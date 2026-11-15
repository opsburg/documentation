---
title: Docker Compose
description: Run Opsburg and its MongoDB on one host with Docker Compose, with secrets in an env file and the database on a named volume.
sidebar_position: 2
---

# Docker Compose

This setup runs two containers on one host: MongoDB 8.0 and the standard Opsburg image. The database keeps its data on a named volume, and the secrets live in a `.env` file next to the compose file.

If you want a single container instead, use the all-in-one image described in [Docker](./docker.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) with the [Compose plugin](https://docs.docker.com/compose/install/).
- `openssl`, to generate the secrets.

## 1. Create the `.env` file

In an empty directory, generate the secrets once:

```bash
cat > .env <<EOF
FRONTEND_URL=http://localhost:8080
MONGO_ROOT_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
chmod 600 .env
```

- `FRONTEND_URL` is the address your browser uses to reach the console, without a trailing slash. Change it when the console is not on `localhost:8080`.
- `MONGO_ROOT_PASSWORD` ends up inside a MongoDB connection string, so keep it to letters and digits (the hex output above is safe).
- `JWT_SECRET` signs the sign-in sessions. Changing it later signs everybody out.
- `SECRETS_ENCRYPTION_KEY` encrypts the credentials Opsburg stores in MongoDB.

:::danger[Keep a copy of the `.env` file]
Back it up somewhere safe. If you lose `SECRETS_ENCRYPTION_KEY`, the Git tokens, AI keys and DNS credentials stored in the database cannot be decrypted, and you have to enter them again.
:::

## 2. Create `docker-compose.yaml`

```yaml
services:
  mongodb:
    image: mongo:8.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:?set MONGO_ROOT_PASSWORD in .env}
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  opsburg:
    image: ghcr.io/opsburg/opsburg:0.2.0
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL:?set FRONTEND_URL in .env}
      JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET in .env}
      SECRETS_ENCRYPTION_KEY: ${SECRETS_ENCRYPTION_KEY:?set SECRETS_ENCRYPTION_KEY in .env}
      NOSQL_DATABASE_URL: mongodb://root:${MONGO_ROOT_PASSWORD}@mongodb:27017/?authSource=admin
      NOSQL_DATABASE_NAME: opsburg
      # Uncomment once the first accounts exist.
      # REGISTRATION_ALLOWED: "false"
    depends_on:
      mongodb:
        condition: service_healthy

volumes:
  mongodb_data:
```

Notes on this file:

- MongoDB publishes no port on the host: only the `opsburg` container reaches it, over the Compose network.
- The `opsburg` container starts only once MongoDB answers its health check. The backend connects to MongoDB at startup and exits if it cannot.
- `NODE_ENV: production` makes the backend refuse to start without `JWT_SECRET`, so a missing secret is caught at once.
- Add more variables under `environment:` as needed: see [Environment variables](./environment-variables.md).

:::note[About the compose file in the source tree]
The compose file in the Opsburg source starts Redis and uses the all-in-one image. Release 0.2.0 does not connect to Redis, and the all-in-one image already contains its own MongoDB, so this page uses the standard image with one MongoDB. The compose file in the source also uses a fixed MongoDB password and publishes MongoDB and Redis on the host: do not reuse those settings outside a laptop.
:::

## 3. Start it

```bash
docker compose up -d
docker compose logs -f opsburg
```

Open `http://localhost:8080`, create the first account and found your city. See [Sign in](../account/sign-in.md) and [Founding the city](../city/founding-the-city.md).

If the console loads but every action fails, the backend is not running: nginx keeps serving the browser app and the API answers `502`. The cause is in `docker compose logs opsburg`.

## Close registration

Self-registration is open by default. Once the people who need an account have one, uncomment `REGISTRATION_ALLOWED: "false"` and apply it:

```bash
docker compose up -d
```

This closes the username and password sign-up only. GitHub, Google and Microsoft sign-in, when configured, still create an account on first sign-in. See [Sign-in and SSO](./environment-variables.md#sign-in-and-sso).

## Back up

Dump the database from the MongoDB container. The command reads the root password from the container's own environment:

```bash
docker compose exec -T mongodb sh -c \
  'mongodump --username root --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db opsburg --archive' \
  > opsburg-$(date +%F).archive
```

Restore it with `mongorestore --archive` in the same way. Keep the `.env` file with the backups: the dump is useless without `SECRETS_ENCRYPTION_KEY`.

## Upgrade

1. Read the [release notes](../release-notes.md) of the target version.
2. Take a backup.
3. Change the `opsburg` image tag in `docker-compose.yaml`, then:

```bash
docker compose pull
docker compose up -d
```

The backend brings the database indexes in line with the new version at startup, before it answers requests.
