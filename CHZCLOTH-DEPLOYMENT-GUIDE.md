# CHZCLOTH v2 - Complete Deployment Guide
## For Non-Developers: Step-by-Step Instructions

**Time estimate:** 2-3 hours for initial setup

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Set Up Supabase (Database)](#step-1-set-up-supabase-database)
4. [Step 2: Apply Database Schema](#step-2-apply-database-schema)
5. [Step 3: Set Up Vercel (Hosting)](#step-3-set-up-vercel-hosting)
6. [Step 4: Connect Domain (Optional)](#step-4-connect-domain-optional)
7. [Step 5: Configure Email (Magic Links)](#step-5-configure-email-magic-links)
8. [Step 6: Test Everything](#step-6-test-everything)
9. [Going Live Checklist](#going-live-checklist)
10. [Troubleshooting](#troubleshooting)

---

## 1. Overview & Architecture

CHZCLOTH uses three services:

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              VERCEL (Hosting)                        │   │
│  │  • Hosts the React app                               │   │
│  │  • Handles HTTPS                                     │   │
│  │  • Free tier: plenty for launch                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SUPABASE (Backend)                      │   │
│  │  • PostgreSQL database                               │   │
│  │  • User authentication (magic links)                 │   │
│  │  • API (auto-generated from tables)                  │   │
│  │  • Free tier: 500MB DB, 50K monthly users           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ANTHROPIC API (AI Features)                  │   │
│  │  • Powers the Bet Analyzer                           │   │
│  │  • Pay-per-use (~$0.003 per analysis)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**What you'll need:**
- Email address
- Credit card (for Anthropic API, ~$5/month initially)
- GitHub account (free)
- 2-3 hours of focused time

---

## 2. Prerequisites

### Create These Accounts First

| Service | URL | Cost |
|---------|-----|------|
| GitHub | https://github.com/signup | Free |
| Supabase | https://supabase.com | Free tier |
| Vercel | https://vercel.com | Free tier |
| Anthropic | https://console.anthropic.com | Pay-per-use |

### Download the Code

1. Download the `chzcloth-v2.zip` file I provided
2. Unzip it to a folder on your computer
3. You should see this structure:
```
chzcloth-v2/
├── src/
├── supabase/
├── public/
├── package.json
├── index.html
└── ...
```

---

## Step 1: Set Up Supabase (Database)

### 1.1 Create a Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (easiest)

### 1.2 Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name:** `chzcloth` (or whatever you want)
   - **Database Password:** Generate a strong one and **SAVE IT SOMEWHERE SAFE**
   - **Region:** Choose closest to your users (e.g., "East US" for US users)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### 1.3 Get Your API Credentials
1. In your Supabase dashboard, click "Settings" (gear icon) → "API"
2. You'll see two important values. Copy them somewhere safe:

```
Project URL:        https://xxxxxxxxxxxxx.supabase.co
anon (public) key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

**⚠️ IMPORTANT:** The "anon key" is safe to use in frontend code. Never share the "service_role key" publicly.

---

## Step 2: Apply Database Schema

### 2.1 Open the SQL Editor
1. In Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"

### 2.2 Run the Base Schema
1. Open the file `supabase/schema.sql` from your downloaded code
2. Copy the ENTIRE contents
3. Paste into the SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" — this is correct!

### 2.3 Run the V2 Migration
1. Click "New query" again
2. Open the file `supabase/migration-v2.sql` from your downloaded code
3. Copy the ENTIRE contents
4. Paste into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

### 2.4 Verify Tables Were Created
1. Click "Table Editor" in the left sidebar
2. You should see these tables:
   - `profiles`
   - `bets`
   - `outcomes`
   - `organizations`
   - `user_organizations`

If you see all 5 tables, the database is set up correctly! 🎉

---

## Step 3: Set Up Vercel (Hosting)

### 3.1 Upload Code to GitHub
First, we need to put your code on GitHub so Vercel can access it.

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `chzcloth`
   - **Description:** (optional)
   - **Visibility:** Private (recommended)
3. Click "Create repository"
4. You'll see instructions — follow the "upload an existing file" option:
   - Click "uploading an existing file"
   - Drag all the files from your `chzcloth-v2` folder into the browser
   - Click "Commit changes"

**Alternative (if you have Git installed):**
```bash
cd chzcloth-v2
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/chzcloth.git
git push -u origin main
```

### 3.2 Connect Vercel to GitHub
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Find and select your `chzcloth` repository
5. Click "Import"

### 3.3 Configure Environment Variables
Before deploying, you need to add your Supabase credentials.

1. In the Vercel import screen, expand "Environment Variables"
2. Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` (your Project URL) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (your anon key) |

3. Click "Deploy"
4. Wait 1-2 minutes for the build to complete

### 3.4 Get Your Live URL
Once deployed, Vercel will give you a URL like:
```
https://chzcloth-abc123.vercel.app
```

This is your live site! But we need to do a few more steps before it works properly.

---

## Step 4: Connect Domain (Optional)

If you have a domain (like `chzcloth.com`):

1. In Vercel dashboard, click your project
2. Go to "Settings" → "Domains"
3. Click "Add"
4. Enter your domain
5. Follow the instructions to add DNS records at your domain registrar

If you don't have a domain yet, the `.vercel.app` URL works fine for testing.

---

## Step 5: Configure Email (Magic Links)

For users to sign in, Supabase needs to send magic link emails.

### 5.1 Configure Redirect URL
1. Go to Supabase dashboard → "Authentication" → "URL Configuration"
2. Under "Site URL", enter your Vercel URL:
   ```
   https://chzcloth-abc123.vercel.app
   ```
   (Replace with your actual Vercel URL)
3. Under "Redirect URLs", add:
   ```
   https://chzcloth-abc123.vercel.app/**
   ```
4. Click "Save"

### 5.2 Customize Email Template (Optional)
1. Go to "Authentication" → "Email Templates"
2. Click "Magic Link"
3. You can customize the email that users receive:

**Suggested template:**
```
Subject: Your CHZCLOTH sign-in link

Hi there,

Click the link below to sign in to CHZCLOTH:

{{ .ConfirmationURL }}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.

— The CHZCLOTH Team
```

### 5.3 Test Email Sending
1. Go to your live Vercel URL
2. Try signing in with your email
3. Check your inbox (and spam folder)
4. You should receive a magic link email

**If emails aren't arriving:**
- Check spam folder
- In Supabase, go to "Authentication" → "Users" to see if the user was created
- Free tier uses Supabase's email service which has rate limits

---

## Step 6: Test Everything

### 6.1 Test User Flow
1. Go to your Vercel URL
2. Click "Sign in"
3. Enter your email
4. Check email, click magic link
5. Complete the organization setup
6. Submit a test bet
7. Go to dashboard

### 6.2 Test Checklist

| Feature | How to Test | Expected Result |
|---------|------------|-----------------|
| Sign in | Enter email | Receive magic link email |
| Auth | Click magic link | Redirected to app, logged in |
| Org setup | Complete 4 steps | Organization created |
| Create bet | Submit a bet | Bet appears in dashboard |
| Context check | Create growth bet (if in efficiency mode) | See guidance modal |
| Record outcome | Click "Record Outcome" | Outcome saved |
| PM Value Index | After 5 bets + 3 outcomes | Index unlocks |

### 6.3 Verify Data in Supabase
1. Go to Supabase → "Table Editor"
2. Click on `profiles` — you should see your user
3. Click on `organizations` — you should see your company
4. Click on `bets` — you should see your test bet

---

## Going Live Checklist

Before sharing with real users:

### Security
- [ ] Supabase Row Level Security is enabled (done by default in schema)
- [ ] Only using `anon` key in frontend (never `service_role`)
- [ ] Site URL configured correctly in Supabase

### Functionality
- [ ] Sign-in emails arriving
- [ ] Magic links redirecting correctly
- [ ] Bets saving to database
- [ ] Outcomes recording properly
- [ ] Dashboard showing correct stats

### Polish
- [ ] Custom domain connected (optional)
- [ ] Email templates customized
- [ ] Tested on mobile device

### Monitoring
- [ ] Supabase dashboard bookmarked (to check user signups, errors)
- [ ] Vercel dashboard bookmarked (to check deployments, errors)

---

## Troubleshooting

### "Invalid API key" error
- Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Make sure there are no extra spaces
- Redeploy after changing env vars

### Magic link not working
- Check that Site URL in Supabase matches your Vercel URL exactly
- Make sure Redirect URLs includes your domain with `/**`
- Check browser console for errors (Right-click → Inspect → Console)

### "User already registered" error
- This is normal if you try to sign up with the same email twice
- Supabase will just send another magic link

### Tables not showing data
- Check that RLS policies were applied (they're in the schema)
- Verify you're logged in when querying
- Check the browser console for errors

### Build failing on Vercel
- Check that all files were uploaded to GitHub
- Look at the build logs in Vercel for specific errors
- Make sure `package.json` is in the root of the repo

---

## Next Steps After Launch

### Week 1: Soft Launch
- Test with 3-5 friendly users
- Collect feedback
- Fix any bugs that emerge

### Week 2-4: Iterate
- Improve based on feedback
- Add any missing features
- Monitor for errors in Supabase logs

### Month 2+: Growth
- Set up a custom domain
- Consider upgrading Supabase if approaching limits
- Add the Anthropic API for AI features (separate guide needed)

---

## Support & Updates

When you need to make changes:

### Updating the Code
1. Make changes to your local files
2. Upload to GitHub (drag and drop, or `git push`)
3. Vercel auto-deploys within 1-2 minutes

### Updating the Database
1. Go to Supabase → SQL Editor
2. Write and run your SQL changes
3. No deployment needed — changes are instant

### Checking Logs
- **Vercel:** Dashboard → Your project → "Deployments" → Click a deployment → "Functions" tab
- **Supabase:** Dashboard → "Logs" (shows auth events, API calls, errors)

---

## Quick Reference

### Your Key URLs
| Service | URL |
|---------|-----|
| Live site | `https://YOUR-PROJECT.vercel.app` |
| Supabase dashboard | `https://supabase.com/dashboard/project/YOUR-PROJECT-ID` |
| Vercel dashboard | `https://vercel.com/YOUR-USERNAME/chzcloth` |
| GitHub repo | `https://github.com/YOUR-USERNAME/chzcloth` |

### Environment Variables
| Variable | Where it goes | What it is |
|----------|--------------|------------|
| `VITE_SUPABASE_URL` | Vercel | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel | Your Supabase anon key |

---

**You've got this!** Follow the steps in order, and you'll have CHZCLOTH live on the internet. When you hit a snag, come back and we'll work through it together.
