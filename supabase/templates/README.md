# Auth email templates

Branded HTML for Supabase Auth emails. Local dev picks them up from `supabase/config.toml`.

**Hosted project (production):** Supabase Dashboard -> Authentication -> Emails -> Templates.

| Template | Subject | File |
|----------|---------|------|
| Confirm signup | Confirm your email \| Jai Jinendra Namkeens | `confirmation.html` |
| Reset password | Reset your password \| Jai Jinendra Namkeens | `recovery.html` |
| Password changed (notification) | Your password was changed \| Jai Jinendra Namkeens | `password_changed.html` |

Paste the file contents into the template's message body and set the subject.
The logo loads from `https://www.jaijinendrasweets.com/brand/logo-namkeens.png`.
