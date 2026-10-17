# WordPress contact form setup for paarlwine.com

This guide is for the main WordPress site on `paarlwine.com`. The app on `app.paarlwine.com` already has its own contact form.

## Recommended plugin

Use **Fluent Forms** (free) or **WPForms Lite**. Both work cleanly with OceanWP.

## Form fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Single-line text | Yes | |
| Email | Email | Yes | Used as Reply-To |
| I represent a wine estate | Checkbox | No | |
| Estate name | Single-line text | No | Show only when the estate checkbox is checked |
| Message | Paragraph text | Yes | |

## Form settings

- **Submit button label:** Send message
- **Confirmation message:** "Thank you — we usually reply within two working days."
- **Spam protection:** enable the built-in honeypot. Add Cloudflare Turnstile or reCAPTCHA v3 only if spam becomes a problem.

## Email notification

- **To:** `hello@paarlwine.com`
- **From:** `Paarl Wine <hello@paarlwine.com>`
- **Reply-To:** `{email}` (the submitter's email)
- **Subject:** New enquiry from {name}

This mirrors the app contact form so enquiries look consistent regardless of which site they come from.

## Deliverability (important)

Do not rely on WordPress's default PHP mail function. Install **FluentSMTP** and configure it with your xneelo mail server:

- **From email:** `hello@paarlwine.com`
- **From name:** Paarl Wine
- **Mailer:** SMTP
- **SMTP Host:** `smtp.paarlwine.com` or the host xneelo provides
- **Encryption:** TLS
- **SMTP Port:** 587
- **Authentication:** On
- **SMTP Username:** `hello@paarlwine.com`
- **SMTP Password:** the mailbox password

Your existing SPF and DKIM records already cover mail sent from `paarlwine.com`, so no extra DNS is needed for the WP form.

## Page content

Create a `/contact` page with:

- H1: Contact Paarl Wine
- Short intro: "Estate listings, sponsored features, corrections to the guide, or a wine we should add — all of it lands in the same inbox."
- The form
- A text block with:
  - **Location:** Paarl, Cape Winelands, Western Cape, South Africa
  - **Email:** [hello@paarlwine.com](mailto:hello@paarlwine.com)
  - **App:** Looking for the wine guide and label scanner? Visit [app.paarlwine.com](https://app.paarlwine.com)

## Linking to the app

Add the app link to the main navigation menu in OceanWP:

- **Label:** Wine Guide & Scanner
- **URL:** `https://app.paarlwine.com`
- **Open in new tab:** Yes

This keeps visitors on `paarlwine.com` for articles and contact, while sending them to the app for the scanner and cellar features.
