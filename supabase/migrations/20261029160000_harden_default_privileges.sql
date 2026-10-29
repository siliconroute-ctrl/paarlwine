-- 1. The automatic-RLS helper is an internal event-trigger function; it should not be callable through the public API.
--    (Only exists when "Enable automatic RLS" was ticked at project creation.)
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- 2. Remove powers the app never needs from the public API roles. Row-level security does not cover these.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- 3. Stop those extra powers being granted automatically on tables created in future.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
