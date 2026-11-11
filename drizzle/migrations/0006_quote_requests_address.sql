ALTER TABLE public.quote_requests ADD COLUMN address TEXT NOT NULL DEFAULT '';
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_address_check CHECK (char_length(address) <= 300);
COMMENT ON COLUMN public.quote_requests.address IS 'Dirección completa de la propiedad del solicitante (calle, número, ciudad, estado, código postal).';