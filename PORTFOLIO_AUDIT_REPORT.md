# Portfolio Full Audit Report

**Target Project:** Abhishek Agrawal — Developer Portfolio & Admin Dashboard  
**Architecture:** React 19 + Vite 8 (SPA) ↔ Supabase (PostgreSQL, Auth, Storage)  
**Audit Date:** November 19, 2026  
**Auditor:** Antigravity Engineering Agent  
**Audit Scope:** Inspection & Verification Only (No code modified, no commands executed to alter state)

---

## 1. Executive Summary

| Category | Assessment | Notes |
| :--- | :--- | :--- |
| **Overall Status** | **NEEDS WORK BEFORE PRODUCTION DEPLOYMENT** | Application builds cleanly with 0 errors and has full CRUD functionality implemented. However, critical authorization and routing blockers must be resolved before deploying. |
| **Codebase & Architecture** | **EXCELLENT** | Modern modular structure, elegant UI/UX, responsive layouts, data-driven fallback to local files, and clean separation of concerns. |
| **Secret Leakage Risk** | **SAFE** | No secrets or credentials are committed to Git. `.env` is properly ignored. |
| **Database & RLS Security** | **CRITICAL ISSUE** | Row Level Security policies currently allow *any* authenticated Supabase user to insert, update, and delete all records and storage files. |
| **Admin Route Security** | **CRITICAL ISSUE** | `/admin` verifies *authentication* (is a user logged in?) but not *authorization* (is the logged-in user specifically Abhishek?). |
| **Vercel Deployment Readiness** | **BLOCKER** | Missing `vercel.json` SPA rewrite rules and relative Vite base (`./`) will cause direct `/admin` visits and asset loading to return 404 errors. |

---

## 2. Critical Issues

The following issues are categorized by severity and must be reviewed before going live:

### 🔴 CRITICAL-01: Overly Permissive Row Level Security (RLS) Policies
- **Location:** `supabase/schema.sql` (Lines 223–303)
- **Problem:** All write policies across all 12 tables and 4 storage buckets use:
  ```sql
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
  ```
- **Why It Matters:** In Supabase, any visitor can create an account if public user signups are enabled (the default). If someone registers an account via the Supabase Auth API, their session role is `authenticated`. Under the current policies, **any authenticated user has full write, update, and delete permissions over the entire database and all storage files**.
- **Impact:** An attacker could wipe out or deface projects, experiences, resume, and profile data.

---

### 🔴 CRITICAL-02: Missing Admin Authorization Guard in Frontend
- **Location:** `src/admin/AdminRoute.jsx` (Lines 10–24)
- **Problem:** `AdminRoute.jsx` checks:
  ```jsx
  if (!user) return <AdminLogin />;
  return <AdminLayout />;
  ```
- **Why It Matters:** This verifies *Authentication* ("Is anyone logged in?"), but does not verify *Authorization* ("Is this user the designated portfolio owner?"). If any user authenticates, they are immediately granted access to the admin dashboard UI.
- **Impact:** Combined with CRITICAL-01, any authenticated user gets full access to the admin UI and backend API.

---

### 🟠 HIGH-01: Missing `vercel.json` SPA Rewrites (404 on Direct `/admin` Visit)
- **Location:** Project Root (`e:\portfolio\vercel.json` is missing)
- **Problem:** The portfolio uses client-side routing (`BrowserRouter` from `react-router-dom`). When deployed to Vercel, requests to `https://your-domain.vercel.app/admin` look for a physical file at `/admin` or `/admin/index.html`.
- **Why It Matters:** Without a `vercel.json` rewrite directing all paths to `/index.html`, direct URL visits or browser refreshes on `/admin` will fail with Vercel's `404: NOT_FOUND`.
- **Impact:** You will not be able to open or refresh `/admin` directly on your deployed site.

---

### 🟠 HIGH-02: Relative Base URL (`base: './'`) in `vite.config.js`
- **Location:** `vite.config.js` (Line 6)
- **Problem:** `vite.config.js` has `base: './'`. In `dist/index.html`, scripts are linked as `<script src="./assets/index.js">`.
- **Why It Matters:** When a user visits a nested route like `/admin`, the browser attempts to fetch `./assets/index.js` relative to `/admin/`, which resolves to `/admin/assets/index.js` (which does not exist).
- **Impact:** Blank screen and 404 for JavaScript and CSS bundles when accessing `/admin` directly.

---

### 🟡 MEDIUM-01: Non-Idempotent SQL Schema & Seed Data Duplication Risk
- **Location:** `supabase/schema.sql` (Lines 223–303 and Lines 308–546)
- **Problem:** 
  1. `CREATE POLICY` statements in `schema.sql` fail with `policy already exists` if executed a second time.
  2. The `INSERT` statements in `schema.sql` do not have `ON CONFLICT` clauses (except `site_settings` and storage buckets).
- **Why It Matters:** If you run `schema.sql` in the Supabase SQL Editor more than once, it will crash on policy creation and duplicate all project, experience, education, and skill records.

---

### 🟡 MEDIUM-02: Password Recovery UI Mismatch
- **Location:** `src/admin/AdminLogin.jsx` & `src/context/AuthContext.jsx`
- **Problem:** `AdminLogin.jsx` has a "Forgot password?" modal that calls `resetPassword(email)`. Supabase sends an email linking to `/admin#access_token=...&type=recovery`. However, the app has no component or form to accept and submit a new password (`supabase.auth.updateUser({ password: newPassword })`).
- **Why It Matters:** Clicking the password reset link in the email logs the user into `/admin`, but never prompts them to enter their new password.

---

### 🟢 LOW-01: Missing File Size & MIME Type Validation in Storage Service
- **Location:** `src/services/storageService.js`
- **Problem:** `uploadFile` does not enforce a maximum file size or validate MIME types before sending files to Supabase Storage.
- **Why It Matters:** Relies solely on frontend HTML input `accept` attributes. Large files could be uploaded accidentally, consuming Supabase storage bandwidth.

---

### 🟢 LOW-02: Oxlint Code Quality Warnings
- **Location:** 61 files
- **Problem:** `npm run lint` (`oxlint`) reports 48 minor warnings (zero errors), primarily regarding unused icon imports (`Code2`, `Image`, `Mail`, `Check`, `Calendar`) and calling asynchronous `fetch` functions directly inside `useEffect` without wrapping them or memoizing dependencies.

---

## 3. Project Structure Audit

```
portfolio/
├── .env                              # [PASS] Exists, contains required env keys, uncommitted
├── .env.example                      # [PASS] Safe template with placeholders only
├── .gitignore                        # [PASS] Accurately protects .env, .env.*, dist, node_modules
├── .oxlintrc.json                    # [PASS] Linter configuration
├── ADMIN_SETUP.md                    # [WARNING] Accurate guide with minor policy & reset mismatches
├── PORTFOLIO_GUIDE.md                # [PASS] User-facing editing manual
├── README.md                         # [PASS] Project documentation
├── index.html                        # [PASS] Clean HTML5 shell with OG tags & viewport configuration
├── package.json                      # [PASS] Clean, valid dependencies
├── package-lock.json                 # [PASS] Synchronized dependency tree
├── vite.config.js                    # [WARNING] Contains base: './' which conflicts with SPA routing
├── vercel.json                       # [FAIL - MISSING] Needed for SPA route rewrites on Vercel
├── public/                           # [PASS]
│   ├── certificates/                 # Local certificates directory
│   ├── profile/                      # Contains profile-placeholder.svg
│   ├── projects/                     # Local project images directory
│   ├── resume/                       # Contains Abhishek_Agrawal_Resume.pdf
│   ├── favicon.svg                   # Custom SVG favicon
│   ├── icons.svg                     # Icons bundle
│   └── robots.txt                    # Search crawler rules
├── src/                              # [PASS]
│   ├── App.jsx                       # Root router (BrowserRouter, AuthProvider, PortfolioProvider)
│   ├── PublicPortfolio.jsx           # Public site wrapper (unlinked from /admin)
│   ├── main.jsx                      # Vite entry point
│   ├── admin/                        # [PASS] Complete private admin dashboard
│   │   ├── AdminLayout.jsx / .css    # Responsive sidebar layout & topbar
│   │   ├── AdminLogin.jsx / .css     # Login screen with password reset modal
│   │   ├── AdminRoute.jsx            # Protected route guard
│   │   ├── adminCommon.css           # Design tokens for admin UI
│   │   ├── components/               # Toast & ConfirmModal
│   │   └── views/                    # 12 distinct managers for all portfolio sections
│   ├── components/                   # [PASS] Public UI components
│   ├── context/                      # [PASS] AuthContext & PortfolioContext
│   ├── data/                         # [PASS] Static fallback data (9 files)
│   ├── hooks/                        # [PASS] useTheme, useScrollSpy, useScrollReveal
│   ├── lib/                          # [PASS] supabaseClient.js
│   ├── sections/                     # [PASS] 10 public page sections
│   ├── services/                     # [PASS] portfolioService, storageService, seedService
│   ├── styles/                       # [PASS] variables.css, animations.css, index.css
│   └── utils/                        # [PASS] helpers.js
└── supabase/                         # [PASS]
    └── schema.sql                    # [WARNING] Complete DDL & seed, but RLS too permissive
```

### Component Status Summary
- **package.json**: `PASS`
- **vite.config.js**: `WARNING`
- **src/**: `PASS`
- **public/**: `PASS`
- **supabase/schema.sql**: `WARNING`
- **.env**: `PASS`
- **.env.example**: `PASS`
- **.gitignore**: `PASS`
- **ADMIN_SETUP.md**: `WARNING`
- **vercel.json**: `FAIL` (Missing)

---

## 4. Dependencies Audit

Inspected `package.json` and cross-referenced with all imports across `src/`:

| Package | Version in `package.json` | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `react` | `^19.3.1` | Core UI Framework | Installed & Active |
| `react-dom` | `^19.3.1` | DOM Renderer | Installed & Active |
| `vite` | `^8.3.6` (resolves 8.3.8) | Build tool & Dev Server | Installed & Active |
| `@supabase/supabase-js` | `^2.119.1` | Database, Auth & Storage SDK | Installed & Active |
| `react-router-dom` | `^7.18.6` | Client-Side Routing | Installed & Active |
| `lucide-react` | `^1.75.0` | UI Icons | Installed & Active |
| `oxlint` | `^1.90.0` | Fast Rust-based Linter | Installed & Active |
| `@vitejs/plugin-react` | `^6.1.2` | Vite React Plugin | Installed & Active |

- **Missing Dependencies:** None. All modules imported in code are present in `package.json`.
- **Unused Major Dependencies:** None.
- **Form Libraries:** None (the application intentionally uses native controlled React components with custom validation, which avoids heavy dependencies like Formik or React Hook Form).
- **Version Conflicts:** None detected. Build completes in ~1.5 seconds.

---

## 5. Environment & Secret Security

- **Expected Keys:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **`.env` File Status:** Present in project root. **Values were NOT inspected or reproduced in this report.**
- **`.gitignore` Protection:**
  ```
  .env
  .env.*
  !.env.example
  ```
  Git status confirms `.env` is untracked and ignored.
- **Hardcoded Secret Scan:**
  - Scanned for `service_role`, `jwt_secret`, `bearer`, database passwords, private keys, and base64 JWT headers (`eyJ...`).
  - **Result: ZERO secrets found in tracked files.** The only match was an informational comment in `ADMIN_SETUP.md` explaining that anon keys start with `eyJ...`.
- **`.env.example` Check:** Contains only dummy placeholders (`https://your-project-id.supabase.co` and `your-anon-public-key-here`).

---

## 6. Supabase Client Audit

- **File Path:** `src/lib/supabaseClient.js`
- **Initialization Code:**
  ```javascript
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  export const isSupabaseConfigured = () => {
    return (
      typeof supabaseUrl === 'string' &&
      supabaseUrl.trim() !== '' &&
      !supabaseUrl.includes('your-project-id') &&
      typeof supabaseAnonKey === 'string' &&
      supabaseAnonKey.trim() !== '' &&
      !supabaseAnonKey.includes('your-anon-key')
    );
  };

  export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey, { ... })
    : null;
  ```
- **Service-Role Key Verification:** Safe. Only `VITE_SUPABASE_ANON_KEY` is referenced. The service-role key is never imported or used.
- **Client Usage:** Cleanly imported into `AuthContext.jsx`, `portfolioService.js`, `storageService.js`, and `seedService.js`. If unconfigured, `supabase` is `null` and operations fall back to static data gracefully.

---

## 7. Database Schema Audit

`supabase/schema.sql` defines 12 relational tables:

| Table | Primary Key | Key Columns | Ordering Field | Visibility Field | Foreign Keys |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profile` | `id UUID` | `name`, `title`, `taglines` (JSONB), `bio`, `about_me`, `email`, `location`, `profile_image_url` | None (Single row) | None (Always public) | None |
| `projects` | `id UUID` | `title`, `description`, `long_description`, `technologies` (JSONB), `category`, `date`, `github_url`, `live_demo_url`, `image_url`, `is_featured` | `sort_order INT` | `is_visible BOOL` | None |
| `experience` | `id UUID` | `role`, `company`, `location`, `start_date`, `end_date`, `is_present`, `description`, `responsibilities` (JSONB), `technologies` (JSONB) | `sort_order INT` | `is_visible BOOL` | None |
| `education` | `id UUID` | `institution`, `degree`, `specialization`, `start_year`, `end_year`, `duration`, `status`, `location`, `cgpa`, `grade`, `description` | `sort_order INT` | `is_visible BOOL` | None |
| `skill_categories`| `id UUID` | `name`, `icon` | `sort_order INT` | `is_visible BOOL` | None |
| `skills` | `id UUID` | `name` | `sort_order INT` | Inherited from category | `category_id -> skill_categories(id) ON DELETE CASCADE` |
| `certificates` | `id UUID` | `title`, `issuer`, `issue_date`, `credential_url`, `description`, `image_url`, `pdf_url` | `sort_order INT` | `is_visible BOOL` | None |
| `achievements` | `id UUID` | `title`, `organization`, `year`, `description` | `sort_order INT` | `is_visible BOOL` | None |
| `publications` | `id UUID` | `title`, `description`, `venue`, `year`, `paper_url`, `code_url`, `topics` (JSONB) | `sort_order INT` | `is_visible BOOL` | None |
| `social_links` | `id UUID` | `platform`, `label`, `url` | `sort_order INT` | `is_enabled BOOL` | None |
| `site_settings` | `id UUID` | `key TEXT UNIQUE`, `value TEXT` | None | None (Public read) | None |
| `resumes` | `id UUID` | `file_name`, `file_url`, `file_size`, `is_active BOOL` | `created_at DESC` | `is_active BOOL` | None |

- **Extensions:** Requires `uuid-ossp` (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` is included).
- **Timestamps:** Every table has `created_at` and `updated_at` defaults.
- **SQL Execution Reliability:** Tables use `IF NOT EXISTS`. However, policies lack `DROP POLICY IF EXISTS`, causing errors on repeat execution.

---

## 8. RLS Security Audit

Detailed breakdown of current Row Level Security policies in `supabase/schema.sql`:

| Table | RLS Active | Public SELECT Policy | Authenticated INSERT/UPDATE/DELETE Policy | Evaluation |
| :--- | :---: | :--- | :--- | :--- |
| `profile` | Yes | `USING (true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `projects` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `experience` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `education` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `skill_categories`| Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `skills` | Yes | `USING (true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `certificates` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `achievements` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `publications` | Yes | `USING (is_visible = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `social_links` | Yes | `USING (is_enabled = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `site_settings` | Yes | `USING (true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |
| `resumes` | Yes | `USING (is_active = true)` | `TO authenticated USING (true) WITH CHECK (true)` | 🔴 Insecure: Any authenticated user can modify |

### Public Visibility Leakage Check
- **Can hidden records be read publicly?** No. Public visitors querying through the anon key are blocked from seeing rows where `is_visible = false` or `is_enabled = false` or `is_active = false`.
- **Can anonymous visitors modify data?** No. Anon write attempts are rejected by RLS.
- **Can any logged-in user modify data?** **YES.** Any user with a valid Supabase login token passes `TO authenticated` and can perform full mutations.

---

## 9. Admin Authorization Model

### Current Implementation
- **Authentication:** `AuthContext.jsx` calls `supabase.auth.signInWithPassword({ email, password })`. If successful, `user` state is populated.
- **Authorization:** In `AdminRoute.jsx`, the only check is:
  ```javascript
  if (!user) return <AdminLogin />;
  ```
  There is **no check** on:
  - `user.email === 'abhi713111@gmail.com'`
  - User ID / UUID whitelist
  - App metadata (`user.app_metadata.role === 'admin'`)
  - Admin roles table or custom claims

### Authentication vs. Authorization Gap
- **Authentication** answers: *"Did this user provide valid credentials for an account in this Supabase project?"*
- **Authorization** answers: *"Is this specific authenticated user authorized to manage Abhishek's portfolio?"*
- **Conclusion:** Currently, authentication is mistaken for authorization. If signups are enabled in your Supabase project, anyone who registers an account will automatically gain admin dashboard access and database write access.

---

## 10. `/admin` Route Audit

- **Router:** Handled in `src/App.jsx` via `<Route path="/admin/*" element={<AdminRoute />} />`.
- **Navigation Hiding:** The `/admin` link is **not** present in the public navbar or footer. It is accessible only by typing `/admin` in the browser URL bar.
- **Behavior Matrix:**

| Visitor State | Action / URL | Observed Result | Security Assessment |
| :--- | :--- | :--- | :--- |
| Unauthenticated Visitor | Navigates to `/admin` | Displays `AdminLogin.jsx` | PASS |
| Designated Admin | Enters valid email & password | Enters `AdminLayout.jsx` | PASS |
| Non-Admin Authenticated User | Enters valid user credentials | **Enters `AdminLayout.jsx`** | 🔴 FAIL (Unauthorized access) |
| Session Expired | Reloads `/admin` after token expiry | `supabase.auth.getSession()` returns null, renders `AdminLogin.jsx` | PASS |
| Supabase Down / Unconfigured | Navigates to `/admin` | Displays alert banner explaining missing config; prevents crash | PASS |
| Hash Routing Fallback | Navigates to `/#/admin` | `RouteHandler` automatically redirects to `/admin` | PASS |

---

## 11. Storage Security Audit

### Buckets Defined in `schema.sql`
1. `profile-images` (Public: true)
2. `project-images` (Public: true)
3. `certificates` (Public: true)
4. `resumes` (Public: true)

### Storage RLS Policies
- `SELECT`: `USING (bucket_id = '...')` (Publicly readable — appropriate so visitors can view images and download resumes).
- `INSERT/UPDATE/DELETE`: `TO authenticated WITH CHECK (bucket_id = '...')`
- **Vulnerability:** Exactly like the database tables, any authenticated account can upload files or delete existing resumes and images from your storage buckets.
- **File Validation:**
  - `storageService.js` creates a clean unique timestamped name (`${Date.now()}_${cleanName}`).
  - However, it does not check file sizes before upload (e.g., stopping a 100MB file).
  - In `ResumeManager.jsx`, a frontend check verifies `.pdf` extension, but `storageService.js` does not enforce MIME types at the API level.

---

## 12. Admin Dashboard Feature Audit

Every dashboard view was audited by tracing its handler code and Supabase service calls:

| Feature | Status | Supabase Connected | Verified Capabilities & Code Paths |
| :--- | :---: | :---: | :--- |
| **Dashboard Home** | WORKING | Yes | Fetches live counts for projects, featured, experiences, skills, certs, pubs. Connects to `seedDatabaseFromStatic`. Quick action navigation buttons tested. |
| **Profile Manager** | WORKING | Yes | Form fields for name, title, taglines, bio, about me, email, location. Image upload connects to `profile-images` bucket. `updateAdminProfile` updates database row. |
| **Projects Manager** | WORKING | Yes | Full CRUD. `createAdminProject`, `updateAdminProject`, `deleteAdminProject`. Duplicate project creates copy with new sort order. Star button toggles `is_featured`. Eye button toggles `is_visible`. Screenshot upload connects to `project-images` bucket. Up/down reordering updates `sort_order`. |
| **Experience Manager**| WORKING | Yes | Full CRUD. Role, company, location, start date, end date. "Present" checkbox automatically locks end date to "Present". Dynamic bullet-point responsibilities list (add/remove inputs). Up/down reordering. |
| **Education Manager** | WORKING | Yes | Full CRUD. Institution, degree, specialization, start/end year, status, CGPA, coursework description. |
| **Skills Manager** | WORKING | Yes | Category CRUD (`createAdminSkillCategory`, `updateAdminSkillCategory`, `deleteAdminSkillCategory`). Icon selector maps 10 Lucide icons. Individual skills can be added via inline input and removed with an `(x)` badge button. |
| **Certificates** | WORKING | Yes | Full CRUD. Verification credential link, description, issue date. File upload connects to `certificates` bucket and handles both images and PDFs. |
| **Achievements** | WORKING | Yes | Full CRUD. Title, organization, year, description. Show/hide visibility toggle and up/down reordering. |
| **Publications** | WORKING | Yes | Full CRUD. Paper title, venue, year, paper URL, code URL, topics tags, and abstract description. |
| **Resume Manager** | WORKING | Yes | Active resume card shows active file. Upload file input validates `.pdf` and uploads to `resumes` bucket. Inserts row into `resumes` table and deactivates prior resumes. Preview and download buttons active. |
| **Social Links** | WORKING | Yes | Lists GitHub, LinkedIn, InsiderOne, LeetCode, Twitter, Email. Edit URLs, toggle enabled/disabled. Custom links can be added and deleted. |
| **Site Settings** | WORKING | Yes | Toggle switches for all 7 sections (`show_projects`, `show_experience`, `show_education`, `show_skills`, `show_certificates`, `show_achievements`, `show_publications`). Homepage greeting and contact note text overrides. |

---

## 13. Public Portfolio Data Flow Audit

The public portfolio retrieves data through `src/context/PortfolioContext.jsx` which invokes `fetchAllPortfolioData()`:

```
                  ┌───────────────────────────────┐
                  │    PortfolioContext.jsx       │
                  └──────────────┬────────────────┘
                                 │
                 Is Supabase Configured in .env?
                                 │
                   ┌─────────────┴─────────────┐
                  YES                          NO
                   │                           │
          Fetch All Tables from DB    Load src/data/*.js
                   │                           │
           Did Queries Succeed?                │
                   │                           │
             ┌─────┴─────┐                     │
            YES          NO                    │
             │           │                     │
    Format DB Rows   Log Warning & Fallback ───┘
             │           │
             └─────┬─────┘
                   │
         Render UI Sections
```

### Edge Case Analysis
- **Supabase unconfigured / invalid keys:** Falls back immediately to `src/data/*.js`. The public site functions 100% normally.
- **Supabase down / network error:** Caught in `try...catch` and falls back to static files.
- **Database completely empty (pre-seed):** If `profile` has 0 rows, `portfolioService.js` detects this and falls back to static data so visitors do not see a blank site.
- **Partial Migration Edge Case:** If `profile` is seeded in Supabase but `projects` has 0 rows, `projectsRes.value.data` evaluates to `[]`. The public Projects section will see `length === 0` and hide itself rather than showing the static projects. Once you seed the database, all sections synchronize.

---

## 14. Static Data Migration / Seed Audit

- **Existing Data Files:** Preserved in `src/data/` (all 9 files remain intact: `personal.js`, `projects.js`, `experience.js`, `education.js`, `skills.js`, `certificates.js`, `achievements.js`, `publications.js`, `navigation.js`).
- **Dashboard Seed Button:** Verified. Located in `src/admin/views/DashboardHome.jsx` as `"Seed Database from Static Data"` calling `seedDatabaseFromStatic()`.
- **Seed Logic Inspection:**
  - Checks `supabase.from('projects').select('id').limit(1)`.
  - If records exist and `force = false`, it **skips** insertion.
  - Therefore, clicking the button multiple times **will NOT create duplicate records**.
- **`schema.sql` Seed Logic:**
  - `schema.sql` lines 308–546 also contain raw `INSERT` statements.
  - **Risk:** If you run `schema.sql` in the Supabase SQL editor, it seeds the data directly. If you then click the dashboard button, the button detects existing data and skips.
  - **However:** If you run `schema.sql` *twice* in the SQL Editor, the SQL script itself lacks `ON CONFLICT` checks and will duplicate all rows.

---

## 15. Resume System Audit

- **Storage Location:** Supabase Storage bucket `resumes`.
- **Selection Mechanism:** Table `resumes` has `is_active BOOLEAN`. `setAdminActiveResume(id)` marks target as `true` and all others as `false`.
- **Public Integration:** `personal.resumePath` in `PortfolioContext.jsx` receives `activeResume.file_url`.
  - In `src/sections/Hero.jsx`, the "Download Resume" button links to `personal.resumePath`.
- **Fallback:** If no resume exists in the database, it defaults to `/resume/Abhishek_Agrawal_Resume.pdf`.
- **Admin Management:** Admin can view active resume, upload new PDF, preview in new tab, download, and delete older versions.

---

## 16. Profile & Media Audit

- **Profile Image:** Uploads to `profile-images` bucket. URL is written to `profile.profile_image_url`. Displays in Hero section. Fallback is `/profile/profile-placeholder.svg`.
- **Project Screenshots:** Uploads to `project-images` bucket. URL is written to `projects.image_url`. Fallback is a styled gradient icon frame on `ProjectCard.jsx`.
- **Certificates:** Uploads to `certificates` bucket. Handles both images and PDFs.

---

## 17. Site Settings Audit

Tested code path for every toggle in `src/admin/views/SiteSettingsManager.jsx`:

| Setting Key | Controls Section | Respected by Component? | Respected by Navbar? |
| :--- | :--- | :---: | :---: |
| `show_projects` | Projects | Yes (`Projects.jsx:26`) | Yes (`Navbar.jsx:45`) |
| `show_experience` | Experience | Yes (`Experience.jsx:10`) | Yes (`Navbar.jsx:44`) |
| `show_education` | Education | Yes (`Education.jsx:10`) | Yes (`Navbar.jsx:47`) |
| `show_skills` | Skills | Yes (`Skills.jsx:23`) | Yes (`Navbar.jsx:46`) |
| `show_certificates` | Certificates | Yes (`Certificates.jsx:10`) | Yes (`Navbar.jsx:48`) |
| `show_achievements` | Achievements | Yes (`Achievements.jsx:10`) | Yes (`Navbar.jsx:49`) |
| `show_publications` | Publications | Yes (`Research.jsx:12`) | Yes (`Navbar.jsx:50`) |
| `hero_greeting` | Hero prefix text | Yes (`Hero.jsx:44`) | N/A |
| `contact_note` | Contact footer note | Yes (`Contact.jsx:61`) | N/A |

**Verdict:** 100% of dashboard site settings are actively connected and respected on the public frontend.

---

## 18. Error Handling Audit

- **Database Errors:** All service calls in `portfolioService.js` throw structured errors caught by the UI views and displayed as Toast notifications.
- **Connection Failures:** `isSupabaseConfigured()` checks prevent client crashes if `.env` keys are missing.
- **Form Validation:** Input fields enforce `required` attributes and display inline error messages.
- **Sanitization:** Error messages shown in toasts display `err.message` without exposing internal database connection strings, passwords, or stack traces.

---

## 19. Build, Lint & Test Audit

- **Build Execution:** `npm run build`
  - **Result: PASS (0 errors)**
  - Transformed 2,253 modules in 1.75s.
  - Chunk size warning noted for bundle (typical for un-split admin + public SPA; can be optimized later with `React.lazy`).
- **Lint Execution:** `npm run lint` (`oxlint`)
  - **Result: PASS (0 errors, 48 warnings)**
  - Warnings are non-breaking: unused Lucide imports (`Code2`, `Image`, `Mail`, `Check`, `Calendar`) and synchronous state updates in `useEffect`.
- **Automated Tests:** No automated test runner (Jest/Vitest) is configured in `package.json`.

---

## 20. Git Readiness Audit

- **Git Status:** Clean (`On branch master, nothing to commit, working tree clean`).
- **`.env` Security:** Verified untracked and covered by `.gitignore`.
- **Git Commit History:**
  - Commit `55721a0`: Added Supabase integration and admin dashboard.
  - Checked diff: Only `.env.example` was committed. **`.env` has never been committed to Git.**
- **Verdict:**
  ### **SAFE TO PUSH TO GITHUB** (from a security/secret perspective)
  *Note: While safe to push without leaking secrets, you should apply the Vercel and RLS recommendations before deploying.*

---

## 21. Supabase ↔ GitHub Integration Question

**Question:** *Does this architecture require connecting the GitHub repository directly to Supabase?*

**Answer:** **NO. It is completely optional and not required.**

### Why:
Your architecture is completely decoupled:
1. **GitHub:** Stores your source code.
2. **Vercel:** Reads source code from GitHub and builds the frontend static files.
3. **Supabase:** Independent cloud backend providing PostgreSQL, Auth, and Storage APIs.

The frontend talks to Supabase directly over HTTPS using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Supabase's native GitHub integration is an optional tool for CI/CD database branching, which is unnecessary for a personal portfolio.

---

## 22. Vercel Deployment Readiness

### Current Blockers:
1. **Missing `vercel.json`:**
   - When deploying a React SPA with `react-router-dom` to Vercel, any direct request to `/admin` will result in a 404 error because Vercel looks for a static file at `/admin.html`.
   - Vercel requires a rewrite rule:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```
2. **`base: './'` in `vite.config.js`:**
   - Setting `base: './'` causes asset URLs to resolve relatively. On route `/admin`, the browser will request `/admin/assets/...` and 404.
   - For Vercel deployments, `base: '/'` should be used.

---

## 23. Documentation vs. Implementation Audit

Comparing `ADMIN_SETUP.md` against actual code:

| Documentation Claim | Code Reality | Discrepancy Description |
| :--- | :--- | :--- |
| "Storage Policies: Only you (signed in as admin) can upload, replace, or delete files." | Policies use `TO authenticated` | **Mismatch:** Any authenticated user can upload/delete, not just the admin. |
| "Database RLS: Authenticated users can modify." | Policies use `TO authenticated` | **Misleading:** Does not warn the user that public signups must be disabled to prevent unauthorized account creation. |
| "Password Reset: Follow link in email to set new password." | User lands on `/admin` logged in, but no new password input form exists. | **Mismatch:** Password recovery flow lacks an update password input form. |
| "Deploy to Vercel: Vercel auto-detects Vite — no configuration needed." | Direct `/admin` requests fail without `vercel.json`. | **Omission:** Fails to mention the need for SPA route rewrites on Vercel. |

---

## 24. Things You Still Need To Do Manually (Ordered Checklist)

Follow this sequence when you are ready to configure and deploy:

1. [ ] **Disable Public User Signups in Supabase:**
   - In Supabase Dashboard → **Authentication** → **Providers** → **Email**.
   - Turn **OFF** `"Allow new users to sign up"`. (This prevents anyone other than you from creating an account).
2. [ ] **Update RLS & Storage Policies:**
   - Restrict write policies to your designated admin email (`abhi713111@gmail.com`).
3. [ ] **Add `vercel.json` and adjust `vite.config.js`:**
   - Add Vercel SPA rewrite configuration and set `base: '/'`.
4. [ ] **Add Admin Email Check to `AdminRoute.jsx`:**
   - Ensure only your email address is permitted into `AdminLayout`.
5. [ ] **Execute `supabase/schema.sql`:**
   - Run in the Supabase SQL Editor to create tables, buckets, and seed data.
6. [ ] **Create Your Admin Account:**
   - In Supabase Dashboard → **Authentication** → **Users** → **Add User** (with Auto-Confirm enabled).
7. [ ] **Verify Local Setup:**
   - Add credentials to `.env` and test logging into `http://localhost:5173/admin`.
8. [ ] **Create GitHub Repository:**
   - Create a private or public repository on GitHub and push your code.
9. [ ] **Deploy to Vercel:**
   - Import repository in Vercel.
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables.
   - Deploy and verify both `/` and `/admin`.

---

## 25. Recommended Fixes (Do NOT implement yet — For Review)

### Fix 1: Restrict RLS to Specific Admin Email
- **Priority:** CRITICAL
- **Problem:** `TO authenticated USING (true)` allows any logged-in user to modify data.
- **Solution:** Change RLS write policies in `schema.sql` to check the user's email:
  ```sql
  CREATE POLICY "Admin write access" ON public.projects
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'abhi713111@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'abhi713111@gmail.com');
  ```
- **Files Involved:** `supabase/schema.sql`

---

### Fix 2: Add Authorization Check in `AdminRoute.jsx`
- **Priority:** CRITICAL
- **Problem:** Any logged-in user can view the admin UI.
- **Solution:** Verify `user.email` matches your authorized administrator email:
  ```jsx
  const ADMIN_EMAIL = 'abhi713111@gmail.com';
  if (!user || user.email !== ADMIN_EMAIL) {
    return <AdminLogin unauthorized={!!user} />;
  }
  ```
- **Files Involved:** `src/admin/AdminRoute.jsx`, `src/admin/AdminLogin.jsx`

---

### Fix 3: Add `vercel.json` for SPA Routing
- **Priority:** HIGH
- **Problem:** Direct visits to `/admin` on Vercel return 404.
- **Solution:** Create `vercel.json` in the root directory:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Files Involved:** `vercel.json`

---

### Fix 4: Set Standard Base URL in `vite.config.js`
- **Priority:** HIGH
- **Problem:** `base: './'` breaks asset loading on `/admin` on Vercel.
- **Solution:** Change `base: './'` to `base: '/'`:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    base: '/',
  })
  ```
- **Files Involved:** `vite.config.js`

---

### Fix 5: Make `schema.sql` Idempotent
- **Priority:** MEDIUM
- **Problem:** Re-running `schema.sql` crashes on existing policies and duplicates seed data.
- **Solution:** Add `DROP POLICY IF EXISTS ...` before creating policies, and add `ON CONFLICT DO NOTHING` to all seed `INSERT` statements.
- **Files Involved:** `supabase/schema.sql`

---

### Fix 6: Add "Update Password" View for Password Recovery
- **Priority:** MEDIUM
- **Problem:** Clicking a password reset email logs the user in but provides no UI to enter a new password.
- **Solution:** Listen for `PASSWORD_RECOVERY` event in `AuthContext` and display a "Set New Password" modal or view.
- **Files Involved:** `src/context/AuthContext.jsx`, `src/admin/AdminLogin.jsx`

---

## 26. Final Verdict

1. **Is Supabase integration correctly implemented?**  
   **YES.** The SDK integration, database services, storage services, dual-mode fallback, and UI bindings are implemented cleanly and function properly.

2. **Is `/admin` properly protected?**  
   **PARTIALLY.** It protects against anonymous visitors by requiring login, but lacks an authorization check to verify that the logged-in user is specifically *you*.

3. **Is database authorization secure?**  
   **NO (CRITICAL).** RLS currently grants write access to *any* authenticated account rather than restricting access to your specific admin email or UUID.

4. **Are Storage policies secure?**  
   **NO (CRITICAL).** Storage buckets allow any authenticated user to upload or delete files.

5. **Is existing portfolio data preserved?**  
   **YES.** All original data in `src/data/*.js` is completely preserved and serves as an automatic fallback whenever the database is unconfigured or unreachable.

6. **Is the project safe to push to GitHub?**  
   **YES.** No secrets, API keys, or `.env` files are tracked in Git.

7. **Is it ready for Vercel?**  
   **NOT YET.** It requires `vercel.json` and changing `base: './'` to `base: '/'` in `vite.config.js` so that direct navigation to `/admin` does not return a 404 error.

8. **What should you do NEXT?**  
   Share this `PORTFOLIO_AUDIT_REPORT.md` with ChatGPT or review the recommendations. When you are ready, apply the 4 key fixes (RLS email restriction, frontend admin email check, `vercel.json`, and `vite.config.js` base URL).
