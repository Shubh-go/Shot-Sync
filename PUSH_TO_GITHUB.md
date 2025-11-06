# Push Your Code to GitHub

Your repository exists at: https://github.com/shubh-go/Shot-Sync

## Step 1: Get a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: "Shot Sync Repo Access"
4. Select scopes:
   - ✅ **repo** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

## Step 2: Push Your Code

Run this command (replace `YOUR_TOKEN` with the token you just copied):

```bash
cd /Users/namrata/Desktop/MVP_Test
git push -u origin main
```

When prompted:
- **Username:** `shubh-go`
- **Password:** Paste your Personal Access Token (not your GitHub password!)

---

## Alternative: Use SSH (More Secure, Long-term)

If you prefer SSH (no token needed each time):

1. **Check if you have SSH keys:**
   ```bash
   ls -la ~/.ssh
   ```

2. **If you don't have one, generate it:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   (Press Enter to accept defaults)

3. **Add your SSH key to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output, then:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key and save

4. **Change remote to SSH:**
   ```bash
   cd /Users/namrata/Desktop/MVP_Test
   git remote set-url origin git@github.com:shubh-go/Shot-Sync.git
   git push -u origin main
   ```

---

**Quick push (HTTPS with token):** Just run `git push -u origin main` and enter your token when asked!

