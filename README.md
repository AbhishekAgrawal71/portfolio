# Abhishek Agrawal — Portfolio

A modern, responsive developer portfolio built with **React** and **Vite**. Showcases projects, skills, experience, education, certificates, achievements, and research — all powered by simple JavaScript data files that anyone can edit without touching React internals.

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | React 19                          |
| Build Tool   | Vite 8                            |
| Icons        | Lucide React                      |
| Styling      | CSS custom properties (variables) |
| Deployment   | GitHub Pages / Vercel             |

---

## Features

- 🌗 **Dark / Light theme** with system preference detection and localStorage persistence
- 📱 **Fully responsive** — mobile, tablet, and desktop
- 🎞️ **Scroll-reveal animations** that respect `prefers-reduced-motion`
- 🔍 **Scroll-spy navigation** highlights the active section in the navbar
- 📂 **Data-driven** — all content lives in `src/data/` as plain JavaScript objects
- 🏷️ **SEO-ready** — Open Graph meta tags, semantic HTML, `robots.txt`
- ⚡ **Fast** — Vite HMR in dev, optimised production build

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/AbhishekAgrawal71/portfolio.git
cd portfolio
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot-module replacement.

---

## Project Structure

```
portfolio/
├── public/
│   ├── certificates/      # Certificate images
│   ├── profile/            # Profile photo / placeholder
│   ├── projects/           # Project screenshots
│   ├── resume/             # Resume PDF
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── assets/             # Static assets imported by components
│   ├── components/         # Reusable UI components (Navbar, Footer, ScrollToTop)
│   ├── data/               # ✏️ All portfolio content lives here
│   │   ├── achievements.js
│   │   ├── certificates.js
│   │   ├── education.js
│   │   ├── experience.js
│   │   ├── navigation.js
│   │   ├── personal.js
│   │   ├── projects.js
│   │   ├── publications.js
│   │   └── skills.js
│   ├── hooks/              # Custom React hooks
│   ├── sections/           # Page section components
│   ├── styles/             # Global CSS (variables, animations, index)
│   ├── utils/              # Utility / helper functions
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
├── PORTFOLIO_GUIDE.md      # Step-by-step editing guide
└── README.md               # ← You are here
```

---

## Editing Portfolio Content

All content is in **`src/data/`**. Each file exports a JavaScript object or array — just edit the values and save. No React knowledge required.

| What to change       | File                       |
| -------------------- | -------------------------- |
| Name, bio, links     | `src/data/personal.js`     |
| Work experience      | `src/data/experience.js`   |
| Projects             | `src/data/projects.js`     |
| Skills               | `src/data/skills.js`       |
| Education            | `src/data/education.js`    |
| Certificates         | `src/data/certificates.js` |
| Achievements         | `src/data/achievements.js` |
| Research / papers    | `src/data/publications.js` |
| Navigation items     | `src/data/navigation.js`   |

For a detailed, copy-paste-friendly walkthrough, see **[PORTFOLIO_GUIDE.md](PORTFOLIO_GUIDE.md)**.

---

## Adding Content

### Add a Project

1. Open `src/data/projects.js`.
2. Copy an existing project object.
3. Fill in the fields (`id`, `title`, `description`, `technologies`, etc.).
4. Save — the project card appears instantly in dev mode.

### Add a Certificate

1. Open `src/data/certificates.js`.
2. Add an object with `id`, `title`, `issuer`, `date`, `credential`, `description`.
3. Save — the Certificates section appears automatically when the array is non-empty.

### Replace Your Resume

1. Put your PDF in `public/resume/` (e.g. `Abhishek_Agrawal_Resume.pdf`).
2. Update `resumePath` in `src/data/personal.js` to match.

### Replace Your Profile Picture

1. Put your photo in `public/profile/`.
2. Update `profileImage` in `src/data/personal.js` to point to it (e.g. `"/profile/my-photo.jpg"`).

---

## Deployment

### GitHub Pages

```bash
npm run build
```

This generates the `dist/` folder. Deploy it to GitHub Pages:

1. Push `dist/` to a `gh-pages` branch, **or**
2. Use the **GitHub Actions** static-site workflow, **or**
3. In repo **Settings → Pages**, set source to the `gh-pages` branch (or `docs/` if you copy `dist/` there).

> The `base: './'` in `vite.config.js` ensures all asset paths are relative, so the site works under any sub-path.

### Vercel

1. Import your GitHub repo in [Vercel](https://vercel.com/).
2. Vercel auto-detects Vite — no configuration needed.
3. Every push to `main` triggers a new deployment.

---

## Available Scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Start the Vite dev server with HMR         |
| `npm run build`    | Create an optimised production build        |
| `npm run preview`  | Preview the production build locally        |
| `npm run lint`     | Run the oxlint linter                       |

---

## License

This project is open source and available under the [MIT License](LICENSE).
