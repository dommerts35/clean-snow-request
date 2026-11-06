ALTER TABLE public.quote_requests ADD COLUMN property_type TEXT NOT NULL DEFAULT '';
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_property_type_check CHECK (char_length(property_type) <= 100);
COMMENT ON COLUMN public.quote_requests.property_type IS 'Tipo de propiedad o negocio del solicitante (valor estable en español).';