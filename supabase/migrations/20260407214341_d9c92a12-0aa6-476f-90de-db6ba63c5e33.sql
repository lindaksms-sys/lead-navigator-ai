
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true);

CREATE POLICY "Public read access for client logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update client logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'client-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete client logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-logos' AND auth.role() = 'authenticated');
