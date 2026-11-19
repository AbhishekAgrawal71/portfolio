-- =============================================================================
-- ABHISHEK AGRAWAL PORTFOLIO - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =============================================================================
-- Execute this SQL script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
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

-- 1. Profile: Public can read, authenticated can insert/update/delete
CREATE POLICY "Public profile read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Auth profile all" ON public.profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Projects: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public projects read" ON public.projects FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth projects all" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Experience: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public experience read" ON public.experience FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth experience all" ON public.experience FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Education: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public education read" ON public.education FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth education all" ON public.education FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Skill categories: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public skill_categories read" ON public.skill_categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth skill_categories all" ON public.skill_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Skills: Public reads all, authenticated has full CRUD
CREATE POLICY "Public skills read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Auth skills all" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Certificates: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public certificates read" ON public.certificates FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth certificates all" ON public.certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Achievements: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public achievements read" ON public.achievements FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth achievements all" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Publications: Public reads visible, authenticated has full CRUD
CREATE POLICY "Public publications read" ON public.publications FOR SELECT USING (is_visible = true);
CREATE POLICY "Auth publications all" ON public.publications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Social Links: Public reads enabled, authenticated has full CRUD
CREATE POLICY "Public social_links read" ON public.social_links FOR SELECT USING (is_enabled = true);
CREATE POLICY "Auth social_links all" ON public.social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Site Settings: Public reads all, authenticated has full CRUD
CREATE POLICY "Public site_settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Auth site_settings all" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. Resumes: Public reads active resume, authenticated has full CRUD
CREATE POLICY "Public resumes read" ON public.resumes FOR SELECT USING (is_active = true);
CREATE POLICY "Auth resumes all" ON public.resumes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- STORAGE BUCKETS SETUP
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('profile-images', 'profile-images', true),
    ('project-images', 'project-images', true),
    ('certificates', 'certificates', true),
    ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Anyone can view (read), only authenticated can upload/update/delete
CREATE POLICY "Public Storage Read profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Auth Storage Insert profile-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');
CREATE POLICY "Auth Storage Update profile-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Auth Storage Delete profile-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images');

CREATE POLICY "Public Storage Read project-images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Auth Storage Insert project-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Auth Storage Update project-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images');
CREATE POLICY "Auth Storage Delete project-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');

CREATE POLICY "Public Storage Read certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Auth Storage Insert certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Auth Storage Update certificates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates');
CREATE POLICY "Auth Storage Delete certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates');

CREATE POLICY "Public Storage Read resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Auth Storage Insert resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Auth Storage Update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "Auth Storage Delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes');

-- =============================================================================
-- SEED DATA FOR ABHISHEK AGRAWAL
-- =============================================================================

-- Profile
INSERT INTO public.profile (name, title, taglines, bio, about_me, email, location, profile_image_url)
VALUES (
    'Abhishek Agrawal',
    'Computer Science Student | Software Developer | ML Enthusiast',
    '["Computer Science Student", "Software Developer", "Machine Learning Enthusiast"]'::jsonb,
    'Computer Science undergraduate at UPES interested in software development, machine learning, and building practical solutions.',
    'I am a Computer Science undergraduate at the University of Petroleum and Energy Studies (UPES), Dehradun, maintaining a CGPA of 8.9. My academic journey has been driven by a strong passion for software development and machine learning, complemented by hands-on experience through real-world internships and practical projects. I enjoy breaking down complex problems, designing efficient solutions, and continuously expanding my technical skill set. From building ML models that derive actionable insights from data to developing full-stack web applications, I strive to create technology that makes a tangible impact. I am eager to bring my problem-solving mindset, collaborative spirit, and technical expertise to a team where I can contribute meaningfully and continue to grow.',
    'abhi713111@gmail.com',
    'Dehradun, India',
    '/profile/profile-placeholder.svg'
);

-- Projects
INSERT INTO public.projects (title, description, long_description, technologies, category, date, github_url, live_demo_url, image_url, is_featured, is_visible, sort_order)
VALUES 
(
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
),
(
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
),
(
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
),
(
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
);

-- Experience
INSERT INTO public.experience (role, company, location, start_date, end_date, is_present, description, responsibilities, technologies, sort_order, is_visible)
VALUES 
(
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
),
(
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
);

-- Education
INSERT INTO public.education (institution, degree, specialization, start_year, end_year, duration, status, location, cgpa, grade, description, sort_order, is_visible)
VALUES 
(
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
);

-- Skill Categories & Skills
DO $$
DECLARE
    cat_prog UUID;
    cat_web UUID;
    cat_ml UUID;
    cat_libs UUID;
    cat_core UUID;
    cat_tools UUID;
BEGIN
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Programming Languages', 'Code', 0) RETURNING id INTO cat_prog;
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Web Development', 'Globe', 1) RETURNING id INTO cat_web;
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Machine Learning', 'Brain', 2) RETURNING id INTO cat_ml;
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Libraries', 'Library', 3) RETURNING id INTO cat_libs;
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Core Computer Science', 'Cpu', 4) RETURNING id INTO cat_core;
    INSERT INTO public.skill_categories (name, icon, sort_order) VALUES ('Tools', 'Wrench', 5) RETURNING id INTO cat_tools;

    -- Programming
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_prog, 'Python', 0),
        (cat_prog, 'Java', 1),
        (cat_prog, 'C', 2),
        (cat_prog, 'C++', 3),
        (cat_prog, 'JavaScript', 4);

    -- Web
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_web, 'HTML', 0),
        (cat_web, 'CSS', 1),
        (cat_web, 'JavaScript', 2);

    -- ML
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_ml, 'Machine Learning', 0),
        (cat_ml, 'Supervised Learning', 1),
        (cat_ml, 'Unsupervised Learning', 2),
        (cat_ml, 'Linear Regression', 3),
        (cat_ml, 'Logistic Regression', 4),
        (cat_ml, 'Decision Trees', 5),
        (cat_ml, 'KNN', 6),
        (cat_ml, 'Data Preprocessing', 7),
        (cat_ml, 'Model Evaluation', 8);

    -- Libraries
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_libs, 'NumPy', 0),
        (cat_libs, 'Pandas', 1),
        (cat_libs, 'Scikit-learn', 2),
        (cat_libs, 'Matplotlib', 3);

    -- Core CS
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_core, 'Data Structures & Algorithms', 0),
        (cat_core, 'DBMS', 1),
        (cat_core, 'Computer Networks', 2),
        (cat_core, 'Computer Organization & Architecture', 3),
        (cat_core, 'Operating Systems', 4),
        (cat_core, 'Software Engineering', 5),
        (cat_core, 'Object-Oriented Programming', 6);

    -- Tools
    INSERT INTO public.skills (category_id, name, sort_order) VALUES
        (cat_tools, 'Git', 0),
        (cat_tools, 'GitHub', 1),
        (cat_tools, 'MySQL', 2),
        (cat_tools, 'VS Code', 3),
        (cat_tools, 'Google Colab', 4),
        (cat_tools, 'Linux', 5);
END $$;

-- Achievements
INSERT INTO public.achievements (title, organization, year, description, sort_order, is_visible)
VALUES 
(
    'Publicity Committee Member',
    'FIPI Student Chapter, UPES',
    '2025',
    'Managed publicity campaigns and social-media content.',
    0,
    true
),
(
    'Public Relations Committee',
    'JIGYASA 2025',
    '2025',
    'Worked on alumni outreach, sponsorships and event publicity.',
    1,
    true
);

-- Social Links
INSERT INTO public.social_links (platform, label, url, is_enabled, sort_order)
VALUES 
('github', 'GitHub', 'https://github.com/AbhishekAgrawal71', true, 0),
('insiderOne', 'InsiderOne', 'https://www.insiderone.in/id/IOPC-F9DF-SF2D', true, 1),
('linkedin', 'LinkedIn', '', false, 2),
('twitter', 'Twitter / X', '', false, 3),
('leetcode', 'LeetCode', '', false, 4),
('email', 'Email', 'mailto:abhi713111@gmail.com', true, 5);

-- Site Settings
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

-- Initial Resume Record
INSERT INTO public.resumes (file_name, file_url, is_active)
VALUES ('Abhishek_Agrawal_Resume.pdf', '/resume/Abhishek_Agrawal_Resume.pdf', true);
