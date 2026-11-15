---
title: Frontends and backends
description: How the owner adds, changes and removes the frontends and backends of a world, what each tab of their editors records, and what Opsburg 0.2.0 does with it.
sidebar_position: 3
---

# Frontends and backends

The frontends and backends of a world, that is a project, are the applications it is made of. They appear on the world board under **Frontends and backends**, each with its name, its slug, the part it belongs to and a badge with its kind (for example `Docker` or `Backend · node · cron`).

:::warning[What 0.2.0 does with them]
Opsburg 0.2.0 records the frontends and backends of a world and can create or link their Git repositories. It does not build, deploy or run them yet. The container, probes, resources, exposure, variables, schedule, versions and continuous deployment settings are stored with each application, and no part of 0.2.0 applies them to a cluster.
:::

## Who can do what

- Every member of the city sees the list on the world board.
- Only the city **owner** adds, opens, changes and removes frontends and backends. For other members the rows do not open.
- Nothing can be added or changed until the world's environments are set. See [Environments](./environments.md).

## Limits

| Item | Limit |
| --- | --- |
| Frontends per world | 30 |
| Backends per world | 30 |
| Name | 3 to 100 characters |
| Slug | 2 to 50 lowercase letters, digits and dashes, starting with a letter or a digit. Unique across all frontends and backends of the world. Fixed once saved. |
| Description | Up to 600 characters |
| Context for AI | Up to 10,000 characters |
| Variables | Up to 100 per application |
| Replicas | 0 to 20 |
| Probe delays and periods | Up to 3600 seconds |

## Adding one

1. Open the world from the city board.
2. Under **Frontends and backends**, select **Add frontend** or **Add backend**.
3. Fill in the tabs (described below). Tabs with a problem show a dot after you try to save.
4. Select **Raise the frontend** or **Raise the backend**.

To change one later, select its row: the editor opens as **Tune** followed by its name. Select **Save** to keep the changes, or **Cancel**.

## General tab

Both editors start with the same identity fields:

| Field | Notes |
| --- | --- |
| **Name** | Typing it fills the slug, with `-fe` for a frontend or `-be` for a backend (for example `Orders` becomes `orders-be`). |
| **Slug** | It names the repository, the image and the service. It is fixed once the application is saved. |
| **Description** | Optional. |
| Part | Labelled after the world's parts (**Feature**, **Agent** or **Application**): the part of the world it belongs to, or **None**. |
| **Version** | The latest version, set by hand. Letters, digits, dots, dashes and underscores. |
| **Version per environment** | One field per environment of the world. Blank means it is not deployed there. |
| **Continuous deployment** | Chips, one per environment: where every deploy pulls the image again and rolls the pods out. Shown for backends and Docker frontends. |
| **Code repository** | See [Code repository](#code-repository). |

A frontend adds:

| Field | Options |
| --- | --- |
| **Kind** | **Bundle** (static files) or **Docker** (an image served by its own container, like a backend). The kind decides which other tabs appear. |
| **Framework** | **None**, **React**, **Vue** or **Angular**. |

A backend adds:

| Field | Options |
| --- | --- |
| **Runtime** | **None**, **Node.js**, **Python**, **Go**, **.NET**, **Java** or **Other**. |
| **Framework** | Free text, for example Fastify or Spring Boot. |

### Code repository

The **Code repository** chips decide where the application's code lives. The connection offered first is the one of the application, or else the world's Git connection. See [Worlds](./overview.md#which-git-connection-keeps-the-code).

| Choice | What happens |
| --- | --- |
| **None** | No repository. |
| **Link an existing one** | Pick a **Connection** and a **Repository** the connection's token can see. Opsburg checks that it exists. |
| **Create a new one** | Pick a **Connection**, a **Repository name** (blank uses the slug) and whether it is **Private** (on by default). Opsburg creates the repository on the Git host, with an initial README, in the connection's namespace (a GitHub organization or a GitLab group) or else in the account of the token. |
| **Keep it** | On a saved application with a repository: no change. |
| **Unlink** | Forget the repository. The repository itself stays on the Git host. |
| **Link another** | Replace the linked repository with another existing one. |

The link and create choices only appear when the city has a Git connection. See [Git connections](../city/git-connections.md).

:::note
Creating a repository happens when you save. If the host refuses (for example because a repository with that name already exists), nothing is saved and the editor shows the host's reason.
:::

## Context tab

**Context for AI**: Markdown notes about this application for AI agents, up to 10,000 characters. Opsburg 0.2.0 stores them; no agent in this release reads them yet.

## Links tab (frontends)

**Calls**: the backends of the world this frontend calls. Removing a backend takes it off every **Calls** list.

## Runtime tab (backends and Docker frontends)

The container of the application. Every field left blank means the platform's or the chart's default, shown as a grey placeholder.

| Group | Fields | Default when blank |
| --- | --- | --- |
| **Image** | **Image repository**: registry and repository without the tag (for example `ghcr.io/acme/orders-be`); each environment adds its version. **Port**. | Port `8080` |
| **Probes** | **Liveness path**, **Readiness path**, **Liveness delay (s)**, **Liveness period (s)**, **Readiness delay (s)**, **Readiness period (s)**. | `/health/live`, `/health/ready`, 30 seconds |
| **Logging and docs** | **Log level** (blank follows the level of the environment), **Docs path**, **OpenAPI path**. | |
| **Exposure** | **Exposed on the host of every environment**, with an **Exposure path** such as `/api/orders`. | On for a new Docker frontend (the path is then required), off for a new backend |
| **Resources** | **CPU request**, **CPU limit**, **Memory request**, **Memory limit** as Kubernetes quantities (`250m`, `0.5`, `128Mi`, `1Gi`), and **Replicas**. | `25m`, `500m`, `128Mi`, `512Mi`, 1 replica |
| **Per environment** | The same resources and replicas for each environment of the world. Blank keeps the container's own value. | |

Opsburg refuses a request above its limit, counting the defaults for the fields left blank, both for the container and for each environment.

A Docker frontend also declares the variables its image reads, under **Variables** on this tab: **Declare a variable**, then a name, an optional description and the **Required** and **Secret** toggles. These are declared only, without values: the value comes from the environment.

## Variables tab (backends)

Variables handed to the backend container, the same in every environment. Select **Add a variable**, then give a name (letters, digits and underscores, not starting with a digit), a value (up to 10,000 characters), an optional description, and whether it is **Secret**.

- Every variable needs a value.
- All values are encrypted at rest with the installation's `SECRETS_ENCRYPTION_KEY`.
- A secret value is never shown again. Its field says the value is set: leave it blank to keep the stored value, or type a new one to replace it.

## Schedule tab (backends)

Blank means the backend is always on. With a **Cron expression** (five fields such as `*/15 * * * *`, or a macro such as `@daily`) it is meant to run as a Kubernetes CronJob instead. **Time zone** takes an IANA name such as `Europe/Rome`; blank means the cluster's. The time zone is kept only together with a schedule.

A scheduled backend shows `cron` in its badge.

## Danger tab

Shown for a saved application. Select **Tear down** followed by its name, then confirm with **Tear down**, or **Keep it** to go back.

Its settings, versions and variables are lost. Its repository stays on the Git host: only Opsburg forgets it.
