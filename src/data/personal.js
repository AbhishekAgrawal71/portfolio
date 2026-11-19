/**
 * =============================================================================
 * Personal Information
 * =============================================================================
 * Edit the fields below to update your personal details across the entire site.
 * All sections (Hero, About, Contact, Footer, etc.) pull from this single file.
 *
 * Tips:
 * - Leave a field as "" (empty string) to hide the corresponding link/icon.
 * - `taglines` rotate in the hero section — add or remove entries freely.
 * - `resumePath` should point to a PDF inside the /public folder.
 * - `profileImage` should point to an image inside the /public folder.
 * =============================================================================
 */

const personalInfo = {
  // ── Core Identity ──────────────────────────────────────────────────────────
  name: "Abhishek Agrawal",

  // Displayed below your name in the hero section
  title: "Computer Science Student | Software Developer | ML Enthusiast",

  // Rotating taglines for the hero typing animation (array of strings)
  taglines: [
    "Computer Science Student",
    "Software Developer",
    "Machine Learning Enthusiast",
  ],

  // Short one-liner bio (used in meta tags and brief introductions)
  bio: "Computer Science undergraduate at UPES interested in software development, machine learning, and building practical solutions.",

  // ── About Me (longer paragraph for the About section) ──────────────────────
  // Write in first person. This is what recruiters and visitors read to learn
  // more about you, so keep it professional yet personable.
  aboutMe:
    "I am a Computer Science undergraduate at the University of Petroleum and Energy Studies (UPES), Dehradun, maintaining a CGPA of 8.9. My academic journey has been driven by a strong passion for software development and machine learning, complemented by hands-on experience through real-world internships and practical projects. I enjoy breaking down complex problems, designing efficient solutions, and continuously expanding my technical skill set. From building ML models that derive actionable insights from data to developing full-stack web applications, I strive to create technology that makes a tangible impact. I am eager to bring my problem-solving mindset, collaborative spirit, and technical expertise to a team where I can contribute meaningfully and continue to grow.",

  // ── Contact & Social Links ─────────────────────────────────────────────────
  // Leave any link as "" to hide it on the site.
  email: "abhi713111@gmail.com",
  github: "https://github.com/AbhishekAgrawal71",
  insiderOne: "https://www.insiderone.in/id/IOPC-F9DF-SF2D",

  // Add these when you create the accounts — the site hides empty links.
  linkedin: "",   // e.g. "https://linkedin.com/in/your-profile"
  twitter: "",    // e.g. "https://twitter.com/your-handle"
  leetcode: "",   // e.g. "https://leetcode.com/your-username"

  // ── Resume & Profile Image ────────────────────────────────────────────────
  // Place your resume PDF at:  public/resume/Abhishek_Agrawal_Resume.pdf
  resumePath: "/resume/Abhishek_Agrawal_Resume.pdf",

  // Place your profile photo at:  public/profile/profile-placeholder.svg
  // Swap the SVG for a JPG/PNG whenever you have a real photo.
  profileImage: "/profile/profile-placeholder.svg",

  // ── Location ──────────────────────────────────────────────────────────────
  location: "Dehradun, India",
};

export { personalInfo };
export const personal = personalInfo;
export default personalInfo;
