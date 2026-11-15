---
title: The city
description: What an Opsburg city (the organization) holds, who can change it, and where each of its settings lives.
sidebar_position: 1
---

# The city

In Opsburg the city, that is the organization, is the top level object. It holds the people, the shared settings and the infrastructure that every world (that is, every project) builds on. A player belongs to one city: Opsburg loads it right after sign-in and shows it in the 3D scene.

## What a city holds

| In the city | What it is | Page |
| --- | --- | --- |
| Charter | Name, a description of the organization and the context for AI assistants | [Founding the city](./founding-the-city.md) |
| Palette and design system | Five brand colors and, optionally, the design system your team uses | [Founding the city](./founding-the-city.md) |
| Machines | Clouds, runtime, CI tools and the environments, in promotion order | [Founding the city](./founding-the-city.md) |
| Citizens | The founder and the members who joined through an invitation link | [Members and invitations](./members-and-invitations.md) |
| Git connections | GitHub and GitLab accounts where the city keeps its code | [Git connections](./git-connections.md) |
| Kubernetes clusters | Folders of a Git repository that Argo CD applies | [Kubernetes clusters](./clusters.md) |
| DNS registrars | Cloudflare, Route 53 or Azure DNS accounts that point hostnames at a cluster | [DNS registrars](./dns-registrars.md) |
| AI models | The models and credentials the city brings | [AI models](./ai-models.md) |
| Logging rules | Log level, format and audit lines for every world | [Logging rules](./logging.md) |
| Worlds | Up to eight projects around the city | [Worlds](../worlds/overview.md) |

## Draft and founded

A new city is a draft. It becomes founded when its four founding quests are done: the charter, the palette, the machines and the invitations. The city board then shows the date it was founded, and the worlds, the clusters and the settings open up. See [Founding the city](./founding-the-city.md).

The slug of the city (its address) follows the name while the city is a draft. Once it is founded, renaming the city keeps the slug.

## Who can change what

Opsburg 0.2.0 has two roles. The city board calls them **Founder** and **Citizen**; the API calls them `owner` and `member`.

| Action | Founder | Citizen |
| --- | --- | --- |
| Complete or change the founding quests and the logging side quest | Yes | No |
| See the members of the city | Yes | Yes |
| See and revoke invitations | Yes | No |
| Add, edit, test and remove AI models, Git connections and DNS registrars | Yes | No |
| See the list of AI models, Git connections and DNS registrars | Yes | Yes, without their configuration |
| List the repositories behind a Git connection | Yes | Yes |
| Bring a cluster, start or abandon its quests, open and close streets | Yes | No |
| See clusters and refresh the state of their pull requests | Yes | Yes |
| Chart, change and remove worlds, set their logging rules | Yes | No |

The backend enforces these rules: a citizen who calls a founder-only endpoint gets `403 forbidden`. Secrets (tokens, API keys, client secrets) are never returned to anyone, founder included.

:::note
In 0.2.0 the founder is the only owner. There is no way to promote a citizen, hand the city over or remove a member. See [Members and invitations](./members-and-invitations.md).
:::

## Map of the city settings

Once the city is founded, its board has these entries:

- **City charter** reopens the founding quests. Change any of them and the city rebuilds itself.
- **Your look** opens the [atelier](../account/atelier.md).
- **Engine room · Kubernetes** opens the clusters. See [Kubernetes clusters](./clusters.md).
- **Settings · AI models** opens the **City settings** panel, with four sections in this order:
  1. **AI models**: see [AI models](./ai-models.md).
  2. **Git connections**: see [Git connections](./git-connections.md).
  3. **DNS registrars**: see [DNS registrars](./dns-registrars.md).
  4. **Logbooks**: see [Logging rules](./logging.md).
- **Chart a new world** creates a world (founder only, up to eight). See [Worlds](../worlds/overview.md).
- **Leave the city** signs you out.

While the city is still a draft, the quest board has a **Settings** link that opens the same City settings panel.

## Limits

| What | Limit per city |
| --- | --- |
| Worlds | 8 |
| AI models | 10 |
| Git connections | 20 |
| DNS registrars | 10 |
| Kubernetes clusters | 20 |
| Streets per cluster | 100 |
| Environments | 10 |
| Invitations per send | 20 emails |
