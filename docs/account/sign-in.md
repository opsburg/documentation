---
title: Sign in
description: How players sign in to Opsburg with a username and password or with GitHub, Google or Microsoft, and which options the server configuration turns on.
sidebar_position: 1
---

# Sign in

You sign in at **The city gates**, the first board the console shows when you are not signed in. Depending on how the server is configured, the gates offer a username and password form, one tile per external provider (GitHub, Google, Microsoft), or both.

## Username and password

To sign in, fill **Username or email** and **Password**, then choose **Enter the city**. The username and the email are matched without regard to case.

To create an account, choose **Found a city** under the form. The form changes to:

| Field | Rule |
| --- | --- |
| **Username** | 3 to 24 characters: letters, digits, `-` or `_`. Unique. |
| **Email** | A valid address, not already used by another account. |
| **Password** | At least 10 characters (at most 128). |

Choose **Found the city** to create the account. You are signed in right away and sent to [the atelier](./atelier.md) to dress your citizen. Opsburg 0.2.0 does not send a verification email.

:::note[No password reset yet]
Opsburg 0.2.0 has no "forgot password" flow and no way to change a password from the console. If you can, enable an external provider as well: a provider account with the same verified email signs in to the same user (see [Linking accounts](#linking-accounts)).
:::

Login and registration are rate limited per IP address: by default 10 attempts per minute. Past the limit the gates answer "Too many attempts. Wait a minute and try again."

## GitHub, Google and Microsoft

When the server has credentials for a provider, the gates show its tile under **or enter with**. Choose it, sign in at the provider, and you come back to the console signed in. If the account is new to Opsburg, it is created on the spot and you go to the atelier.

How it works:

- The backend runs the whole OAuth flow on the server side, with the client secret, using the authorization code flow with PKCE (S256) for every provider.
- The state, the PKCE verifier and the nonce travel in a short-lived signed cookie (10 minutes) between the start of the sign-in and the callback. The callback rejects a mismatched state.
- Google and Microsoft are used through OpenID Connect (`openid email profile`), and their ID tokens are verified against the provider's keys. GitHub uses the scopes `read:user user:email`.
- After sign-in, the browser returns only to a path of the console, never to another site.

The new account's username comes from the provider: the GitHub login, the Microsoft username or the name, cleaned to fit the username rules. If it is taken, a number is appended (`ada`, `ada2`, `ada3`).

### Linking accounts

Opsburg links an external account to an existing user when the provider vouches for the email:

1. An external account already linked to a user always signs in as that user.
2. Otherwise, if the provider confirms the email is verified and a user has that email, the external account is linked to that user.
3. Otherwise a new user is created.

An email the provider does not verify is never used for linking, and is not stored. For Google, a verified email is required to sign in at all. For GitHub, Opsburg uses the primary email only when it is verified. For Microsoft, the email is trusted for personal accounts, or for work accounts when Entra ID states that the tenant owns the domain.

### Errors you may see

| Message | What happened |
| --- | --- |
| The sign-in took too long or was opened in another tab. Try again. | The state check failed: the round trip took over 10 minutes, or it started in another tab. |
| The provider refused the sign-in. Try again. | The provider returned an error, or the code exchange failed. |
| Your email with that provider is not verified. | Google did not confirm the account's email. |
| Sign-in cancelled. | You cancelled at the provider. |

## The session

A successful sign-in sets a session cookie named `opsburg_session`:

- `HttpOnly`, so scripts in the page cannot read it, and `SameSite=Lax`.
- `Secure` when the console is served over HTTPS (when `FRONTEND_URL` starts with `https://`).
- Valid for 7 days. It holds a token signed with the server's `JWT_SECRET`; changing the secret signs everyone out.

**Leave the city**, on the city board, signs you out and clears the cookie.

## Arriving with an invitation

An invitation link opens the gates with a line such as "*Ada* invites you to *Harbor*. Sign in, or register, to take up residence." Sign in or register with any method: the console keeps the invitation in the tab during a GitHub, Google or Microsoft round trip, and you join that city once you are in. See [Members and invitations](../city/members-and-invitations.md).

## What the operator controls

Which options appear depends on server configuration. The console asks the backend what is enabled on each load.

| Setting | Default | Effect on the gates |
| --- | --- | --- |
| `ALLOW_EMBEDDED_LOGIN` | `true` | When `false`, the username and password form disappears and password sign-in and registration are refused. Only provider tiles remain. |
| `REGISTRATION_ALLOWED` | `true` | When `false`, the **Found a city** link disappears and password registration is refused. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | unset | Both set: the GitHub tile appears. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | unset | Both set: the Google tile appears. |
| `AZURE_ENTRAID_CLIENT_ID`, `AZURE_ENTRAID_CLIENT_SECRET` | unset | Both set: the Microsoft tile appears. |
| `AZURE_ENTRAID_TENANT_ID` | `common` | Which Microsoft accounts are accepted: `common` (any), `organizations` (work and school accounts), `consumers` (personal accounts) or one tenant ID. |
| `AUTH_RATE_LIMIT_MAX` | `10` | Login and registration attempts per minute per IP. |
| `FRONTEND_URL`, `PUBLIC_URL` | `http://localhost:5173` | Where the browser returns after an external sign-in, and the origin of the callback URL. `PUBLIC_URL` defaults to `FRONTEND_URL`. |

The callback URL to register with each provider is:

```text
<PUBLIC_URL>/api/auth/github/callback
<PUBLIC_URL>/api/auth/google/callback
<PUBLIC_URL>/api/auth/microsoft/callback
```

:::warning[Closing registration does not close external sign-in]
`REGISTRATION_ALLOWED=false` only stops the username and password registration. A first sign-in with an enabled provider still creates an account. To keep strangers out, enable only providers whose accounts you control (for example a single Microsoft tenant in `AZURE_ENTRAID_TENANT_ID`), or keep the console on a private network.
:::

Every variable is described in [Environment variables](../self-hosting/environment-variables.md).
