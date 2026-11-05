ALTER TABLE public.messages ADD COLUMN is_ai boolean NOT NULL DEFAULT false;
ALTER TABLE public.messages ALTER COLUMN sender_id DROP NOT NULL;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_or_ai CHECK ((is_ai AND sender_id IS NULL) OR (NOT is_ai AND sender_id IS NOT NULL));
CREATE INDEX IF NOT EXISTS messages_client_created_idx ON public.messages (client_id, created_at DESC);