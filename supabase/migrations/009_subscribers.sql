-- Welcome Offer subscribers. Inserts go through the service-role API.
-- Admins may read the list; there is no public insert policy.

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscribers_email_lower CHECK (email = lower(email))
);

CREATE UNIQUE INDEX subscribers_email_unique ON subscribers (email);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscribers_admin_select ON subscribers FOR SELECT
  USING (is_admin());
