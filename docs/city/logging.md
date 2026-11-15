---
title: Logging rules
description: Set the log level, format and audit lines of an Opsburg city, override them per world, and map them to LOG_LEVEL, LOG_JSON and LOG_AUDIT.
sidebar_position: 8
---

# Logging rules

The city, that is the organization, sets three logging rules for its applications: how much they log, in which format, and whether they write audit lines. Each world, that is each project, follows the city's rules unless it sets one of them apart.

## The rules

| Rule | Values | Default |
| --- | --- | --- |
| **Level** | `trace`, `debug`, `info`, `warn`, `error`, `fatal` | `info` |
| **Format** | JSON (one object per line) or Plain text | JSON |
| **Audit log** | On or Off: whether applications write audit lines, that is who did what, on which record | Off |

"From trace, the chattiest, to fatal. Each level keeps the ones above it." A level of `warn` keeps `warn`, `error` and `fatal`.

A city that never saved its rules uses the defaults: `info`, JSON, audit off.

## Keep the logbooks

Setting the city's rules is the first side quest, **Keep the logbooks**: "How much your applications log, in JSON or plain text, and whether they keep an audit trail." Side quests are optional, open once the city is chartered, and never hold back the founding. See [Founding the city](./founding-the-city.md).

1. On the quest board, under **Side quests**, open **Keep the logbooks**.
2. Pick the **Level**, the **Format** and the **Audit log**.
3. Press **Keep the logbooks**.

The first save completes the side quest, even if you keep the defaults. Its reward: "Every world writes by your rules." The rules can change at any time afterwards.

The same form is in the City settings, in the **Logbooks** section: "How much every world writes down, in which hand, and whether it keeps an audit trail. A world can set any of them apart." After the first save the button reads **Save the logbooks** and is enabled only when something changed.

Only the founder can change the rules. Citizens see them as a single line, for example `info · JSON · audit off`.

## Override per world

Each world can set any of the three rules apart from the city. On a world's board, the **Logbooks** line shows the rules in force and either "The city's rules." or "Set apart from the city's."

1. Press **Change** next to **Logbooks** (founder only).
2. For each of **Level**, **Format** and **Audit log**, pick a value or keep the first option, **The city's (…)**, which follows the city.
3. Press **Save**.

A rule left on the city's option keeps following the city, so a later change to the city's rules reaches that world too. The override is available once the world's environments are saved. See [Worlds](../worlds/overview.md).

The rules in force for a world are resolved per rule:

```text
world's own value  →  else the city's value  →  else the default
```

## What containers receive

Each rule maps to an environment variable:

| Variable | Value | Example |
| --- | --- | --- |
| `LOG_LEVEL` | The level | `info` |
| `LOG_JSON` | `true` for JSON, `false` for plain text | `true` |
| `LOG_AUDIT` | `true` when audit lines are on, `false` otherwise | `false` |

After a save the form says "✓ Saved. Every world picks them up on its next deploy." Configure your application's logger from these variables, and fall back to sensible defaults when they are missing.

```js
// Node.js, with pino
import pino from "pino"

const json = process.env.LOG_JSON !== "false"
const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    ...(json ? {} : { transport: { target: "pino-pretty" } })
})
const audit = process.env.LOG_AUDIT === "true"
```

:::note[Deploys in 0.2.0]
Opsburg 0.2.0 saves the rules and resolves them per world, but it does not deploy application containers itself yet. The variable names above are the ones Opsburg defines for these rules: write your code against them. See [Applications](../worlds/applications.md).
:::
