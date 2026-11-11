CREATE TABLE public.chat_reads (
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, client_id)
);
GRANT SELECT, INSERT, UPDATE ON public.chat_reads TO authenticated;
GRANT ALL ON public.chat_reads TO service_role;
ALTER TABLE public.chat_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own read state" ON public.chat_reads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert own read state" ON public.chat_reads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND (client_id = auth.uid() OR public.is_staff(auth.uid())));
CREATE POLICY "update own read state" ON public.chat_reads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND (client_id = auth.uid() OR public.is_staff(auth.uid())));
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reads;