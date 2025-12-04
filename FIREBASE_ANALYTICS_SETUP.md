# Firebase Analytics Setup Guide

## What is Firebase Analytics?

Firebase Analytics is Google Analytics for Firebase - it tracks user behavior, page views, events, and provides insights about your app usage.

## Setup Steps

### 1. Enable Analytics in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pokapal-7cd63**
3. Click **Analytics** in the left menu
4. If not already enabled, click **Get Started** and follow the setup wizard
5. Make sure Analytics is enabled for your web app

### 2. Code Setup (Already Done)

The code has been updated to initialize Firebase Analytics. It will automatically:
- Track page views
- Track user engagement
- Track custom events (if you add them)

### 3. View Analytics Data

**Where to see your data:**

1. **Firebase Console > Analytics Dashboard**
   - Go to: https://console.firebase.google.com/project/pokapal-7cd63/analytics
   - You'll see:
     - **Overview**: User counts, engagement, retention
     - **Events**: Custom events you track
     - **Audiences**: User segments
     - **Conversions**: Goal completions

2. **Real-time Data**
   - Click "Real-time" in the Analytics menu
   - Shows active users right now (updates every few seconds)

3. **Reports**
   - **User engagement**: Daily/weekly/monthly active users
   - **Events**: Page views, clicks, custom events
   - **Demographics**: User location, device types, etc.

## Why You Might Not See Data

### Common Reasons:

1. **Low Traffic**: With just you testing, data might be minimal
   - Analytics needs multiple events to show meaningful data
   - Some reports require at least 10-20 events

2. **Time Delay**: 
   - **Real-time data**: Shows within seconds
   - **Standard reports**: Can take 24-48 hours to populate
   - **Historical data**: May take longer

3. **Ad Blockers**: 
   - Browser extensions can block Analytics
   - Try disabling ad blockers when testing

4. **Development vs Production**:
   - Analytics works in both, but production data is more reliable
   - Localhost (`localhost:5173`) may have limited tracking

5. **Not Enough Events**:
   - Analytics needs multiple page views/events to show trends
   - With just one user, you'll mainly see real-time data

## What Gets Tracked Automatically

- **Page views**: When users navigate between pages
- **User engagement**: Time spent, sessions
- **User properties**: Logged-in users, device info
- **Screen views**: Route changes in your Vue app

## Testing Analytics

1. **Open your app** in a browser
2. **Navigate between pages** (Home, Browse, Profile, etc.)
3. **Check Real-time Analytics**:
   - Go to Firebase Console > Analytics > Real-time
   - You should see yourself as an active user within 30 seconds
4. **Wait 24 hours** for standard reports to populate

## Custom Events (Optional)

If you want to track specific actions, you can add custom events:

```javascript
import { logEvent } from 'firebase/analytics'
import { analytics } from './config/firebase'

// Track a custom event
if (analytics) {
  logEvent(analytics, 'card_collected', {
    card_id: 'charizard-001',
    set_name: 'Base Set'
  })
}
```

## Troubleshooting

### "No data in Analytics"
- ✅ Check that Analytics is enabled in Firebase Console
- ✅ Verify you're viewing the correct project
- ✅ Check Real-time view (shows data immediately)
- ✅ Wait 24-48 hours for standard reports
- ✅ Disable ad blockers
- ✅ Try accessing from production URL (not localhost)

### "Analytics not initialized"
- Check browser console for errors
- Make sure Firebase config is correct
- Verify Analytics is enabled in Firebase Console

## Next Steps

1. **Deploy to production** - Analytics works better with real users
2. **Share your site** - Get more users to generate meaningful data
3. **Check Real-time view** - See immediate activity
4. **Wait for reports** - Standard analytics take 24-48 hours

## Useful Links

- [Firebase Analytics Dashboard](https://console.firebase.google.com/project/pokapal-7cd63/analytics)
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Analytics Events Reference](https://firebase.google.com/docs/reference/js/analytics)

