# Portfolio Admin & Supabase Setup Guide

A complete, step-by-step guide to setting up your private **Supabase** backend for Abhishek Agrawal's developer portfolio. 

Once configured, you will have a private dashboard at `/admin` to add, edit, reorder, delete, and manage all projects, experiences, skills, certificates, resumes, and settings without touching code.

---

## Table of Contents

1. [How to Create the Supabase Project](#1-how-to-create-the-supabase-project)
2. [How to Configure Environment Variables](#2-how-to-configure-environment-variables)
3. [How to Create Your Admin Account](#3-how-to-create-your-admin-account)
4. [How to Run Database Migrations](#4-how-to-run-database-migrations)
5. [How to Configure Storage Buckets](#5-how-to-configure-storage-buckets)
6. [How to Run the Site Locally](#6-how-to-run-the-site-locally)
7. [How to Deploy It for Free](#7-how-to-deploy-it-for-free)
8. [How to Access /admin](#8-how-to-access-admin)
9. [How to Reset Your Admin Password](#9-how-to-reset-your-admin-password)
10. [How to Back Up Your Portfolio Data](#10-how-to-back-up-your-portfolio-data)

---

## 1. How to Create the Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (sign in with your GitHub account).
2. Click **"New Project"**.
3. Fill in the project details:
   - **Name**: `portfolio` (or any name you prefer)
   - **Database Password**: Choose a strong password and save it in a password manager.
   - **Region**: Choose the region closest to you (e.g. `South Asia (Mumbai)` or `East US`).
   - **Pricing Plan**: Free tier ($0/month).
4. Click **"Create new project"**. Wait 1–2 minutes for Supabase to provision your database.

---

## 2. How to Configure Environment Variables

1. In your Supabase dashboard, navigate to **Project Settings** (gear icon at the bottom of the left sidebar) → **API**.
2. Locate the following two values:
   - **Project URL** (looks like `https://abcdefghijkl.supabase.co`)
   - **Project API Keys** → `anon` `public` (a long string starting with `eyJ...`)
3. In your project directory (`e:\portfolio`), open or create the `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
4. **Important**: Never commit your `.env` file to Git. It is already included in `.gitignore`.

---

## 3. How to Create Your Admin Account

1. In your Supabase dashboard, click on **Authentication** (person icon in the left menu) → **Users**.
2. Click **"Add user"** → **"Create user"**.
3. Enter:
   - **User Email**: Your email (e.g. `abhi713111@gmail.com`)
   - **Password**: Create a secure password for your admin account.
   - Toggle **"Auto Confirm User?"** to **ON** (so you don't need to click a verification email).
4. Click **"Create user"**.
5. You can now use this email and password to log in at `/admin`.

---

## 4. How to Run Database Migrations

You have two easy ways to set up and populate all database tables:

### Method A: One-Click SQL Script (Recommended)

1. In your Supabase dashboard, go to the **SQL Editor** (terminal icon in left menu).
2. Click **"New query"**.
3. Open the file **`supabase/schema.sql`** from your project folder.
4. Copy its entire contents, paste it into the Supabase SQL Editor query window, and click **"Run"** (or press `Ctrl + Enter`).
5. This automatically:
   - Creates all 12 tables (`profile`, `projects`, `experience`, `education`, `skill_categories`, `skills`, `certificates`, `achievements`, `publications`, `social_links`, `site_settings`, `resumes`).
   - Configures strict **Row Level Security (RLS)** policies.
   - Sets up Storage buckets.
   - Pre-seeds all your existing projects, experience, skills, and education!

### Method B: Seed via Admin Dashboard
If you already ran the table creation or prefer doing it through the UI:
1. Log in to `/admin`.
2. On the **Overview / Dashboard** page, you will see a button: **"Seed Database from Static Data"**.
3. Click it. It will automatically upload your existing portfolio data directly into Supabase.

---

## 5. How to Configure Storage Buckets

If you ran `supabase/schema.sql`, your 4 storage buckets are already configured. To verify:

1. In your Supabase dashboard, click **Storage** (bucket icon in the left sidebar).
2. Ensure you have the following 4 public buckets:
   - `profile-images` (Public)
   - `project-images` (Public)
   - `certificates` (Public)
   - `resumes` (Public)
3. If any bucket is missing, click **"New bucket"**, name it exactly as listed above, and check the box **"Public bucket"**.

### Storage Policies (RLS)
The SQL schema automatically configures storage security:
- **Public**: Anyone visiting your portfolio can view/download images, PDFs, and your resume.
- **Authenticated Only**: Only you (signed in as admin) can upload, replace, or delete files.

---

## 6. How to Run the Site Locally

1. Open your terminal in `e:\portfolio`:
   ```bash
   # Install dependencies (if not already done)
   npm install

   # Start local dev server
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.
   - The public portfolio will load smoothly.
   - If Supabase is connected, it fetches live data.
   - If Supabase is not connected yet, it seamlessly falls back to static files.

---

## 7. How to Deploy It for Free

### Deploying to Vercel (Recommended)

1. Push your portfolio code to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase admin dashboard"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"** → select your GitHub repository.
3. In the project configuration, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **"Deploy"**.
5. Vercel automatically deploys your site with SSL and free global CDN.

---

## 8. How to Access /admin

- **URL**: Navigate to `https://your-domain.com/admin` (or `http://localhost:5173/admin` locally).
- **Privacy**: The admin link is completely private and is **not** linked anywhere on the public portfolio.
- **Login**: Enter the admin email and password you created in Step 3.
- **Dashboard Features**:
  - **Overview**: Real-time stats and quick action shortcuts.
  - **Profile**: Edit bio, name, title, and upload new profile photo.
  - **Projects**: Create, edit, duplicate, delete, reorder, toggle featured, and upload screenshots.
  - **Experience**: Add and edit internships, bullet responsibilities, and dates.
  - **Education**: Update degree status, CGPA, and coursework.
  - **Skills**: Create categories with custom icons; add/remove skill badges dynamically.
  - **Certificates**: Upload certificate images or PDFs, set credential URLs.
  - **Achievements**: Manage leadership roles and committee positions.
  - **Publications**: Add research papers and links (automatically shows/hides section).
  - **Resume**: Upload new PDF resume with automatic replacement and preview.
  - **Social Links**: Toggle visibility and URLs for GitHub, LinkedIn, InsiderOne, etc.
  - **Site Settings**: Toggle whole sections on or off with a switch.

---

## 9. How to Reset Your Admin Password

### Option A: From the Login Page
1. Go to `/admin`.
2. Click **"Forgot password?"**.
3. Enter your admin email and click **"Send Reset Link"**.
4. Check your inbox for the reset email from Supabase and follow the link to set a new password.

### Option B: Directly from Supabase Dashboard
1. Go to your Supabase dashboard → **Authentication** → **Users**.
2. Click the three dots `...` next to your admin user.
3. Select **"Send password recovery"** or click **"Edit user"** to manually update the password.

---

## 10. How to Back Up Your Portfolio Data

### Backup Method A: Supabase Automated Backups
Supabase automatically takes daily backups of your PostgreSQL database (available under **Project Settings** → **Database** → **Backups**).

### Backup Method B: Export Data via SQL
To take an instant manual backup of all your content:
1. In Supabase, go to **SQL Editor**.
2. Run:
   ```sql
   -- View and copy all projects as JSON
   SELECT json_agg(p) FROM public.projects p;
   ```
3. Or export individual tables as CSV:
   - Go to **Table Editor** (spreadsheet icon in left sidebar).
   - Select any table (e.g. `projects`, `experience`).
   - Click **"Export"** → **"Export to CSV"**.
