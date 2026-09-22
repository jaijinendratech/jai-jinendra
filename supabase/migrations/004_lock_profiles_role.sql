-- Prevent non-admins from changing profiles.role (closes self-escalation via profiles_update_own)

CREATE OR REPLACE FUNCTION prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT is_admin() THEN
      RAISE EXCEPTION 'Only admins can change profiles.role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_role_escalation();

-- Tighten UPDATE policy: non-admins may update own row but role must stay unchanged
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (
    (id = auth.uid() AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid()))
    OR is_admin()
  );
