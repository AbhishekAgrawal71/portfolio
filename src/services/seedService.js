import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

import staticPersonal from '../data/personal';
import staticProjects from '../data/projects';
import staticExperience from '../data/experience';
import staticEducation from '../data/education';
import staticSkills from '../data/skills';
import staticAchievements from '../data/achievements';

/**
 * Seeds initial portfolio data from static files into Supabase.
 * Safe: Won't overwrite existing tables unless force=true is passed.
 */
export const seedDatabaseFromStatic = async (force = false) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  const results = {
    profile: false,
    projects: 0,
    experience: 0,
    education: 0,
    skillCategories: 0,
    skills: 0,
    achievements: 0,
    socialLinks: 0,
    siteSettings: 0,
    resume: false,
  };

  // 1. Profile
  const { data: existingProfile } = await supabase.from('profile').select('id').limit(1);
  if (!existingProfile || existingProfile.length === 0 || force) {
    if (force && existingProfile?.length) {
      await supabase.from('profile').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const { error: profErr } = await supabase.from('profile').insert([{
      name: staticPersonal.name,
      title: staticPersonal.title,
      taglines: staticPersonal.taglines,
      bio: staticPersonal.bio,
      about_me: staticPersonal.aboutMe,
      email: staticPersonal.email,
      location: staticPersonal.location,
      profile_image_url: staticPersonal.profileImage,
    }]);
    if (profErr) console.warn('Seed profile error:', profErr);
    else results.profile = true;
  }

  // 2. Projects
  const { data: existingProjects } = await supabase.from('projects').select('id').limit(1);
  if (!existingProjects || existingProjects.length === 0 || force) {
    if (force && existingProjects?.length) {
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const projectsToInsert = staticProjects.map((p, idx) => ({
      title: p.title,
      description: p.description,
      long_description: p.longDescription || p.description,
      technologies: p.technologies || [],
      category: p.category || 'General',
      date: p.date || '2025',
      github_url: p.github || '',
      live_demo_url: p.liveDemo || '',
      image_url: p.image || '',
      is_featured: !!p.featured,
      is_visible: true,
      sort_order: idx,
    }));
    const { data: inserted, error: projErr } = await supabase.from('projects').insert(projectsToInsert).select();
    if (projErr) console.warn('Seed projects error:', projErr);
    else results.projects = inserted?.length || 0;
  }

  // 3. Experience
  const { data: existingExp } = await supabase.from('experience').select('id').limit(1);
  if (!existingExp || existingExp.length === 0 || force) {
    if (force && existingExp?.length) {
      await supabase.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const expToInsert = staticExperience.map((e, idx) => ({
      role: e.role,
      company: e.company,
      location: e.location || 'Remote',
      start_date: e.startDate || '2025',
      end_date: e.endDate || '',
      is_present: e.endDate === 'Present',
      description: e.description || '',
      responsibilities: e.responsibilities || [],
      technologies: e.technologies || [],
      sort_order: idx,
      is_visible: true,
    }));
    const { data: inserted, error: expErr } = await supabase.from('experience').insert(expToInsert).select();
    if (expErr) console.warn('Seed experience error:', expErr);
    else results.experience = inserted?.length || 0;
  }

  // 4. Education
  const { data: existingEdu } = await supabase.from('education').select('id').limit(1);
  if (!existingEdu || existingEdu.length === 0 || force) {
    if (force && existingEdu?.length) {
      await supabase.from('education').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const eduToInsert = staticEducation.map((ed, idx) => ({
      institution: ed.university || ed.institution,
      degree: ed.degree,
      specialization: 'Computer Science and Engineering',
      start_year: ed.startYear || '2024',
      end_year: ed.endYear || '2028',
      duration: ed.duration || '2024 - 2028',
      status: ed.status || 'Third Year / 5th Semester',
      location: ed.location || 'Dehradun, India',
      cgpa: ed.cgpa || '8.9 / 10',
      grade: ed.grade || '8.9 / 10 CGPA',
      description: ed.description || '',
      sort_order: idx,
      is_visible: true,
    }));
    const { data: inserted, error: eduErr } = await supabase.from('education').insert(eduToInsert).select();
    if (eduErr) console.warn('Seed education error:', eduErr);
    else results.education = inserted?.length || 0;
  }

  // 5. Skills Categories & Skills
  const { data: existingCats } = await supabase.from('skill_categories').select('id').limit(1);
  if (!existingCats || existingCats.length === 0 || force) {
    if (force && existingCats?.length) {
      await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('skill_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    for (let i = 0; i < staticSkills.length; i++) {
      const cat = staticSkills[i];
      const { data: newCat, error: catErr } = await supabase.from('skill_categories').insert([{
        name: cat.category,
        icon: cat.icon || 'Code',
        sort_order: i,
        is_visible: true,
      }]).select().single();

      if (!catErr && newCat) {
        results.skillCategories++;
        const skillsToInsert = (cat.skills || []).map((skillName, sIdx) => ({
          category_id: newCat.id,
          name: skillName,
          sort_order: sIdx,
        }));
        if (skillsToInsert.length > 0) {
          const { error: skillErr } = await supabase.from('skills').insert(skillsToInsert);
          if (!skillErr) results.skills += skillsToInsert.length;
        }
      }
    }
  }

  // 6. Achievements
  const { data: existingAch } = await supabase.from('achievements').select('id').limit(1);
  if (!existingAch || existingAch.length === 0 || force) {
    if (force && existingAch?.length) {
      await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const achToInsert = staticAchievements.map((a, idx) => ({
      title: a.title,
      organization: a.organization,
      year: a.year || a.date || '2025',
      description: a.description || '',
      sort_order: idx,
      is_visible: true,
    }));
    const { data: inserted, error: achErr } = await supabase.from('achievements').insert(achToInsert).select();
    if (achErr) console.warn('Seed achievements error:', achErr);
    else results.achievements = inserted?.length || 0;
  }

  // 7. Social Links
  const { data: existingLinks } = await supabase.from('social_links').select('id').limit(1);
  if (!existingLinks || existingLinks.length === 0 || force) {
    if (force && existingLinks?.length) {
      await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const linksToInsert = [
      { platform: 'github', label: 'GitHub', url: staticPersonal.github || 'https://github.com/AbhishekAgrawal71', is_enabled: true, sort_order: 0 },
      { platform: 'insiderOne', label: 'InsiderOne', url: staticPersonal.insiderOne || 'https://www.insiderone.in/id/IOPC-F9DF-SF2D', is_enabled: true, sort_order: 1 },
      { platform: 'linkedin', label: 'LinkedIn', url: staticPersonal.linkedin || '', is_enabled: false, sort_order: 2 },
      { platform: 'twitter', label: 'Twitter / X', url: staticPersonal.twitter || '', is_enabled: false, sort_order: 3 },
      { platform: 'leetcode', label: 'LeetCode', url: staticPersonal.leetcode || '', is_enabled: false, sort_order: 4 },
      { platform: 'email', label: 'Email', url: `mailto:${staticPersonal.email}`, is_enabled: true, sort_order: 5 },
    ];
    const { data: inserted, error: linkErr } = await supabase.from('social_links').insert(linksToInsert).select();
    if (linkErr) console.warn('Seed social links error:', linkErr);
    else results.socialLinks = inserted?.length || 0;
  }

  // 8. Site Settings
  const defaultSettings = [
    { key: 'show_projects', value: 'true' },
    { key: 'show_experience', value: 'true' },
    { key: 'show_education', value: 'true' },
    { key: 'show_skills', value: 'true' },
    { key: 'show_certificates', value: 'true' },
    { key: 'show_achievements', value: 'true' },
    { key: 'show_publications', value: 'true' },
    { key: 'hero_greeting', value: "Hello, I'm" },
    { key: 'contact_note', value: '* The contact form will open your default email client.' },
  ];
  for (const s of defaultSettings) {
    await supabase.from('site_settings').upsert(s, { onConflict: 'key' });
  }
  results.siteSettings = defaultSettings.length;

  // 9. Default Resume record
  const { data: existingResume } = await supabase.from('resumes').select('id').limit(1);
  if (!existingResume || existingResume.length === 0 || force) {
    await supabase.from('resumes').insert([{
      file_name: 'Abhishek_Agrawal_Resume.pdf',
      file_url: staticPersonal.resumePath || '/resume/Abhishek_Agrawal_Resume.pdf',
      is_active: true,
    }]);
    results.resume = true;
  }

  return results;
};
