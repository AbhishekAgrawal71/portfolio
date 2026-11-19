# Deployment Report: Developer Portfolio & Admin Dashboard

**Deployment Status:** SUCCESS  
**Date:** November 19, 2026  
**Platform:** Vercel (Production)  

---

## 1. Summary & Core URLs

Your personal developer portfolio and private Supabase-backed admin dashboard have been published to GitHub and deployed live to Vercel production with continuous deployment enabled.

- **Live Production Website:** [https://portfolio-delta-blue-92.vercel.app](https://portfolio-delta-blue-92.vercel.app)
- **Live Admin Dashboard:** [https://portfolio-delta-blue-92.vercel.app/admin](https://portfolio-delta-blue-92.vercel.app/admin)
- **GitHub Repository:** [https://github.com/AbhishekAgrawal71/portfolio](https://github.com/AbhishekAgrawal71/portfolio)

---

## 2. GitHub Repository Details

| Property | Value |
|---|---|
| **Repository Name** | `portfolio` |
| **Owner** | `AbhishekAgrawal71` |
| **Visibility** | Public |
| **Default Branch** | `main` |
| **Repository URL** | [https://github.com/AbhishekAgrawal71/portfolio](https://github.com/AbhishekAgrawal71/portfolio) |
| **Security Audit** | Verified 0 secret keys, tokens, or `.env` files tracked |

---

## 3. Vercel Deployment Details

| Property | Value |
|---|---|
| **Vercel Project Name** | `portfolio` |
| **Vercel Scope / Account** | `abhi713111-1486` |
| **Deployment State** | `READY` (HTTP 200 OK) |
| **Live Production Domain** | [https://portfolio-delta-blue-92.vercel.app](https://portfolio-delta-blue-92.vercel.app) |
| **Vercel Deployment URL** | [https://portfolio-ntp2wcvgz-abhi713111-1486.vercel.app](https://portfolio-ntp2wcvgz-abhi713111-1486.vercel.app) |
| **SPA Rewrites** | Configured via [vercel.json](file:///e:/portfolio/vercel.json) (`/:match* -> /index.html`) |

---

## 4. Environment Variables Configuration

Both required environment variables have been securely injected into Vercel production, preview, and development environments via the Vercel CLI:

| Environment Variable | Status on Vercel | Exposed in Repo? | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Configured | **NO** (Kept in `.env` locally) | Supabase project endpoint |
| `VITE_SUPABASE_ANON_KEY` | Configured | **NO** (Kept in `.env` locally) | Public anonymous client key |

> **Note:** As per Supabase best practices, the service-role key is **never** bundled into the frontend or committed anywhere. All queries use the client anon key and are protected by PostgreSQL Row Level Security (RLS) policies.

---

## 5. Public Portfolio Verification

| Check | Result | Verification Notes |
|---|---|---|
| **Homepage Loads** | PASS | Root route returns `HTTP 200 OK` with production asset bundles |
| **Projects Display** | PASS | Dynamic database fetching with zero-delay static fallback |
| **Resume Download** | PASS | Active resume queried from `resumes` bucket / table with fallback |
| **Images & Assets** | PASS | Static assets bundled into `/assets/`, Supabase storage public URLs supported |
| **Responsive Design** | PASS | Tailwind CSS responsive breakpoints for mobile, tablet, and desktop |

---

## 6. Admin Dashboard Verification

| Check | Result | Verification Notes |
|---|---|---|
| **`/admin` Route Loads** | PASS | Returns `HTTP 200 OK` directly on deep link without 404 |
| **SPA Routing / Refresh** | PASS | `vercel.json` rewrites ensure sub-routes are handled by React Router |
| **Login Form Displays** | PASS | Unauthenticated users are presented with secure Supabase Auth login |
| **UUID Authorization** | PASS | `is_admin()` SQL security definer check validates Supabase `auth.uid()` against `admin_users` |

---

## 7. Supabase Production Configuration Required

To allow Supabase Auth (magic links, password resets, session redirects) to complete authentication seamlessly on your live domain, you must register your live Vercel domain in your Supabase dashboard:

### Step-by-Step Instructions:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left navigation, click on **Authentication** (the user icon).
3. Under the Authentication sub-menu, click **URL Configuration**.
4. In the **Site URL** field, set:
   ```
   https://portfolio-delta-blue-92.vercel.app
   ```
5. In the **Redirect URLs** list, click **Add URL** and add the following two URLs:
   - `https://portfolio-delta-blue-92.vercel.app/admin`
   - `https://portfolio-delta-blue-92.vercel.app/**`
   *(Keep `http://localhost:5173/**` in the list so local development continues working).*
6. Click **Save Changes**.

---

## 8. How Future Updates Work (Workflow Guide)

Your architecture separates **code updates** from **content management**:

```
                       ┌─────────────────────────┐
                       │   Local Code Edits      │
                       └────────────┬────────────┘
                                    │ git push origin main
                                    ▼
┌──────────────────┐   ┌─────────────────────────┐
│ Supabase DB/Auth │   │      GitHub Repo        │
└────────▲─────────┘   └────────────┬────────────┘
         │                          │ webhook auto-deploy
         │                          ▼
         │             ┌─────────────────────────┐
         │             │    Vercel Production    │
         │             └────────────┬────────────┘
         │                          │
         │ updates directly         │ serves frontend
         │                          ▼
┌────────┴─────────┐   ┌─────────────────────────┐
│ /admin Dashboard │◄──┤ Live Visitors / Recruiter│
└──────────────────┘   └─────────────────────────┘
```

1. **Content, Project, Image, and Resume Updates:**
   - Log in directly at [https://portfolio-delta-blue-92.vercel.app/admin](https://portfolio-delta-blue-92.vercel.app/admin).
   - Any project, certificate, skill, experience, or resume you add, edit, or delete updates Supabase in real-time.
   - **No git commit or redeployment required.** Visitors see your updates immediately.

2. **Frontend Code or Component Updates:**
   - Make code changes locally in your IDE.
   - Test locally using `npm run dev`.
   - Commit and push to GitHub:
     ```bash
     git add .
     git commit -m "feat: customize hero section"
     git push origin main
     ```
   - Vercel automatically detects the push, builds the project, and deploys the new version within seconds.

---

## 9. Security & Verification Audit

- [x] `.env` is listed in `.gitignore` and was **never** committed or tracked by Git.
- [x] Verified zero tracked API keys, service-role secrets, database passwords, or auth tokens.
- [x] Git history is clean and uses the standard `main` branch.
- [x] Row Level Security (RLS) is active across all 11 database tables with UUID authorization.
- [x] Public read access is enabled for portfolio display, while write access is strictly locked to verified admin UUIDs.
- [x] Storage buckets (`portfolio-images` and `resumes`) enforce admin-only upload/delete policies.

---

## 10. Verification Complete

**PORTFOLIO IS LIVE:**  
[https://portfolio-delta-blue-92.vercel.app](https://portfolio-delta-blue-92.vercel.app)
