# Admin Bookings Page - Mongoose Schema Registration Fix

## Issue Summary

The admin bookings page was encountering a `MissingSchemaError` with the following error:

```
Error fetching bookings: MissingSchemaError: Schema hasn't been registered for model "User".
Use mongoose.model(name, schema)
    at async GET (app/api/bookings/route.ts:163:22)
```

## Root Cause

The issue occurred because the User, Room, and RoomType models weren't being properly registered with Mongoose before they were used in `.populate()` operations. In Next.js applications, model registration can fail due to:

- Module loading timing issues
- Hot reloading in development mode
- Dynamic imports not triggering model registration

## Solution Implemented

### 1. Added Mongoose Import

```typescript
import mongoose from "mongoose";
```

### 2. Added Explicit Model Registration Checks

Before any database operations, added checks to ensure models are registered:

```typescript
// Ensure User model is registered with Mongoose
if (!mongoose.models.User) {
  await import("@/models/User");
}

// Ensure Room model is registered with Mongoose
if (!mongoose.models.Room) {
  await import("@/models/Room");
}

// Ensure RoomType model is registered with Mongoose
if (!mongoose.models.RoomType) {
  await import("@/models/RoomType");
}
```

### 3. Applied to Both GET and POST Functions

The fix was applied to both the `GET` (fetch bookings) and `POST` (create booking) functions in `app/api/bookings/route.ts`.

## Files Modified

- `app/api/bookings/route.ts` - Added mongoose import and model registration checks

## Testing

- Development server starts successfully
- API endpoint now returns "Unauthorized" (expected behavior) instead of mongoose schema error
- User model is properly registered before population operations

## Prevention

This fix prevents similar issues by ensuring models are explicitly registered before use, which is especially important in Next.js applications where module loading can be unpredictable during development and hot reloading.

## Additional Notes

- The fix uses dynamic imports (`await import()`) to trigger model registration
- Each model is checked individually to avoid unnecessary imports
- The approach is defensive and won't break if models are already registered
