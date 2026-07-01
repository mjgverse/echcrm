
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^.+@.+\..+$'
    AND length(btrim(message)) BETWEEN 1 AND 2000
    AND (phone IS NULL OR length(phone) <= 50)
    AND (company IS NULL OR length(company) <= 150)
    AND converted_to_file_id IS NULL
  );
