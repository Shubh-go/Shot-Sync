# Fix GitHub Pages Deployment

The deploy job is being cancelled. Here's how to fix it:

## Option 1: Re-run the Workflow (Easiest)

1. Go to: https://github.com/Shubh-go/Shot-Sync/actions
2. Click on the latest workflow run
3. Click "Re-run all jobs" button (top right)
4. Wait for it to complete

## Option 2: Make a Small Change to Trigger New Build

Sometimes making a small change and pushing triggers a fresh deployment:

```bash
cd ~/Desktop/Shot-Sync
echo "<!-- Updated -->" >> index.html
git add index.html
git commit -m "Trigger deployment"
git push
```

## Option 3: Check GitHub Pages Settings

1. Go to: https://github.com/Shubh-go/Shot-Sync/settings/pages
2. Make sure:
   - Source: `main` branch
   - Folder: `/ (root)`
3. Click Save (even if it's already set)
4. This forces a new deployment

## Option 4: Wait and Retry

Sometimes GitHub Actions has temporary issues. Wait 10-15 minutes and the next push should deploy successfully.

## Why Deploy Gets Cancelled

Common reasons:
- Multiple pushes happening quickly (GitHub cancels old ones)
- Manual cancellation
- GitHub Actions temporary issues
- Rate limiting

## Check Current Status

After re-running, check:
- https://github.com/Shubh-go/Shot-Sync/actions
- Look for green checkmarks on all jobs (build, report, deploy)

Once deploy succeeds, your site will update!

