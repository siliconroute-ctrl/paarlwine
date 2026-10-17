# Deploying Terroir (app.paarlwine.com)

Order matters: GitHub, then Supabase, then Vercel, then DNS. Allow about an hour.

## 1. GitHub

Create a **private** repository (for example `paarlwine/terroir`) and push this folder to it.
Everything after this is automatic: each push to `main` redeploys the app.

## 2. Supabase (database, sign-in, photo storage)

1. Create a project at supabase.com. Choose a region close to South Africa (for example Europe/Frankfurt or London).
2. Run the migrations in `supabase/migrations/` **in file-name order** (SQL Editor, or `supabase link` then `supabase db push`).
3. **Authentication > URL Configuration**
   - Site URL: `https://app.paarlwine.com`
   - Redirect URLs: `https://app.paarlwine.com/**`, `https://app.paarlwine.com/reset-password`
4. **Authentication > Providers > Google** (optional but the sign-in page shows the button):
   create an OAuth client in Google Cloud Console, paste the client ID and secret into Supabase, and add the callback
   URL Supabase shows to the Google client.
5. **Authentication > SMTP Settings**: enter the `hello@paarlwine.com` mailbox details so sign-up and password-reset
   emails come from your own domain. (Supabase's built-in sender is rate-limited and not for production.)
6. **Project Settings > API**: copy the project URL, the publishable key and the service role key.

## 3. Anthropic (label scanner)

Create an API key at console.anthropic.com and set a monthly spend limit. The app also caps each user at
`SCAN_DAILY_LIMIT` scans per 24 hours (default 20).

## 4. Vercel (hosting)

1. Import the GitHub repository at vercel.com. Vercel is detected automatically; no build settings are needed.
2. Add every variable from `.env.example` under **Settings > Environment Variables** (Production and Preview).
3. Deploy once, then open **Settings > Domains** and add `app.paarlwine.com`.

## 5. DNS (Xneelo)

In the DNS zone for `app.paarlwine.com`, replace the existing `A` record (currently `185.158.133.1`, which points at Lovable)
with the record **Vercel shows on the Domains screen**. Leave the `mail`, `MX`, `SPF` and `DKIM` records alone.
After the app loads on Vercel, delete the `_lovable` TXT record.

## 6. Existing users and scans

The old app ran on a Lovable-managed Supabase database. If real people have signed up and you want to keep them, their
data must be exported from that database before the Lovable project is deleted. If it is only test accounts, start fresh.

## 7. Make yourself an admin (to read contact messages in the database)

After signing up in the app, run this in the Supabase SQL Editor with your own email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```

## 8. Check it works

- Home, Guide and Estates pages load and the guide shows South African wines.
- Create an account, sign in, scan a label, save it, and see it in the cellar with its photo.
- Send a message from the contact form; it appears in `contact_messages` and in the `hello@paarlwine.com` inbox.
- Request a password reset and click the link.
