---
title: Worlds
description: A world is a project of the city, of one of three kinds, with up to eight per city, managed by the city owner and tied to the Git connection that keeps its code.
sidebar_position: 1
---

# Worlds

A world, that is a project, floats in the sky around the city, that is the organization. Each world groups the environments it ships to, its frontends and backends, its resources and the Git connection that keeps its code.

## The three kinds

When you chart a world you pick its kind first. The kind decides how the world looks in the sky and what its parts are called. It cannot change later.

| Kind | Parts are called | Parts | What it is for |
| --- | --- | --- | --- |
| **One application** | Features | 1 to 8 | One product split into features, such as Checkout, Search, Back office. |
| **A pool of agents** | Agents | 1 to 12 | A set of AI agents that work together, such as a triage bot or a release scribe. |
| **Many small applications** | Applications | 1 to 10 | Several small, independent applications, such as a landing page, an admin tool, a status page. |

A part has a name (up to 40 characters, unique in the world) and an optional line on what it does (up to 200 characters). Frontends and backends can later be attached to a part.

## Limits and permissions

- A city holds up to **eight worlds**. A new world takes the first free place in the sky, and keeps it when another world is abandoned.
- Only the **owner** of the city charts, redraws, sets up and abandons worlds. Other members see every world and its board, but cannot change anything.
- The city must be founded first. See [Founding the city](../city/founding-the-city.md).
- A world name has 2 to 48 characters and is unique in the city, ignoring case.

## Charting a world

1. On the city board, under **Worlds**, select **Chart a new world**. The button shows only to the owner, and only while the city has fewer than eight worlds.
2. In **The atlas**, pick the kind: **One application**, **A pool of agents** or **Many small applications**.
3. Fill in the form:
   - **Project name**: 2 to 48 characters.
   - **What is it for?**: optional, up to 600 characters.
   - The parts: one row per feature, agent or application, with an optional **What it does (optional)** line. Use **Add feature** (or **Add agent**, **Add application**) for more rows.
   - **Code kept in**: the Git connection of the city that keeps the world's repositories. See [Which Git connection keeps the code](#which-git-connection-keeps-the-code).
4. Select **Raise the world**.

The camera flies to the new world. Its board shows only its first quest until you set its environments. See [Environments](./environments.md).

## The world board

Open a world from the **Worlds** list on the city board. Each row shows the world's kind, its name and how many parts it has.

Until the environments quest is done, the board shows the kind, the name, the description and the **Lay the tracks** quest. Once it is done, the board shows:

| Section | What it shows |
| --- | --- |
| Parts | The features, agents or applications of the world, with their summaries. The heading reads, for example, **Features · 3**. |
| **Environments** | The environments the world ships to, in promotion order. The owner can **Change** them. See [Environments](./environments.md). |
| **Frontends and backends** | The applications of the world. The owner opens one to change it, or adds a new one. See [Frontends and backends](./applications.md). |
| **Resources** | The resources of the world, such as databases, storages and APIs. |
| **Code kept in** | The Git connection of the world, and on request its repositories. |
| **Logbooks** | The logging rules the world follows, its own or the city's. See [Environments](./environments.md#logging-rules-of-a-world). |

The owner also gets **Redraw the world** and **Abandon this world**. Everyone gets **Back to** the city.

### Redrawing a world

**Redraw the world** opens the same form used to chart it. You can change the name, the description, the parts and the Git connection. The kind stays as it is. A part you keep (same row) keeps its identity, so frontends and backends attached to it stay attached. Select **Redraw the world** to save.

Redrawing is possible only after the environments quest is done.

### Abandoning a world

1. Select **Abandon this world**.
2. Confirm with **Abandon**, or select **Keep it** to go back.

:::danger
Abandoning deletes the world together with its frontends, backends and resources. Repositories on the Git host are not touched. There is no undo.
:::

## Which Git connection keeps the code

Each world points at one of the city's Git connections (GitHub or GitLab). See [Git connections](../city/git-connections.md) for how to add one.

- A new world starts on the city's default connection. You can pick another one, or **None yet**.
- If the city has no Git connection, the form says so and the world is created without one.
- On the board, **Code kept in** shows the connection name, its host and namespace. **Look at the repositories** lists the repositories the connection can see, with their visibility and default branch. The first 12 show at once; **Show all** lists the rest. When the host returns more than Opsburg reads, the board says it is showing the most recently active ones.
- With no connection chosen, the board shows **No Git connection chosen for this world yet.**

The connection of the world is the one each frontend and backend offers first when you link or create its repository. A frontend or backend can still use another connection of the city.
