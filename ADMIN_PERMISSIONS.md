# Admin Permissions Setup

## How to Make a User an Admin

### Option 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pokapal-7cd63**
3. Go to **Firestore Database**
4. Find the `users` collection
5. Click on your user document (by your user ID)
6. Click **Add field**
7. Field name: `isAdmin`
8. Field type: **boolean**
9. Value: `true`
10. Click **Update**

### Option 2: Using the App (Future Feature)

We can add an admin panel to manage admin permissions, but for now use Firebase Console.

## Current Behavior

- **All authenticated users** can access `/admin` routes
- **Admin flag** (`isAdmin: true`) is available for future use
- Currently, any logged-in user can access admin features

## Future: Restrict Admin Routes

If you want to restrict admin routes to only users with `isAdmin: true`, we can update the router guard:

```javascript
// In router/index.js
router.beforeEach(async (to, from, next) => {
  const isAdminRoute = to.path.startsWith('/admin')
  const currentUser = auth.currentUser
  
  if (isAdminRoute) {
    if (!currentUser) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    // Check admin status
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
    const isAdmin = userDoc.exists() && userDoc.data().isAdmin === true
    
    if (!isAdmin) {
      next({ path: '/', query: { error: 'admin_required' } })
      return
    }
  }
  
  next()
})
```

## Testing

1. ✅ Login to your account
2. ✅ Go to `/admin` - should work
3. ✅ Set `isAdmin: true` in Firestore for your user
4. ✅ (Future) Only admins can access admin routes

For now, the router error is fixed and any logged-in user can access admin!

