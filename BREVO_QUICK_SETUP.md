# Brevo Quick Setup (5 Minutes!)

Brevo is **MUCH easier** than AWS SES - no domain verification, no approval process, works immediately!

## Step 1: Sign Up (1 minute)
1. Go to https://www.brevo.com/
2. Click "Sign up free"
3. Create account (use your email: `shotsyncbasketball@gmail.com`)
4. Verify your email address

## Step 2: Get API Key (2 minutes)
1. After logging in, click your profile icon (top right)
2. Click **"SMTP & API"** (or go to: https://app.brevo.com/settings/keys/api)
3. Click **"Generate a new API key"**
4. Name it: "Shot Sync"
5. Click **"Generate"**
6. **COPY THE API KEY** - you won't see it again!

## Step 3: Add to Your .zshrc (1 minute)

Open your terminal and run:
```bash
nano ~/.zshrc
```

Add these lines at the end:
```bash
# Brevo Email Configuration
export BREVO_API_KEY=your-api-key-here
export BREVO_SENDER_EMAIL=shotsyncbasketball@gmail.com
export BREVO_SENDER_NAME=Shot Sync
```

Replace `your-api-key-here` with your actual API key from Step 2.

Save and reload:
```bash
source ~/.zshrc
```

## Step 4: Test It! (1 minute)

```bash
python app.py
```

Complete a shot analysis and the email will be sent automatically!

## ✅ Done!

**Brevo Free Tier:**
- 300 emails per day (9,000/month)
- Works immediately - no approval needed!
- No domain verification required
- Perfect for getting traction this week!

**That's it!** Much simpler than AWS SES. 🎉

