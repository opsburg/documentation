---
title: Helm
description: Install Opsburg on Kubernetes with the Helm chart published on ghcr.io, pointing it at your own MongoDB and keeping its secrets in a Kubernetes Secret.
sidebar_position: 3
---

# Helm

The Opsburg chart deploys the standard image (backend and nginx in one container) as a Deployment, with a Service and an optional Ingress. It is published as an OCI artifact:

```text
oci://ghcr.io/opsburg/charts/opsburg
```

The chart version matches the Opsburg release it ships: chart `0.2.0` runs image `ghcr.io/opsburg/opsburg:0.2.0`.

:::note[MongoDB is not part of the chart]
Bring your own MongoDB, reachable from the cluster, and give the console its address in `NOSQL_DATABASE_URL`. Use a managed service or the installation method your team already runs.
:::

## Prerequisites

- A Kubernetes cluster and `kubectl` access to it.
- [Helm](https://helm.sh/docs/intro/install/) 3.8 or later (OCI registries).
- A MongoDB server and a user for Opsburg.

## 1. Create the Secret

Keep the sensitive variables in a Secret you manage, and point the chart at it with `existingSecret`. Every key of the Secret becomes an environment variable of the container.

```bash
kubectl create namespace opsburg

kubectl create secret generic opsburg-secrets -n opsburg \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=SECRETS_ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  --from-literal=NOSQL_DATABASE_URL='mongodb://opsburg:CHANGE_ME@mongodb.example.internal:27017/?authSource=admin' \
  --from-literal=NOSQL_DATABASE_NAME=opsburg
```

Replace the MongoDB address and credentials with your own. With Sealed Secrets or External Secrets, create a Secret with the same keys instead.

:::warning[JWT_SECRET is required]
The chart sets `NODE_ENV=production`, and in production the backend does not start without `JWT_SECRET` (at least 32 bytes). The pod still turns Ready, because the probes check nginx, but every API call answers `502`. Check the pod logs if the console loads and nothing works.
:::

:::danger[Back up SECRETS_ENCRYPTION_KEY]
Keep a copy of the key outside the cluster. Without it, the credentials stored in MongoDB (Git tokens, AI keys, DNS credentials) cannot be decrypted.
:::

## 2. Write a values file

```yaml title="values.yaml"
env:
  FRONTEND_URL: https://opsburg.example.com
  # Uncomment once the first accounts exist.
  # REGISTRATION_ALLOWED: "false"

existingSecret: opsburg-secrets

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  hosts:
    - host: opsburg.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: opsburg-tls
      hosts:
        - opsburg.example.com

resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    memory: 1Gi
```

The ingress class, the annotations and the resource figures are examples: adapt them to your cluster. `FRONTEND_URL` must be the public URL of the console, without a trailing slash. The `env` map you write is merged with the chart's default, so `NODE_ENV: production` stays.

## 3. Install

```bash
helm install opsburg oci://ghcr.io/opsburg/charts/opsburg \
  --version 0.2.0 \
  --namespace opsburg \
  -f values.yaml
```

Then open the console at your host, create the first account and found your city. See [Sign in](../account/sign-in.md) and [Founding the city](../city/founding-the-city.md).

To read every value with its comments:

```bash
helm show values oci://ghcr.io/opsburg/charts/opsburg --version 0.2.0
```

## Values

| Value | Default | Description |
| --- | --- | --- |
| `replicaCount` | `1` | Number of pods. |
| `image.repository` | `ghcr.io/opsburg/opsburg` | Image to run. |
| `image.tag` | `""` | Image tag. Empty means the chart's `appVersion`. |
| `image.pullPolicy` | `IfNotPresent` | Image pull policy. |
| `imagePullSecrets` | `[]` | Pull secrets, for a mirror registry that needs them. |
| `env` | `NODE_ENV: production` | Plain environment variables, as a map of name to value. Values are quoted for you. |
| `secretEnv` | `{}` | Sensitive variables. The chart writes them into a Secret it creates and loads it into the container. |
| `existingSecret` | `""` | Name of a Secret you manage. Every key becomes an environment variable. |
| `service.type` | `ClusterIP` | Service type. |
| `service.port` | `80` | Service port. It targets port 80 of the container (nginx). |
| `ingress.enabled` | `false` | Create an Ingress. |
| `ingress.className` | `""` | `ingressClassName` of the Ingress. |
| `ingress.annotations` | `{}` | Annotations of the Ingress. |
| `ingress.hosts` | `console.example.com`, path `/`, `Prefix` | Hosts and paths routed to the Service. |
| `ingress.tls` | `[]` | TLS blocks of the Ingress (`secretName`, `hosts`). |
| `resources` | `{}` | Container resource requests and limits. |
| `nodeSelector` | `{}` | Pod node selector. |
| `tolerations` | `[]` | Pod tolerations. |
| `affinity` | `{}` | Pod affinity. |
| `podAnnotations` | `{}` | Extra pod annotations. |

### How the variables combine

- `env` entries are set directly on the container, so they win over a key with the same name in `secretEnv` or `existingSecret`.
- `secretEnv` and `existingSecret` can be used together. When both hold the same key, `existingSecret` wins.
- A change to `secretEnv` restarts the pods, because the chart stamps a checksum of it on the pod template. A change to the Secret named in `existingSecret` does not: restart the pods yourself.

```bash
kubectl rollout restart deployment -n opsburg -l app.kubernetes.io/instance=opsburg
```

`secretEnv` is handy for a test cluster, but its values sit in your values file and in the Helm release history. Prefer `existingSecret` in production.

### Probes

The container has fixed probes: readiness is an HTTP `GET /` on port 80 (nginx serving the browser app) and liveness is a TCP check on the same port. Neither checks the backend.

## Behind an ingress controller

The image trusts only the nginx inside the container as a proxy (`TRUST_PROXY=127.0.0.1`). Behind an ingress controller, the backend then sees the controller's address as the client, and the per-IP rate limit on sign-in (`AUTH_RATE_LIMIT_MAX`, 10 requests per minute by default) is shared by every user.

To rate-limit real clients, add the address range of your ingress controller pods to `TRUST_PROXY`, keeping `127.0.0.1`:

```yaml
env:
  TRUST_PROXY: "127.0.0.1,10.42.0.0/16"
```

Use the pod CIDR of your cluster. Only list proxies you control: a trusted proxy's `X-Forwarded-For` header decides the client address.

## Sign-in with GitHub, Google or Microsoft

Register `https://<your host>/api/auth/<provider>/callback` as the redirect URI with the provider (`github`, `google` or `microsoft`), then add the client ID and secret to your Secret. The variable names are in [Sign-in and SSO](./environment-variables.md#sign-in-and-sso).

## Upgrade

1. Read the [release notes](../release-notes.md) of the target version.
2. Back up your MongoDB.
3. Upgrade the release with the same values file:

```bash
helm upgrade opsburg oci://ghcr.io/opsburg/charts/opsburg \
  --version X.Y.Z \
  --namespace opsburg \
  -f values.yaml
```

The backend brings the database indexes in line with the new version at startup. If something goes wrong, `helm rollback opsburg -n opsburg` returns to the previous revision.

## Uninstall

```bash
helm uninstall opsburg --namespace opsburg
```

This removes the Deployment, the Service, the Ingress and the Secret created from `secretEnv`. Your MongoDB and the Secret you created yourself are left untouched.
