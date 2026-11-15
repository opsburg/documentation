---
title: Git connections
description: Connect an Opsburg city to GitHub (github.com or Enterprise Server) or GitLab (gitlab.com or self-managed), test the token and list repositories.
sidebar_position: 4
---

# Git connections

A Git connection tells the city, that is the organization, where its code lives: a GitHub or GitLab instance, an optional organization or group, and an access token. Worlds pick the connection that keeps their code, and [Kubernetes clusters](./clusters.md) open their pull requests through one.

A city can have up to 20 connections, for example its own github.com organization and the self-managed GitLab of a client.

## Supported hosts

| Provider | Instance | API used |
| --- | --- | --- |
| GitHub | github.com, or a GitHub Enterprise Server at your own address | `https://api.github.com` for github.com, `<address>/api/v3` otherwise |
| GitLab | gitlab.com, or a self-managed GitLab, also under a path (`https://acme.it/gitlab`) | `<address>/api/v4` |

## Add a connection

Open **Settings · AI models** on the city board and scroll to **Git connections**. Only the founder can add, edit, test and remove connections.

1. Press **Link a Git host**.
2. Fill in the form:

   | Field | What to enter |
   | --- | --- |
   | **Provider** | GitHub or GitLab. |
   | **Name** | How the city calls it, up to 100 characters. Unique in the city, case insensitive. |
   | **Address (optional)** | Empty for github.com or gitlab.com. Otherwise the `https://` address of your instance, without credentials, query or fragment. |
   | **Organization or user (optional)** (GitHub) | Where the repositories live, like `acme`. Empty: the token's own account. |
   | **Group (optional)** (GitLab) | The group path, subgroups included, like `acme/platform`. Empty: the projects the token is a member of. |
   | **Access token** | See [Token permissions](#token-permissions). |
   | **Use it by default** | The default connection is preselected for new worlds and clusters. The first connection is always the default. |

3. Press **Link it to the city**.

The list shows each connection as `<Provider> · <host>/<namespace>`, with a **Default** chip on the default one.

## Token permissions

The form gives these hints:

- **GitHub**: "A personal access token with access to the repositories and their workflows."
- **GitLab**: "A personal or group access token with the api scope."

What Opsburg does with the token decides what it needs:

| Use | Calls |
| --- | --- |
| Connection test | Reads the token's user, then the organization, user or group you named. |
| Repository listing | Lists repositories of the namespace, or of the token's account. |
| Cluster quests and streets | Reads the cluster repository, creates a branch, commits files and opens a pull request (GitHub) or merge request (GitLab), then reads its state. |

For a connection used by a cluster, the token must be able to write to that repository and open pull or merge requests. Opsburg never pushes to an existing branch: every write lands on a new branch named `opsburg/...`, behind a request someone has to merge.

## Test a connection

Press **Test** under a connection. Opsburg signs in to the API with the token and, if you set a namespace, looks it up. Possible results:

- `✓ Signed in as <login> (120 ms)`
- `✓ Signed in as <login>, organization acme reachable (180 ms)`
- `✗ Signed in as <login>, but acme does not exist or the token cannot see it`
- `✗ The host rejected the token`
- `✗ The address does not look like the API of this provider`
- `✗ The host did not answer within 15 seconds`

The test never fails with an error; a problem is reported as a `✗` result.

## List repositories

On a world's board, under **Code kept in**, press **Look at the repositories**. Opsburg reads one page of the 100 most recently active repositories of the connection: those of the organization, user or group, or, without a namespace, those of the token's account. The board shows twelve, with **Show all N** for the rest, each with its visibility (`private` or `public`) and default branch. When the page is full, the board says "The 100 most recently active: there are more on the host."

The same listing feeds the **Repository** suggestions when you [bring a cluster](./clusters.md#bring-a-cluster).

Every citizen can list repositories: they are read with the city's token and nothing is changed.

## How a world picks a connection

When the founder charts or redraws a world, the form has a **Code kept in** select listing the city's connections, with the default one preselected for a new world, plus **None yet**. If the city has no connection, the form says "No Git connection in the city yet: link one in the city settings to keep this world's code." See [Worlds](../worlds/overview.md).

## Edit, make default, remove

- **Edit** opens **Tune &lt;name&gt;**. The stored token is kept unless you type a new one, but only while the provider and the address stay the same: point the connection elsewhere and you must type the token again ("Type the token again: the host changed.").
- **Make default** moves the default to this connection. There is always one default while connections exist.
- **Remove** asks for confirmation. Opsburg refuses to remove a connection while a world or a cluster uses it, and names them: choose another connection for them first. If you remove the default, the oldest remaining connection becomes the default.

## How the token is stored

"Tokens are stored encrypted and never shown again." The API never returns a token, to the founder either; it returns only the name, provider, address, namespace and default flag.

Tokens are encrypted with AES-256-GCM with the operator's `SECRETS_ENCRYPTION_KEY`, which the backend requires to start. See [AI models](./ai-models.md#how-keys-are-stored) for what the key protects and why you must keep it.

Opsburg sends the token only to the address stored with the connection, and does not follow redirects, so a redirect cannot carry the token to another host.
