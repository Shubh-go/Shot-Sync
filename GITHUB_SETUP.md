# Setting Up Your Private GitHub Repository

Your code is now ready to be pushed to GitHub! Follow these steps:

## Step 1: Create the Private Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `Shot-Sync` (or any name you like)
3. **Description:** "Basketball shot form analysis app with pose detection and email feedback"
4. **Visibility:** Select **"Private"** 🔒
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

## Step 2: Connect and Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd /Users/namrata/Desktop/MVP_Test
git remote add origin https://github.com/YOUR_USERNAME/Shot-Sync.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Share with Your Friend

Once pushed:

1. Go to your repository on GitHub
2. Click **"Settings"** (top right)
3. Click **"Collaborators"** (left sidebar)
4. Click **"Add people"**
5. Enter your friend's GitHub username or email
6. They'll receive an invitation to access the private repo

## ✅ Done!

Your friend will be able to:
- View all code
- Clone the repository
- See the commit history

**Important:** Make sure your friend knows they need to:
- Set up their own EmailJS credentials (if using GitHub Pages version)
- Set up their own email service credentials (if using Flask version)
- Install dependencies: `pip install -r requirements.txt`

---

**Alternative:** If you prefer to share via a shareable link instead of adding collaborators, you can use GitHub's "Share private repository" feature (limited access token).

