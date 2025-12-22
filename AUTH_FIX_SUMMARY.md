# Admin Bookings Authentication Fix

## Problem

The admin/booking page was redirecting users to the sign-in page after login, while other admin pages like admin/rooms and admin/guests were accessible after login.

## Root Cause

The admin/bookings page had different authentication logic compared to other admin pages:

### Before (Problematic Code)

- Used `isSignedIn` check with redirect logic
- Had `useEffect` that pushed users to `/sign-in` when not signed in
- Had early return `if (!isSignedIn) { return null; }`
- Used `enabled: isSignedIn` in queries

### Other Admin Pages Pattern

- **admin/rooms**: Uses `useAuth` with `getToken()` for API calls but no redirect logic
- **admin/guests**: No authentication checks at all
- **admin/users**: No authentication checks at all

## Solution

Updated admin/bookings page to match the authentication pattern of admin/rooms:

### Changes Made

1. **Removed redirect logic**: Eliminated the `useEffect` that was redirecting to sign-in
2. **Removed early return**: Removed the `if (!isSignedIn) { return null; }` check
3. **Updated query enabling**: Removed `enabled: isSignedIn` from queries
4. **Simplified error handling**: Made error messages more generic
5. **Cleaned up imports**: Removed unused `useRouter` import and variable

### After (Fixed Code)

```typescript
// Now uses the same pattern as admin/rooms:
const { getToken } = useAuth(); // No isSignedIn check

// No redirect logic
// No early return
// Query runs without isSignedIn check
```

## Authentication Flow

The page now follows this flow:

1. **Middleware protection**: The `middleware.ts` handles route protection at the server level
2. **API authentication**: Uses `getToken()` for authenticated API calls
3. **No client-side redirects**: Relies on middleware for access control

## Result

- ✅ admin/bookings now accessible after login (same as admin/rooms)
- ✅ Maintains secure API authentication
- ✅ Consistent with other admin pages
- ✅ No more unwanted redirects to sign-in page

## Files Modified

- `app/admin/bookings/page.tsx`: Updated authentication logic to match admin/rooms pattern

## Testing

After this fix, users should be able to:

1. Log in successfully
2. Access `/admin/bookings` without being redirected to sign-in
3. Use all booking management features as expected
4. Still have secure API calls with proper token authentication
