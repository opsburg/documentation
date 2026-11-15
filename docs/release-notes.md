---
title: Release notes
description: What changed in each Opsburg release, with links to the documentation of every feature.
sidebar_position: 9
---

# Release notes

Opsburg follows [Semantic Versioning](https://semver.org/). Each release publishes the container images on `ghcr.io/opsburg/opsburg` (the standard image as `<version>`, the all-in-one image as `<version>-all-in-one`) and the Helm chart on `oci://ghcr.io/opsburg/charts/opsburg`.

## 0.2.0

*Released on 2026-11-15.*

### Added

- **Error reporting with Sentry, off by default.** The backend reports its unexpected errors (the 500 responses, not the 4xx ones) when you set `SENTRY_DSN`, filed under `SENTRY_ENVIRONMENT`. The browser app reports its errors when you fill `SENTRY_DSN` and `ENVIRONMENT` in `config.js`, which a deploy can replace without rebuilding the image. Both send to your own Sentry project, never to the Opsburg maintainers. See [Error reporting](./self-hosting/error-reporting.md).

### Fixed

- A world's board now applies its saved logging rules at once. See [Logging](./city/logging.md).

## 0.1.0

*Released on 2026-11-14.*

The first release of Opsburg: a 3D game client where an organization is a city and its projects are worlds around it.

### Added

- **Sign-in at the city gates**: username and password, GitHub, Google and Microsoft, with server-side OAuth and PKCE. The session lives in an httpOnly cookie. See [Sign in](./account/sign-in.md).
- **Founding the city**, that is the organization, through four quests: charter and AI context, palette and design system, machines, and invitations by one-time link. Each quest raises part of the capital. See [Founding the city](./city/founding-the-city.md) and [Members and invitations](./city/members-and-invitations.md).
- **The atelier**: right after signing up, each player dresses their citizen, who then stands in the city. See [The atelier](./account/atelier.md).
- **Worlds**, that is projects, of three kinds: one application, a pool of AI agents, or many small applications. Each city holds up to eight, and only the owner manages them. See [Worlds](./worlds/overview.md).
- **Environments quest**: a new world first asks for the environments its code goes through, in promotion order, prefilled from the city's. The rest of the world opens once they are saved. See [Environments](./worlds/environments.md).
- **Environments of the city**: a world picks among the environments the city set in its machines quest and keeps the city's promotion order; a new world starts on all of them. See [Environments](./worlds/environments.md).
- **Git connections** per organization: GitHub (github.com or Enterprise Server) and GitLab (gitlab.com or self-managed), with the token encrypted, a connection test and repository listing. Each world picks the connection that keeps its code. See [Git connections](./city/git-connections.md).
- **Kubernetes clusters, the GitOps way**: a cluster is a folder of a repository that Argo CD applies. Cluster quests (Rancher, Trivy, Traefik or Envoy Gateway, Let's Encrypt, kube-green, Kyverno, External Secrets, Falco, with cert-manager as foundation) arrive as pull or merge requests with pinned Helm charts and an app of apps. See [Clusters](./city/clusters.md).
- **DNS registrars** per organization (Cloudflare, Route 53, Azure DNS): the streets of a cluster point hostnames at its ingress, with an Ingress by pull request and TLS from the Let's Encrypt quest. See [DNS registrars](./city/dns-registrars.md).
- **Logging rules**: the organization sets the log level, the format (JSON or plain text) and audit lines, and each project can override any of them. They resolve to `LOG_LEVEL`, `LOG_JSON` and `LOG_AUDIT`, the variables containers will receive once Opsburg deploys them (0.2.0 saves the rules and does not deploy containers yet). Keeping the logbooks is the city's first side quest. See [Logging](./city/logging.md).
- **AI models per organization**: Anthropic, Microsoft Foundry, Gemini, Azure OpenAI and Bedrock, with a default model and a live connection test. Keys are encrypted at rest with `SECRETS_ENCRYPTION_KEY` and never returned by the API. See [AI models](./city/ai-models.md).
- **Self-hosted telemetry ping**, written but not switched on in this release. See [Telemetry](./self-hosting/telemetry.md).
- **Distribution**: the image is published on `ghcr.io/opsburg/opsburg`, with an all-in-one variant (`-all-in-one`) that bundles MongoDB, Redis and Nginx, and a Helm chart on `oci://ghcr.io/opsburg/charts/opsburg`. See [Docker](./self-hosting/docker.md) and [Helm](./self-hosting/helm.md).
