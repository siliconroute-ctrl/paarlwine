# Email setup

The app sends email in two ways. Neither needs a special sending domain or DNS delegation.

## 1. Contact-form notifications (sent by the app)

Sent over SMTP from the real mailbox `hello@paarlwine.com`. Set these environment variables on Vercel
(see `.env.example`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
Use the mail server details Xneelo gives for the mailbox. The message is always saved to the database first,
so nothing is lost if email fails.

## 2. Sign-up and password-reset emails (sent by Supabase)

In the Supabase dashboard open **Authentication > SMTP Settings** and enter the same mailbox details.
Branded wording for these emails is edited under **Authentication > Email Templates**.

## DNS

The existing SPF, DKIM and MX records for `paarlwine.com` at Xneelo already cover mail from this mailbox.
Do not add the old `notify.paarlwine.com` delegation records; they belonged to the Lovable setup and are no longer used.
