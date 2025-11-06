# Set Your Gmail App Password

## Quick Steps:

1. **Get your App Password:**
   - Go to https://myaccount.google.com/
   - Security → 2-Step Verification → App passwords
   - Generate one for "Mail"
   - Copy the 16-character password

2. **Edit your .zshrc file:**
   ```bash
   nano ~/.zshrc
   ```
   
   Or open it in any text editor.

3. **Find this line:**
   ```
   export SMTP_PASSWORD=REPLACE_WITH_YOUR_APP_PASSWORD_HERE
   ```

4. **Replace it with your actual password:**
   ```
   export SMTP_PASSWORD=abcd efgh ijkl mnop
   ```
   (Use your actual 16-character app password)

5. **Save the file and reload your shell:**
   ```bash
   source ~/.zshrc
   ```

6. **Test it:**
   ```bash
   echo $SMTP_PASSWORD
   ```
   (Should show your password)

## Done! 

Now your email settings are permanent. Every time you open a new terminal, they'll be automatically loaded.

⚠️ **Security Note:** Your `.zshrc` file is in your home directory and is private. But never commit this file to GitHub or share it publicly!

