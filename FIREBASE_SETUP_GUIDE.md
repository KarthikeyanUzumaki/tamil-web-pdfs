# Firebase/Firestore Setup and Debugging Guide

## The Problem
Your favorites are not being saved to Firestore when you log in. This is most likely due to one of these issues:

1. **Firestore is not enabled** in your Firebase project
2. **Security rules are blocking access**
3. **Firebase project configuration issues**

## Step-by-Step Fix

### 1. Enable Firestore Database

**Go to your Firebase Console:**
1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Select your project: `tamilpdflibrary`
3. In the left sidebar, click **"Firestore Database"**
4. If you see "Get started" or "Create database", click it
5. Choose **"Start in test mode"** (we'll fix security rules later)
6. Select a location (choose the closest to your users)
7. Click **"Done"**

### 2. Check Security Rules

**In Firebase Console:**
1. Go to **Firestore Database** → **Rules**
2. Make sure your rules allow authenticated users to read/write their own documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to other collections
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### 3. Test the Connection

**Use the test files I created:**

1. Open `firestore_test.html` in your browser
2. Click each test button to see what's working
3. Open `firebase_rules_test.html` to test security rules
4. Check the browser console for detailed error messages

### 4. Common Error Codes and Solutions

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `permission-denied` | Security rules blocking access | Update security rules (Step 2) |
| `unavailable` | Firestore not enabled | Enable Firestore (Step 1) |
| `not-found` | Document doesn't exist | Normal for new users |
| `invalid-argument` | Bad data format | Check the data being saved |

### 5. Debug Your Main Site

**Open your main site and:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Sign in with Google
4. Try to add a favorite
5. Look for error messages in the console

**Expected console output:**
```
=== toggleFavorite called ===
PDF ID: poems/bba.pdf
Current user: {uid: "...", email: "..."}
Firebase DB available: true
Current favorites before toggle: []
Favorites after toggle: ['poems/bba.pdf']
Saving to Firestore with data: {email: "...", favorites: ['poems/bba.pdf'], ...}
✅ Successfully saved to Firestore
```

### 6. If Still Not Working

**Check these things:**

1. **Firebase Project ID**: Make sure it matches in your code
2. **API Key**: Verify it's correct
3. **Domain**: Add your domain to authorized domains in Firebase Console
4. **Billing**: Firestore requires billing to be enabled (free tier available)

### 7. Quick Test

**Create a simple test:**
1. Open `firebase_rules_test.html`
2. Sign in with Google
3. Click "Test User Document Access"
4. If this works, the issue is in your main site code
5. If this fails, the issue is with Firebase configuration

### 8. Alternative: Use Local Storage (Temporary Fix)

If Firestore continues to have issues, I can modify the code to use localStorage as a temporary solution. This will save favorites locally in the browser, but they won't sync across devices.

## Next Steps

1. **First**: Enable Firestore in Firebase Console
2. **Second**: Update security rules
3. **Third**: Test with the provided test files
4. **Fourth**: Check your main site console for errors
5. **Fifth**: Let me know what errors you see

## Need Help?

If you're still having issues after following these steps, please:
1. Share any error messages from the browser console
2. Tell me what happens when you run the test files
3. Confirm if Firestore is enabled in your Firebase project

The most common issue is that Firestore is simply not enabled in the Firebase project. Once you enable it, everything should work perfectly! 