---
title: Error reporting
description: Send the errors of the Opsburg backend and browser app to your own Sentry project, which is off by default and configured without rebuilding the image.
sidebar_position: 6
---

# Error reporting

Opsburg can report its errors to [Sentry](https://docs.sentry.io/). It is off by default. When you turn it on, the reports go to the Sentry project you name, on sentry.io or on your own Sentry server, never to the Opsburg team.

The backend and the browser app are configured separately:

| Part | Where you set it | What it reports |
| --- | --- | --- |
| Backend | Environment variables `SENTRY_DSN` and `SENTRY_ENVIRONMENT` | Unexpected server errors (HTTP 500) |
| Browser app | `SENTRY_DSN` and `ENVIRONMENT` in `config.js` | Errors thrown in the browser |

:::tip
Create two Sentry projects, one for Node.js and one for React, so that backend and browser errors stay apart. Each has its own DSN.
:::

## Backend

Set the DSN of your Sentry project:

| Variable | Default | Description |
| --- | --- | --- |
| `SENTRY_DSN` | unset | DSN of the Sentry project. Unset or empty: nothing is sent. |
| `SENTRY_ENVIRONMENT` | `NODE_ENV`, then `production` | Environment the errors are filed under, to tell your installations apart (for example `staging` and `production`). |

What is reported:

- A request that fails with an unexpected error, the kind that answers `500`.
- Not reported: client errors (`4xx`), validation errors, refused permissions and rate limiting. Those are expected answers, not bugs.

Sentry starts before the rest of the backend loads. It runs with the SDK's default options and only the DSN and environment set: no performance tracing is configured. See the [Sentry options for Node.js](https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/) for what the defaults include.

### Docker

```bash
docker run -d --name opsburg \
  -e SENTRY_DSN='https://examplePublicKey@o0.ingest.sentry.io/0' \
  -e SENTRY_ENVIRONMENT=production \
  ...
```

### Docker Compose

The [compose file](./docker-compose.md) of the repository already passes `SENTRY_DSN` from `.env`:

```bash title=".env"
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

To set `SENTRY_ENVIRONMENT` as well, add it under `environment:` of the `opsburg` service:

```yaml
services:
  opsburg:
    environment:
      SENTRY_ENVIRONMENT: production
```

### Helm

```yaml title="values.yaml"
env:
  SENTRY_DSN: https://examplePublicKey@o0.ingest.sentry.io/0
  SENTRY_ENVIRONMENT: production
```

Replace the example DSN with the one from your Sentry project settings. Restart the container or upgrade the release to apply it.

## Browser app

The browser app reads its Sentry settings from `/config.js`, which nginx serves without caching. Replacing that file is enough: no rebuild, and browsers pick it up at the next page load.

Write your own `config.js`:

```js title="config.js"
window.globalConfiguration = {
    SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
    ENVIRONMENT: "production"
}
```

| Key | Default | Description |
| --- | --- | --- |
| `SENTRY_DSN` | `""` | DSN of the Sentry project. Empty: nothing is sent. |
| `ENVIRONMENT` | `production` | Environment the errors are filed under. |

The browser app reports the errors React cannot recover from and the ones it recovers from. The DSN is visible to anyone who loads the console: that is how Sentry browser DSNs work, and they only allow sending events.

The console's Content Security Policy allows connections to any `http` or `https` host, so a self-hosted Sentry works without changes.

### Docker and Docker Compose

Mount your file over `/var/www/frontend/config.js`:

```bash
docker run -d --name opsburg \
  -v "$PWD/config.js:/var/www/frontend/config.js:ro" \
  ...
```

```yaml
services:
  opsburg:
    volumes:
      - ./config.js:/var/www/frontend/config.js:ro
```

### Kubernetes

The 0.2.0 chart has no value for mounting extra files. Put the file in a ConfigMap:

```bash
kubectl create configmap opsburg-config-js -n opsburg --from-file=config.js
```

Then mount it into the `opsburg` container with a [Helm post-renderer](https://helm.sh/docs/topics/advanced/#post-rendering), for example a Kustomize patch on the Deployment:

```yaml
spec:
  template:
    spec:
      volumes:
        - name: config-js
          configMap:
            name: opsburg-config-js
      containers:
        - name: opsburg
          volumeMounts:
            - name: config-js
              mountPath: /var/www/frontend/config.js
              subPath: config.js
              readOnly: true
```

A ConfigMap mounted with `subPath` is not refreshed in a running pod: restart the pods after you change it.

## Turn it off

Remove `SENTRY_DSN` from the backend environment and set `SENTRY_DSN` back to `""` in `config.js` (or remove the mount, since the file shipped in the image has an empty DSN).
