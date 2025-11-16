# Firestore Setup Guide

## The Error

If you're seeing: **"Missing or insufficient permissions"**, your Firestore security rules are blocking access.

## Quick Fix for Development

### Option 1: Test Mode (Easiest - for development only)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pokapal-7cd63**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

⚠️ **WARNING**: These rules allow anyone to read/write. Only use for development!

### Option 2: Proper Rules (Recommended for production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Or allow public read, authenticated write
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Steps to Enable Firestore

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: pokapal-7cd63
3. **Click Firestore Database** (left sidebar)
4. **If not created yet**:
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (closest to you)
   - Click "Enable"

5. **Update Rules**:
   - Go to Rules tab
   - Use the test mode rules above
   - Click "Publish"

## Verify Setup

After updating rules, try:
1. Refresh your app
2. Go to `/admin`
3. Check if Firebase status shows "✓ Connected"
4. Try fetching sets from API

## Common Issues

### "Missing or insufficient permissions"
- **Fix**: Update Firestore rules (see above)

### "Firestore not initialized"
- **Fix**: Create the database in Firebase Console

### "Permission denied"
- **Fix**: Make sure rules allow read/write operations

## Next Steps

Once Firestore is configured:
1. ✅ Rules updated
2. ✅ Database created
3. ✅ Test connection at `/admin`
4. ✅ Fetch sets from Pokemon TCG API
5. ✅ Seed cards

