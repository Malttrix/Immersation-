-- DEPRECATED: the former script granted public writes and must never be used.
-- Review and apply supabase/migrations/202610300001_commerce_security.sql instead.
DO $$ BEGIN RAISE EXCEPTION 'Deprecated unsafe policy script; use versioned migrations'; END $$;
