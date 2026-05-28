
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  college_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, college_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'college_name');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  university TEXT,
  college TEXT,
  branch TEXT,
  year TEXT,
  semester TEXT,
  subject TEXT,
  resource_type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by everyone" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON public.resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON public.resources FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX idx_resources_resource_type ON public.resources(resource_type);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Public can view resource files" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Authenticated can upload resource files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own resource files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Increment downloads function
CREATE OR REPLACE FUNCTION public.increment_downloads(resource_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.resources SET downloads = downloads + 1 WHERE id = resource_id;
END;
$$;
