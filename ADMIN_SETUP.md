# Portfolio Admin & Supabase Setup Guide

A complete, production-ready guide to configuring your private **Supabase** backend for Abhishek Agrawal's developer portfolio.

Once configured, you have a private dashboard at `/admin` to add, edit, reorder, delete, and manage all projects, experiences, skills, certificates, resumes, and site settings without touching source code.

---

## Architecture Overview

```
Public Portfolio (Visitors)                  Private Dashboard (/admin)
          │                                              │
          ▼                                              ▼
   [Public Reads]                             [Admin Authorization Check]
          │                                  (auth.uid() in public.admin_users)
          │                                              │
          └──────────────────────┬───────────────────────┘
                                 ▼
                     Supabase Cloud Backend
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   PostgreSQL DB           Authentication             Storage
(RLS: is_admin() writes)  (JWT session tokens)  (Bucket limits + RLS)
```

### Security & Defense-in-Depth Model:
1. **Database RLS Boundary**: Every table enforces Row Level Security. Write permissions (`INSERT`, `UPDATE`, `DELETE`) require `public.is_admin() = true`.
2. **UUID-Based Authorization**: A dedicated `public.admin_users` table stores authorized Supabase User UUIDs. No reliance on insecure client-side claims or hardcoded emails.
3. **Storage Policies**: Storage buckets (`profile-images`, `project-images`, `certificates`, `resumes`) allow public file viewing, but require `public.is_admin()` for uploading, updating, or deleting files. Bucket-level MIME type and file size limits are enforced on the server.
4. **Protected Route Guard**: Visiting `/admin` checks both session authentication and `public.admin_users` registration. Non-admin users are strictly blocked with an Unauthorized message.
5. **Static Fallback**: If Supabase credentials are missing or the database is unavailable, the public portfolio seamlessly falls back to local static files in `src/data/*.js`.

---

## Recommended Step-by-Step Setup Order

Follow these steps in exact order to configure your portfolio backend:

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (sign in with GitHub).
2. Click **"New Project"**.
3. Fill in the details:
   - **Name**: `portfolio`
   - **Database Password**: Choose a strong password and save it in a password manager.
   - **Region**: Choose a region close to your primary audience (e.g. `South Asia (Mumbai)` or `East US`).
   - **Pricing Plan**: Free tier ($0/month).
4. Click **"Create new project"** and wait ~2 minutes for provisioning.

---

### Step 2: Configure Local `.env`
1. In your Supabase dashboard, navigate to **Project Settings** (gear icon) → **API**.
2. Locate:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Project API Keys** → `anon` `public` (`eyJ...`)
3. In your local project root (`e:\portfolio`), create or edit `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
4. **Security Notice**: Never commit `.env` to Git. It is listed in `.gitignore`. The client browser ONLY uses the safe `anon` key. Never provide your `service_role` key to the frontend.

---

### Step 3: Run Database Schema / Production Patch
- **For an Existing Database** (already ran schema.sql previously):
  1. In your Supabase dashboard, click **SQL Editor** → **New query**.
  2. Open `supabase/production_fix_patch.sql`, copy its entire contents, paste and click **Run**.
  3. This immediately grants required PostgreSQL table permissions to `anon` and `authenticated`, adds the single-active-resume trigger, updates skills visibility RLS, and maintains 100% of your existing data.

- **For a Fresh Database** (first time setup):
  1. In the Supabase dashboard, click **SQL Editor** → **New query**.
  2. Open `supabase/schema.sql`, copy its entire contents, paste and click **Run**.
  3. This creates all 13 tables, sets up table grants, RLS write policies, storage buckets, and seeds your initial portfolio data.

---

### Step 4: Create Supabase Auth User
1. In the Supabase dashboard, click **Authentication** (users icon in left menu) → **Users**.
2. Click **"Add user"** → **"Create user"**.
3. Enter:
   - **User Email**: Your admin email (e.g. `abhi713111@gmail.com`)
   - **Password**: Choose a strong administrator password.
   - **Auto Confirm User?**: Toggle **ON** (so email verification is not required).
4. Click **"Create user"**.

---

### Step 5: Copy User UUID
1. In the **Authentication** → **Users** table, find your newly created user row.
2. Under the **User UID** column, copy the UUID string (it looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

---

### Step 6: Bootstrap Admin Privileges via SQL Editor
Because admin RLS policies are active, you must run a one-time SQL command to register your UUID in `public.admin_users`:

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Run the following command (replace the placeholder with your actual copied UUID):
   ```sql
   INSERT INTO public.admin_users (user_id)
   VALUES ('00000000-0000-0000-0000-000000000000'); -- Replace with your actual user UID
   ```
3. Click **"Run"**. Your account is now fully authorized as the portfolio administrator!

---

### Step 7: Defense-in-Depth: Disable Public Email Signup (Recommended)
Because this is your personal portfolio, external visitors do not need to register accounts.
1. In the Supabase dashboard, go to **Authentication** → **Sign In / Up** (or **Providers** → **Email**).
2. Toggle OFF **"Allow new users to sign up"**.
3. Click **Save**.
> **Note**: Even if public signup remains enabled, unauthorized users who sign up will have zero write permissions in the database and storage, and will be blocked by `/admin` with an Unauthorized message.

---

### Step 8: Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Verify the public portfolio loads live data from Supabase.

---

### Step 9: Login at `/admin`
1. Navigate to [http://localhost:5173/admin](http://localhost:5173/admin).
2. Enter your admin email and password created in Step 4.
3. Click **"Sign In to Dashboard"**.
4. The dashboard overview will load with a green **"Supabase Live DB"** badge.

---

### Step 10: Test Dashboard CRUD & File Uploads
1. Go to **Projects** → click **"New Project"**, fill in test details, and click **"Save Project"**.
2. Verify the project appears in the list and reflects on the public site at [http://localhost:5173](http://localhost:5173).
3. Test editing, reordering, visibility toggling, and deleting the test project.
4. Test uploading a profile picture in **Profile** (max 5 MB; JPG, PNG, WEBP).

---

### Step 11: Create GitHub Repository
1. Go to [https://github.com/new](https://github.com/new) and create a repository (e.g. `portfolio`).
2. Keep it public or private according to your preference.

---

### Step 12: Push Source Code
In your project terminal (`e:\portfolio`):
```bash
git add .
git commit -m "Production release: Supabase admin authorization, RLS security, SPA routing, upload validation"
git branch -M main
git remote add origin https://github.com/AbhishekAgrawal71/portfolio.git
git push -u origin main
```
*(Verify `.env` is NOT committed; `git status` will confirm `.env` is ignored).*

---

### Step 13: Import Repository into Vercel
1. Log in to [https://vercel.com](https://vercel.com) (sign in with your GitHub account).
2. Click **"Add New Project"** and select your `portfolio` repository.
3. Framework Preset will automatically detect **Vite**. Root directory should be `./`.

---

### Step 14: Add Environment Variables in Vercel
Before clicking Deploy, expand the **Environment Variables** section and add:
- `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-anon-key`

---

### Step 15: Deploy
Click **"Deploy"**. Vercel will build the project using `vercel.json` rewrites and `vite.config.js` (`base: '/'`).
In ~1 minute, your site is live with a free SSL domain (e.g., `https://abhishek-portfolio.vercel.app`).

---

### Step 16: Test Production `/admin`
1. Visit `https://your-domain.vercel.app/admin`.
2. Directly refresh the page (verifies `vercel.json` SPA rewrite works).
3. Log in with your admin credentials.
4. Verify you can manage your portfolio in production.

---

## File Upload Constraints

Client-side and server-side rules are strictly enforced:

| Bucket | Max File Size | Allowed MIME Types | Allowed Extensions |
| :--- | :--- | :--- | :--- |
| `profile-images` | 5 MB | `image/jpeg`, `image/png`, `image/webp` | `.jpg`, `.jpeg`, `.png`, `.webp` |
| `project-images` | 5 MB | `image/jpeg`, `image/png`, `image/webp` | `.jpg`, `.jpeg`, `.png`, `.webp` |
| `certificates` | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` |
| `resumes` | 10 MB | `application/pdf` | `.pdf` |

---

## Password Recovery Flow

1. On the `/admin` login screen, click **"Forgot password?"**.
2. Enter your admin email and click **"Send Reset Link"**.
3. Check your inbox and click the reset link in the email from Supabase.
4. The link redirects to your `/admin` route with a recovery hash token.
5. The application detects the recovery session and displays the **"Set New Password"** interface.
6. Enter a new password (minimum 8 characters), confirm it, and submit.
7. Your password is automatically updated via `supabase.auth.updateUser()`.

---

## Supabase Auth URL Configuration

To ensure password reset links and authentication callbacks redirect properly:
1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**.
2. Set **Site URL**:
   - For local development: `http://localhost:5173`
   - After Vercel deployment: `https://your-portfolio-domain.vercel.app`
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/admin`
   - `http://localhost:5173/**`
   - `https://your-portfolio-domain.vercel.app/admin` (add after deploying)
   - `https://your-portfolio-domain.vercel.app/**`
4. Click **Save**.
