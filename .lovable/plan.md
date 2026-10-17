## Route: konsoleH Advanced View (Xneelo's option 3)

Subdomain zone delegation is what's needed. Do not use option 1 (Change Name Servers moves all of paarlwine.com off Xneelo) and do not use a CNAME (it can't carry the MX and DKIM records Lovable publishes inside the subdomain).

## Records to add

In konsoleH, switch to **Advanced View**, then add to the paarlwine.com zone:

| Type | Host | Value |
|------|------|-------|
| NS | `notify.paarlwine.com` | `ns3.lovable.cloud` |
| NS | `notify.paarlwine.com` | `ns4.lovable.cloud` |
| TXT | `_lovable-email.paarlwine.com` | `lovable_email_verify=1e1e7de2312ca499845794e310c2073a7be032ebf42cf1c673feb42b4974a33b` |

Notes:
- If the Host field is relative to the zone, enter `notify` and `_lovable-email` rather than the full names.
- Both NS entries are separate records on the same host — add them one at a time.
- Leave every existing record untouched: root A, `www`, `app` (`185.158.133.1`), MX, SPF, DKIM, DMARC.

## Reply to Xneelo support if Advanced View is unavailable

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

## After the records are live

Verification is automatic; progress shows in Cloud → Emails. The contact-form notification and all six auth emails are already built and begin delivering from `Paarl Wine <hello@paarlwine.com>` with no code changes. Keep volumes modest for 2–4 weeks while the new sending domain warms up.

## Code changes

- Add `content/DNS-EMAIL-SETUP.md` recording the exact records, the konsoleH Advanced View steps, and the support-request wording, so this is preserved with the project.

No application code changes are required — the email pipeline is complete and only waits on DNS.
