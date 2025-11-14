# 🚀 Quick Start - GitHub Gist Badge

## Step by Step - Configuration

### 1️⃣ Generate Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name: `PROFILE_VIEWS_BADGE`
4. Select permissions:
   - ✅ `repo` - full access to repositories
   - ✅ `gist` - create and manage gists
5. Click **"Generate token"** and **COPY THE TOKEN** (you won't be able to see it again!)

### 2️⃣ Add token to GitHub Secrets

1. In this repository go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `GH_TOKEN`
4. Value: paste the copied token
5. Click **"Add secret"**

### 3️⃣ First workflow run

1. Go to the **Actions** tab
2. Select the **"Update Profile Views Badge"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for completion (about 10-30 seconds)

### 4️⃣ Find GIST_ID in logs

1. Click on the completed workflow
2. Click on the **"update-badge"** job
3. Expand the **"Generate and upload badge to Gist"** section
4. Find the line:
   ```
   🔑 IMPORTANT! Save this GIST_ID as a secret in GitHub Actions:
      GIST_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. **COPY this GIST_ID**

### 5️⃣ Add GIST_ID to Secrets

1. Go back to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `GIST_ID`
4. Value: paste the copied GIST_ID
5. Click **"Add secret"**

### 6️⃣ Run workflow again

1. Go again to **Actions** → **"Update Profile Views Badge"**
2. Click **"Run workflow"** → **"Run workflow"**
3. After completion, check the logs, you'll find:
   ```
   🔗 Your stable badge URL is ready!
      Use this URL in your README.md or on your profile:
      https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/badge.svg?cache_bust=TIMESTAMP
      (This URL is permanent and always points to the latest version of the badge)
   ```
4. **COPY this URL** (the one with `cache_bust` parameter prevents caching issues)

### 7️⃣ Add badge to your profile

1. Go to your profile repository (`username/username`)
2. Edit `README.md`
3. Add:
   ```markdown
   ![Profile Views](https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/badge.svg)
   ```
4. Commit and done! 🎉

## ✅ Verification

- [ ] Token `GH_TOKEN` added to Secrets
- [ ] Workflow run for the first time
- [ ] `GIST_ID` copied from logs
- [ ] `GIST_ID` added to Secrets
- [ ] Workflow run for the second time
- [ ] Badge URL copied from logs
- [ ] Badge added to profile README
- [ ] Badge displays correctly

## 🔧 Troubleshooting

### ❌ "Bad credentials" in logs
- Check if the token has `repo` and `gist` permissions
- Generate a new token if it expired

### ❌ No GIST_ID in logs
- Check if `GH_TOKEN` is correctly set
- Check if the workflow completed successfully (green checkmark)

### ❌ Badge not displaying
- Check if the URL is correct
- Check if the Gist was created at https://gist.github.com/

## 📝 Notes

- The badge will be updated automatically every hour
- The Gist is private, but `badge.svg` is accessible via raw URL
- You don't need to do anything else - everything works automatically!
- You can delete `badge.svg` and `views-count.json` files from the local repository (they are in `.gitignore`)
- The badge fetches real-time data from visitor-badge API (`visitor-badge.laobi.icu`)
- Cache-busting parameter in URL ensures badge always displays the latest version

## 🧪 Testing Locally

You can test the badge locally before deploying:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables:
   ```bash
   set GH_TOKEN=your_token_here
   set GIST_ID=your_gist_id (optional)
   ```
4. Run in preview mode:
   ```bash
   node generate-badge.js --preview=12345
   ```

This will:
- Generate a badge with 12345 views
- Save it locally as `badge.svg`
- Open it in your browser (Windows)
- Skip Gist update (unless `GIST_ID` is set)

## 🎯 What's next?

After configuration:
- Workflow will run automatically every hour
- Badge will update in your profile
- All data is safely in the private Gist
- No more commits in this repository (clean!)