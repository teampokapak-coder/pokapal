# Firebase Storage CORS Configuration

If you're getting CORS errors when uploading images to Firebase Storage, you need to configure CORS for your storage bucket.

## Option 1: Using Firebase CLI (Recommended)

1. Create a `cors.json` file in your project root:

```json
[
  {
    "origin": ["http://localhost:5173", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

2. Deploy the CORS configuration:

```bash
gsutil cors set cors.json gs://pokapal-7cd63.firebasestorage.app
```

Or if using Firebase CLI:

```bash
firebase storage:rules:set cors.json
```

## Option 2: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to Cloud Storage > Buckets
4. Click on your storage bucket (`pokapal-7cd63.firebasestorage.app`)
5. Go to the "Configuration" tab
6. Scroll to "CORS configuration"
7. Click "Edit CORS configuration"
8. Add the following:

```json
[
  {
    "origin": ["http://localhost:5173", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

9. Save the configuration

## Option 3: Firebase Storage Rules

Make sure your Firebase Storage rules allow authenticated uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload blog images
    match /blog-hero-images/{imageId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated write access
    }
    
    // Allow authenticated users to upload other images
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

To update Storage rules:
1. Go to Firebase Console > Storage > Rules
2. Update the rules as shown above
3. Click "Publish"

## Testing

After configuring CORS, test the upload functionality:
1. Make sure you're logged in (authentication is required for uploads)
2. Try uploading an image in the blog admin panel
3. Check the browser console for any remaining errors

## Troubleshooting

- **Still getting CORS errors?** Make sure you've added both `http://localhost:5173` (for development) and your production domain to the CORS origins.
- **Authentication errors?** Ensure Firebase Storage rules allow authenticated uploads and that the user is logged in.
- **File size errors?** Check that the file is under 5MB (current limit in the code).

