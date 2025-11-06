# Email Configuration Guide

To enable email functionality for sending shot analysis results, you need to configure SMTP settings.

## 💰 Cost: FREE to Start!

**Good news:** You can send emails completely FREE using your personal Gmail account!

- **Gmail Free:** Up to 500 emails per day (15,000/month) - Perfect for getting traction
- **Outlook/Yahoo:** Similar free limits
- **Paid services:** Only needed if you exceed 500 emails/day or need advanced features

For a traction/lead generation app, a free Gmail account is usually more than enough to start with!

## Quick Setup

### Option 1: Environment Variables (Recommended)

Set these environment variables before running the app:

```bash
export SMTP_SERVER=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export FROM_EMAIL=your-email@gmail.com
```

### Option 2: Direct Configuration

Edit `app.py` and update these lines directly:

```python
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = 'your-email@gmail.com'
SMTP_PASSWORD = 'your-app-password'
FROM_EMAIL = 'your-email@gmail.com'
```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this 16-character password (not your regular Gmail password)

## Other Email Providers

### Outlook/Hotmail
```
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
Update the `SMTP_SERVER` and `SMTP_PORT` values accordingly.

## Testing

Once configured, users will be able to:
1. Complete a shot analysis
2. Enter their first name, last name, and email
3. Receive an email with:
   - Their overall score
   - The shot analysis graph
   - Personalized feedback and recommendations

## Troubleshooting

**"Email service not configured"**
- Make sure `SMTP_USERNAME` and `SMTP_PASSWORD` are set

**"Email authentication failed"**
- For Gmail: Use an App Password, not your regular password
- Check that 2FA is enabled
- Verify credentials are correct

**"Failed to send email"**
- Check your internet connection
- Verify SMTP server and port are correct
- Check firewall settings

## Security Note

⚠️ **Never commit email credentials to version control!**

Use environment variables or a secure secrets management system.

