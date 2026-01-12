-- Enable RLS (confirmed it is enabled, just ensuring)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to do everything on public.users
-- In a real production app, you would restrict this to 'admin' role only.
CREATE POLICY "Allow full access to authenticated users"
ON public.users
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
