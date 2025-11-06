# Firebase Setup for Google Sign-In & Email Storage

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `shot-sync` (or any name)
4. Disable Google Analytics (optional, you can skip it)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** in left sidebar
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Google"**
5. Toggle **"Enable"**
6. Enter project support email: `shotsyncbasketball@gmail.com`
7. Click **"Save"**

## Step 3: Create Firestore Database

1. Click **Firestore Database** in left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click **"Enable"**

## Step 4: Get Firebase Config

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register app name: `Shot Sync Web`
6. **Copy the `firebaseConfig` object** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "shot-sync-xxxxx.firebaseapp.com",
  projectId: "shot-sync-xxxxx",
  storageBucket: "shot-sync-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 5: Update Your Code

You'll need to add this config to `app.js`. The code will be updated automatically, but you'll need to replace the placeholder with your actual config.

## Step 6: Set Firestore Rules (Security)

1. Go to **Firestore Database** → **Rules**
2. Update rules to allow authenticated users to write:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Allow storing analysis results
    match /analyses/{analysisId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

## ✅ Done!

After setup, users can:
- Sign in with Google (one click!)
- Have their emails automatically stored
- Have analysis results saved to their account

## Free Tier Limits

- **Authentication**: 50,000 MAU (Monthly Active Users) - FREE
- **Firestore**: 50K reads, 20K writes, 20K deletes per day - FREE
- Perfect for MVP/traction phase!

## Next Steps

1. Complete the setup above
2. Get your Firebase config
3. The code will be updated with Firebase integration
4. Test it locally first
5. Deploy to GitHub Pages

