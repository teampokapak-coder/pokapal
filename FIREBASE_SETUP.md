# Firebase Setup Guide

## Quick Start

### 1. Preview the App (Without Firebase)
The app works with local data by default! Just run:
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### 2. Connect Firebase (Optional but Recommended)

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "pokapal")
4. Follow the setup wizard

#### Step 2: Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location (closest to your users)

#### Step 3: Get Your Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register app with a nickname (e.g., "pokapal-web")
5. Copy the `firebaseConfig` object

#### Step 4: Add Config to Project

**Option A: Environment Variables (Recommended)**
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

**Option B: Direct Config**
Edit `src/config/firebase.js` and replace the placeholder values with your actual Firebase config.

#### Step 5: Seed Firebase with Pokemon Sets
1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:5173/admin
3. Click "Seed Firebase with Sets"
4. Wait for confirmation message

That's it! Your app will now use Firebase data.

## What Gets Seeded?

The seeder adds **28 Pokemon sets** and **3 Sports card sets** to Firebase, including:
- Classic sets (Base Set, Jungle, Fossil, etc.)
- Modern sets (Sword & Shield, Scarlet & Violet, etc.)
- Sports cards (Baseball, Football, Basketball)

## Testing Without Firebase

The app works perfectly fine without Firebase! It uses local data from `src/data/pokemonSets.js`. You can:
- Pick random sets
- Create checklists
- Create and join groups
- Track progress

All data is stored in localStorage when Firebase isn't connected.

## Next Steps After Firebase Setup

1. **Enable Authentication** (optional):
   - Go to Firebase Console > Authentication
   - Enable Email/Password sign-in
   - We'll add auth components next

2. **Set Firestore Rules** (for production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Deploy** (when ready):
   ```bash
   npm run build
   # Deploy to Firebase Hosting, Vercel, Netlify, etc.
   ```

## Troubleshooting

**Error: "Firebase not configured"**
- Make sure your `.env` file exists and has correct values
- Restart the dev server after creating `.env`
- Check that `src/config/firebase.js` has correct values

**Error: "Permission denied"**
- Make sure Firestore is in test mode (for development)
- Check Firestore rules in Firebase Console

**Sets not loading**
- Check browser console for errors
- Verify Firestore database is created
- Make sure you've seeded the data (visit `/admin`)

