# Authentication & Authorization Troubleshooting Guide

## 🔍 **Problem: Admin/Bookings Page Redirects to Login**

### **Symptoms**

- User is logged in but gets redirected to `/sign-in` when accessing `/admin/bookings`
- User may see authentication errors or be unable to access admin features
- Issue persists even after successful login

### **Root Causes**

#### 1. **Missing or Incorrect Role in Clerk Metadata**

```typescript
// Clerk Dashboard → Users → [User] → Public Metadata
{
  "role": "admin",        // ❌ Missing or incorrect
  "approved": true        // ❌ Missing or false
}
```

#### 2. **Database Synchronization Issues**

- User exists in Clerk but not in MongoDB database
- Role mismatch between Clerk and database
- Approval status mismatch

#### 3. **Client-Side vs Server-Side Auth Conflict**

- Client checks `isSignedIn` only
- Server requires `admin` role + approval status
- Race condition between checks

---

## 🛠️ **Diagnostic Steps**

### **Step 1: Check Authentication Debug Endpoint**

Visit: **`/api/debug/auth`**

This will show:

```json
{
  "auth": {
    "isAuthenticated": true,
    "hasValidRole": false, // ❌ This indicates the problem
    "isApproved": false, // ❌ Or this
    "role": "none", // ❌ Should be "admin"
    "issues": ["No role in session metadata", "User not approved"]
  }
}
```

### **Step 2: Check User Role Information**

Use the new user management utilities:

```typescript
// In any API route or server component
import { getUserRoleInfo, diagnoseAuthIssue } from "@/lib/user-management";

const userInfo = await getUserRoleInfo(userId);
const diagnosis = diagnoseAuthIssue(userInfo);

console.log("User Diagnosis:", diagnosis);
```

### **Step 3: Verify Clerk Dashboard**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Users**
4. Find the problematic user
5. Check **Public Metadata** section

**Required Metadata:**

```json
{
  "role": "admin",
  "approved": true
}
```

---

## 🔧 **Solutions**

### **Solution 1: Fix Clerk Metadata**

**Option A: Via Clerk Dashboard**

1. Edit user in Clerk Dashboard
2. Add/modify Public Metadata:
   ```json
   {
     "role": "admin",
     "approved": true
   }
   ```

**Option B: Via API**

```typescript
// Call the existing API endpoint
const response = await fetch("/api/admin/users/role", {
  method: "POST",
  body: new FormData(
    Object.entries({
      id: "user_id_here",
      role: "admin",
    })
  ),
});
```

### **Solution 2: Synchronize Database**

Use the new utility function:

```typescript
// In a temporary API route or script
import { syncUserRole } from "@/lib/user-management";

const result = await syncUserRole("user_id_here");
console.log(result.message);
```

### **Solution 3: Approve User**

```typescript
// Using the new utility
import { approveUser } from "@/lib/user-management";

const result = await approveUser("user_id_here");
console.log(result.message);
```

---

## 📋 **Quick Fix Commands**

### **Emergency Admin Setup**

If you need to quickly grant admin access:

1. **Find your user ID** (from `/api/debug/auth` or Clerk Dashboard)
2. **Run this in browser console** (when logged in as that user):

```javascript
// Temporary fix via Clerk API
await fetch("/api/admin/set-admin", {
  method: "POST",
  body: new FormData(
    Object.entries({
      userId: "your_user_id_here",
    })
  ),
});
```

### **Database Reset**

If users are missing from database:

```typescript
// Create a temporary API route
import { createUserFromClerk } from "@/lib/user-management";

// Call this for each user that needs to be created
await createUserFromClerk(userId);
```

---

## 🚀 **Prevention Measures**

### **1. Enhanced Error Messages**

The admin/bookings page now shows specific error messages:

- **"Not authenticated"** → User needs to sign in
- **"Not approved"** → User needs admin approval
- **"Insufficient permissions"** → User needs admin role
- **"Data sync issues"** → Run syncUserRole()

### **2. Better Client-Side Protection**

All admin pages now use:

```typescript
const { hasPermission, userRole, isApproved } = useRequireRole("admin");

useEffect(() => {
  if (isSignedIn && !hasPermission) {
    if (!isApproved) {
      router.push("/pending-approval");
    } else {
      router.push("/unauthorized");
    }
  }
}, [isSignedIn, hasPermission, isApproved, router]);
```

### **3. Debug Information**

In development mode, admin pages show:

- Authentication status
- User role
- Approval status
- Direct link to debug endpoint

---

## 🆘 **Emergency Access**

If you're completely locked out:

1. **Access Clerk Dashboard** directly
2. **Find your user** in the Users section
3. **Edit Public Metadata**:
   ```json
   {
     "role": "admin",
     "approved": true
   }
   ```
4. **Save changes**
5. **Clear browser cache** or try incognito mode

---

## 📊 **Monitoring & Maintenance**

### **Regular Checks**

1. **Weekly**: Run `/api/debug/auth` for admin users
2. **Monthly**: Check for data sync issues
3. **After user changes**: Verify role assignments

### **Automated Checks**

The system now includes:

- Role validation in middleware
- Client-side permission checks
- Database synchronization utilities
- Comprehensive error logging

---

## 🎯 **Success Indicators**

**✅ Working correctly when:**

- `/api/debug/auth` shows `hasValidRole: true`
- User has `role: "admin"` in Clerk metadata
- User has `approved: true` in Clerk metadata
- Database role matches Clerk role
- No sync issues reported

**❌ Still broken when:**

- Redirects to login page persist
- "Insufficient permissions" errors
- Debug shows missing metadata
- Role mismatches between Clerk and database

---

## 📞 **Support Commands**

For quick diagnosis, paste this in browser console:

```javascript
// Quick auth check
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

This comprehensive guide should help resolve the authentication issue and prevent future occurrences!
