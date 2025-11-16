# Firestore Rules with Authentication

## Updated Rules for Production

Now that we have authentication, update your Firestore rules to use auth:

### Recommended Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for sets and pokemon (for browsing)
    match /sets/{setId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /pokemon/{cardId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User collections - users can only access their own
    match /userCollections/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /collections/{collectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Groups - members can read, creator can write
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
      
      match /activity/{activityId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
  }
}
```

### Development Rules (Less Secure)

For development/testing, you can use:

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

This allows:
- ✅ Anyone to read (browse cards/sets)
- ✅ Only authenticated users to write
- ✅ Good for development

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pokapal-7cd63**
3. Click **Firestore Database** → **Rules** tab
4. Paste the rules above
5. Click **Publish**

## Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started** (if not already enabled)
3. Click **Sign-in method** tab
4. Enable **Email/Password**
5. Click **Save**

## Testing

After updating rules and enabling auth:

1. ✅ Create an account at `/login`
2. ✅ Try accessing `/admin` (should work when logged in)
3. ✅ Try accessing `/admin` when logged out (should redirect to login)
4. ✅ Test reading/writing data

## Security Notes

- **Public read**: Sets and Pokemon cards are readable by anyone (for browsing)
- **Authenticated write**: Only logged-in users can add/edit data
- **User data**: Users can only access their own collections
- **Groups**: Members can read, creator can manage

