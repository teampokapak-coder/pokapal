# Quick Firestore Rules Fix

## Current Issue
"Missing or insufficient permissions" - Your Firestore rules need to be updated.

## Quick Fix (Copy & Paste)

Go to Firebase Console → Firestore Database → Rules tab and paste this:

### Option 1: Development Mode (Easiest)
Allows public reads, authenticated writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Option 2: More Secure (Recommended)
Public reads for sets/pokemon, auth required for user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read access for sets and pokemon
    match /sets/{setId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Japanese sets collection
    match /setJA/{setId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /pokemon/{cardId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Japanese cards collection
    match /pokemon_ja/{cardId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pokemon list collection (aggregated data)
    match /pokemonList/{pokemonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User collections - users can only access their own
    match /userCollections/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /collections/{collectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Groups - authenticated users can read, creators can write
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
      
      match /activity/{activityId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## Steps

1. Go to: https://console.firebase.google.com/project/pokapal-7cd63/firestore/rules
2. Copy one of the rule sets above
3. Paste into the rules editor
4. Click **Publish**
5. Refresh your app

## Which One to Use?

- **Option 1**: Use if you're still testing/developing
- **Option 2**: Use for production or when you want better security

After updating rules, the error should be gone!

