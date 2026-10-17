-- The private bucket for users' label photos. The access policies for it already exist in an earlier
-- migration; the bucket itself was originally created outside migrations, so a fresh Supabase project
-- needs this row for photo uploads to work.
INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-labels', 'wine-labels', false)
ON CONFLICT (id) DO NOTHING;
