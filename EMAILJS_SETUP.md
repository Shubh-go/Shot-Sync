# EmailJS Setup for GitHub Pages (5 Minutes!)

EmailJS lets you send emails directly from your GitHub Pages site - **no backend needed!**

## Step 1: Sign Up (1 minute)
1. Go to https://www.emailjs.com/
2. Click "Sign Up Free"
3. Create account (use your email: `shotsyncbasketball@gmail.com`)
4. Verify your email

## Step 2: Connect Email Service (2 minutes)
1. After logging in, go to **"Email Services"** (left sidebar)
2. Click **"Add New Service"**
3. Choose **"Gmail"** (or your preferred email service)
4. Click **"Connect Account"**
5. Sign in with your Gmail account
6. Click **"Create Service"**
7. **Copy the Service ID** - you'll need this!

## Step 3: Create Email Template (2 minutes)
1. Go to **"Email Templates"** (left sidebar)
2. Click **"Create New Template"**
3. Use this template:

**Subject:**
```
Your Shot Sync Analysis Results - {{first_name}}!
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #667eea; margin-top: 0; text-align: center;">🏀 Shot Sync</h1>
            <h2 style="color: #333; text-align: center; font-size: 24px;">Thank You for Using Shot Sync!</h2>
            
            <p style="font-size: 16px;">Hi {{first_name}},</p>
            <p>We're excited to share your personalized shot analysis results with you. Here's everything you need to improve your basketball shooting form:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 36px;">Overall Score: {{overall_score}}%</h2>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">Feedback & Recommendations</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0; color: #333;">{{feedback}}</pre>
            </div>
            
            <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #333;"><strong>Keep practicing!</strong> Every shot is an opportunity to improve.</p>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">We hope this analysis helps you take your game to the next level!</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>The Shot Sync Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="text-align: center; color: #999; font-size: 12px;">Shot Sync - Your Basketball Shot Analysis Partner</p>
        </div>
    </div>
</body>
</html>
```

4. **To:** `{{to_email}}`
5. **From Name:** Shot Sync
6. **From Email:** (your connected email)
7. Click **"Save"**
8. **Copy the Template ID** - you'll need this!

## Step 4: Get Public Key (30 seconds)
1. Go to **"Account"** → **"General"** (left sidebar)
2. Find **"Public Key"** 
3. **Copy the Public Key**

## Step 5: Update Your Code
1. Open `static/app_github.js`
2. Find these lines near the top:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```
3. Replace with your actual values:
```javascript
const EMAILJS_SERVICE_ID = 'service_xxxxx'; // Your service ID from Step 2
const EMAILJS_TEMPLATE_ID = 'template_xxxxx'; // Your template ID from Step 3
const EMAILJS_PUBLIC_KEY = 'xxxxx'; // Your public key from Step 4
```

## Step 6: Deploy to GitHub Pages
1. Commit and push your changes
2. Your site will automatically update!

## ✅ Done!

**EmailJS Free Tier:**
- 200 emails per month
- Works immediately - no approval needed!
- Perfect for GitHub Pages!

**That's it!** Your GitHub Pages site can now send emails! 🎉

