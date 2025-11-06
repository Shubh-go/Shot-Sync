# AWS SES Setup Guide for Shot Sync

AWS SES (Simple Email Service) is perfect for high-volume email sending. You can send up to **62,000 emails/month for FREE** if running from EC2, or **1,000/month** from other services.

## Quick Setup (5 minutes)

### Step 1: Create AWS Account (if you don't have one)
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Complete the signup process (requires credit card, but won't charge you for free tier)

### Step 2: Access AWS SES Console
1. Log into AWS Console
2. Search for "SES" in the top search bar
3. Click on "Simple Email Service"

### Step 3: Verify Your Email Address
**IMPORTANT:** AWS SES requires you to verify your sender email address first.

1. In SES Console, go to **"Verified identities"** (left sidebar)
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter: `shotsyncbasketball@gmail.com` (or your preferred sender email)
5. Click **"Create identity"**
6. **Check your email inbox** - AWS will send a verification email
7. **Click the verification link** in the email

⚠️ **Note:** In "Sandbox mode" (default), you can only send to verified email addresses. To send to any email address, you need to request production access (see Step 6).

### Step 4: Create IAM User with SES Permissions
1. Go to **IAM** service in AWS Console
2. Click **"Users"** → **"Create user"**
3. Username: `shot-sync-ses-user`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search for and select: **`AmazonSESFullAccess`**
7. Click **"Next"** → **"Create user"**
8. **IMPORTANT:** Click on the user → **"Security credentials"** tab
9. Click **"Create access key"**
10. Select **"Application running outside AWS"**
11. Click **"Next"** → **"Create access key"**
12. **COPY AND SAVE** both:
    - **Access Key ID**
    - **Secret Access Key** (you won't see this again!)

### Step 5: Set Environment Variables
Add these to your `.zshrc` file (or set them in your terminal):

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id-here
export AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
export AWS_REGION=us-east-1
export FROM_EMAIL=shotsyncbasketball@gmail.com
```

Then reload:
```bash
source ~/.zshrc
```

### Step 6: Request Production Access (To Send to Any Email)
1. In SES Console, click **"Account dashboard"** (left sidebar)
2. You'll see "Account status: Sandbox"
3. Click **"Request production access"**
4. Fill out the form:
   - **Use case:** "Transactional emails for basketball shot analysis app"
   - **Website URL:** https://shubh-go.github.io/Shot-Sync/
   - **Describe your use case:** "Sending personalized shot analysis results with graphs and feedback to users who request analysis"
5. Click **"Submit"**
6. **Approval usually takes 24-48 hours**, but sometimes faster!

**While in Sandbox:** You can test by verifying a few test email addresses first.

## Cost After Free Tier

- **Free tier:** 62,000 emails/month (from EC2) or 1,000/month (from other services)
- **After free tier:** $0.10 per 1,000 emails
- **Example:** 10,000 emails = $1.00

## Testing

Once set up, test it:

1. Start your Flask app: `python app.py`
2. Complete a shot analysis
3. The email should be sent automatically!

## Troubleshooting

**"Email address is not verified"**
- Make sure you verified the sender email in Step 3
- If in Sandbox mode, also verify the recipient email

**"Access Denied"**
- Check your IAM user has `AmazonSESFullAccess` policy
- Verify your access keys are correct

**"Production access not granted"**
- You're still in Sandbox mode
- Request production access (Step 6)
- Or verify recipient email addresses for testing

## Quick Commands

```bash
# Check if credentials are set
echo $AWS_ACCESS_KEY_ID
echo $AWS_REGION

# Test email sending
python app.py
```

## Need Help?

- AWS SES Documentation: https://docs.aws.amazon.com/ses/
- SES Console: https://console.aws.amazon.com/ses/

Once you have production access, you can send to **unlimited emails** at very low cost! 🚀

