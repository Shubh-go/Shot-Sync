# Deploy to GitHub Pages (Shareable Website)

This is a **100% client-side** application that runs entirely in the browser. No server needed! Perfect for GitHub Pages.

## Quick Deploy to GitHub Pages

### Option 1: Simple GitHub Pages (Easiest)

1. **Create a GitHub repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `basketball-shot-analyzer`

2. **Upload your files**
   - Upload these files to your repository:
     - `index.html`
     - `style.css`
     - `app.js`

3. **Enable GitHub Pages**
   - Go to your repository Settings
   - Scroll to "Pages" section
   - Under "Source", select the branch (usually `main` or `master`)
   - Click Save
   - Your site will be live at: `https://yourusername.github.io/repository-name/`

4. **Share the link!** 🎉
   - Anyone can access it from anywhere
   - No installation needed
   - Works on any device with a camera

### Option 2: Using GitHub Desktop

1. Install [GitHub Desktop](https://desktop.github.com/)
2. Clone your repository
3. Copy `index.html`, `style.css`, and `app.js` to the repository folder
4. Commit and push
5. Enable GitHub Pages in Settings

### Option 3: Using Command Line

```bash
# Initialize git repository
git init
git add index.html style.css app.js
git commit -m "Initial commit - Basketball Shot Analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then enable GitHub Pages in repository Settings → Pages.

## Files Needed for GitHub Pages

Make sure these files are in your repository root:
- ✅ `index.html` - Main HTML file
- ✅ `style.css` - Styling
- ✅ `app.js` - Application logic

## How It Works

- **No backend required** - Everything runs in the browser
- **MediaPipe.js** - Pose detection runs client-side
- **Chart.js** - Charts loaded from CDN
- **100% Free** - GitHub Pages is free for public repositories

## Alternative Hosting Options

If you don't want to use GitHub Pages, you can also host on:

- **Netlify** - Drag and drop your files, instant deploy
- **Vercel** - Connect GitHub repo, auto-deploy
- **Firebase Hosting** - Free tier available
- **Surge.sh** - Simple static hosting

All of these work the same way - just upload the 3 files!

## Testing Locally Before Deploying

You can test it locally first:

```bash
# Using Python (if installed)
python3 -m http.server 8000

# Or using Node.js
npx serve

# Then open http://localhost:8000 in your browser
```

## Troubleshooting

**Camera not working?**
- Make sure you're using HTTPS (GitHub Pages provides this automatically)
- Browsers require HTTPS for camera access

**Pose detection not working?**
- Check browser console for errors
- Make sure you have internet connection (MediaPipe loads from CDN)

**Page not loading?**
- Check that all 3 files are in the repository root
- Make sure GitHub Pages is enabled in Settings

## Custom Domain (Optional)

You can add a custom domain in GitHub Pages settings if you own one!

