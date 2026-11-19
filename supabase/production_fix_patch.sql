-- =============================================================================
-- ABHISHEK AGRAWAL PORTFOLIO - PRODUCTION FIX & SECURITY PATCH
-- =============================================================================
-- INSTRUCTIONS FOR EXECUTION:
-- 1. Open your Supabase Project Dashboard: https://supabase.com/dashboard
-- 2. Navigate to "SQL Editor" (terminal icon in left menu).
-- 3. Click "New query".
-- 4. Copy the ENTIRE contents of this file, paste into the query window, and click "Run".
--
-- SAFETY GUARANTEES:
-- - 100% Non-destructive: Does NOT drop, truncate, or delete any tables or data.
-- - Preserves all existing portfolio records, images, projects, and experiences.
-- - Preserves public.admin_users and your registered administrator UUID.
-- - Preserves Supabase Auth users and credentials.
-- - Idempotent: Safe to re-run multiple times without errors or duplication.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. POSTGRESQL TABLE GRANTS (Fixes "permission denied for table resumes/...")
-- -----------------------------------------------------------------------------
-- In PostgreSQL, RLS only filters rows. Roles must first have table-level GRANTs.

-- A. Public anonymous visitors: SELECT privileges only on portfolio content
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

-- B. Authenticated users: Full table privileges on portfolio tables and admin_users.
-- Note: Row Level Security (RLS) below restricts all write operations strictly to public.is_admin().
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

-- C. Grant execute permissions on is_admin() function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- -----------------------------------------------------------------------------
-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
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
-- 3. RLS POLICIES FOR ADMIN_USERS
-- -----------------------------------------------------------------------------
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
-- 4. RLS POLICIES FOR SKILLS (Prevents leaking skills of hidden categories)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public skills read" ON public.skills;
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
-- 5. RLS POLICIES FOR RESUMES
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
-- 6. ATOMIC SINGLE-ACTIVE-RESUME TRIGGER
-- -----------------------------------------------------------------------------
-- Automatically ensures that when any resume is set to is_active=true, all other
-- resumes are atomically updated to is_active=false within the same transaction.
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

-- -----------------------------------------------------------------------------
-- 7. RE-ASSERT POLICIES FOR ALL OTHER PORTFOLIO TABLES (Idempotent Refresh)
-- -----------------------------------------------------------------------------

-- Profile
DROP POLICY IF EXISTS "Public profile read" ON public.profile;
DROP POLICY IF EXISTS "Admin profile insert" ON public.profile;
DROP POLICY IF EXISTS "Admin profile update" ON public.profile;
DROP POLICY IF EXISTS "Admin profile delete" ON public.profile;
CREATE POLICY "Public profile read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin profile insert" ON public.profile FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin profile update" ON public.profile FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin profile delete" ON public.profile FOR DELETE TO authenticated USING (public.is_admin());

-- Projects
DROP POLICY IF EXISTS "Public projects read" ON public.projects;
DROP POLICY IF EXISTS "Admin projects insert" ON public.projects;
DROP POLICY IF EXISTS "Admin projects update" ON public.projects;
DROP POLICY IF EXISTS "Admin projects delete" ON public.projects;
CREATE POLICY "Public projects read" ON public.projects FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin projects insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin projects update" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin projects delete" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- Experience
DROP POLICY IF EXISTS "Public experience read" ON public.experience;
DROP POLICY IF EXISTS "Admin experience insert" ON public.experience;
DROP POLICY IF EXISTS "Admin experience update" ON public.experience;
DROP POLICY IF EXISTS "Admin experience delete" ON public.experience;
CREATE POLICY "Public experience read" ON public.experience FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin experience insert" ON public.experience FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin experience update" ON public.experience FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin experience delete" ON public.experience FOR DELETE TO authenticated USING (public.is_admin());

-- Education
DROP POLICY IF EXISTS "Public education read" ON public.education;
DROP POLICY IF EXISTS "Admin education insert" ON public.education;
DROP POLICY IF EXISTS "Admin education update" ON public.education;
DROP POLICY IF EXISTS "Admin education delete" ON public.education;
CREATE POLICY "Public education read" ON public.education FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin education insert" ON public.education FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin education update" ON public.education FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin education delete" ON public.education FOR DELETE TO authenticated USING (public.is_admin());

-- Skill Categories
DROP POLICY IF EXISTS "Public skill_categories read" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories insert" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories update" ON public.skill_categories;
DROP POLICY IF EXISTS "Admin skill_categories delete" ON public.skill_categories;
CREATE POLICY "Public skill_categories read" ON public.skill_categories FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin skill_categories insert" ON public.skill_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin skill_categories update" ON public.skill_categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin skill_categories delete" ON public.skill_categories FOR DELETE TO authenticated USING (public.is_admin());

-- Certificates
DROP POLICY IF EXISTS "Public certificates read" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates insert" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates update" ON public.certificates;
DROP POLICY IF EXISTS "Admin certificates delete" ON public.certificates;
CREATE POLICY "Public certificates read" ON public.certificates FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin certificates insert" ON public.certificates FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin certificates update" ON public.certificates FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin certificates delete" ON public.certificates FOR DELETE TO authenticated USING (public.is_admin());

-- Achievements
DROP POLICY IF EXISTS "Public achievements read" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements insert" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements update" ON public.achievements;
DROP POLICY IF EXISTS "Admin achievements delete" ON public.achievements;
CREATE POLICY "Public achievements read" ON public.achievements FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin achievements insert" ON public.achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin achievements update" ON public.achievements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin achievements delete" ON public.achievements FOR DELETE TO authenticated USING (public.is_admin());

-- Publications
DROP POLICY IF EXISTS "Public publications read" ON public.publications;
DROP POLICY IF EXISTS "Admin publications insert" ON public.publications;
DROP POLICY IF EXISTS "Admin publications update" ON public.publications;
DROP POLICY IF EXISTS "Admin publications delete" ON public.publications;
CREATE POLICY "Public publications read" ON public.publications FOR SELECT USING (is_visible = true OR public.is_admin());
CREATE POLICY "Admin publications insert" ON public.publications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin publications update" ON public.publications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin publications delete" ON public.publications FOR DELETE TO authenticated USING (public.is_admin());

-- Social Links
DROP POLICY IF EXISTS "Public social_links read" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links insert" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links update" ON public.social_links;
DROP POLICY IF EXISTS "Admin social_links delete" ON public.social_links;
CREATE POLICY "Public social_links read" ON public.social_links FOR SELECT USING (is_enabled = true OR public.is_admin());
CREATE POLICY "Admin social_links insert" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin social_links update" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin social_links delete" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());

-- Site Settings
DROP POLICY IF EXISTS "Public site_settings read" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings insert" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings update" ON public.site_settings;
DROP POLICY IF EXISTS "Admin site_settings delete" ON public.site_settings;
CREATE POLICY "Public site_settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin site_settings insert" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin site_settings update" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin site_settings delete" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. STORAGE BUCKETS CONFIGURATION & POLICIES
-- -----------------------------------------------------------------------------
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

-- Storage object policies (profile-images)
DROP POLICY IF EXISTS "Public Storage Read profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete profile-images" ON storage.objects;
CREATE POLICY "Public Storage Read profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Admin Storage Insert profile-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND public.is_admin());
CREATE POLICY "Admin Storage Update profile-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND public.is_admin()) WITH CHECK (bucket_id = 'profile-images' AND public.is_admin());
CREATE POLICY "Admin Storage Delete profile-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND public.is_admin());

-- Storage object policies (project-images)
DROP POLICY IF EXISTS "Public Storage Read project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update project-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete project-images" ON storage.objects;
CREATE POLICY "Public Storage Read project-images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Admin Storage Insert project-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin Storage Update project-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin()) WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin Storage Delete project-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin());

-- Storage object policies (certificates)
DROP POLICY IF EXISTS "Public Storage Read certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete certificates" ON storage.objects;
CREATE POLICY "Public Storage Read certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Admin Storage Insert certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
CREATE POLICY "Admin Storage Update certificates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin()) WITH CHECK (bucket_id = 'certificates' AND public.is_admin());
CREATE POLICY "Admin Storage Delete certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin());

-- Storage object policies (resumes)
DROP POLICY IF EXISTS "Public Storage Read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Insert resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Storage Delete resumes" ON storage.objects;
CREATE POLICY "Public Storage Read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Admin Storage Insert resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin Storage Update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin()) WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin Storage Delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin());

-- =============================================================================
-- PATCH COMPLETE
-- =============================================================================
