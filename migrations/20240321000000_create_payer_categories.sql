-- Create payer_categories table
CREATE TABLE IF NOT EXISTS public.payer_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    created_by uuid NULL DEFAULT auth.uid(),
    created_date_time timestamp with time zone NOT NULL DEFAULT now(),
    last_modified_by uuid NULL DEFAULT auth.uid(),
    last_modified_date timestamp with time zone NULL,
    updated_at timestamp with time zone NULL,
    deleted_at timestamp with time zone NULL,
    CONSTRAINT payer_categories_pkey PRIMARY KEY (id),
    CONSTRAINT payer_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user" (id),
    CONSTRAINT payer_categories_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES "user" (id)
) TABLESPACE pg_default;

-- Add RLS policies
ALTER TABLE public.payer_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.payer_categories
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.payer_categories
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.payer_categories
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.payer_categories
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Add indexes
CREATE INDEX payer_categories_name_idx ON public.payer_categories (name);
CREATE INDEX payer_categories_created_date_time_idx ON public.payer_categories (created_date_time);
CREATE INDEX payer_categories_deleted_at_idx ON public.payer_categories (deleted_at); 