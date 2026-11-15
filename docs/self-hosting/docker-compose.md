---
title: Docker Compose
description: Run Opsburg and its MongoDB on one host with the Docker Compose file of the Opsburg repository, with secrets and settings in a .env file.
sidebar_position: 2
---

# Docker Compose

The Opsburg repository has a `docker-compose.yaml` that runs two containers on one host: MongoDB 9.0 and the standard Opsburg image. The database keeps its data on a named volume, and the secrets and settings live in a `.env` file next to the compose file, built from the `.env.example` of the repository.

If you want a single container instead, use the all-in-one image described in [Docker](./docker.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) with the [Compose plugin](https://docs.docker.com/compose/install/).
- `openssl`, to generate the secrets.

## 1. Create `docker-compose.yaml`

In an empty directory, create `docker-compose.yaml` with the content of the file in the repository:

```yaml title="docker-compose.yaml"
# Opsburg with its own MongoDB, on one Docker host.
#
#   cp .env.example .env    # then fill FRONTEND_URL, the secrets and the database password
#   docker compose up -d
#
# The console answers on http://localhost:8080 (OPSBURG_PORT). MongoDB is reachable
# only from the Opsburg container: no database port is published on the host.
# Variables marked :? are required: compose refuses to start without them.

name: opsburg

services:
  mongodb:
    image: mongo:9.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-opsburg}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:?set MONGO_ROOT_PASSWORD in .env}
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand({ ping: 1 }).ok"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  opsburg:
    # A release tag: an upgrade is a change of OPSBURG_VERSION. Not latest, which
    # follows the development branch.
    image: ghcr.io/opsburg/opsburg:${OPSBURG_VERSION:?set OPSBURG_VERSION in .env, e.g. 0.3.0}
    restart: unless-stopped
    ports:
      - "${OPSBURG_PORT:-8080}:80"
    environment:
      # Required: the address the console is opened at. Sign-ins land there and
      # invitation links point at it. https:// makes the session cookie Secure.
      FRONTEND_URL: ${FRONTEND_URL:?set FRONTEND_URL in .env}
      # Required: openssl rand -hex 32. Signs the sessions.
      JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET in .env}
      # Required: openssl rand -base64 32. Encrypts the stored credentials (Git
      # tokens, DNS credentials, AI keys): keep it, losing it makes them unreadable.
      SECRETS_ENCRYPTION_KEY: ${SECRETS_ENCRYPTION_KEY:?set SECRETS_ENCRYPTION_KEY in .env}
      NOSQL_DATABASE_URL: mongodb://mongodb:27017/?authSource=admin
      NOSQL_DATABASE_USERNAME: ${MONGO_ROOT_USERNAME:-opsburg}
      NOSQL_DATABASE_PASSWORD: ${MONGO_ROOT_PASSWORD}
      NOSQL_DATABASE_NAME: opsburg
      # Off: no new account, neither with a password nor at a first external sign-in.
      REGISTRATION_ALLOWED: ${REGISTRATION_ALLOWED:-true}
      # External sign-in: each provider is on when both its id and secret are set.
      # Callback to register with the provider: ${FRONTEND_URL}/api/auth/<provider>/callback
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:-}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
      AZURE_ENTRAID_TENANT_ID: ${AZURE_ENTRAID_TENANT_ID:-common}
      AZURE_ENTRAID_CLIENT_ID: ${AZURE_ENTRAID_CLIENT_ID:-}
      AZURE_ENTRAID_CLIENT_SECRET: ${AZURE_ENTRAID_CLIENT_SECRET:-}
      # Errors of the backend to your own Sentry project: off while empty.
      SENTRY_DSN: ${SENTRY_DSN:-}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      # Through nginx to the backend: unhealthy when either is down.
      test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://127.0.0.1/api/echo"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s

volumes:
  mongodb_data:
```

What the file does:

- MongoDB publishes no port on the host: only the `opsburg` container reaches it, over the Compose network. Its root user is created from `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD`, and Opsburg signs in to MongoDB with the same user.
- The `opsburg` container starts only once MongoDB answers its healthcheck. The backend connects to MongoDB at startup.
- The `opsburg` container has a healthcheck of its own: it calls `/api/echo` through nginx to the backend, so `docker compose ps` shows it `unhealthy` when either of them stops answering.
- The image is the standard one, pinned by `OPSBURG_VERSION`. It runs in production mode: the backend does not start without `JWT_SECRET`, `FRONTEND_URL` and `SECRETS_ENCRYPTION_KEY`, and the container stops when the backend or nginx exits, so `restart: unless-stopped` starts it again.
- A variable written as `${NAME:?...}` is required: `docker compose` refuses to start and prints the message when it is missing from `.env`.
- The console listens on port 8080 of the host. Change it with `OPSBURG_PORT`.

## 2. Create the `.env` file

Next to `docker-compose.yaml`, create `.env.example` with the content of the file in the repository, then copy it to `.env`:

```bash title=".env.example"
# Settings of docker-compose.yaml. Copy to .env next to it and fill the required ones.

# --- Required -----------------------------------------------------------------
# Release of Opsburg to run (0.3.0 or later: the container healthcheck needs it).
OPSBURG_VERSION=0.3.0
# The address the console is opened at, without trailing slash.
FRONTEND_URL=http://localhost:8080
# openssl rand -hex 32
JWT_SECRET=
# openssl rand -base64 32. Keep a copy: it encrypts the stored credentials.
SECRETS_ENCRYPTION_KEY=
# Password of the MongoDB root user, created on the first start of the database.
MONGO_ROOT_PASSWORD=

# --- Optional -----------------------------------------------------------------
# OPSBURG_PORT=8080
# MONGO_ROOT_USERNAME=opsburg
# REGISTRATION_ALLOWED=true
# LOG_LEVEL=info

# External sign-in: a provider is on when both its id and secret are set.
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# AZURE_ENTRAID_TENANT_ID=common
# AZURE_ENTRAID_CLIENT_ID=
# AZURE_ENTRAID_CLIENT_SECRET=

# SENTRY_DSN=
```

```bash
cp .env.example .env
chmod 600 .env
```

Fill the required values in `.env`. Generate the secrets with:

```bash
openssl rand -hex 32      # JWT_SECRET
openssl rand -base64 32   # SECRETS_ENCRYPTION_KEY
openssl rand -hex 24      # MONGO_ROOT_PASSWORD
```

- `OPSBURG_VERSION` is the release to run. Use 0.3.0 or later: older images have no `/api/echo`, and the container healthcheck would fail.
- `FRONTEND_URL` is the address your browser uses to reach the console, without a trailing slash. Change it when the console is not on `http://localhost:8080`.
- `JWT_SECRET` signs the sign-in sessions. Changing it later signs everybody out.
- `SECRETS_ENCRYPTION_KEY` encrypts the credentials Opsburg stores in MongoDB.
- `MONGO_ROOT_PASSWORD` is the password of the MongoDB root user. MongoDB creates that user only on the first start of an empty volume: changing the value later does not change the password in the database.

The optional settings are described in [Environment variables](./environment-variables.md). To set a variable the file does not list, add it under `environment:` of the `opsburg` service.

:::danger[Keep a copy of the `.env` file]
Back it up somewhere safe. If you lose `SECRETS_ENCRYPTION_KEY`, the Git tokens, AI keys and DNS credentials stored in the database cannot be decrypted, and you have to enter them again.
:::

## 3. Start it

```bash
docker compose up -d
docker compose logs -f opsburg
```

Open `http://localhost:8080`, create the first account and found your city. See [Sign in](../account/sign-in.md) and [Founding the city](../city/founding-the-city.md).

If the `opsburg` container keeps restarting, the backend refuses its configuration or cannot reach MongoDB. The reason is in `docker compose logs opsburg`.

## Close registration

Self-registration is open by default. Once the people who need an account have one, set it in `.env`:

```bash
REGISTRATION_ALLOWED=false
```

Then apply it:

```bash
docker compose up -d
```

From then on nobody new gets an account: neither with a password nor at the first sign-in with GitHub, Google or Microsoft. Existing users still sign in. An invitation link works only for someone who already has an account, so let the people you invite sign up before you close registration. See [Sign-in and SSO](./environment-variables.md#sign-in-and-sso).

## Back up

Dump the database from the MongoDB container. The command reads the root user and password from the container's own environment:

```bash
docker compose exec -T mongodb sh -c \
  'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db opsburg --archive' \
  > opsburg-$(date +%F).archive
```

Restore it with `mongorestore --archive` in the same way. Keep the `.env` file with the backups: the dump is useless without `SECRETS_ENCRYPTION_KEY`.

## Upgrade

1. Read the [release notes](../release-notes.md) of the target version.
2. Take a backup.
3. Change `OPSBURG_VERSION` in `.env`, then:

```bash
docker compose pull
docker compose up -d
```

The backend brings the database indexes in line with the new version at startup, before it answers requests.

:::note[Coming from the 0.2.0 version of this page]
The compose file this page showed for 0.2.0 created the MongoDB root user as `root` and ran `mongo:8.0`. When you move to the repository's file with an existing database volume, set `MONGO_ROOT_USERNAME=root` and your existing password in `.env`. The new file names the Compose project `opsburg`, so its volume is `opsburg_mongodb_data`; before, the project took the name of the directory. If that directory had another name, `docker volume ls` shows your data under `<directory>_mongodb_data`, and the new file would start on an empty volume. The new file runs `mongo:9.0`: check MongoDB's upgrade notes before you change the major version of a database that holds data, or keep the image you ran before.
:::
