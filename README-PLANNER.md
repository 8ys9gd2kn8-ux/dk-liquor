# D&K Party Planner: setup and security notes

The planner adds 1:1 chats, group chats and event planning (date/time/venue polls, shared product list, budget)
to the existing D&K shop. It is wired into the same Supabase project and the same Profile page.

## Files added / changed
| File | Purpose |
|---|---|
| `supabase-planner.sql` | **Run once** in Supabase SQL Editor. Tables, Row Level Security, RPC functions, private avatar bucket, realtime. |
| `planner/pp-crypto.js` | End-to-end encryption (Web Crypto only, no third-party code). |
| `planner/pp-data.js` | Supabase queries, auth, key management, avatar upload. |
| `planner/pp-config.js` | Switch SMS verification on or off (`smsEnabled`). |
| `supabase-email-template.html` | Ready-made email for the 6-digit verification code. |
| `planner/pp-css.js` | Styles (inside a Shadow DOM, cannot clash with the shop). |
| `planner/pp-app.js` | The interface: Profile registration card, chats, groups, planner, nav button. |
| `index.html` | **Changed**: loads the planner scripts and adds a Content-Security-Policy. |
| `planner/dev/` | `pp-mock.js` (fake backend) and `demo.html` (single-file demo). **Demo only, never rely on it for production.** |

`app.js`, `style.css`, `config.js` and `admin.html` are unchanged.
Note: `index.html` and `admin.html` reference `orbit.js`, which was not in the zip you sent. Add it back or the category wheel will not appear.

## Deploy checklist
1. Supabase > SQL Editor > paste and run `supabase-planner.sql`.
2. **Email verification (works today, no SMS needed).** Supabase > Authentication:
   - Providers > **Email**: enable it and turn on **Confirm email**.
   - **SMTP Settings**: enable **Custom SMTP** and connect an email sender (for example Resend, SendGrid, Mailgun or Postmark; check each one's free tier and verify your domain with its SPF/DKIM records). Supabase's built-in email service is only for testing and allows just a handful of emails per hour for the whole project, so real sign-ups will fail without this.
   - **Email Templates**: open **Confirm signup** and **Change Email Address** and paste in `supabase-email-template.html`. It must contain `{{ .Token }}`, which is the 6-digit code the app asks for (the default templates send a link instead, which this app does not use).
   - Authentication > Providers > Email: set the OTP expiry to 600 seconds or less.
   Sign-up is **email first**. Phone numbers are collected as the contact point but stay "not verified", so the contact-suggestion feature only lists friends whose phone has been verified by SMS.
2b. **Later: turn on SMS.** When an SMS provider works for Uganda (a registered sender name is needed on MTN and Airtel; see the notes we discussed, or use Africa's Talking through a Supabase *Send SMS hook*), enable Authentication > Providers > Phone, then edit `planner/pp-config.js` and set `smsEnabled:true` (and `primaryVerify:'sms'` if you want SMS first). Nothing else changes.
   - Keep **Anonymous sign-ins** enabled (the shop uses them). The planner refuses anonymous users in every policy.
3. Authentication > Settings: minimum password length 8, enable leaked-password protection if your plan allows, enable **CAPTCHA (Cloudflare Turnstile or hCaptcha)** and keep rate limits on. This blocks SMS-pumping abuse, which can otherwise cost you money.
4. Authentication > URL Configuration: set your site URL and add only your real domain as a redirect.
5. Storage: the `pp-avatars` bucket is created by the SQL as **private**. Do not make it public.
6. Upload the files, commit to GitHub Pages. Test with two real phones.

## How user information and conversations are protected
**Message text is end-to-end encrypted.** The database, Supabase staff and D&K administrators only ever see ciphertext.
- Each user has an ECDH P-256 key pair made on their own device. The private key is stored non-extractable in the browser and backed up only in encrypted form (PBKDF2, 310,000 rounds + AES-GCM) under a **message passphrase** that is never sent to the server.
- Each conversation has its own AES-256-GCM key, wrapped separately for each member. Messages bind the chat id and sender id as authenticated data, so they cannot be moved between chats.
- Removing a member rotates the conversation key, so they cannot read new messages.
- **Contact info > Encryption** shows a fingerprint. Compare it in person or by phone call to confirm nobody is intercepting your chat.

**Access control (database level, not just the interface).**
- Row Level Security is on for every table; the `anon` role has no access at all.
- A user sees only conversations they belong to. Admin actions (add/remove members, lock plan choices, change item status, budget) are enforced by policies and triggers, not by hiding buttons. Members cannot make themselves admin.
- Privileged operations go through `SECURITY DEFINER` functions with a fixed `search_path`.
- No user list can be browsed: search is exact username or exact phone only, and contact matching returns only people already registered.
- Rate limit of 60 messages per minute per user; length limits on every text column.
- `pp_audit` records membership and role changes; browsers cannot read or write it.

**Contacts.** Your contact list is read on the phone only (Android Chrome contact picker). Only salted SHA-256 hashes of phone numbers are sent, to find matches. Contacts not on D&K are never stored, and nothing is kept after the session.

**Invitation links** are single-use, expire in 7 days, and only the hash of the secret is stored.

**Profile pictures** are re-encoded to a 256 px JPEG in the browser (this removes EXIF and GPS data), stored in a private bucket and shown through short-lived signed URLs. Only people who share a chat with you can view your photo. Without a photo, initials are shown.

**Browser hardening.** `index.html` now has a Content-Security-Policy that allows scripts only from your own site plus the Supabase library, and connections only to your Supabase project. For extra safety, host `supabase.min.js` yourself or add a Subresource Integrity hash.

## Honest limits (please read)
- **Not encrypted:** group names, group photos, event data (poll options, shopping list, budget, activity log) and message timing. These are protected by access control, not E2EE. Phone numbers are visible to people you chat with (that is the "contact point").
- **Forgotten passphrase + lost device = old messages cannot be recovered.** We cannot reset it by design.
- A new member can read earlier history in that chat (needed so late joiners see decisions). Key rotation protects only messages *after* a removal.
- Web E2EE trusts the website code you serve. Keep your GitHub account protected with 2FA.
- No forward secrecy per message (one key per conversation until a rotation).
- Only the latest 1,500 messages load at once. Photos, voice notes and documents in chat are not built yet.
- **What was tested:** crypto round trips (Node), and the full user flow (registration with SMS code, key creation, encrypted chat, key recovery, contact matching, groups, invites, photos) in headless Chromium against an in-memory stand-in for Supabase. **Not tested:** the SQL against a live PostgreSQL, a real SMS provider, real Supabase Realtime/Storage. Run a test with two phones and a staging project before going live. Please have a developer or security reviewer read `supabase-planner.sql` once.
