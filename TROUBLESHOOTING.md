# Troubleshooting GitHub Pages 404

If you're seeing a 404 error, try these steps:

## 1. Wait a Few Minutes
GitHub Pages can take **2-5 minutes** to build and deploy after you save the settings. The files are in the repository, but the site needs time to build.

## 2. Verify Pages are Enabled
- Go to: https://github.com/Shubh-go/Shot-Sync/settings/pages
- Check that it shows:
  - ✅ Branch: `main`
  - ✅ Folder: `/ (root)`
  - ✅ Green checkmark or "Your site is published"

## 3. Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or try an incognito/private window

## 4. Check the Exact URL
Make sure you're visiting:
```
https://shubh-go.github.io/Shot-Sync/
```

NOT:
- `https://shubh-go.github.io/Shot-Sync/index.html` (might work but root is better)
- `https://shubh-go.github.io/Shot-Sync/web/` (old path)

## 5. Check Repository is Public
- Go to: https://github.com/Shubh-go/Shot-Sync
- Look at the top - should say "Public" not "Private"

## 6. Check GitHub Actions (if using Actions)
If you see build errors, check:
- https://github.com/Shubh-go/Shot-Sync/actions

## 7. Force a Rebuild
If it's still not working:
1. Go to Pages settings
2. Change folder to `/docs` temporarily
3. Save
4. Change back to `/ (root)`
5. Save again

This forces GitHub to rebuild the site.

## 8. Verify Files are in Root
The files should be at:
- `index.html` (in root)
- `style.css` (in root)
- `app.js` (in root)

They are confirmed to be there!

## Still Not Working?

If it's been more than 10 minutes and still 404:
1. Double-check the Pages settings are saved
2. Try accessing: https://shubh-go.github.io/Shot-Sync/index.html directly
3. Check GitHub Status: https://www.githubstatus.com/

