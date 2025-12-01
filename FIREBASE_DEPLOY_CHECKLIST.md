# Firebase Hosting Deployment Checklist

## Current Configuration ✅

- **Firebase Project**: `pokapal-7cd63`
- **Build Output**: `dist` folder
- **firebase.json**: Correctly configured
- **Deploy Script**: `npm run deploy` ready

## Steps to Deploy

### 1. Upgrade Node.js (REQUIRED)
Your current version: Node.js 18.17.1
Required: Node.js 20.19+ or 22.12+

**Option A: Using nvm (if installed)**
```bash
nvm install 20
nvm use 20
node --version  # Should show v20.x.x or v22.x.x
```

**Option B: Download from nodejs.org**
- Visit https://nodejs.org/
- Download Node.js 20 LTS or 22 LTS
- Install and restart terminal

### 2. Verify Firebase Login
```bash
firebase login
firebase projects:list
```

### 3. Build Your Project
```bash
npm run build
```

This should create/update the `dist` folder with:
- `index.html`
- `assets/` folder with JS and CSS files

### 4. Deploy to Firebase
```bash
npm run deploy
```

Or manually:
```bash
firebase deploy --only hosting
```

### 5. Verify Deployment
After deployment, Firebase will show you a URL like:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/pokapal-7cd63/overview
Hosting URL: https://pokapal-7cd63.web.app
```

Visit the Hosting URL to see your app.

## Troubleshooting

### If you see the Firebase welcome page:
1. Make sure `firebase.json` has `"public": "dist"`
2. Make sure `dist/index.html` exists
3. Rebuild: `npm run build`
4. Redeploy: `firebase deploy --only hosting`

### If build fails:
- Check Node.js version: `node --version`
- Make sure all dependencies are installed: `npm install`
- Check for import errors in the build output

### If deploy fails:
- Make sure you're logged in: `firebase login`
- Check project ID matches: `firebase use`
- Verify `dist` folder exists and has files

## Current Files Status

✅ `firebase.json` - Correctly configured
✅ `.firebaserc` - Project ID set
✅ `package.json` - Deploy script ready
✅ `dist/` folder - Exists with built files

## Next Steps

1. **Upgrade Node.js** (most important!)
2. Run `npm run build` to rebuild
3. Run `npm run deploy` to deploy
4. Check your Firebase Hosting URL

