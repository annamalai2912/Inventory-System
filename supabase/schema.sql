-- ============================================================
-- TechKnots Inventory — Initial Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles"   ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read projects"   ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- COMPONENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.components (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'uncategorized',
  sub_tags            TEXT[] DEFAULT '{}',
  quantity            INTEGER NOT NULL DEFAULT 0,
  unit                TEXT NOT NULL DEFAULT 'pcs',
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  datasheet_url       TEXT,
  image_urls          TEXT[] DEFAULT '{}',
  notes               TEXT,
  added_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT components_name_category_unique UNIQUE (name, category)
);

ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read components"   ON public.components FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert components" ON public.components FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update components" ON public.components FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete components" ON public.components FOR DELETE USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER components_updated_at
  BEFORE UPDATE ON public.components
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- ATOMIC QUANTITY RPC
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_quantity(
  p_component_id UUID,
  p_delta        INTEGER,
  p_user_id      UUID,
  p_change_type  TEXT DEFAULT 'adjust',
  p_project_tag  TEXT DEFAULT NULL,
  p_notes        TEXT DEFAULT NULL
)
RETURNS public.components AS $$
DECLARE
  updated_component public.components;
BEGIN
  UPDATE public.components
  SET quantity = GREATEST(0, quantity + p_delta)
  WHERE id = p_component_id
  RETURNING * INTO updated_component;

  INSERT INTO public.stock_logs (component_id, user_id, change_type, quantity_delta, project_tag, notes)
  VALUES (p_component_id, p_user_id, p_change_type, p_delta, p_project_tag, p_notes);

  RETURN updated_component;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- STOCK LOGS (Audit Trail)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id    UUID REFERENCES public.components(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_type     TEXT NOT NULL CHECK (change_type IN ('add','remove','use','restock','adjust')),
  quantity_delta  INTEGER NOT NULL,
  project_tag     TEXT,
  notes           TEXT,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read logs"   ON public.stock_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert logs" ON public.stock_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('component-images', 'component-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view component images"
  ON storage.objects FOR SELECT USING (bucket_id = 'component-images');

CREATE POLICY "Authenticated users can upload component images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'component-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete component images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'component-images' AND auth.role() = 'authenticated');
