    at POST (app/api/admin/users/[action]/route.ts:82:38)

80 | }
81 | } catch (error) {

> 82 | console.error(`Error in ${params.action}:`, error);

     |                                      ^

83 | return new NextResponse("Internal server error", { status: 500 });
84 | }
85 | }
Error in enable: Error:
at async POST (app/api/admin/users/[action]/route.ts:60:9)
58 | case "enable": {
59 | // Unban user in Clerk

> 60 | await client.users.unbanUser(targetUserId);

     |         ^

61 |
62 | // Mark as active in MongoDB
63 | await User.findOneAndUpdate( {
clerkError: true,
status: undefined,
clerkTraceId: '',
retryAfter: undefined,
errors: [Array],
toString: [Function: toString]
}
POST /api/admin/users/enable 500 in 3502ms at POST (app/api/admin/users/[action]/route.ts:82:38)
80 | }
81 | } catch (error) {

> 82 | console.error(`Error in ${params.action}:`, error);

     |                                      ^

83 | return new NextResponse("Internal server error", { status: 500 });
84 | }
85 | }
Error in enable: Error:
at async POST (app/api/admin/users/[action]/route.ts:60:9)
58 | case "enable": {
59 | // Unban user in Clerk

> 60 | await client.users.unbanUser(targetUserId);

     |         ^

61 |
62 | // Mark as active in MongoDB
63 | await User.findOneAndUpdate( {
clerkError: true,
status: undefined,
clerkTraceId: '',
retryAfter: undefined,
errors: [Array],
toString: [Function: toString]
}
POST /api/admin/users/enable 500 in 3502ms# Admin/Bookings Access Fix

## 🔍 **Issue Analysis**

You can log in with admin role and see other pages, but `/admin/bookings` redirects you. This indicates a specific authentication/authorization issue with the bookings page.

## 🚨 **Quick Diagnosis Steps**

### Step 1: Check Authentication Status

Visit this URL while logged in: **`/api/debug/auth`**

This will show your current authentication status, including:

- Whether you're properly authenticated
- Your current role in session claims
- Whether you're approved
- Any issues with your user data

### Step 2: Check User Information

Visit this URL while logged in: **`/admin/diagnostic`**

This page provides comprehensive diagnostic tools to identify and fix authentication issues.

## 🛠️ **Most Common Causes & Solutions**

### Cause 1: Missing or Incorrect Role in Clerk Metadata

**Problem**: Your user doesn't have the correct role set in Clerk's public metadata.

**Solution A - Via Clerk Dashboard:**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Find your user account
4. Click **Edit** on your user
5. In the **Public Metadata** section, ensure you have:
   ```json
   {
     "role": "admin",
     "approved": true
   }
   ```

**Solution B - Via API (if you have another admin account):**
If you have access to an admin account, you can use the diagnostic page at `/admin/diagnostic` to set your role.

### Cause 2: Session Claims Not Updated

**Problem**: Your session claims might be cached with old metadata.

**Solution:**

1. Sign out completely
2. Clear browser cache/cookies
3. Sign back in
4. Try accessing `/admin/bookings` again

### Cause 3: Database Synchronization Issue

**Problem**: Your user exists in Clerk but not properly synchronized with the database.

**Solution:**

1. Go to `/admin/diagnostic`
2. Click **Check Current User**
3. Click **Sync Data** if there are sync issues

### Cause 4: Role Hierarchy Mismatch

**Problem**: Your user might have a role that doesn't match the expected hierarchy.

**Solution:**
The admin/bookings page requires exactly `"admin"` role. Staff members cannot access it.

## 🔧 **Emergency Fix (If Completely Locked Out)**

If you can't access any admin pages:

1. **Direct Clerk Access:**

   - Go directly to Clerk Dashboard
   - Find your user in the Users section
   - Manually set Public Metadata:
     ```json
     {
       "role": "admin",
       "approved": true
     }
     ```

2. **Browser Console Fix** (temporary):
   ```javascript
   // Run in browser console when logged in
   fetch("/api/admin/user-diagnostic", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       targetUserId: "your_user_id_here",
       action: "make-admin",
     }),
   });
   ```

## 📊 **Expected Behavior**

Once fixed, you should be able to:

- Access `/admin/bookings` without redirects
- See the bookings management interface
- Perform all admin booking operations

## 🆘 **Still Not Working?**

If the issue persists:

1. Check the browser console for any JavaScript errors
2. Verify network requests in DevTools for failed API calls
3. Check if there are any middleware redirects happening
4. Ensure your Clerk application is properly configured

## 📝 **Quick Debug Commands**

**In Browser Console:**

```javascript
// Quick auth status check
fetch("/api/debug/auth")
  .then((r) => r.json())
  .then((data) => {
    console.table([
      { Metric: "Authenticated", Value: data.auth.isAuthenticated },
      { Metric: "Has Role", Value: data.auth.hasValidRole },
      { Metric: "Approved", Value: data.auth.isApproved },
      { Metric: "Role", Value: data.auth.role },
      { Metric: "Issues", Value: data.auth.issues.length },
    ]);
  });
```

This will give you a quick overview of your authentication status.
