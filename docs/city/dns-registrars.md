---
title: DNS registrars
description: Connect Cloudflare, Route 53 or Azure DNS to an Opsburg city so the streets of a cluster point hostnames at its ingress, with an Ingress by pull request and TLS from Let's Encrypt.
sidebar_position: 6
---

# DNS registrars

A DNS registrar is an account at a DNS provider that the city, that is the organization, hands to Opsburg. With one in place, Opsburg writes the DNS records of a cluster's streets, that is its public hostnames, and points them at the cluster's ingress.

A city can have up to 10 registrars.

## Supported providers

| Provider | Credentials asked | Permissions the form suggests |
| --- | --- | --- |
| Cloudflare | **API token** | A token with Zone:Read and DNS:Edit on the zones Opsburg manages. |
| AWS Route 53 | **Access key id**, **Secret access key** | An IAM user allowed to list hosted zones and change their record sets. |
| Azure DNS | **Tenant id**, **Client id**, **Subscription id**, **Resource group**, **Client secret** | A service principal with DNS Zone Contributor on the resource group where the DNS zones are. |

Tenant, client and subscription ids are GUIDs. Opsburg checks their shape before saving.

Opsburg uses only public zones on Route 53: a private hosted zone is skipped. On Cloudflare, records are created as DNS only (not proxied), with the comment "Managed by Opsburg".

For the permissions themselves, see the vendor docs: [Cloudflare API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/), [Route 53 IAM](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/security-iam.html), [Azure DNS roles](https://learn.microsoft.com/en-us/azure/dns/dns-protect-zones-recordsets).

## Add a registrar

Open **Settings · AI models** on the city board and scroll to **DNS registrars**. Only the founder can add, edit, test and remove registrars.

1. Press **Add your registrar**.
2. Pick the **Provider**, give it a **Name** ("How the city calls it.", unique in the city) and fill in the credentials.
3. Tick **Use it by default** to make it the registrar new streets use. The first registrar is always the default.
4. Press **Hand over the keys**.

"Secrets are stored encrypted and never shown again." The founder sees the non secret fields (ids, resource group) when editing; the secret comes back as a placeholder and is kept unless retyped. Change the account fields or the provider and you must type the secret again. Citizens see only the name and provider.

Secrets are encrypted at rest with the operator's `SECRETS_ENCRYPTION_KEY`, which the backend requires to start. See [AI models](./ai-models.md#how-keys-are-stored).

## Test a registrar

Press **Test**. Opsburg lists the zones the credentials can see:

- `✓ Connected: 3 zones (acme.it, acme.com, example.org)`
- `✗ Connected, but the account holds no zone`
- `✗` and the reason the provider refused or did not answer.

## Streets of a cluster

A street is a hostname of a cluster. Streets live on the cluster board, under **Streets**, in the [engine room](./clusters.md).

### Set the ingress address

Every street points at one address, the public entry of the cluster:

1. Under **Ingress address**, type the public IP of the cluster's ingress, or the hostname of its load balancer.
2. Press **Save**.

Opsburg writes an `A` record for an IPv4 address, `AAAA` for IPv6, `CNAME` for a hostname, with a TTL of 300 seconds.

Changing the address later points every street at the new one. A street whose registrar fails keeps its old record and shows "✗ The DNS record does not point at the cluster", with **Point it again** to retry.

### Open a street

You need an ingress address and at least one registrar. Press **Open a street**:

| Field | What to enter |
| --- | --- |
| **Hostname** | A full name, like `shop.acme.it`. It is pointed at the ingress address right away. |
| **Registrar** | Shown when the city has more than one. The default is preselected. |
| **Route its traffic to a service (an Ingress by pull request)** | Ticked by default. Untick it for a DNS only street. |
| **Namespace**, **Service**, **Port** | The Kubernetes service that receives the traffic. Port defaults to 80. |
| **TLS with a Let's Encrypt certificate** | Available once the cluster's **Seal the gates** quest is installed. Otherwise it reads "TLS needs the quest Seal the gates first". |

Press **Open it**. What happens:

1. Opsburg finds the zone of the registrar that holds the hostname (the longest matching zone).
2. It refuses if a record for that hostname already points somewhere else: "remove it at the registrar first". Opsburg never takes over a record it did not write.
3. It writes the DNS record at once.
4. If the street routes traffic, it opens a pull request that adds `apps/routes/<hostname>.yaml` to the cluster folder. If the request cannot be opened, Opsburg removes the record again, so nothing is left half done.

The street shows `✓ A → 203.0.113.10 on <registrar>` and, while the request is open, `⧗ Ingress awaiting merge · request #N`. After you merge it, press **Refresh** on the cluster board.

A hostname can be a street of one cluster only in the whole city. A cluster has at most 100 streets.

### The Ingress

The Ingress Opsburg writes looks like this:

```yaml
# Written by Opsburg. Change it through the city, or here by pull request: Opsburg reads nothing back from this file.
apiVersion: "networking.k8s.io/v1"
kind: "Ingress"
metadata:
  name: "route-shop-acme-it-1a2b3c4d"
  namespace: "shop"
  labels:
    app.kubernetes.io/managed-by: "opsburg"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt"
spec:
  ingressClassName: "traefik"
  rules:
    - host: "shop.acme.it"
      http:
        paths:
          - path: "/"
            pathType: "Prefix"
            backend:
              service:
                name: "shop"
                port:
                  number: 80
  tls:
    - hosts:
        - "shop.acme.it"
      secretName: "route-shop-acme-it-1a2b3c4d-tls"
```

The name is the hostname with dashes plus a short hash of the full hostname, so `shop-eu.acme.it` and `shop.eu.acme.it` never collide. The ingress class is `traefik`; the form does not offer another. Without TLS, the `cert-manager.io/cluster-issuer` annotation and the `tls` block are left out.

### TLS from Let's Encrypt

With TLS, cert-manager sees the annotation, asks the `letsencrypt` ClusterIssuer created by the **Seal the gates** quest for a certificate through the HTTP-01 challenge, stores it in the `-tls` Secret and renews it. The challenge works only once the hostname resolves to the cluster's ingress, which is why Opsburg writes the record before it proposes the Ingress. See [Kubernetes clusters](./clusters.md) and the [cert-manager ACME docs](https://cert-manager.io/docs/configuration/acme/).

### Hostnames of a quest

Rancher brings its own Ingress. Once the Rancher quest is installed and the cluster has an ingress address, its board shows **Point &lt;hostname&gt; at the cluster**, which opens a DNS only street for Rancher's hostname.

### Close a street

Press **Close the street**, then **Close**. The record goes at once; the Ingress, if any, goes through a pull request that deletes its file ("Ingress removal awaiting merge"). If you close that request without merging, the Ingress stays and the street waits for **Point it again**.

If an Ingress request is closed without merging, Opsburg removes the record it wrote for that street.

## Edit and remove a registrar

- **Edit** opens **Tune &lt;name&gt;**. Moving a registrar to another account or provider is refused while streets are pointed through it: close them first.
- **Make default** moves the default to this registrar.
- **Remove** is refused while a cluster has hostnames pointed through it. If you remove the default, the oldest remaining registrar becomes the default.
