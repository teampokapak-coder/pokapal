# Fresh Firebase Hosting Setup Guide

## Step 1: Upgrade Node.js (REQUIRED)

Firebase CLI v14.22.0 requires Node.js >=20.0.0 or >=22.0.0

**Option A: Using nvm (recommended)**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 22 (LTS)
nvm install 22
nvm use 22

# Verify
node --version  # Should show v22.x.x
```

**Option B: Using Homebrew (macOS)**
```bash
brew install node@22
# Follow instructions to link it
```

## Step 2: Verify Firebase CLI

```bash
firebase --version  # Should work now
firebase login      # Login if needed
```

## Step 3: Fresh Firebase Hosting Setup

### Option A: Use Existing Project (pokapal-7cd63)

```bash
# Verify project connection
firebase use pokapal-7cd63

# Check hosting status
firebase hosting:sites:list

# Deploy
npm run deploy
```

### Option B: Start Completely Fresh

```bash
# 1. Remove old Firebase config (optional - backup first!)
# cp .firebaserc .firebaserc.backup
# cp firebase.json firebase.json.backup

# 2. Reinitialize Firebase
firebase init hosting

# When prompted:
# - Select "Use an existing project" or "Create a new project"
# - Choose your project (pokapal-7cd63 or create new)
# - Public directory: dist
# - Single-page app: Yes
# - Set up automatic builds: No (we'll use npm run deploy)

# 3. Verify firebase.json looks correct
cat firebase.json

# 4. Build and deploy
npm run build
firebase deploy --only hosting
```

## Step 4: Verify Deployment

After deployment, check:
1. Firebase Console → Hosting → Should show your deployment
2. Visit the hosting URL (shown after deployment)
3. Check browser console for any errors

## Troubleshooting

If deployment still fails:
1. Clear Firebase cache: `rm -rf .firebase`
2. Re-login: `firebase logout && firebase login`
3. Check project permissions in Firebase Console
4. Verify `dist` folder exists and has `index.html`

