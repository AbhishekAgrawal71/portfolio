# Portfolio Editing Guide

A step-by-step guide for updating your portfolio content. You only need to know basic JavaScript — no React knowledge required. Every piece of content lives in **`src/data/`** as a plain JavaScript file.

> **Tip:** After every change, save the file. If `npm run dev` is running, the browser refreshes automatically so you can see your updates instantly.

---

## Table of Contents

1. [How to Add a Project](#1-how-to-add-a-project)
2. [How to Remove a Project](#2-how-to-remove-a-project)
3. [How to Add a Project Screenshot](#3-how-to-add-a-project-screenshot)
4. [How to Add a Certificate](#4-how-to-add-a-certificate)
5. [How to Replace Your Resume](#5-how-to-replace-your-resume)
6. [How to Replace Your Profile Picture](#6-how-to-replace-your-profile-picture)
7. [How to Add or Remove Skills](#7-how-to-add-or-remove-skills)
8. [How to Change Social Links](#8-how-to-change-social-links)
9. [How to Add Experience](#9-how-to-add-experience)
10. [How to Deploy / Update Your Site](#10-how-to-deploy--update-your-site)

---

## 1. How to Add a Project

Open **`src/data/projects.js`** and add a new object to the array. Copy-paste this template at the end (before the closing `];`):

```js
  {
    id: "my-new-project",                   // unique lowercase slug
    title: "My New Project",
    description:
      "A short one-liner that appears on the project card.",
    longDescription:
      "A longer paragraph with more detail about the project.",
    technologies: ["Python", "Flask", "PostgreSQL"],
    image: "",                               // see section 3
    github: "https://github.com/you/repo",   // or "" to hide
    liveDemo: "https://my-project.vercel.app", // or "" to hide
    featured: true,                          // true = highlighted
    category: "Web Development",
    date: "2026",
  },
```

**Save the file.** The new project card appears on the site.

---

## 2. How to Remove a Project

Open **`src/data/projects.js`**, find the project object you want to remove, and delete the entire block (from `{` to `},`). Save the file.

---

## 3. How to Add a Project Screenshot

1. Put your image file (PNG, JPG, or WebP) in the **`public/projects/`** folder.
   - Example: `public/projects/my-new-project.png`
2. Open **`src/data/projects.js`** and set the `image` field of that project:

```js
    image: "/projects/my-new-project.png",
```

3. Save. The screenshot now shows on the project card.

---

## 4. How to Add a Certificate

Open **`src/data/certificates.js`**. The array starts empty. Add an object like this:

```js
const certificates = [
  {
    id: "aws-cloud-practitioner",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "March 2026",
    credential: "https://aws.amazon.com/verification/XXXXXXX",  // or ""
    description: "Covers cloud concepts, security, pricing, and core AWS services.",
  },
];
```

**Save.** The Certificates section automatically appears on the site (it's hidden when the array is empty).

---

## 5. How to Replace Your Resume

1. Put your resume PDF in the **`public/resume/`** folder.
   - Example: `public/resume/Abhishek_Agrawal_Resume.pdf`
2. Open **`src/data/personal.js`** and update the `resumePath` field:

```js
  resumePath: "/resume/Abhishek_Agrawal_Resume.pdf",
```

3. Save. The download/view resume button now points to your new file.

---

## 6. How to Replace Your Profile Picture

1. Put your photo (JPG, PNG, or WebP) in the **`public/profile/`** folder.
   - Example: `public/profile/abhishek.jpg`
2. Open **`src/data/personal.js`** and update the `profileImage` field:

```js
  profileImage: "/profile/abhishek.jpg",
```

3. Save. Your photo replaces the placeholder everywhere on the site.

---

## 7. How to Add or Remove Skills

Open **`src/data/skills.js`**.

### Add a skill to an existing category

Find the category and add a string to its `skills` array:

```js
  {
    category: "Web Development",
    icon: "Globe",
    skills: ["HTML", "CSS", "JavaScript", "React"],  // ← added "React"
  },
```

### Remove a skill

Delete the string from the `skills` array.

### Add an entirely new skill category

Add a new object to the array:

```js
  {
    category: "Cloud & DevOps",
    icon: "Cloud",           // Pick any icon name from https://lucide.dev/icons
    skills: ["AWS", "Docker", "GitHub Actions", "Linux"],
  },
```

Save. The new category card appears in the Skills section.

---

## 8. How to Change Social Links

Open **`src/data/personal.js`** and update the relevant fields:

```js
  email: "your-email@example.com",
  github: "https://github.com/your-username",
  linkedin: "https://linkedin.com/in/your-profile",
  twitter: "https://twitter.com/your-handle",
  leetcode: "https://leetcode.com/your-username",
```

- Set any link to `""` (empty string) to hide it from the site.
- Save. All social links across every section update automatically.

---

## 9. How to Add Experience

Open **`src/data/experience.js`** and add a new object at the **top** of the array (most recent first):

```js
  {
    id: "acme-sde-intern",
    role: "Software Development Intern",
    company: "Acme Corp",
    location: "Bangalore, India",
    startDate: "January 2027",
    endDate: "Present",                     // or "June 2027"
    description:
      "Brief summary of your role and what the company does.",
    responsibilities: [
      "Built REST APIs serving 10k+ requests per day",
      "Wrote unit tests achieving 90% code coverage",
      "Participated in agile sprints and daily stand-ups",
    ],
    technologies: ["Node.js", "Express", "PostgreSQL", "Docker"],
  },
```

Save. The new experience card appears at the top of the Experience section.

---

## 10. How to Deploy / Update Your Site

### First-time build

```bash
npm run build
```

This creates a **`dist/`** folder with your production-ready site.

### Deploy to GitHub Pages

1. Push the `dist/` folder to a `gh-pages` branch:

   ```bash
   git add dist -f
   git commit -m "Deploy portfolio"
   git subtree push --prefix dist origin gh-pages
   ```

2. In your GitHub repo, go to **Settings → Pages** and set the source to the `gh-pages` branch.

3. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

### Deploy to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com/), import the repo.
3. Vercel detects Vite automatically — click **Deploy**.
4. Every future `git push` triggers a re-deploy.

### Updating after changes

After editing any data file:

```bash
npm run build
git add .
git commit -m "Update portfolio content"
git push
```

If using GitHub Pages with the subtree method, also run the `git subtree push` command again. If using Vercel, the push triggers an automatic redeploy.

---

## Quick Reference — Where Everything Lives

| I want to change…          | Edit this file                 |
| -------------------------- | ------------------------------ |
| Name, bio, email, links    | `src/data/personal.js`         |
| Projects                   | `src/data/projects.js`         |
| Skills                     | `src/data/skills.js`           |
| Experience                 | `src/data/experience.js`       |
| Education                  | `src/data/education.js`        |
| Certificates               | `src/data/certificates.js`     |
| Achievements               | `src/data/achievements.js`     |
| Publications / Research    | `src/data/publications.js`     |
| Navigation bar items       | `src/data/navigation.js`       |
| Resume PDF                 | `public/resume/` + personal.js |
| Profile picture            | `public/profile/` + personal.js|
| Project screenshots        | `public/projects/`             |
