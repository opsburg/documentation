---
title: What is Opsburg
description: Opsburg is a self-hosted console that sets up your organization, projects, Git hosts, Kubernetes clusters and DNS the GitOps way, drawn as a 3D steampunk city.
sidebar_position: 1
---

# What is Opsburg

Opsburg is a self-hosted platform for platform engineers, DevOps teams and SREs. It aims to build, ship and run your applications and AI agents on Kubernetes through GitOps, under rules you set once for the whole organization.

The console is a 3D city builder in a steampunk style. Your organization is a city, each project is a world floating around it, and the setup work is a set of quests. Every quest saves real configuration: a Git connection, a cluster, a DNS registrar, a logging rule.

## What it does today

Release 0.2.0 covers the foundations: who works in the organization, where the code lives, which clusters and environments exist, and how hostnames reach the clusters.

- **Sign-in** with username and password, GitHub, Google or Microsoft. See [Sign in](./account/sign-in.md).
- **Founding the city**, that is the organization: four quests record what the organization does, its palette and design system, the clouds, runtimes, pipelines and environments it uses, and who else joins. See [Founding the city](./city/founding-the-city.md).
- **Worlds**, that is projects, of three kinds: one application, a pool of AI agents, or many small applications. A city holds up to eight. See [Worlds](./worlds/overview.md).
- **Environments in promotion order**, set once for the city and picked by each world. See [Environments](./worlds/environments.md).
- **Git connections** to GitHub (github.com or Enterprise Server) and GitLab (gitlab.com or self-managed). See [Git connections](./city/git-connections.md).
- **Kubernetes clusters, the GitOps way**: a cluster is a folder of a Git repository that Argo CD applies. Platform components (cert-manager, Rancher, Trivy, Traefik or Envoy Gateway, Let's Encrypt, kube-green, Kyverno, External Secrets, Falco) arrive as pull or merge requests with pinned Helm charts. See [Clusters](./city/clusters.md).
- **DNS registrars** (Cloudflare, Route 53, Azure DNS) that point hostnames at a cluster's ingress. See [DNS registrars](./city/dns-registrars.md).
- **Logging rules** for the organization, with per-project overrides, handed to containers as environment variables. See [Logging](./city/logging.md).
- **AI models** per organization (Anthropic, Microsoft Foundry, Gemini, Azure OpenAI, Bedrock) with encrypted keys and a connection test. See [AI models](./city/ai-models.md).

:::note[Where Opsburg is going]
Building images, deploying the applications of a world to its clusters and running AI agents are the direction of the project. They are not in 0.2.0. Today a world records its parts, environments, frontends, backends and resources, and the clusters receive platform components and hostnames by pull request.
:::

## The city, in real terms

Each game term maps to something you would configure in any platform. This table lists only what 0.2.0 implements.

| In the game | What it is |
| --- | --- |
| The city gates | The sign-in page |
| Citizen | A user account, drawn as a figure you dress in the atelier |
| The atelier | The editor for your citizen's look |
| City | The organization. A user belongs to one city. |
| Founder | The owner of the organization, the user who founded it |
| Founding quests | The four setup steps of the organization: charter, palette, machines, invitations |
| Side quests | Optional organization settings, such as the logging rules ("Keep the logbooks") |
| World | A project. Up to eight per city. |
| Features, agents, applications | The parts of a world, depending on its kind |
| Laying the tracks | Choosing the environments a project deploys to, in promotion order |
| The engine room | The Kubernetes clusters of the organization |
| Cluster quests | Platform components, installed by pull or merge request as Argo CD Applications |
| Streets | Hostnames pointed at a cluster's ingress through a DNS registrar |
| Logbooks | Logging rules: level, format and audit lines |

[Core concepts](./core-concepts.md) explains how these pieces fit together.

## Who it is for

Opsburg is for teams that run their own Kubernetes clusters and want one place to describe the organization, its projects and its platform, with every change to a cluster going through a reviewed pull request. The game layer is the interface; the outputs are ordinary Git commits, Argo CD Applications, Helm charts, Ingress resources and DNS records.

## Self-hosted

You run Opsburg on your own infrastructure. It ships as a container image on `ghcr.io/opsburg/opsburg`, as an all-in-one image that bundles MongoDB, Redis and Nginx, and as a Helm chart. Credentials you store (Git tokens, DNS and AI keys) stay in your database, encrypted when you set an encryption key.

The visual style follows the [Opsburg design system](https://opsburg.dev/design-system/). More about the project is on [opsburg.dev](https://opsburg.dev) and on [GitHub](https://github.com/opsburg).

## Where to go next

- [Quick start](./quick-start.md): run the all-in-one image and found your first city in a few minutes.
- [Core concepts](./core-concepts.md): cities, worlds, environments, roles and GitOps.
- [Self-hosting with Docker](./self-hosting/docker.md), [Docker Compose](./self-hosting/docker-compose.md) or [Helm](./self-hosting/helm.md) for a production setup.
- [Release notes](./release-notes.md): what changed in each version.
