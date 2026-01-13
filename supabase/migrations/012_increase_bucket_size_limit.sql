-- Increase file size limit for manuals bucket to 100MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('manuals', 'manuals', true, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET file_size_limit = 104857600,
    allowed_mime_types = ARRAY['application/pdf'];
