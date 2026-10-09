-- Subscriber unsubscribe support + log of admin email broadcasts.

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_unique
  ON subscribers (unsubscribe_token);

CREATE TABLE IF NOT EXISTS email_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE email_broadcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_broadcasts_admin_select ON email_broadcasts;
CREATE POLICY email_broadcasts_admin_select ON email_broadcasts FOR SELECT
  USING (is_admin());
