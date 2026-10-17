# Email DNS setup — notify.paarlwine.com

Sender domain for all app email (contact-form notifications + the six auth emails).
Visible sender: `Paarl Wine <hello@paarlwine.com>`.
Technical sending subdomain: `notify.paarlwine.com` (no mailbox needed).

## Why NS and not CNAME

Lovable takes over the whole `notify.paarlwine.com` zone and publishes several
records inside it (DKIM keys, SPF, MX, return-path host). A CNAME can only alias
one name to one target, cannot carry MX records, and DNS forbids a CNAME
co-existing with other records at the same name. So the delegation must be real
NS records.

## Records to add at Xneelo (konsoleH)

Xneelo splits nameserver management from the regular DNS grid. Subdomain
delegation lives in **Advanced View**, not in the basic Manage DNS dropdown.

Do **not** use:
- *Change Name Servers* — that moves all of paarlwine.com off Xneelo.
- A CNAME — cannot carry MX/DKIM (see above).

In konsoleH → Manage DNS → **Advanced View**, add to the `paarlwine.com` zone:

| Type | Host | Value |
|------|------|-------|
| NS | `notify.paarlwine.com` | `ns3.lovable.cloud` |
| NS | `notify.paarlwine.com` | `ns4.lovable.cloud` |
| TXT | `_lovable-email.paarlwine.com` | `lovable_email_verify=1e1e7de2312ca499845794e310c2073a7be032ebf42cf1c673feb42b4974a33b` |

Notes:
- If the Host field is relative to the zone, enter `notify` and `_lovable-email`
  instead of the full names.
- The two NS entries are separate records on the same host — add them one at a time.
- Leave every existing record untouched: root A, `www`, `app` (`185.158.133.1`),
  MX, SPF, DKIM, DMARC.

## If Advanced View is unavailable — support request wording

```text
I need to delegate a subdomain zone, not change the root name servers.
Please add these records to the paarlwine.com zone:

NS    notify.paarlwine.com    ns3.lovable.cloud
NS    notify.paarlwine.com    ns4.lovable.cloud
TXT   _lovable-email.paarlwine.com    lovable_email_verify=1e1e7de2312ca499845794e310c2073a7be032ebf42cf1c673feb42b4974a33b

These are text name server hostnames. The delegation applies only to the
"notify" subdomain, which is used for outbound mail. The root domain, website,
existing MX records, and the app subdomain must remain unchanged.
```

## Fallback — move DNS hosting to Cloudflare

Only if Xneelo cannot add the NS records at all. Registrar stays Xneelo.

1. Add `paarlwine.com` to a free Cloudflare account; records auto-import.
2. Verify every imported record against the current Xneelo zone before switching:
   root A, `www`, `app` (`185.158.133.1`), MX, SPF, DKIM, DMARC, webmail/autodiscover.
3. Set root, `www`, and `app` to DNS-only (grey cloud) so behaviour is unchanged.
4. Add the two NS records and the TXT record above.
5. Change nameservers at Xneelo to the Cloudflare pair. Propagation is usually
   under an hour, up to 24.

## After the records are live

- Verification is automatic — watch progress in Cloud → Emails.
- No application code changes are needed; the email pipeline is already built and
  starts delivering once DNS verifies.
- Keep volumes modest for the first 2–4 weeks while the new sending domain warms up.

## Mailbox summary

- `hello@paarlwine.com` — the single real mailbox; receives contact-form notifications
  and is the visible From/Reply-To address.
- `notify.paarlwine.com` — technical sending subdomain only, no mailbox.
