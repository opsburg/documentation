---
title: Quick start
description: Run the Opsburg all-in-one container, create the first account, found the city and raise the first world in about ten minutes.
sidebar_position: 2
---

# Quick start

This page takes you from nothing to a founded city with one world, on your own machine. It uses the all-in-one image, which runs MongoDB, Redis, the Opsburg backend and Nginx inside a single container. It is the fastest way to try Opsburg; for a production setup see the [self-hosting pages](#going-to-production).

## Before you start

- Docker on a machine with a few GB of free disk.
- A browser with WebGL 2. Without it, the console still works and shows the same boards as flat panels, without the 3D city.

:::note[Image platform]
The images are published for `linux/amd64` only. On an ARM machine (Apple Silicon, for example) add `--platform linux/amd64` to `docker run` so Docker emulates it.
:::

## 1. Run the all-in-one image

Generate the encryption key once and keep it:

```bash
export SECRETS_ENCRYPTION_KEY="$(openssl rand -base64 32)"
echo "$SECRETS_ENCRYPTION_KEY"   # save this value somewhere safe
```

Then start the container:

```bash
docker run -d --name opsburg \
  -p 8080:80 \
  -v opsburg-data:/data \
  -e FRONTEND_URL=http://localhost:8080 \
  -e SECRETS_ENCRYPTION_KEY \
  ghcr.io/opsburg/opsburg:0.3.0-all-in-one
```

What each part does:

| Option | Why |
| --- | --- |
| `-p 8080:80` | Nginx listens on port 80 in the container. It serves the console and proxies `/api` to the backend. MongoDB and Redis listen on the container's loopback only and are not published. |
| `-v opsburg-data:/data` | Everything that must survive the container lives under `/data`: the database, the Redis dump, repository clones and the generated JWT secret. |
| `FRONTEND_URL` | Required. The address you open the console at, starting with `http://` or `https://`. Invitation links and the return from GitHub, Google or Microsoft sign-in use it, and the session cookie is marked `Secure` only when it starts with `https://`. |
| `SECRETS_ENCRYPTION_KEY` | Required. 32 bytes, base64 or 64 hex characters. Git tokens, DNS credentials and AI keys are encrypted at rest with it. |

The tag `all-in-one` follows the latest release; `0.3.0-all-in-one` pins this version.

Without `FRONTEND_URL` or `SECRETS_ENCRYPTION_KEY` the container stops at once, before it starts MongoDB, and its log names the missing variables. A `FRONTEND_URL` that is not an `http(s)` address, or a key that does not decode to 32 bytes, makes the backend refuse to start, with the reason in the log.

:::warning[Keep the encryption key]
Pass the same `SECRETS_ENCRYPTION_KEY` on every start. If you recreate the container with a different key, the credentials already saved cannot be read back.
:::

You do not need to set `JWT_SECRET` for a trial. When it is missing, the container generates a random secret on the first start and keeps it in `/data/secrets/jwt_secret`, so sessions survive restarts. If you set it yourself, it must be at least 32 bytes or the backend refuses to start.

The first start takes a little while: the container initialises a single-node MongoDB replica set and waits for MongoDB and Redis before starting the backend. Follow it with:

```bash
docker logs -f opsburg
```

The backend is up when the log shows it listening. All four services log to the container's output.

## 2. Open the console and create the first account

Open [http://localhost:8080](http://localhost:8080). The camera flies to **The city gates**, the sign-in page.

1. Under the form, choose **Found a city** to switch to registration.
2. Fill **Username** (3 to 24 letters, digits, `-` or `_`), **Email** and **Password** (at least 10 characters).
3. Choose **Found the city**.

You are signed in at once. There is no email verification and no installation administrator: every account is equal, and the account that completes the first founding quest becomes the founder, that is the owner, of that city.

:::tip[Close registration after the first accounts]
Registration is open by default. Anyone who can reach the console can create an account and found a city of their own. Set `REGISTRATION_ALLOWED=false` once everybody who needs an account has one. From then on nobody new can get an account, with a password or with GitHub, Google or Microsoft, so an invitation link works only for someone who already has an account. Invite people while registration is still open. See [Sign in](./account/sign-in.md#what-the-operator-controls).
:::

## 3. Dress your citizen

A new account goes to **The atelier** first. Pick a build, hair, hat, outfit, tool and colors, or choose **Surprise me**, then **This is me**. You can change the look later with **Your look**. Details are in [The atelier](./account/atelier.md).

## 4. Found the city

The board now reads **Found your city** over **An empty plot**. The city, that is the organization, is founded by four quests. Each one raises part of the city as you complete it.

1. **Charter the city.** Enter the **City name** (2 to 48 characters) and **What does your organization do?**. **What should the AI know?** is optional. Choose **Found the city**: this creates the organization, and the other quests unlock.
2. **Paint the rooftops.** Keep or change the five colors of the palette (**Primary**, **Secondary**, **Accent**, **Dark**, **Light**). Tick **We have a design system** if you have one and name it. Choose **Paint the rooftops**.
3. **Fire up the machines.** Choose where you run (**Where do you run?**), on what (**On what?**) and **Your pipelines**. Under **Environments**, keep the default `dev`, `staging`, `production` or edit the list: the order is the promotion order. Choose **Fire up the machines**.
4. **Call the citizens.** Add collaborators' emails and choose **Invite** to get one-time invitation links to copy and send, or choose **I am founding it alone for now**.

Quests 2 to 4 can be done in any order. When all four are done, the city is founded and the board shows its name, its citizens and its worlds. [Founding the city](./city/founding-the-city.md) covers every field.

## 5. Raise the first world

A world, that is a project, floats in the sky around the city.

1. On the city board choose **Chart a new world**.
2. Pick a kind: **One application**, **A pool of agents** or **Many small applications**.
3. Fill **Project name** and, optionally, **What is it for?**.
4. List its parts: features, agents or applications depending on the kind. At least one is required.
5. Choose **Raise the world**. The camera flies to it as it rises.

A new world asks for its environments before anything else. On its board, under **Lay the tracks**, keep the environments it is **Deployed to** (all of the city's are selected) and choose **Lay the tracks**. The rest of the world opens once they are saved. See [Worlds](./worlds/overview.md) and [Environments](./worlds/environments.md).

## What next

- Connect GitHub or GitLab in [Git connections](./city/git-connections.md), so worlds can say where their code is kept.
- Add a cluster in [the engine room](./city/clusters.md) and install its platform components by pull request.
- Add a [DNS registrar](./city/dns-registrars.md) to point hostnames at a cluster.
- Enable GitHub, Google or Microsoft sign-in: see [Sign in](./account/sign-in.md) and [Environment variables](./self-hosting/environment-variables.md).

## Going to production

The command above is meant for a trial on one machine. For a real installation:

- [Docker](./self-hosting/docker.md): the all-in-one and standard images in detail.
- [Docker Compose](./self-hosting/docker-compose.md): Opsburg with its own MongoDB container.
- [Helm](./self-hosting/helm.md): the chart on `oci://ghcr.io/opsburg/charts/opsburg`.
- [Environment variables](./self-hosting/environment-variables.md): every setting, including a fixed `JWT_SECRET` and the sign-in providers.
- Put the console behind HTTPS and set `FRONTEND_URL` to its `https://` address, so the session cookie is sent only over TLS.

To stop and remove the trial:

```bash
docker rm -f opsburg
docker volume rm opsburg-data
```
