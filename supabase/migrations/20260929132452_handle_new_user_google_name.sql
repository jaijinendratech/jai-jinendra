-- Store Google display names on signup. CREATE OR REPLACE keeps on_auth_user_created.
-- profiles.role is unchanged and still defaults to customer.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, phone, email, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(
      NULLIF(BTRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(BTRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(
        BTRIM(
          CONCAT_WS(
            ' ',
            NULLIF(BTRIM(NEW.raw_user_meta_data->>'given_name'), ''),
            NULLIF(BTRIM(NEW.raw_user_meta_data->>'family_name'), '')
          )
        ),
        ''
      ),
      ''
    )
  );
  RETURN NEW;
END;
$$;
