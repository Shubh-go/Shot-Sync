# EmailJS Simple Setup (Even Easier!)

Since we're building the full HTML in JavaScript, you can use a **super simple template**!

## Step 1: Create Email Template (1 minute)

1. In EmailJS, go to **"Email Templates"** → **"Create New Template"**
2. Use this **simple template**:

**Template Name:** "Shot Sync Results"

**Subject:**
```
{{subject}}
```

**Content (can be simple, we override it with HTML):**
```
{{message}}
```

**To:** `{{to_email}}`

**From Name:** Shot Sync
**From Email:** (your connected Gmail)

3. Click **"Save"**
4. **Copy the Template ID** (starts with `template_...`)

## Step 2: Get Your IDs

You should have:
- ✅ **Service ID** (from Step 2 - e.g., `service_x2dr09n`)
- ✅ **Template ID** (from above - e.g., `template_xxxxx`)
- Need: **Public Key** (Account → General → Public Key)

## Step 3: Update Code

Open `static/app_github.js` and update these lines (around line 13-15):

```javascript
const EMAILJS_SERVICE_ID = 'service_x2dr09n'; // Your actual service ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxx'; // Your actual template ID  
const EMAILJS_PUBLIC_KEY = 'xxxxx'; // Your actual public key
```

## ✅ Done!

The code will automatically build the full HTML email with the graph and feedback - you don't need to put it all in the EmailJS template! The template just needs simple variables like `{{subject}}` and `{{message}}`.

🎉 Much simpler!

