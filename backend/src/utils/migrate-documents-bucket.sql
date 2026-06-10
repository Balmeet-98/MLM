-- Run in Supabase SQL Editor
-- Creates a private storage bucket for the site brochure (upload brochure.pdf via Supabase Dashboard)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
