-- =============================================================================
-- ABHISHEK AGRAWAL PORTFOLIO - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =============================================================================
-- Execute this SQL script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run.
-- Safe to re-run multiple times (idempotent; policies and seed data will not duplicate).
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. TABLE: admin_users & FUNCTION: is_admin()
-- -----------------------------------------------------------------------------
-- Dedicated admin authorization table mapping Supabase Auth UUIDs to admin role.
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: determines whether the current auth.uid() is an authorized admin.
-- Uses SECURITY DEFINER with search_path=public to avoid recursive RLS loops.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    );
$$;

-- Grant execution to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Grant table SELECT to authenticated role for defense-in-depth direct queries
GRANT SELECT ON public.admin_users TO authenticated;

-- Admin Users Policies
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 1. TABLE: profile
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    taglines JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    about_me TEXT,
    email TEXT,
    location TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. TABLE: projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    category TEXT NOT NULL DEFAULT 'General',
    date TEXT,
    github_url TEXT,
    live_demo_url TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. TABLE: experience
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT DEFAULT 'Remote',
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_present BOOLEAN DEFAULT false,
    description TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4. TABLE: education
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    specialization TEXT,
    start_year TEXT NOT NULL,
    end_year TEXT NOT NULL,
    duration TEXT,
    status TEXT,
    location TEXT,
    cgpa TEXT,
    grade TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 5. TABLE: skill_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Code',
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 6. TABLE: skills
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 7. TABLE: certificates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT,
    credential_url TEXT,
    description TEXT,
    image_url TEXT,
    pdf_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 8. TABLE: achievements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    year TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 9. TABLE: publications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    year TEXT,
    paper_url TEXT,
    code_url TEXT,
    topics JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 10. TABLE: social_links
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 11. TABLE: site_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 12. TABLE: resumes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- TABLE GRANTS
-- -----------------------------------------------------------------------------
-- Public anonymous visitors: SELECT privileges only on portfolio content
GRANT SELECT ON public.profile TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.experience TO anon;
GRANT SELECT ON public.education TO anon;
GRANT SELECT ON public.skill_categories TO anon;
GRANT SELECT ON public.skills TO anon;
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.publications TO anon;
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.resumes TO anon;

-- Authenticated users: Full table privileges on portfolio tables and admin_users.
-- Row Level Security (RLS) strictly restricts write operations to public.is_admin().
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all portfolio tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. Profile Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profile read" ON public.profile;
DROP POLICY IF EXISTS "Auth profile all" ON public.profile;
DROP POLICY IF EXISTS "Admin profile insert" ON public.profile;
DROP POLICY IF EXISTS "Admin profile update" ON public.profile;
DROP POLICY IF EXISTS "Admin profile delete" ON public.profile;

CREATE POLICY "Public profile read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin profile insert" ON public.profile FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin profile update" ON public.profile FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin profile delete" ON public.profile FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. Projects Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public projects read" ON public.projects;
DROP POLICY IF EXISTS "Auth projects all" ON public.projects;
DROP POLICY IF EXISTS "Admin projects insert" ON public.projects;
DROP POLICY IF EXISTS "Admin projects update" ON public.projects;
DROP POLICY IF EXISTS "Admin projects delete" ON public.projects;

CREATE POLICY "Public projects read" ON public.projects FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin projects insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin projects update" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin projects delete" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. Experience Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public experience read" ON public.experience;
DROP POLICY IF EXISTS "Auth experience all" ON public.experience;
DROP POLICY IF EXISTS "Admin experience insert" ON public.experience;
DROP POLICY IF EXISTS "Admin experience update" ON public.experience;
DROP POLICY IF EXISTS "Admin experience delete" ON public.experience;

CREATE POLICY "Public experience read" ON public.experience FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin experience insert" ON public.experience FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin experience update" ON public.experience FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin experience delete" ON public.experience FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. Education Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public education read" ON public.education;
DROP POLICY IF EXISTS "Auth education all" ON public.education;
DROP POLICY IF EXISTS "Admin education insert" ON public.education;
DROP POLICY IF EXISTS "Admin education update" ON public.education;
DROP POLICY IF EXISTS "Admin education delete" ON public.education;

CREATE POLICY "Public education read" ON public.education FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin education insert" ON public.education FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin education update" ON public.education FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin education delete" ON public.education FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. Skill Categories Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public skill_categories read" ON public.skill_categories;
DROP POLICY IF EXISTS "Auth skill_categories all" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories insert" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories update" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories delete" ON public.skill_categories;

CREATE POLICY "Public skill_categories read" ON public.skill_categories FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin skill_categories insert" ON public.skill_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin skill_categories update" ON public.skill_categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin skill_categories delete" ON public.skill_categories FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. Skills Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public skills read" ON public.skills;
DROP POLICY IF EXISTS "Auth skills all" ON public.skills;
DROP POLICY IF EXISTS "Admin skills insert" ON public.skills;
DROP POLICY IF EXISTS "Admin skills update" ON public.skills;
DROP POLICY IF EXISTS "Admin skills delete" ON public.skills;

CREATE POLICY "Public skills read" ON public.skills FOR SELECT
USING (
    public.is_admin() OR
    EXISTS (
        SELECT 1 FROM public.skill_categories
        WHERE public.skill_categories.id = public.skills.category_id
        AND public.skill_categories.is_visible = true
    )
);
CREATE POLICY "Admin skills insert" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin skills update" ON public.skills FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin skills delete" ON public.skills FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. Certificates Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public certificates read" ON public.certificates;
DROP POLICY IF EXISTS "Auth certificates all" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates insert" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates update" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates delete" ON public.certificates;

CREATE POLICY "Public certificates read" ON public.certificates FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin certificates insert" ON public.certificates FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin certificates update" ON public.certificates FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin certificates delete" ON public.certificates FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. Achievements Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public achievements read" ON public.achievements;
DROP POLICY IF EXISTS "Auth achievements all" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements insert" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements update" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements delete" ON public.achievements;

CREATE POLICY "Public achievements read" ON public.achievements FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin achievements insert" ON public.achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin achievements update" ON public.achievements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin achievements delete" ON public.achievements FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. Publications Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public publications read" ON public.publications;
DROP POLICY IF EXISTS "Auth publications all" ON public.publications;
DROP POLICY IF EXISTS "Admin publications insert" ON public.publications;
DROP POLICY IF EXISTS "Admin publications update" ON public.publications;
DROP POLICY IF EXISTS "Admin publications delete" ON public.publications;

CREATE POLICY "Public publications read" ON public.publications FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin publications insert" ON public.publications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin publications update" ON public.publications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin publications delete" ON public.publications FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 10. Social Links Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public social_links read" ON public.social_links;
DROP POLICY IF EXISTS "Auth social_links all" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links insert" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links update" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links delete" ON public.social_links;

CREATE POLICY "Public social_links read" ON public.social_links FOR SELECT USING (is_enabled = true OR public.is_admin());
CREATE POLICY "Admin social_links insert" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin social_links update" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin social_links delete" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 11. Site Settings Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public site_settings read" ON public.site_settings;
DROP POLICY IF EXISTS "Auth site_settings all" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings insert" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings update" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings delete" ON public.site_settings;

CREATE POLICY "Public site_settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin site_settings insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin site_settings update" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin site_settings delete" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 12. Resumes Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public resumes read" ON public.resumes;
DROP POLICY IF EXISTS "Auth resumes all" ON public.resumes;
DROP POLICY IF EXISTS "Admin resumes insert" ON public.resumes;
DROP POLICY IF EXISTS "Admin resumes update" ON public.resumes;
DROP POLICY IF EXISTS "Admin resumes delete" ON public.resumes;

CREATE POLICY "Public resumes read" ON public.resumes FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin resumes insert" ON public.resumes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin resumes update" ON public.resumes FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin resumes delete" ON public.resumes FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- ATOMIC SINGLE-ACTIVE-RESUME TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_single_active_resume()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.resumes
        SET is_active = false
        WHERE id <> NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_active_resume ON public.resumes;
CREATE TRIGGER trg_single_active_resume
BEFORE INSERT OR UPDATE OF is_active ON public.resumes
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION public.handle_single_active_resume();

-- =============================================================================
-- STORAGE BUCKETS SETUP & SECURITY POLICIES
-- =============================================================================

-- Ensure buckets exist with strict size and MIME type constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('project-images', 'project-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('certificates', 'certificates', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('resumes', 'resumes', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies: Anyone can view (read), ONLY verified admins can upload, update, or delete.

-- 1. profile-images
DROP POLICY IF EXISTS "Public Storage Read profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Insert profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Update profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Delete profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete profile-images" ON storage.objects;

CREATE POLICY "Public Storage Read profile-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Admin Storage Insert profile-images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND public.is_admin());
CREATE POLICY "Admin Storage Update profile-images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND public.is_admin()) WITH CHECK (bucket_id = 'profile-images' AND public.is_admin());
CREATE POLICY "Admin Storage Delete profile-images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND public.is_admin());

-- 2. project-images
DROP POLICY IF EXISTS "Public Storage Read project-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Insert project-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Update project-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Delete project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete project-images" ON storage.objects;

CREATE POLICY "Public Storage Read project-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Admin Storage Insert project-images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin Storage Update project-images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin()) WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin Storage Delete project-images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin());

-- 3. certificates
DROP POLICY IF EXISTS "Public Storage Read certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Insert certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete certificates" ON storage.objects;

CREATE POLICY "Public Storage Read certificates" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Admin Storage Insert certificates" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
CREATE POLICY "Admin Storage Update certificates" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin()) WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
CREATE POLICY "Admin Storage Delete certificates" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin());

-- 4. resumes
DROP POLICY IF EXISTS "Public Storage Read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Insert resumes" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Auth Storage Delete resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete resumes" ON storage.objects;

CREATE POLICY "Public Storage Read resumes" ON storage.objects
    FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Admin Storage Insert resumes" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin Storage Update resumes" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin()) WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin Storage Delete resumes" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin());

-- =============================================================================
-- IDEMPOTENT SEED DATA FOR ABHISHEK AGRAWAL
-- =============================================================================
-- Safe to re-run: Each record is inserted ONLY if it does not already exist.

-- 1. Profile (only inserted if profile table is empty)
INSERT INTO public.profile (name, title, taglines, bio, about_me, email, location, profile_image_url)
SELECT 
    'Abhishek Agrawal',
    'Computer Science Student | Software Developer | ML Enthusiast',
    '["Computer Science Student", "Software Developer", "Machine Learning Enthusiast"]'::jsonb,
    'Computer Science undergraduate at UPES interested in software development, machine learning, and building practical solutions.',
    'I am a Computer Science undergraduate at the University of Petroleum and Energy Studies (UPES), Dehradun, maintaining a CGPA of 8.9. My academic journey has been driven by a strong passion for software development and machine learning, complemented by hands-on experience through real-world internships and practical projects. I enjoy breaking down complex problems, designing efficient solutions, and continuously expanding my technical skill set. From building ML models that derive actionable insights from data to developing full-stack web applications, I strive to create technology that makes a tangible impact. I am eager to bring my problem-solving mindset, collaborative spirit, and technical expertise to a team where I can contribute meaningfully and continue to grow.',
    'abhi713111@gmail.com',
    'Dehradun, India',
    '/profile/profile-placeholder.svg'
WHERE NOT EXISTS (SELECT 1 FROM public.profile LIMIT 1);

-- 2. Projects (checked by title)
INSERT INTO public.projects (title, description, long_description, technologies, category, date, github_url, live_demo_url, image_url, is_featured, is_visible, sort_order)
SELECT
    'Placement Prediction Model',
    'Performed data preprocessing, trained multiple machine-learning algorithms and evaluated model performance using standard evaluation metrics.',
    'A complete machine learning project focused on predicting placement outcomes. The pipeline covers data cleaning, exploratory data analysis, data preprocessing, training multiple algorithms (including Logistic Regression, Decision Trees, and KNN), and evaluating performance with standard metrics.',
    '["Python", "Pandas", "NumPy", "Scikit-learn"]'::jsonb,
    'Machine Learning',
    '2025',
    'https://github.com/AbhishekAgrawal71',
    '',
    '',
    true,
    true,
    0
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Placement Prediction Model');

INSERT INTO public.projects (title, description, long_description, technologies, category, date, github_url, live_demo_url, image_url, is_featured, is_visible, sort_order)
SELECT
    'Memory Management Simulator',
    'Built a simulator for memory allocation strategies including First Fit, Best Fit, and Worst Fit.',
    'Simulates dynamic memory partitioning and operating system allocation algorithms. Models memory blocks, processes, and allocation/deallocation strategies to compare First Fit, Best Fit, and Worst Fit behaviors under varying memory loads.',
    '["C++", "Python"]'::jsonb,
    'C/C++',
    '2025',
    'https://github.com/AbhishekAgrawal71',
    '',
    '',
    false,
    true,
    1
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Memory Management Simulator');

INSERT INTO public.projects (title, description, long_description, technologies, category, date, github_url, live_demo_url, image_url, is_featured, is_visible, sort_order)
SELECT
    'Library Management System',
    'Built using object-oriented programming principles with functionality for book issue, book return, search, and inventory management.',
    'Object-oriented software designed to manage library operations cleanly. Encapsulates book and member entities, handles transactions, tracks availability, and allows rapid search across catalog records.',
    '["Java"]'::jsonb,
    'Java',
    '2025',
    'https://github.com/AbhishekAgrawal71',
    '',
    '',
    false,
    true,
    2
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Library Management System');

INSERT INTO public.projects (title, description, long_description, technologies, category, date, github_url, live_demo_url, image_url, is_featured, is_visible, sort_order)
SELECT
    'Student Record Management System',
    'Console-based student record system implementing CRUD operations, file handling, and search functionality.',
    'A reliable record management tool featuring persistent disk storage through file I/O. Supports adding, viewing, updating, deleting, and searching student profiles efficiently.',
    '["C", "Python"]'::jsonb,
    'Python',
    '2024',
    'https://github.com/AbhishekAgrawal71',
    '',
    '',
    false,
    true,
    3
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Student Record Management System');

-- 3. Experience (checked by role + company)
INSERT INTO public.experience (role, company, location, start_date, end_date, is_present, description, responsibilities, technologies, sort_order, is_visible)
SELECT
    'Web Development Intern',
    'Weazy',
    'Remote',
    'June 2026',
    'Present',
    true,
    'Hands-on development and optimization of the live company website, focusing on responsive UI/UX and web performance.',
    '["Building responsive web pages using HTML, CSS and JavaScript", "Maintaining the company website", "Improving UI/UX", "Improving website performance", "Working with the team to resolve issues and implement features"]'::jsonb,
    '["HTML", "CSS", "JavaScript", "Responsive Design"]'::jsonb,
    0,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.experience WHERE role = 'Web Development Intern' AND company = 'Weazy');

INSERT INTO public.experience (role, company, location, start_date, end_date, is_present, description, responsibilities, technologies, sort_order, is_visible)
SELECT
    'Intern / Group Lead',
    'eVidyaloka Trust',
    'Remote',
    'June 2025',
    'July 2025',
    false,
    'Led team activities and created AI-assisted educational content to expand digital learning accessibility.',
    '["Coordinated team activities and attendance", "Generated AI-assisted educational video transcripts", "Collaborated with mentors", "Helped ensure timely completion of assigned work"]'::jsonb,
    '["AI-Assisted Tools", "Team Coordination", "Educational Content"]'::jsonb,
    1,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.experience WHERE role = 'Intern / Group Lead' AND company = 'eVidyaloka Trust');

-- 4. Education (checked by institution)
INSERT INTO public.education (institution, degree, specialization, start_year, end_year, duration, status, location, cgpa, grade, description, sort_order, is_visible)
SELECT
    'University of Petroleum and Energy Studies (UPES)',
    'B.Tech in Computer Science and Engineering',
    'Computer Science and Engineering',
    '2024',
    '2028',
    '2024 - 2028',
    'Third Year / 5th Semester',
    'Dehradun, India',
    '8.9 / 10',
    '8.9 / 10 CGPA',
    'Core focus on Software Development, Machine Learning, Data Structures & Algorithms, DBMS, Operating Systems, and Object-Oriented Programming.',
    0,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.education WHERE institution = 'University of Petroleum and Energy Studies (UPES)');

-- 5. Skill Categories & Skills (idempotent lookup/creation)
DO $$
DECLARE
    cat_prog UUID;
    cat_web UUID;
    cat_ml UUID;
    cat_libs UUID;
    cat_core UUID;
    cat_tools UUID;
BEGIN
    -- Programming Languages
    SELECT id INTO cat_prog FROM public.skill_categories WHERE name = 'Programming Languages' LIMIT 1;
    IF cat_prog IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Programming Languages', 'Code', 0) RETURNING id INTO cat_prog;
    END IF;

    -- Web Development
    SELECT id INTO cat_web FROM public.skill_categories WHERE name = 'Web Development' LIMIT 1;
    IF cat_web IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Web Development', 'Globe', 1) RETURNING id INTO cat_web;
    END IF;

    -- Machine Learning
    SELECT id INTO cat_ml FROM public.skill_categories WHERE name = 'Machine Learning' LIMIT 1;
    IF cat_ml IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Machine Learning', 'Brain', 2) RETURNING id INTO cat_ml;
    END IF;

    -- Libraries
    SELECT id INTO cat_libs FROM public.skill_categories WHERE name = 'Libraries' LIMIT 1;
    IF cat_libs IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Libraries', 'Library', 3) RETURNING id INTO cat_libs;
    END IF;

    -- Core CS
    SELECT id INTO cat_core FROM public.skill_categories WHERE name = 'Core Computer Science' LIMIT 1;
    IF cat_core IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Core Computer Science', 'Cpu', 4) RETURNING id INTO cat_core;
    END IF;

    -- Tools
    SELECT id INTO cat_tools FROM public.skill_categories WHERE name = 'Tools' LIMIT 1;
    IF cat_tools IS NULL THEN
        INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Tools', 'Wrench', 5) RETURNING id INTO cat_tools;
    END IF;

    -- Skills: Programming
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_prog, 'Python', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_prog AND name = 'Python');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_prog, 'Java', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_prog AND name = 'Java');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_prog, 'C', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_prog AND name = 'C');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_prog, 'C++', 3 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_prog AND name = 'C++');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_prog, 'JavaScript', 4 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_prog AND name = 'JavaScript');

    -- Skills: Web
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_web, 'HTML', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_web AND name = 'HTML');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_web, 'CSS', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_web AND name = 'CSS');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_web, 'JavaScript', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_web AND name = 'JavaScript');

    -- Skills: ML
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Machine Learning', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Machine Learning');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Supervised Learning', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Supervised Learning');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Unsupervised Learning', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Unsupervised Learning');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Linear Regression', 3 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Linear Regression');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Logistic Regression', 4 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Logistic Regression');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Decision Trees', 5 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Decision Trees');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'KNN', 6 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'KNN');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Data Preprocessing', 7 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Data Preprocessing');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_ml, 'Model Evaluation', 8 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_ml AND name = 'Model Evaluation');

    -- Skills: Libraries
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_libs, 'NumPy', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_libs AND name = 'NumPy');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_libs, 'Pandas', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_libs AND name = 'Pandas');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_libs, 'Scikit-learn', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_libs AND name = 'Scikit-learn');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_libs, 'Matplotlib', 3 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_libs AND name = 'Matplotlib');

    -- Skills: Core CS
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Data Structures & Algorithms', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Data Structures & Algorithms');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'DBMS', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'DBMS');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Computer Networks', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Computer Networks');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Computer Organization & Architecture', 3 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Computer Organization & Architecture');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Operating Systems', 4 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Operating Systems');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Software Engineering', 5 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Software Engineering');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_core, 'Object-Oriented Programming', 6 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_core AND name = 'Object-Oriented Programming');

    -- Skills: Tools
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'Git', 0 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'Git');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'GitHub', 1 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'GitHub');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'MySQL', 2 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'MySQL');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'VS Code', 3 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'VS Code');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'Google Colab', 4 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'Google Colab');
    INSERT INTO public.skills (category_id, name, sort_order) SELECT cat_tools, 'Linux', 5 WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE category_id = cat_tools AND name = 'Linux');
END $$;

-- 6. Achievements (checked by title + organization)
INSERT INTO public.achievements (title, organization, year, description, sort_order, is_visible)
SELECT
    'Publicity Committee Member',
    'FIPI Student Chapter, UPES',
    '2025',
    'Managed publicity campaigns and social-media content.',
    0,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE title = 'Publicity Committee Member' AND organization = 'FIPI Student Chapter, UPES');

INSERT INTO public.achievements (title, organization, year, description, sort_order, is_visible)
SELECT
    'Public Relations Committee',
    'JIGYASA 2025',
    '2025',
    'Worked on alumni outreach, sponsorships and event publicity.',
    1,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE title = 'Public Relations Committee' AND organization = 'JIGYASA 2025');

-- 7. Social Links (checked by platform)
INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'github', 'GitHub', 'https://github.com/AbhishekAgrawal71', true, 0
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'github');

INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'insiderOne', 'InsiderOne', 'https://www.insiderone.in/id/IOPC-F9DF-SF2D', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'insiderOne');

INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'linkedin', 'LinkedIn', '', false, 2
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'linkedin');

INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'twitter', 'Twitter / X', '', false, 3
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'twitter');

INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'leetcode', 'LeetCode', '', false, 4
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'leetcode');

INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
SELECT 'email', 'Email', 'mailto:abhi713111@gmail.com', true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE platform = 'email');

-- 8. Site Settings (idempotent ON CONFLICT DO NOTHING)
INSERT INTO public.site_settings (key, value)
VALUES 
    ('show_projects', 'true'),
    ('show_experience', 'true'),
    ('show_education', 'true'),
    ('show_skills', 'true'),
    ('show_certificates', 'true'),
    ('show_achievements', 'true'),
    ('show_publications', 'true'),
    ('hero_greeting', 'Hello, I''m'),
    ('contact_note', '* The contact form will open your default email client.')
ON CONFLICT (key) DO NOTHING;

-- 9. Initial Resume Record (checked by file_name)
INSERT INTO public.resumes (file_name, file_url, is_active)
SELECT 'Abhishek_Agrawal_Resume.pdf', '/resume/Abhishek_Agrawal_Resume.pdf', true
WHERE NOT EXISTS (SELECT 1 FROM public.resumes WHERE file_name = 'Abhishek_Agrawal_Resume.pdf');
