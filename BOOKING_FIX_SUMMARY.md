# Booking Creation & Edit Fix Summary

## Issue Description

Users were getting ZodError when trying to create or edit bookings:

```
Error [ZodError]: [
  {
    "expected": "number",
    "code": "invalid_type",
    "path": ["totalNights"],
    "message": "Invalid input: expected number, received undefined"
  },
  {
    "expected": "number",
    "code": "invalid_type",
    "path": ["totalAmount"],
    "message": "Invalid input: expected number, received undefined"
  }
]
```

## Root Cause

The frontend booking forms calculated `totalNights` and `totalAmount` locally but didn't send these calculated values to the API. The API schemas expected these as required/optional numbers, causing validation failures.

## Files Modified

### 1. `app/api/bookings/route.ts` (POST route)

**Changes:**

- Removed `totalNights` and `totalAmount` from the required booking schema
- Added server-side calculation of these values based on check-in/check-out dates and room rate
- Added validation to ensure total nights is positive
- Combined raw form data with calculated fields before creating booking

**Before:**

```typescript
const bookingSchema = z.object({
  // ... other fields
  totalNights: z.number().min(1),
  totalAmount: z.number().min(0),
});

const bookingData = bookingSchema.parse(body);
```

**After:**

```typescript
const bookingSchema = z.object({
  // ... other fields (excluding totalNights and totalAmount)
});

const rawBookingData = bookingSchema.parse(body);

// Calculate total nights and amount server-side
const checkInDate = new Date(rawBookingData.checkInDate);
const checkOutDate = new Date(rawBookingData.checkOutDate);
const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
const totalAmount = totalNights * rawBookingData.roomRate;

if (totalNights <= 0) {
  return NextResponse.json(
    { error: "تاریخ خروج باید بعد از تاریخ ورود باشد" },
    { status: 400 }
  );
}

const bookingData = {
  ...rawBookingData,
  totalNights,
  totalAmount,
};
```

### 2. `app/api/bookings/[id]/route.ts` (PUT route)

**Changes:**

- Removed `totalNights` and `totalAmount` from the optional update schema
- Added logic to recalculate these values when dates or room rate are updated
- Added proper validation for date ranges
- Automatically recalculates outstanding amount when total amount changes

**Before:**

```typescript
const updateSchema = z.object({
  // ... other fields
  totalNights: z.number().min(1).optional(),
  totalAmount: z.number().min(0).optional(),
});
```

**After:**

```typescript
const updateSchema = z.object({
  // ... other fields (excluding totalNights and totalAmount)
});

// Recalculate when dates or roomRate change
if (updateData.checkInDate || updateData.checkOutDate || updateData.roomRate) {
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (totalNights <= 0) {
    return NextResponse.json(
      { error: "تاریخ خروج باید بعد از تاریخ ورود باشد" },
      { status: 400 }
    );
  }

  updateObj.totalNights = totalNights;
  updateObj.totalAmount = totalNights * roomRate;

  // Recalculate outstanding amount
  const paidAmount = Number(existingBooking.paidAmount);
  updateObj.outstandingAmount = Math.max(0, updateObj.totalAmount - paidAmount);
}
```

## Benefits of Server-Side Calculation

1. **Security**: Prevents client-side manipulation of booking totals
2. **Consistency**: Ensures calculations are always correct regardless of frontend bugs
3. **Maintainability**: Single source of truth for calculations
4. **Payload Reduction**: Less data sent from client to server
5. **Error Prevention**: Centralized validation and error handling

## Testing Recommendations

1. Test booking creation with various date ranges
2. Test booking editing with date and rate changes
3. Verify that outstanding amounts are calculated correctly
4. Test edge cases like same-day check-in/check-out
5. Ensure validation messages appear in Persian as expected

## Frontend Impact

No frontend changes were required. The existing forms already calculate these values for display purposes, but now the server handles the authoritative calculations.
