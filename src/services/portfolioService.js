import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Static fallback data
import staticPersonal from '../data/personal';
import staticProjects from '../data/projects';
import staticExperience from '../data/experience';
import staticEducation from '../data/education';
import staticSkills from '../data/skills';
import staticCertificates from '../data/certificates';
import staticAchievements from '../data/achievements';
import staticPublications from '../data/publications';

/**
 * =============================================================================
 * PUBLIC DATA FETCHER (WITH AUTOMATIC STATIC FALLBACK)
 * =============================================================================
 */

export const fetchAllPortfolioData = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return getStaticFallbackData();
  }

  try {
    const [
      profileRes,
      projectsRes,
      experienceRes,
      educationRes,
      categoriesRes,
      skillsRes,
      certificatesRes,
      achievementsRes,
      publicationsRes,
      socialLinksRes,
      settingsRes,
      resumeRes,
    ] = await Promise.allSettled([
      supabase.from('profile').select('*').limit(1).single(),
      supabase.from('projects').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('experience').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('education').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('skill_categories').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('certificates').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('achievements').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('publications').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      supabase.from('social_links').select('*').eq('is_enabled', true).order('sort_order', { ascending: true }),
      supabase.from('site_settings').select('*'),
      supabase.from('resumes').select('*').eq('is_active', true).limit(1).maybeSingle(),
    ]);

    // Check if profile exists; if database is empty, use fallback
    if (profileRes.status !== 'fulfilled' || !profileRes.value.data) {
      console.warn('Database is empty or profile query failed. Using static fallback data.');
      return getStaticFallbackData();
    }

    const profileData = profileRes.value.data;

    // Build projects array
    const projectsData = (projectsRes.status === 'fulfilled' && projectsRes.value.data)
      ? projectsRes.value.data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          longDescription: p.long_description,
          technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies ? JSON.parse(p.technologies) : []),
          image: p.image_url || '',
          github: p.github_url || '',
          liveDemo: p.live_demo_url || '',
          featured: p.is_featured,
          category: p.category,
          date: p.date,
          isVisible: p.is_visible,
          sortOrder: p.sort_order,
        }))
      : staticProjects;

    // Build experience array
    const experienceData = (experienceRes.status === 'fulfilled' && experienceRes.value.data)
      ? experienceRes.value.data.map(e => ({
          id: e.id,
          role: e.role,
          company: e.company,
          location: e.location,
          startDate: e.start_date,
          endDate: e.end_date,
          duration: e.is_present ? `${e.start_date} - Present` : (e.end_date ? `${e.start_date} - ${e.end_date}` : e.start_date),
          isPresent: e.is_present,
          description: e.description,
          responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : (e.responsibilities ? JSON.parse(e.responsibilities) : []),
          technologies: Array.isArray(e.technologies) ? e.technologies : (e.technologies ? JSON.parse(e.technologies) : []),
          sortOrder: e.sort_order,
        }))
      : staticExperience;

    // Build education array
    const educationData = (educationRes.status === 'fulfilled' && educationRes.value.data)
      ? educationRes.value.data.map(ed => ({
          id: ed.id,
          university: ed.institution,
          institution: ed.institution,
          degree: ed.degree,
          specialization: ed.specialization,
          duration: ed.duration || `${ed.start_year} - ${ed.end_year}`,
          startYear: ed.start_year,
          endYear: ed.end_year,
          location: ed.location,
          cgpa: ed.cgpa,
          grade: ed.grade || ed.cgpa,
          status: ed.status,
          description: ed.description,
          sortOrder: ed.sort_order,
        }))
      : staticEducation;

    // Build skills array
    let skillsCategories = [];
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
      const allSkills = skillsRes.status === 'fulfilled' && skillsRes.value.data ? skillsRes.value.data : [];
      skillsCategories = categoriesRes.value.data.map(cat => ({
        id: cat.id,
        category: cat.name,
        icon: cat.icon || 'Code',
        skills: allSkills.filter(s => s.category_id === cat.id).map(s => s.name),
        sortOrder: cat.sort_order,
      }));
    } else {
      skillsCategories = staticSkills;
    }

    // Build certificates
    const certificatesData = (certificatesRes.status === 'fulfilled' && certificatesRes.value.data)
      ? certificatesRes.value.data.map(c => ({
          id: c.id,
          title: c.title,
          name: c.title,
          issuer: c.issuer,
          organization: c.issuer,
          date: c.issue_date,
          issueDate: c.issue_date,
          credentialUrl: c.credential_url,
          image: c.image_url,
          pdf: c.pdf_url,
          description: c.description,
          sortOrder: c.sort_order,
        }))
      : staticCertificates;

    // Build achievements
    const achievementsData = (achievementsRes.status === 'fulfilled' && achievementsRes.value.data)
      ? achievementsRes.value.data.map(a => ({
          id: a.id,
          title: a.title,
          organization: a.organization,
          year: a.year,
          date: a.year,
          description: a.description,
          sortOrder: a.sort_order,
        }))
      : staticAchievements;

    // Build publications
    const publicationsData = (publicationsRes.status === 'fulfilled' && publicationsRes.value.data)
      ? publicationsRes.value.data.map(pub => ({
          id: pub.id,
          title: pub.title,
          description: pub.description,
          venue: pub.venue,
          journal: pub.venue,
          year: pub.year,
          paperUrl: pub.paper_url,
          codeUrl: pub.code_url,
          topics: pub.topics,
          sortOrder: pub.sort_order,
        }))
      : staticPublications;

    // Build social links
    const socialLinksData = (socialLinksRes.status === 'fulfilled' && socialLinksRes.value.data)
      ? socialLinksRes.value.data
      : [];

    // Parse settings
    const settingsMap = {};
    if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
      settingsRes.value.data.forEach(s => {
        settingsMap[s.key] = s.value;
      });
    }

    // Active resume
    const activeResume = (resumeRes.status === 'fulfilled' && resumeRes.value.data)
      ? resumeRes.value.data.file_url
      : staticPersonal.resumePath;

    // Map social links into personal
    const githubLink = socialLinksData.find(s => s.platform === 'github')?.url || staticPersonal.github;
    const linkedinLink = socialLinksData.find(s => s.platform === 'linkedin')?.url || staticPersonal.linkedin;
    const leetcodeLink = socialLinksData.find(s => s.platform === 'leetcode')?.url || staticPersonal.leetcode;
    const twitterLink = socialLinksData.find(s => s.platform === 'twitter')?.url || staticPersonal.twitter;
    const insiderOneLink = socialLinksData.find(s => s.platform === 'insiderOne')?.url || staticPersonal.insiderOne;

    const personal = {
      name: profileData.name || staticPersonal.name,
      title: profileData.title || staticPersonal.title,
      taglines: Array.isArray(profileData.taglines) ? profileData.taglines : (profileData.taglines ? JSON.parse(profileData.taglines) : staticPersonal.taglines),
      bio: profileData.bio || staticPersonal.bio,
      aboutMe: profileData.about_me || staticPersonal.aboutMe,
      email: profileData.email || staticPersonal.email,
      location: profileData.location || staticPersonal.location,
      profileImage: profileData.profile_image_url || staticPersonal.profileImage,
      resumePath: activeResume || staticPersonal.resumePath,
      github: githubLink,
      linkedin: linkedinLink,
      leetcode: leetcodeLink,
      twitter: twitterLink,
      insiderOne: insiderOneLink,
    };

    return {
      isFromDb: true,
      personal,
      projects: projectsData,
      experience: experienceData,
      education: educationData,
      skills: skillsCategories,
      certificates: certificatesData,
      achievements: achievementsData,
      publications: publicationsData,
      socialLinks: socialLinksData,
      settings: settingsMap,
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return getStaticFallbackData();
  }
};

const getStaticFallbackData = () => ({
  isFromDb: false,
  personal: staticPersonal,
  projects: staticProjects,
  experience: staticExperience,
  education: staticEducation,
  skills: staticSkills,
  certificates: staticCertificates,
  achievements: staticAchievements,
  publications: staticPublications,
  socialLinks: [
    { platform: 'github', label: 'GitHub', url: staticPersonal.github, is_enabled: !!staticPersonal.github },
    { platform: 'insiderOne', label: 'InsiderOne', url: staticPersonal.insiderOne, is_enabled: !!staticPersonal.insiderOne },
    { platform: 'linkedin', label: 'LinkedIn', url: staticPersonal.linkedin, is_enabled: false },
    { platform: 'twitter', label: 'Twitter', url: staticPersonal.twitter, is_enabled: false },
    { platform: 'leetcode', label: 'LeetCode', url: staticPersonal.leetcode, is_enabled: false },
  ],
  settings: {
    show_projects: 'true',
    show_experience: 'true',
    show_education: 'true',
    show_skills: 'true',
    show_certificates: 'true',
    show_achievements: 'true',
    show_publications: 'true',
  },
});

/**
 * =============================================================================
 * ADMIN CRUD METHODS
 * =============================================================================
 */

// Profile
export const getAdminProfile = async () => {
  const { data, error } = await supabase.from('profile').select('*').limit(1).single();
  if (error) throw error;
  return data;
};

export const updateAdminProfile = async (id, profileData) => {
  const { data, error } = await supabase
    .from('profile')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Projects
export const getAdminProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminProject = async (project) => {
  const { data, error } = await supabase.from('projects').insert([project]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminProject = async (id, project) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...project, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminProject = async (id) => {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
};

// Experience
export const getAdminExperience = async () => {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminExperience = async (exp) => {
  const { data, error } = await supabase.from('experience').insert([exp]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminExperience = async (id, exp) => {
  const { data, error } = await supabase
    .from('experience')
    .update({ ...exp, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminExperience = async (id) => {
  const { error } = await supabase.from('experience').delete().eq('id', id);
  if (error) throw error;
};

// Education
export const getAdminEducation = async () => {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminEducation = async (edu) => {
  const { data, error } = await supabase.from('education').insert([edu]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminEducation = async (id, edu) => {
  const { data, error } = await supabase
    .from('education')
    .update({ ...edu, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminEducation = async (id) => {
  const { error } = await supabase.from('education').delete().eq('id', id);
  if (error) throw error;
};

// Skills & Categories
export const getAdminSkillCategories = async () => {
  const { data: categories, error: catError } = await supabase
    .from('skill_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (catError) throw catError;

  const { data: skills, error: skillError } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });
  if (skillError) throw skillError;

  return categories.map(cat => ({
    ...cat,
    skills: skills.filter(s => s.category_id === cat.id),
  }));
};

export const createAdminSkillCategory = async (cat) => {
  const { data, error } = await supabase.from('skill_categories').insert([cat]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminSkillCategory = async (id, cat) => {
  const { data, error } = await supabase
    .from('skill_categories')
    .update({ ...cat, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminSkillCategory = async (id) => {
  const { error } = await supabase.from('skill_categories').delete().eq('id', id);
  if (error) throw error;
};

export const createAdminSkill = async (categoryId, name) => {
  const { data, error } = await supabase.from('skills').insert([{
    category_id: categoryId,
    name,
    sort_order: 0,
  }]).select().single();
  if (error) throw error;
  return data;
};

export const deleteAdminSkill = async (id) => {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
};

// Certificates
export const getAdminCertificates = async () => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminCertificate = async (cert) => {
  const { data, error } = await supabase.from('certificates').insert([cert]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminCertificate = async (id, cert) => {
  const { data, error } = await supabase
    .from('certificates')
    .update({ ...cert, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminCertificate = async (id) => {
  const { error } = await supabase.from('certificates').delete().eq('id', id);
  if (error) throw error;
};

// Achievements
export const getAdminAchievements = async () => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminAchievement = async (ach) => {
  const { data, error } = await supabase.from('achievements').insert([ach]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminAchievement = async (id, ach) => {
  const { data, error } = await supabase
    .from('achievements')
    .update({ ...ach, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminAchievement = async (id) => {
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) throw error;
};

// Publications
export const getAdminPublications = async () => {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAdminPublication = async (pub) => {
  const { data, error } = await supabase.from('publications').insert([pub]).select().single();
  if (error) throw error;
  return data;
};

export const updateAdminPublication = async (id, pub) => {
  const { data, error } = await supabase
    .from('publications')
    .update({ ...pub, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminPublication = async (id) => {
  const { error } = await supabase.from('publications').delete().eq('id', id);
  if (error) throw error;
};

// Resumes
export const getAdminResumes = async () => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createAdminResume = async (resume) => {
  // If setting this as active, deactivate others
  if (resume.is_active) {
    await supabase.from('resumes').update({ is_active: false }).neq('id', 'placeholder');
  }
  const { data, error } = await supabase.from('resumes').insert([resume]).select().single();
  if (error) throw error;
  return data;
};

export const setAdminActiveResume = async (id) => {
  await supabase.from('resumes').update({ is_active: false }).neq('id', id);
  const { data, error } = await supabase
    .from('resumes')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminResume = async (id) => {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  if (error) throw error;
};

// Social Links
export const getAdminSocialLinks = async () => {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateAdminSocialLink = async (id, link) => {
  const { data, error } = await supabase
    .from('social_links')
    .update({ ...link, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createAdminSocialLink = async (link) => {
  const { data, error } = await supabase.from('social_links').insert([link]).select().single();
  if (error) throw error;
  return data;
};

export const deleteAdminSocialLink = async (id) => {
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) throw error;
};

// Site Settings
export const getAdminSiteSettings = async () => {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings = {};
  (data || []).forEach(item => {
    settings[item.key] = item.value;
  });
  return settings;
};

export const updateAdminSiteSetting = async (key, value) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw error;
  return data;
};
