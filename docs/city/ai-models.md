---
title: AI models
description: Bring AI models to an Opsburg city (Anthropic, Microsoft Foundry, Gemini, Azure OpenAI, Bedrock), pick the default, test the connection and keep the keys encrypted.
sidebar_position: 7
---

# AI models

The city, that is the organization, brings its own AI models: a provider, a model and the credentials to reach it. A city can hold up to 10.

:::info[What 0.2.0 does with them]
In 0.2.0 you can add models, pick the default one, run a live connection test, edit and remove them. No feature of this release sends requests to the models beyond that test: the assistants and agents that will use them are not shipped yet.
:::

## Providers

| Provider (as listed) | Fields | Model |
| --- | --- | --- |
| Anthropic (Claude) | **API key** | Optional. "Leave empty for the latest Claude." |
| Microsoft Foundry (Claude on Azure) | **Resource name** (the `<resource>` of `https://<resource>.services.ai.azure.com`), **API key** | Optional. "Leave empty for the latest Claude." |
| Google Gemini | **API key** | Required, for example `gemini-2.5-pro`. |
| Azure OpenAI | **Endpoint** (`https://<resource>.openai.azure.com/`), **API key**, and the box **It is a reasoning deployment (o-series, GPT-5)** | Required: the name of your deployment. |
| Amazon Bedrock (Claude) | **Region** (for example `eu-west-1`), **Access key id**, **Secret access key** | Required: the model id or inference profile. |

When the model is left empty on Anthropic or Microsoft Foundry, Opsburg uses `claude-opus-5-5`. The list then shows "default model" next to the provider.

Opsburg checks the shape of the fields that end up in a URL:

- the Foundry resource is a name, like `my-foundry`, not a URL;
- the Bedrock region is an AWS region name, like `eu-west-1`;
- the Azure OpenAI endpoint must be an `https` address on `.openai.azure.com`, `.cognitiveservices.azure.com` or `.services.ai.azure.com`.

## Add a model

Open **Settings · AI models** on the city board. Only the founder can add, edit, test and remove models.

1. Press **Bring a model**.
2. Pick the **Provider**.
3. Give it a **Name** ("How the city calls it.", up to 100 characters, unique in the city regardless of case).
4. Fill in the **Model** and the provider's fields.
5. Tick **Use it by default** if it should be the default. The first model is always the default.
6. Press **Bring it to the city**.

## The default model

"The first one is the default." The default model carries a **Default** chip and comes first in the list. Press **Make default** on another model to move it. There is always exactly one default while the city has models. If you remove the default, the oldest remaining model takes its place.

## Test a model

Press **Test**. Opsburg sends the model a short request ("Answer with the single word \"ok\"", at most 16 tokens) and shows the answer and the round trip time:

- `✓ The model answered: ok (840 ms)`
- `✗ The provider rejected the credentials`
- `✗ The provider does not know this model or deployment`
- `✗ The provider is rate limiting the requests: try again in a few minutes`
- `✗ The provider did not answer within 20 seconds`

The test never fails with an error: a problem is reported as a `✗` result, without the provider's own message. Tests are rate limited per minute.

## Edit and remove

- **Edit** opens **Tune &lt;name&gt;**. Keys are kept as they are unless you type new ones ("Kept as it is unless you type a new one."). A stored key is kept only while the provider and where it is sent (resource, endpoint, region, access key id) stay the same. Change one of those and Opsburg asks you to type the key again, so a stored key can never be sent to an endpoint of someone's choosing.
- **Remove** asks "Remove &lt;name&gt;?". Press **Remove** to confirm or **Keep** to cancel.

## Who sees what

| | Founder | Citizen |
| --- | --- | --- |
| Name, provider, model, default flag | Yes | Yes |
| Configuration (resource, endpoint, region, access key id) | Yes | No |
| API keys and secret access keys | No, shown as a placeholder | No |

A city with no model shows "No model yet." To the founder it adds "Bring your own: Claude, Gemini or GPT, with your keys."

## How keys are stored

"Keys are stored encrypted and never shown again." The secret fields are the **API key** and the **Secret access key**. The API never returns them, to anyone: the founder gets a placeholder in their place.

Opsburg encrypts secrets with AES-256-GCM, using the operator's `SECRETS_ENCRYPTION_KEY`, before writing them to MongoDB. A database dump or backup then holds ciphertext, not usable keys. The same applies to Git tokens and DNS registrar secrets. The key is required: the backend does not start without it, so no secret is written in clear.

The key holds 32 bytes, as base64 or as 64 hex characters. Generate one with:

```sh
openssl rand -base64 32
```

See [Environment variables](../self-hosting/environment-variables.md).

:::warning[Keep the key]
Secrets written with a key can be read only with that same key. If you lose or change it, Opsburg cannot decrypt them and you must type every API key, token and secret again. Store the key with the same care as the database backups.
:::

:::note
Encryption protects the database, not the running server: the backend holds the key to decrypt secrets when it calls a provider. An installation that ran a release before 0.3.0 without a key still holds the secrets it saved then in plain text, until they are saved again.
:::
