---
title: Telemetry
description: Opsburg 0.2.0 sends no usage data from self-hosted installations, and this page says what that means in practice.
sidebar_position: 5
---

# Telemetry

Release 0.2.0 sends no usage data from your installation. There is nothing to turn off.

## What 0.2.0 does

- **No usage ping.** The backend of 0.2.0 contains no call to an Opsburg server. The ping code exists in the source tree, but the server does not load it.
- **No tracking in the browser.** The browser app has no analytics script and sets no tracking cookie. The only cookies are the sign-in ones: `opsburg_session` and, during a GitHub, Google or Microsoft sign-in, `opsburg_oauth`.
- **No traces or metrics.** The console does not export OpenTelemetry data about itself.
- **Error reports only if you ask for them.** Sentry is off unless you set a DSN, and then it reports to your own Sentry project. See [Error reporting](./error-reporting.md).

The backend only calls outside services as part of features you or your users set up: the sign-in providers you configure, the Git hosts of [Git connections](../city/git-connections.md), the providers of [AI models](../city/ai-models.md), the APIs of [DNS registrars](../city/dns-registrars.md), and your MongoDB.

## Variables you may have seen

Example files and comments in the Opsburg source mention `TELEMETRY_DISABLED`, `TELEMETRY_ENABLED`, `TELEMETRY_ENDPOINT`, `TELEMETRY_INTERVAL_HOURS` and `DO_NOT_TRACK`. Release 0.2.0 ignores all of them. Setting them does no harm.

## Future releases

If a release turns on an anonymous usage ping, its [release notes](../release-notes.md) and this page will say what it sends and how to switch it off.
