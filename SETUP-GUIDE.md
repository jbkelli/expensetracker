# Fresh Supabase Setup Guide

## Step 1: Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name (e.g., "expense-tracker-fresh")
4. Set a strong database password
5. Choose a region close to you
6. Click "Create Project"
7. Wait for it to finish setting up (~2 minutes)

## Step 2: Configure Authentication
1. In your Supabase project, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. **IMPORTANT**: Turn OFF "Confirm email" (so users can sign in immediately)
4. Click **Save**

## Step 3: Set Up Database
1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `database-setup.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned" messages

## Step 4: Get Your Credentials
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (starts with https://...supabase.co)
   - **anon/public key** (long JWT token)

## Step 5: Update Local Environment
1. Open your `.env` file
2. Replace with your NEW credentials:
   ```
   VITE_SUPABASE_URL=your-new-project-url
   VITE_SUPABASE_ANON_KEY=your-new-anon-key
   ```

## Step 6: Update Vercel Environment Variables
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Delete old `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Add new ones with values from Step 4
4. Make sure to add to: Production, Preview, Development
5. Go to Deployments → Click ••• → Redeploy

## Step 7: Test Locally
1. Restart your dev server: `npm run dev`
2. Go to http://localhost:5173/signup
3. Create a test account
4. You should be able to sign in immediately!

## Step 8: Test Deployed
1. Wait for Vercel deployment to complete
2. Go to your deployed URL
3. Sign up and sign in
4. Should work perfectly!

## Troubleshooting
- If login fails, check browser console for errors
- Make sure email confirmation is OFF in Supabase
- Verify environment variables are set correctly in both .env and Vercel
- Check that database-setup.sql ran successfully (no errors)
