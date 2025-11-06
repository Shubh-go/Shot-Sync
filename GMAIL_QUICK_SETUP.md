# Gmail Quick Setup Guide

## Step 1: Get Your Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google", find **2-Step Verification**
   - If it's OFF, turn it ON first (you'll need this)
4. Once 2-Step Verification is ON, go back to Security
5. Scroll down to **App passwords**
6. Click **App passwords**
7. Select **Mail** as the app
8. Select **Other (Custom name)** and type "Basketball App"
9. Click **Generate**
10. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ You won't see this again! Save it somewhere safe.

## Step 2: Set Environment Variables

Open your terminal and run these commands (replace with YOUR email):

```bash
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=abcdefghijklmnop
export FROM_EMAIL=your-email@gmail.com
```

**For your email (shotsyncbasketball@gmail.com):**
```bash
export SMTP_USERNAME=shotsyncbasketball@gmail.com
export SMTP_PASSWORD=your-16-char-app-password-here
export FROM_EMAIL=shotsyncbasketball@gmail.com
```

(Replace `your-16-char-app-password-here` with the App Password you generate in Step 1)

**Note:** The app password has spaces, but you can use it with or without spaces - both work.

## Step 3: Start Your App

```bash
python app.py
```

That's it! Now when users submit the email form, emails will be sent from `shotsyncbasketball@gmail.com`.

## Alternative: Set in Code (Less Secure)

If you prefer not to use environment variables, you can edit `app.py` directly:

```python
SMTP_USERNAME = 'shotsyncbasketball@gmail.com'
SMTP_PASSWORD = 'your-16-char-app-password'
FROM_EMAIL = 'shotsyncbasketball@gmail.com'
```

⚠️ **Warning:** Don't commit this file with your password to GitHub!

## Testing

1. Run your app
2. Complete a shot analysis
3. Fill in the email form with a test email
4. Check your inbox (and spam folder) for the results!

## Troubleshooting

**"Email authentication failed"**
- Make sure you're using the App Password, NOT your regular Gmail password
- Make sure 2-Step Verification is enabled
- Double-check the password is correct (no extra spaces)

**"Email service not configured"**
- Make sure you exported the environment variables
- Or restart your terminal/app after setting them

## Need Help?

- The email will be sent FROM whatever you set as `FROM_EMAIL`
- The email will be sent TO whatever the user enters in the form
- You can use the same Gmail address for both FROM and sending

