# Adding Basketball Shot Analyzer to Shot-Sync Repository

Since you already have the [Shot-Sync repository](https://github.com/Shubh-go/Shot-Sync), here's how to add the web version.

## Option 1: Add as Web Version (Recommended)

Create a `web` or `website` folder in your repository:

```
Shot-Sync/
├── (existing iOS app files)
├── web/                    ← New folder
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

### Steps:

1. **Clone your repository** (if not already):
   ```bash
   cd ~/Desktop
   git clone https://github.com/Shubh-go/Shot-Sync.git
   cd Shot-Sync
   ```

2. **Create web folder and copy files**:
   ```bash
   mkdir web
   cp /Users/namrata/Desktop/MVP_Test/index.html web/
   cp /Users/namrata/Desktop/MVP_Test/style.css web/
   cp /Users/namrata/Desktop/MVP_Test/app.js web/
   ```

3. **Update index.html paths** (if needed):
   - The paths should already be correct since files are in same folder
   - Verify: `<link rel="stylesheet" href="style.css">`
   - Verify: `<script src="app.js"></script>`

4. **Commit and push**:
   ```bash
   git add web/
   git commit -m "Add web version of Shot Sync - browser-based shot analyzer"
   git push
   ```

5. **Enable GitHub Pages**:
   - Go to https://github.com/Shubh-go/Shot-Sync/settings/pages
   - Source: `main` branch, `/web` folder
   - Click Save

6. **Your site will be live at**:
   ```
   https://shubh-go.github.io/Shot-Sync/
   ```

## Option 2: Add to Root (If you want it at root level)

If you want the web version at the root of your GitHub Pages:

```
Shot-Sync/
├── index.html           ← Web version (rename from MVP_Test/index.html)
├── style.css
├── app.js
├── (iOS app files in subfolders)
└── README.md
```

### Steps:

1. **Copy files to repository root**:
   ```bash
   cd Shot-Sync
   cp /Users/namrata/Desktop/MVP_Test/index.html .
   cp /Users/namrata/Desktop/MVP_Test/style.css .
   cp /Users/namrata/Desktop/MVP_Test/app.js .
   ```

2. **Enable GitHub Pages**:
   - Settings → Pages
   - Source: `main` branch, `/ (root)` folder
   - Save

3. **Site URL**:
   ```
   https://shubh-go.github.io/Shot-Sync/
   ```

## Option 3: Separate Branch (Keep iOS separate)

Create a `gh-pages` branch for the web version:

```bash
git checkout -b gh-pages
git add index.html style.css app.js
git commit -m "Add web version"
git push origin gh-pages
```

Then enable Pages with `gh-pages` branch.

## Recommended Structure

I recommend **Option 1** (web folder) because:
- ✅ Keeps iOS and web code organized
- ✅ Easy to maintain both versions
- ✅ Clear separation
- ✅ Can add more web features later

## Update README.md

Add a section to your README:

```markdown
## Web Version

Try the web version at: https://shubh-go.github.io/Shot-Sync/

Features:
- Real-time pose detection
- Shot form analysis
- Comparison to benchmark
- Works in any browser
```

## Quick Commands

```bash
# Navigate to your repo
cd ~/Desktop/Shot-Sync

# Create web folder and add files
mkdir -p web
cp /Users/namrata/Desktop/MVP_Test/index.html web/
cp /Users/namrata/Desktop/MVP_Test/style.css web/
cp /Users/namrata/Desktop/MVP_Test/app.js web/

# Commit
git add web/
git commit -m "Add web version of Shot Sync"
git push
```

Then enable GitHub Pages pointing to `/web` folder!

