---
title: Docker
description: Run Opsburg from its Docker images, either the all-in-one image with MongoDB inside or the standard image against a MongoDB you run yourself.
sidebar_position: 1
---

# Docker

Opsburg ships as a container image on the GitHub Container Registry. One container serves the browser app and the API on port 80: nginx serves the app and forwards `/api/` to the backend, which listens on port 3000 inside the container.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) on a Linux host (x86_64).
- For the standard image: a MongoDB server the container can reach.

## Which image

Two variants are published:

| Image | What runs inside | Use it for |
| --- | --- | --- |
| `ghcr.io/opsburg/opsburg:0.2.0-all-in-one` | Backend, nginx, MongoDB 8.0 and Redis, kept alive by supervisord | A complete installation from one `docker run` |
| `ghcr.io/opsburg/opsburg:0.2.0` | Backend and nginx | Installations that point at a MongoDB you already run, and the [Helm chart](./helm.md) |

Each release publishes a version tag for both variants (`X.Y.Z` and `X.Y.Z-all-in-one`).

:::warning[Pin a version tag]
The `all-in-one` and `latest` tags also move with development builds, not only with releases. Use a version tag such as `0.2.0-all-in-one` so that an image pull never changes what you run without you knowing.
:::

## All-in-one image

### Start the container

```bash
docker run -d --name opsburg --restart unless-stopped \
  -p 8080:80 \
  -e FRONTEND_URL=http://localhost:8080 \
  -v opsburg-data:/data \
  ghcr.io/opsburg/opsburg:0.2.0-all-in-one
```

Then open `http://localhost:8080`.

- Only port 80 is published. MongoDB and Redis listen on `127.0.0.1` inside the container and cannot be reached from outside it.
- `FRONTEND_URL` is the address your browser uses to reach the console, without a trailing slash. Set it to your real URL (for example `https://opsburg.example.com`) when the console is not on `localhost:8080`. See [Environment variables](./environment-variables.md#server).

On start, supervisord runs MongoDB and Redis first. The backend waits for both before it starts, then nginx comes up. Follow it with:

```bash
docker logs -f opsburg
```

To see the state of each process inside the container:

```bash
docker exec opsburg supervisorctl status
```

If one of the processes cannot start after its retries, the container stops instead of staying up half-working, so `--restart` and your orchestrator can react.

### The `/data` volume

Everything that must survive `docker rm` lives under `/data`. Mount a named volume or a host directory there.

| Path | Content |
| --- | --- |
| `/data/db` | MongoDB data files |
| `/data/redis` | Redis append-only file |
| `/data/secrets/jwt_secret` | The session signing secret, generated on first start when you do not set `JWT_SECRET` |

The other folders the entrypoint creates under `/data` are empty in 0.2.0.

The entrypoint fixes the ownership of these directories at every start, so a host directory owned by root works too.

:::danger[Back up the volume]
Losing `/data` loses the database. If you set [`SECRETS_ENCRYPTION_KEY`](./environment-variables.md#secrets-encryption), also back up the key itself: the volume does not contain it, and without it the stored credentials cannot be read.
:::

### Recommended variables

The all-in-one image works with no variables at all. For anything beyond a trial, set these:

| Variable | Why |
| --- | --- |
| `FRONTEND_URL` | Sign-in redirects and invitation links use it. Its default is a development address. |
| `SECRETS_ENCRYPTION_KEY` | Encrypts the credentials Opsburg stores (Git tokens, AI keys, DNS credentials). Without it they are stored in plain text. |
| `REGISTRATION_ALLOWED` | Set it to `false` once your accounts exist. See [First startup](#first-startup). |

Put them in a file and pass it with `--env-file`:

```bash
cat > opsburg.env <<EOF
FRONTEND_URL=https://opsburg.example.com
SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
chmod 600 opsburg.env

docker run -d --name opsburg --restart unless-stopped \
  -p 8080:80 --env-file opsburg.env \
  -v opsburg-data:/data \
  ghcr.io/opsburg/opsburg:0.2.0-all-in-one
```

You do not need to set `JWT_SECRET` with this image: the entrypoint generates one on first start and keeps it in `/data/secrets/jwt_secret`. If you set it yourself, it must be at least 32 bytes long or the backend refuses to start.

The variables that only exist in this image (`MONGO_REPLICA_SET`, `REDIS_PASSWORD`, `SERVICES_WAIT_TIMEOUT`) are listed in [Environment variables](./environment-variables.md#all-in-one-image).

## Standard image

The standard image contains the backend and nginx only. It needs a MongoDB server.

```bash
cat > opsburg.env <<EOF
NODE_ENV=production
FRONTEND_URL=https://opsburg.example.com
JWT_SECRET=$(openssl rand -hex 32)
SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
NOSQL_DATABASE_URL=mongodb://opsburg:CHANGE_ME@mongodb.example.internal:27017/?authSource=admin
NOSQL_DATABASE_NAME=opsburg
EOF
chmod 600 opsburg.env

docker run -d --name opsburg --restart unless-stopped \
  -p 8080:80 --env-file opsburg.env \
  ghcr.io/opsburg/opsburg:0.2.0
```

Replace the MongoDB address and credentials with your own. No volume is needed: all the state of the console is in MongoDB.

:::warning[Set JWT_SECRET]
With `NODE_ENV=production` the backend does not start without `JWT_SECRET`. Without `NODE_ENV=production` it starts with a random secret, and every restart signs everybody out. Generate it once with `openssl rand -hex 32` and keep it.
:::

In this image nginx runs in the foreground and the backend runs beside it. If the backend exits (a missing `JWT_SECRET`, an unreachable MongoDB), the container keeps running and serves the browser app, but every API call answers `502`. Check `docker logs opsburg` when the console loads but nothing works.

For the full list of variables see [Environment variables](./environment-variables.md). To run MongoDB next to the console on the same host, see [Docker Compose](./docker-compose.md).

## First startup

1. Open the console at your `FRONTEND_URL`.
2. Create the first account with a username, an email and a password. See [Sign in](../account/sign-in.md).
3. Found your city, that is your organization. See [Founding the city](../city/founding-the-city.md).

Self-registration is open by default. Once the people who need an account have one, close it:

```bash
REGISTRATION_ALLOWED=false
```

:::note
`REGISTRATION_ALLOWED` only closes the username and password sign-up. When GitHub, Google or Microsoft sign-in is configured, anyone who can sign in with that provider still gets an account on first sign-in. See [Sign-in and SSO](./environment-variables.md#sign-in-and-sso).
:::

## Upgrades

1. Read the [release notes](../release-notes.md) of the version you are moving to.
2. Back up the data (see below).
3. Pull the new tag, remove the old container and start a new one with the same volume and variables:

```bash
docker pull ghcr.io/opsburg/opsburg:X.Y.Z-all-in-one
docker stop opsburg && docker rm opsburg
docker run -d --name opsburg --restart unless-stopped \
  -p 8080:80 --env-file opsburg.env \
  -v opsburg-data:/data \
  ghcr.io/opsburg/opsburg:X.Y.Z-all-in-one
```

The backend brings the database indexes in line with the new version at startup, before it answers requests.

### Back up the all-in-one volume

Stop the container so that MongoDB and Redis have flushed their files, then archive the volume:

```bash
docker stop opsburg
docker run --rm -v opsburg-data:/data:ro -v "$PWD":/backup debian:bookworm-slim \
  tar czf /backup/opsburg-data.tgz -C /data .
docker start opsburg
```

With the standard image, back up your MongoDB with the tools you already use for it, for example [`mongodump`](https://www.mongodb.com/docs/database-tools/mongodump/).
