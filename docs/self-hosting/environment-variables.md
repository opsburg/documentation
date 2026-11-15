---
title: Environment variables
description: Every environment variable Opsburg 0.3.0 reads, with its default and whether you need it, plus the runtime config.js of the browser app.
sidebar_position: 4
---

# Environment variables

This page lists the variables release 0.3.0 reads. A variable that is not on this page has no effect on this release, even if it appears in an older example or comment.

How values are read:

- Empty or whitespace-only values count as unset.
- Switches (`ALLOW_EMBEDDED_LOGIN`, `REGISTRATION_ALLOWED`) are off only for `false`, `0`, `no` or `off`, in any case. Any other value turns them on.
- The backend reads the variables once, at startup. Restart the container after a change.

## Minimum set

| Image | You must set |
| --- | --- |
| All-in-one | `FRONTEND_URL`, `SECRETS_ENCRYPTION_KEY` |
| Standard image, Docker Compose, Helm | `FRONTEND_URL`, `SECRETS_ENCRYPTION_KEY`, `JWT_SECRET`, `NOSQL_DATABASE_URL` |

The backend does not start without `FRONTEND_URL` and `SECRETS_ENCRYPTION_KEY`, in any image. Both images run in production mode, so the backend also needs `JWT_SECRET`: the all-in-one image generates one when it is missing, the standard image does not start without it. The all-in-one image checks `FRONTEND_URL` and `SECRETS_ENCRYPTION_KEY` before it starts MongoDB and Redis, and stops at once with a message that names the missing ones.

## Server

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `production` in both images, unset (treated as development) outside them | `production` makes `JWT_SECRET` mandatory. Also the fallback for `SENTRY_ENVIRONMENT`. Leave it as it is in the images. |
| `FRONTEND_URL` | Yes | none | Public URL of the console, without a trailing slash. It must start with `http://` or `https://`, or the backend refuses to start. The browser lands here after a GitHub, Google or Microsoft sign-in, and city invitation links start with it. When it starts with `https://`, the session cookies are marked `Secure`. |
| `PUBLIC_URL` | No | Value of `FRONTEND_URL` | Public URL the sign-in providers call back to. Set it only when the providers must reach the console on a different address than the browser does. |
| `HTTP_PORT` | No | `3000` | Port the backend listens on. `PORT` is read when `HTTP_PORT` is unset. Leave both alone in the Opsburg images: nginx forwards to port 3000. |
| `TRUST_PROXY` | No | `127.0.0.1` in the images, off otherwise | Proxies whose `X-Forwarded-For` header the backend believes, to find the client address for its per-IP rate limits. `true` trusts every hop, `false` none, or give a comma-separated list of addresses and CIDR ranges. Keep `127.0.0.1` in the list: it is the nginx inside the container. |
| `AUTH_RATE_LIMIT_MAX` | No | `10` | Requests per minute and per client address on sign-in, registration and the other rate-limited endpoints (such as connection tests). |

:::tip[Behind a load balancer or ingress]
With the default `TRUST_PROXY`, the backend sees your load balancer as the only client, so all users share one rate limit. Add the load balancer's addresses, for example `TRUST_PROXY=127.0.0.1,10.42.0.0/16`. See [Helm](./helm.md#behind-an-ingress-controller).
:::

## Database

Opsburg stores everything in MongoDB.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NOSQL_DATABASE_URL` | Yes, except all-in-one | All-in-one: `mongodb://127.0.0.1:27017/opsburg` | MongoDB connection string. Without it the backend starts but connects to nothing, and every request that needs data fails. |
| `NOSQL_DATABASE_NAME` | No | All-in-one: `opsburg` | Database to use. When set, it wins over the database named in the connection string. |
| `NOSQL_DATABASE_USERNAME` | No | unset | MongoDB user, if you prefer not to put it in the connection string. |
| `NOSQL_DATABASE_PASSWORD` | No | unset | MongoDB password, same as above. |

At startup the backend logs whether MongoDB is a replica set or a standalone server, then syncs the indexes of its collections before it answers requests.

## Sessions

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `JWT_SECRET` | Yes with `NODE_ENV=production`, so in both images | All-in-one: generated on first start and kept in `/data/secrets/jwt_secret`. Standard image: none, the backend does not start without it. Outside the images and outside production: a random value per process. | Signs the session cookie. At least 32 bytes, or the backend refuses to start. Generate it with `openssl rand -hex 32`. Changing it signs everybody out. |
| `COOKIE_SECRET` | No | Derived from `JWT_SECRET` | Signs the short-lived cookie that carries a GitHub, Google or Microsoft sign-in from start to callback. |

:::warning
Without `JWT_SECRET` and outside production, the backend makes up a random secret and logs a warning: every restart then signs everybody out. This only happens when you run the backend outside the images, for example on a development machine: both images run in production mode.
:::

A session lasts 7 days and lives in an httpOnly cookie named `opsburg_session`.

## Sign-in and SSO

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `ALLOW_EMBEDDED_LOGIN` | No | `true` | Username and password sign-in. When off, sign-up with a password is off too, and only the configured providers remain. |
| `REGISTRATION_ALLOWED` | No | `true` | Creation of new accounts. When off, no account is created: neither by password sign-up nor at the first sign-in with GitHub, Google or Microsoft. Existing users still sign in. |
| `GITHUB_CLIENT_ID` | No | unset | GitHub OAuth app client ID. GitHub sign-in is on when both ID and secret are set. |
| `GITHUB_CLIENT_SECRET` | No | unset | GitHub OAuth app client secret. |
| `GOOGLE_CLIENT_ID` | No | unset | Google OAuth client ID. Google sign-in is on when both ID and secret are set. |
| `GOOGLE_CLIENT_SECRET` | No | unset | Google OAuth client secret. |
| `AZURE_ENTRAID_CLIENT_ID` | No | unset | Microsoft Entra ID application (client) ID. Microsoft sign-in is on when both ID and secret are set. |
| `AZURE_ENTRAID_CLIENT_SECRET` | No | unset | Microsoft Entra ID client secret. |
| `AZURE_ENTRAID_TENANT_ID` | No | `common` | Which Microsoft accounts may sign in: `common` (any), `organizations` (work and school accounts), `consumers` (personal accounts), or a tenant ID to allow only that tenant. |

The redirect URI to register with each provider is:

```text
<PUBLIC_URL>/api/auth/github/callback
<PUBLIC_URL>/api/auth/google/callback
<PUBLIC_URL>/api/auth/microsoft/callback
```

At startup the backend logs which providers are enabled.

:::warning[REGISTRATION_ALLOWED=false closes every way in]
With registration closed, a person who signs in with a configured provider for the first time gets no account: the console shows "This server does not admit new citizens." A provider account already linked to a user still signs in, and one whose email the provider has verified is linked to the existing Opsburg user with the same email. Invitations create no account either: an invitation link works only for someone who already has one. Let the people you invite sign up before you close registration.

With registration open, anyone who can sign in with a configured provider gets an account. To restrict that, restrict it at the provider: for Microsoft, set `AZURE_ENTRAID_TENANT_ID` to your tenant; for Google and GitHub, limit who can use the OAuth app.
:::

See [Sign in](../account/sign-in.md) for what users see.

## Secrets encryption

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SECRETS_ENCRYPTION_KEY` | Yes | none | 32-byte key, as base64 or as 64 hex characters. Generate it with `openssl rand -base64 32`. The backend does not start without it, or with a key that does not decode to 32 bytes. |

Opsburg encrypts with AES-256-GCM the credentials it keeps in MongoDB: the tokens of [Git connections](../city/git-connections.md), the keys of [AI models](../city/ai-models.md), the credentials of [DNS registrars](../city/dns-registrars.md), and the secret values of applications and resources. Since the key is required, no credential is written in clear.

An installation upgraded from a release before 0.3.0 that ran without a key still holds the credentials it saved then in clear. They stay readable, and each one is encrypted the next time it is saved.

:::danger[Back up the key]
A key of the wrong length stops the backend at startup. A lost or changed key makes every encrypted credential unreadable: there is no recovery, only entering them again. Store the key with your backups, separately from the database.
:::

## Logging

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `LOG_LEVEL` | No | `info` | Level of the backend logs: `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. The backend writes one JSON object per line on stdout. |

This variable is about the console's own logs. The log settings of the applications you deploy are set in the game: see [Logging](../city/logging.md).

## Error reporting

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SENTRY_DSN` | No | unset | DSN of your Sentry project. When unset, the backend sends nothing. |
| `SENTRY_ENVIRONMENT` | No | `NODE_ENV`, then `production` | Sentry environment the errors are filed under. |

See [Error reporting](./error-reporting.md), which also covers the browser app.

## All-in-one image

These variables are read by the start scripts of the all-in-one image, not by the backend.

| Variable | Default | Description |
| --- | --- | --- |
| `MONGO_REPLICA_SET` | `rs0` | The embedded MongoDB runs as a single-node replica set with this name, initialised on first start. Set it to an empty value to run a standalone MongoDB. |
| `REDIS_PASSWORD` | unset | Password of the embedded Redis. It listens on `127.0.0.1` only, so a password is optional. |
| `SERVICES_WAIT_TIMEOUT` | `120` | Seconds the backend waits for MongoDB and Redis at start before giving up and letting supervisord retry. |

The image also presets `NODE_ENV=production`, `PORT=3000`, `TRUST_PROXY=127.0.0.1`, `NOSQL_DATABASE_URL` and `NOSQL_DATABASE_NAME` (see the tables above).

## Browser app: `config.js`

The browser app reads its runtime settings from `/config.js`, a plain script served by nginx without caching. In the images it is the file `/var/www/frontend/config.js`. Replace it at deploy time, with a bind mount or a mounted ConfigMap, to change these settings without rebuilding the image:

```js
window.globalConfiguration = {
    SENTRY_DSN: "",
    ENVIRONMENT: "production"
}
```

| Key | Default | Description |
| --- | --- | --- |
| `SENTRY_DSN` | `""` | DSN of your Sentry project for the errors of the browser app. Empty means nothing is sent. |
| `ENVIRONMENT` | `production` | Sentry environment the browser errors are filed under. |

See [Error reporting](./error-reporting.md#browser-app) for how to mount the file.

## Telemetry

Release 0.3.0 sends no usage data, so there is no telemetry variable to set. See [Telemetry](./telemetry.md).
