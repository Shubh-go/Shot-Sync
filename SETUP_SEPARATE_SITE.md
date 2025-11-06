# Setting Up a Separate Website for Basketball Shot Analyzer

This guide will help you create a completely separate GitHub Pages site for your basketball shot analyzer.

## Step-by-Step Instructions

### Step 1: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com) and click the **+** icon → **New repository**
2. Name it something like:
   - `basketball-shot-analyzer`
   - `shot-form-analyzer`
   - `basketball-form-coach`
   - (Any name you prefer!)
3. Make it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README, .gitignore, or license (we'll add files manually)
5. Click **Create repository**

### Step 2: Upload Files to Your New Repository

You have three options:

#### Option A: Using GitHub Web Interface (Easiest)

1. Go to your new repository
2. Click **"uploading an existing file"**
3. Drag and drop these 3 files:
   - `index.html`
   - `style.css`
   - `app.js`
4. Click **Commit changes**

#### Option B: Using GitHub Desktop

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Clone your new repository
3. Copy the 3 files into the repository folder
4. Commit and push

#### Option C: Using Command Line

```bash
# Navigate to your project folder
cd /Users/namrata/Desktop/MVP_Test

# Initialize git (if not already)
git init

# Add files
git add index.html style.css app.js

# Commit
git commit -m "Initial commit - Basketball Shot Analyzer"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right of repository)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**

### Step 4: Access Your Website

Your site will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

For example:
- If your username is `shubh-go` and repo is `basketball-shot-analyzer`
- URL: `https://shubh-go.github.io/basketball-shot-analyzer/`

## Files Needed

Make sure these 3 files are in your repository root:

```
your-repo-name/
├── index.html    ← Main HTML file
├── style.css    ← Styling
└── app.js       ← JavaScript application
```

## Custom Domain (Optional)

If you own a domain (like `yourname.com`), you can:
1. Add a `CNAME` file to your repository with your domain
2. Update DNS settings at your domain provider
3. GitHub Pages will serve your site at your custom domain

## Repository Name Suggestions

- `basketball-shot-analyzer`
- `shot-form-analyzer`
- `basketball-form-coach`
- `hoop-form-analysis`
- `shot-mechanics-analyzer`

## Quick Checklist

- [ ] Created new GitHub repository
- [ ] Uploaded `index.html`, `style.css`, `app.js`
- [ ] Enabled GitHub Pages in Settings
- [ ] Website is live and accessible
- [ ] Tested the camera and pose detection

## Troubleshooting

**Site not loading?**
- Wait a few minutes after enabling Pages (takes 1-2 minutes)
- Check that files are in repository root, not in a subfolder
- Verify GitHub Pages is enabled in Settings

**Camera not working?**
- Make sure you're accessing via HTTPS (GitHub Pages provides this)
- Check browser console for errors
- Allow camera permissions when prompted

**404 Error?**
- Make sure `index.html` is in the root folder
- Check repository name matches URL path

## Next Steps

Once your site is live, you can:
- Share the link with anyone
- Add a custom README.md to your repository
- Customize the styling
- Add more features

Your site will automatically update whenever you push changes to the repository!

