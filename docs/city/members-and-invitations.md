---
title: Members and invitations
description: How the founder of an Opsburg city invites people with one-time links, how an invitee joins, and what each role can do.
sidebar_position: 3
---

# Members and invitations

The citizens of a city, that is the members of the organization, join through invitation links. Opsburg has no mail service in 0.2.0: the founder creates the links and sends them through whatever channel they use.

## Roles

| Role on the board | Role in the API | Who |
| --- | --- | --- |
| Founder | `owner` | The player who saved the charter and created the city. |
| Citizen | `member` | Everyone who joined through an invitation link. |

The founder changes the city; citizens see it. The full list is in [The city](./overview.md#who-can-change-what). The city board shows your role under your name and the number of citizens in the **Citizens** gauge.

## Invite people

Invitations live in the fourth founding quest, **Call the citizens**. On a founded city, open it from **City charter**.

1. Under **Collaborators**, type an email and press **Add** or Enter. Repeat for up to 20 emails.
2. Press **Invite** (or **Invite N citizens**).
3. Opsburg shows one link per email: "Send each citizen their link. It works once, for 14 days, and it is shown only now."
4. Press **Copy** next to each link and send it yourself. Press **Done** when you have copied them all.

If the browser blocks the clipboard, select the link in its field and copy it by hand.

An email that already belongs to a citizen, or already has an open invitation, gets no new link. Emails are stored in lowercase.

### What a link looks like

```text
<FRONTEND_URL>/?invite=<token>
```

`FRONTEND_URL` is the public address of your Opsburg installation (see [Environment variables](../self-hosting/environment-variables.md)). The token is 32 random bytes. Opsburg stores only its SHA-256 hash, which is why the link cannot be shown again: if you lose it, revoke the invitation and invite the same email again.

### Lifetime of a link

| State | Meaning |
| --- | --- |
| Pending | Created and not used yet. Valid for 14 days from creation. |
| Accepted | Used once. It cannot be used again, and it cannot be revoked. |
| Revoked | The founder revoked it. The link stops working. |

After 14 days a pending link stops working, even though it still shows as pending.

## Revoke an invitation

The **Call the citizens** quest lists pending invitations under **Waiting at the gate**. Press **Revoke** next to an email to stop its link. Revoking twice does nothing. An accepted invitation cannot be revoked: "That citizen already moved in: the invitation cannot be revoked."

Only the founder sees the invitations; for citizens the list is empty.

## Join a city

1. Open the invitation link. The city gate shows "&lt;founder&gt; invites you to &lt;city&gt;. Sign in, or register, to take up residence."
2. Sign in, or register a new account. See [Sign in](../account/sign-in.md).
3. Opsburg accepts the invitation right after sign-in and makes you a citizen. A new player goes through the [atelier](../account/atelier.md) first, then enters the city.

The token is kept in the browser tab while you sign in, so an OAuth round trip to GitHub, Google or Microsoft does not lose it. If you are already signed in, opening the link joins the city straight away.

If the link was used, revoked or expired, the gate says "This invitation is not valid anymore: it was used, revoked or it expired."

:::note[When registration is closed]
An invitation does not create an account. When the operator sets `REGISTRATION_ALLOWED=false`, the invitee can neither register with a password nor get a new account at a first sign-in with GitHub, Google or Microsoft: the gates answer "This server does not admit new citizens." The link then works only for someone who already has an account on the installation. Ask the operator to open registration while new people join. See [Sign in](../account/sign-in.md#what-the-operator-controls).
:::

:::warning[The link is the proof]
Whoever holds a link can accept it, whatever email it was sent to. Password sign-ups do not verify the email address, so Opsburg cannot check that the person who opens the link owns the invited address. Send links through a channel you trust, and revoke any link that may have leaked.
:::

Opening a link you already accepted, with the same account, does nothing and does not fail.

## Remove members

Opsburg 0.2.0 has no way to remove a citizen, change a role, hand the city to another founder or leave a city. The founder stays the only owner. **Leave the city** on the board signs you out; it does not take you out of the city.

:::note[One city per player]
A player can found only one city, and cannot found one after joining another. The board shows one city per player: the one joined through the link, and on later sign-ins the oldest city the player belongs to.
:::
