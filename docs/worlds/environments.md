---
title: Environments
description: How a world picks the environments its code goes through, in the city's promotion order, and how it sets its own logging rules apart from the city's.
sidebar_position: 2
---

# Environments

A world, that is a project, ships its code through a list of environments in promotion order: the first one gets the code first, the last one is usually production. The environments belong to the city, that is the organization. Each world picks among them.

## Where the environments come from

The city defines its environments in the machines quest (**Fire up the machines**), under **Environments**. That list sets two things for every world:

- **Which environments exist.** A world can only use environments the city has.
- **Their promotion order.** A world keeps the city's order. It cannot reorder them.

A city holds 1 to 10 environments. Names have 1 to 24 lowercase letters, digits and dashes, and start with a letter or a digit. See [Founding the city](../city/founding-the-city.md) for the machines quest.

When the city removes an environment, every world that used it drops it. When the city adds one, existing worlds do not get it automatically: the owner adds it to each world that needs it.

## The environments quest

A new world has one quest before anything else: **Lay the tracks**, its environments. Until it is done, the world board shows only this quest, and the server refuses every other change to the world (frontends, backends, resources, logging rules, redrawing) with the message "Define the environments of the project first". Abandoning the world is still possible.

To complete it:

1. Open the world from the **Worlds** list on the city board.
2. Under **First quest**, **Lay the tracks**, the **Deployed to** chips list the city's environments. All of them start selected: a new world ships to every environment of the city unless you say otherwise.
3. Deselect the environments the world does not use. The line under the chips shows the result in promotion order, for example `dev → staging → production`. At least one environment must stay selected.
4. Select **Lay the tracks**.

The rest of the world opens at once: parts, frontends and backends, resources, Git connection and logbooks.

:::note
Only the city owner can lay the tracks. Other members see **Only the founder can lay the tracks.**
If the city has no environments yet, the quest says so: add them in the machines quest first.
:::

## Changing the environments later

On the world board, next to **Environments**, the owner selects **Change**. The same chips appear, preselected with the world's current environments. Change the selection and select **Save the environments**, or **Cancel**.

Frontends and backends set values per environment (a version, resource overrides, continuous deployment). They can only name environments the world uses.

## Logging rules of a world

The city sets the logging rules every world follows: the log level, the format and whether applications write audit lines. See [Logging](../city/logging.md). A world can set any of the three apart from the city, and leave the others on the city's.

On the world board, the **Logbooks** section shows the rules in force, for example `info · JSON · audit off`, followed by **Set apart from the city's.** or **The city's rules.**

To change them, the owner selects **Change** next to **Logbooks**:

| Field | Options |
| --- | --- |
| **Level** | **The city's (…)**, or one of `trace`, `debug`, `info`, `warn`, `error`, `fatal`. Each level keeps the ones above it. |
| **Format** | **The city's (…)**, **JSON** or **Plain text**. |
| **Audit log** | **The city's (…)**, **On** or **Off**. |

Each **The city's (…)** option shows the city's current value in brackets. Select **Save**. A rule left on the city's value follows the city, including later changes the city makes. The board shows the saved rules right away.

The rules in force map to the variables `LOG_LEVEL`, `LOG_JSON` and `LOG_AUDIT` that the world's containers read. A single frontend or backend can still set its own level in its **Runtime** tab. See [Frontends and backends](./applications.md).

Logging rules, like every other change, wait for the environments quest.
