CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  service text NOT NULL CHECK (char_length(service) <= 100),
  location text NOT NULL CHECK (char_length(location) <= 300),
  details text NOT NULL CHECK (char_length(details) <= 3000),
  status text NOT NULL DEFAULT 'nueva',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone sends quote" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (status = 'nueva');
CREATE POLICY "staff read quotes" ON public.quote_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update quotes" ON public.quote_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admin delete quotes" ON public.quote_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_delete_account(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot delete self'; END IF;
  DELETE FROM public.appointments WHERE client_id = _user_id OR worker_id = _user_id;
  DELETE FROM public.messages WHERE client_id = _user_id OR sender_id = _user_id;
  DELETE FROM public.time_entries WHERE worker_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_delete_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_account(uuid) TO authenticated;