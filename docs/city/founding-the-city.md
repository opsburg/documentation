---
title: Founding the city
description: The four founding quests of an Opsburg city (charter, palette, machines and invitations), what each one asks for and saves, and how they raise the city.
sidebar_position: 2
---

# Founding the city

Founding the city, that is creating the organization, takes four quests. Each one saves a part of the organization and raises a part of the city in the 3D scene. When all four are done, the city is founded and the rest of Opsburg opens: worlds, clusters and the city board.

The quest board shows a progress bar (`0/4` to `4/4`) and, under each quest, either what it asks for or what it raised.

| # | Quest | What it saves | What it raises |
| --- | --- | --- | --- |
| 1 | Charter the city | Name, description, AI context | the town hall |
| 2 | Paint the rooftops | Color palette, design system | the houses, in your colors |
| 3 | Fire up the machines | Clouds, runtime, pipelines, environments | the works and the environment islands |
| 4 | Call the citizens | Invitations | the square and its lights |

The first quest creates the organization, so the other three stay locked ("Charter the city first.") until it is done. After that, the founder can complete quests 2 to 4 in any order. Only the founder can complete the quests; a citizen sees "Only the founder, &lt;name&gt;, can complete the quests."

The city is founded the moment the last of the four quests is saved, whatever the order.

## 1. Charter the city

"Tell us about your organization: it becomes the context of your AI assistants."

| Field | Rules |
| --- | --- |
| **City name** | Your organization, team or company. 2 to 48 characters. |
| **What does your organization do?** | Required, up to 2,000 characters. |
| **What should the AI know?** | Optional, up to 4,000 characters. Products, customers, conventions, words with a special meaning for you. |

The button reads **Found the city** the first time and **Save the charter** afterwards. Saving the first time creates the organization with you as its founder.

The city also gets a slug, made from the name (lowercase letters, digits and dashes). While the city is a draft, the slug follows the name when you rename it. Once the city is founded, the slug stays put.

:::note
A player can found one city only. Saving a new charter fails with "You already belong to a city." if you already founded or joined one.
:::

:::info[AI context in 0.2.0]
Opsburg 0.2.0 stores the AI context with the charter. The AI assistants that will read it are not part of this release. See [AI models](./ai-models.md).
:::

## 2. Paint the rooftops

"Your color palette and your design system."

**Color palette.** Five colors: Primary, Secondary, Accent, Dark and Light. Pick them with the color picker or type them as hex (`#rgb` or `#rrggbb`). Opsburg stores them as lowercase `#rrggbb`. The form starts from Opsburg's own palette:

| Swatch | Default |
| --- | --- |
| Primary | `#c9952a` |
| Secondary | `#2f8a78` |
| Accent | `#b4642e` |
| Dark | `#0a1e35` |
| Light | `#f6ecd3` |

The houses of the city are painted with these colors.

**Design system.** Tick **We have a design system** to describe it:

| Field | Rules |
| --- | --- |
| **Name** | Required, up to 80 characters. |
| **npm package** | Optional. A valid npm package name, like `@acme/design-system`. |
| **Storybook** | Optional. An `http` or `https` address. |
| **Figma library** | Optional. An `http` or `https` address. |
| **Notes** | Optional, up to 2,000 characters. Fonts, spacing, rules the components follow. |

Leave the box unticked if you have none: the quest still completes. The button reads **Paint the rooftops**, then **Repaint the city** once the quest is done.

## 3. Fire up the machines

"Clouds, runtimes, pipelines and environments you run on."

| Group | Choices | Rules |
| --- | --- | --- |
| **Where do you run?** | AWS, Azure, Google Cloud, On premises, Other | At least one. |
| **On what?** | Kubernetes, Containers, Virtual machines, Serverless, Not yet | Exactly one. Kubernetes is preselected. |
| **Your pipelines** | GitHub Actions, Azure Pipelines, GitLab CI, Jenkins, Other, None yet | At least one. None yet excludes the others. |
| **Environments** | Free names | 1 to 10. Each is 1 to 24 lowercase letters, digits or dashes, starting with a letter or digit. No repeats. |
| **Anything else?** | Free text | Optional, up to 2,000 characters. Regions, accounts, what runs where. |

The environments start as `dev`, `staging` and `production`. Remove one with its `×`, add one with the **New environment** field and **Add**. The order of the list is the promotion order: new worlds take their environments from it, in this order. See [Environments](../worlds/environments.md).

Each cloud raises a works in the city, each environment an island. The button reads **Fire up the machines**, then **Save the machines**.

:::warning[Removing an environment]
When you save the machines without an environment that worlds were using, Opsburg takes that environment off every world of the city.
:::

## 4. Call the citizens

"Invite your collaborators."

Type an email under **Collaborators** and press **Add** (or Enter). Add up to 20 emails, then press **Invite** (or **Invite N citizens**). Opsburg has no mail service: it shows one link per email, and you send each link yourself. The links are shown only once.

To found the city alone, press **I am founding it alone for now**. The quest completes without any invitation, and you can invite people later from the same quest.

Invitations, their lifetime and how to revoke them are covered in [Members and invitations](./members-and-invitations.md).

:::tip
On the 3D board, the quest board stays open after the last quest founds the city, so you can copy the invitation links. Press **Enter &lt;city&gt;** when you are done.
:::

## After the founding

Once the city is founded, the quest board title reads "City founded" and the city board takes its place, with a **City charter** button that reopens the quests. Change any quest at any time: the city rebuilds itself.

The quest board also lists the side quests. They are optional, can be done at any time and never hold back the founding. Opsburg 0.2.0 has one: **Keep the logbooks**, described in [Logging rules](./logging.md).
