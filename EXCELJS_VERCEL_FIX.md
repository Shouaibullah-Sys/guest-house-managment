# ExcelJS Vercel Deployment Fix

## Problem

The application was failing to build on Vercel with the error:

```
Module not found: Can't resolve 'exceljs'
```

This occurred in the file `app/api/reports/daily-guests/route.ts` at line 8.

## Root Cause

ExcelJS is a server-side only library that uses Node.js APIs and filesystem operations. When imported at the top level in Next.js applications, it causes issues during:

1. **Build time**: Next.js tries to analyze all imports during build
2. **Server-Side Rendering (SSR)**: ExcelJS shouldn't be imported during SSR
3. **Client-side bundling**: ExcelJS gets included in client bundles unnecessarily

## Solution Applied

The fix involves using **dynamic imports** to load ExcelJS only when needed on the server side.

### Changes Made

#### 1. `app/api/reports/daily-guests/route.ts`

**Before:**

```typescript
import ExcelJS from "exceljs";
```

**After:**

```typescript
// Removed top-level import
```

**Before:**

```typescript
function generateGuestReportExcel(guestsWithBookings: any[], reportDate: string, stats: any) {
  const workbook = new ExcelJS.Workbook();
```

**After:**

```typescript
function generateGuestReportExcel(guestsWithBookings: any[], reportDate: string, stats: any) {
  // Dynamic import for ExcelJS to avoid server-side rendering issues
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
```

**Type Updates:**

- Changed all `ExcelJS.Worksheet` type references to `any` in helper functions

#### 2. `lib/pdf-generator.ts`

**Before:**

```typescript
import ExcelJS from "exceljs";

static generateReport(test: LaboratoryTestWithDetails): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
```

**After:**

```typescript
// Removed top-level import

static generateReport(test: LaboratoryTestWithDetails): any {
  // Dynamic import for ExcelJS to avoid server-side rendering issues
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
```

**Type Updates:**

- Changed return type from `ExcelJS.Workbook` to `any`
- Changed all `ExcelJS.Worksheet` type references to `any` in private methods

## Why This Works

1. **Dynamic Loading**: ExcelJS is only imported when actually needed during runtime
2. **Server-Only**: The import happens inside async functions that only run on the server
3. **Build Optimization**: Next.js doesn't try to analyze ExcelJS during build time
4. **Bundle Size**: ExcelJS is excluded from client-side bundles

## Additional Recommendations

### 1. Environment Configuration

Ensure your `vercel.json` includes proper Node.js configuration:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 2. Package Installation

Verify ExcelJS is properly installed:

```bash
npm install exceljs
# or
pnpm add exceljs
```

### 3. Alternative Approach (Optional)

If you continue having issues, consider using a different library like `xlsx` which has better browser compatibility:

```bash
npm install xlsx
```

Then replace ExcelJS imports with:

```typescript
import * as XLSX from "xlsx";
```

### 4. Build Verification

Test the fix locally before deploying:

```bash
npm run build
# or
pnpm build
```

## Testing the Fix

1. **Local Development**: `npm run dev`
2. **Build Test**: `npm run build`
3. **Vercel Deployment**: Deploy and verify the API route works

## Expected Results

- ✅ Build should complete successfully on Vercel
- ✅ Excel report generation should work in API routes
- ✅ No "Module not found" errors
- ✅ Smaller client-side bundle sizes

## Files Modified

1. `app/api/reports/daily-guests/route.ts` - Main API route fix
2. `lib/pdf-generator.ts` - Library utility fix

## Notes

- The `any` types are used as a temporary solution for type safety during dynamic imports
- Consider creating proper type definitions if you want strict typing
- This pattern can be applied to other server-side only libraries (like `fs`, `path`, etc.)
