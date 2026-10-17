-- Per-user log of AI label scans, used to enforce a daily cap (cost protection).
CREATE TABLE public.scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX scan_log_user_created_idx ON public.scan_log (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.scan_log TO authenticated;
GRANT ALL ON public.scan_log TO service_role;

ALTER TABLE public.scan_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own scan log" ON public.scan_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users add own scan log" ON public.scan_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
