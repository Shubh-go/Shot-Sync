# Simple Instructions: Add to Shot-Sync Repo

## Quick Steps

### 1. Clone Your Repository (if not already)
```bash
cd ~/Desktop
git clone https://github.com/Shubh-go/Shot-Sync.git
cd Shot-Sync
```

### 2. Create Web Folder and Add Files
```bash
mkdir web
cp /Users/namrata/Desktop/MVP_Test/index.html web/
cp /Users/namrata/Desktop/MVP_Test/style.css web/
cp /Users/namrata/Desktop/MVP_Test/app.js web/
```

### 3. Commit and Push
```bash
git add web/
git commit -m "Add web version of Shot Sync - browser-based shot analyzer"
git push
```

### 4. Enable GitHub Pages
1. Go to: https://github.com/Shubh-go/Shot-Sync/settings/pages
2. Under **Source**:
   - Branch: `main`
   - Folder: `/web`
3. Click **Save**

### 5. Your Site Will Be Live!
```
https://shubh-go.github.io/Shot-Sync/
```

## Or Use the Script

Run this from your Desktop:
```bash
/Users/namrata/Desktop/MVP_Test/add_to_shot_sync.sh
```

Then follow the printed instructions to commit and enable Pages.

## File Structure After Adding

```
Shot-Sync/
├── (existing iOS app files)
├── web/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## That's It!

Your web version will be separate from the iOS app but in the same repository. Perfect for showcasing both versions!

