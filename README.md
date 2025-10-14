# Dr. Sebghat Clinic - Laboratory Management System

This is a laboratory management system built with [Next.js](https://nextjs.org) for Dr. Sebghat Clinic, featuring role-based access control and user management.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Role-Based Access Control

The system implements a three-tier role system for laboratory management:

### User Roles

- **Admin**: Full system access including user management, Q&A moderation, laboratory dashboard, and all administrative functions
- **Laboratory**: Access to laboratory dashboard and laboratory-specific functions
- **Patient**: Standard user access with basic functionality (default role for new users)

### Default Role Assignment

New users are automatically assigned the "patient" role upon registration through webhook integration with Clerk authentication.

### User Management

Administrators can manage user roles through the enhanced `/admin/users` interface:

**Features:**

- **Complete User Table:** View all users in a sortable, filterable table
- **Advanced Search:** Real-time search across all user data
- **Bulk Actions:** Select multiple users for batch operations
- **Column Management:** Show/hide columns as needed
- **Pagination:** Handle large user lists efficiently

**User Actions:**

- **Role Management:** Change user roles between admin, laboratory, and patient
- **Role Removal:** Remove user roles and reset to default
- **User Deletion:** Permanently delete users with confirmation
- **Copy User ID:** Quick access to user identifiers for support

**Table Columns:**

- **Name:** First and last name with sorting
- **Email:** Primary email address
- **Role:** Current role with color-coded badges
- **Created:** Account creation date with sorting
- **Actions:** Dropdown menu with all available actions

### Webhook Integration

The system includes webhook endpoints for automatic user management:

- **User Creation**: Automatically assigns "patient" role to new users
- **User Updates**: Logs role changes for audit purposes
- **User Deletion**: Handles user removal from the system

Webhook endpoint: `/api/webhooks/clerk`

## Laboratory Dashboard

The laboratory dashboard (`/laboratory`) provides specialized functionality for laboratory staff:

### Access Control

- **Admin users**: Full access to laboratory dashboard and admin panel
- **Laboratory users**: Access to laboratory dashboard only
- **Patient users**: Redirected to home page (no access)

### Features

- **Lab Tests Management**: Interface for managing laboratory tests
- **Patient Management**: Access to patient records and history
- **Reports & Analytics**: Generate laboratory reports
- **Quick Actions**: Fast access to common laboratory tasks
- **User Information**: Display current user role and access level

### Navigation

- Laboratory link appears in header for authorized users
- Admin users see additional "Administrator Controls" section
- Seamless integration with existing role management system

## Doctor Management System

The doctor management system (`/laboratory/doctors`) allows laboratory staff to manage referring physicians:

### Features

**👨‍⚕️ Doctor Registration**

- **Comprehensive Doctor Profiles:** Name, specialization, contact information
- **Clinic/Hospital Details:** Associated medical facilities
- **License Tracking:** Medical license number management
- **Contact Information:** Phone, email, and clinic details

**🔗 Integration with Lab Tests**

- **Real-time Dropdown Updates:** Newly added doctors immediately appear in test creation forms
- **Automatic Query Invalidation:** TanStack Query ensures fresh data across all components
- **Seamless Workflow:** Add doctor → Create test with referral in one smooth process

**📊 Doctor Directory**

- **Professional Table Display:** All registered doctors with complete information
- **Contact Integration:** Quick access to doctor contact details
- **Specialization Badges:** Visual indicators of medical specialties
- **Search Ready:** Foundation for future doctor search functionality

### Workflow Integration

1. **Add Doctor:** Register new referring physicians
2. **Automatic Update:** Doctor appears in lab test creation dropdown
3. **Create Test:** Select doctor from updated list during test creation
4. **Track Referrals:** Monitor which doctors refer patients for tests

### Technical Features

- **TanStack Query Integration:** Automatic cache updates when doctors are added
- **Form Validation:** Comprehensive validation for doctor information
- **Error Handling:** Proper error states and user feedback
- **Responsive Design:** Works seamlessly on all device sizes

## Laboratory Daily Record System

The laboratory daily record system (`/laboratory/daily-record`) provides comprehensive patient and test management:

### Key Features

**🔍 Patient Search**

- **Phone Number Search:** Search patients by phone number with exact and partial matching
- **Real-time Results:** Instant search results with patient profiles
- **Auto-complete:** Smart search suggestions

**👤 Patient Management**

- **Existing Patient Selection:** Click on search results to select patients
- **New Patient Creation:** Create new patient profiles when not found
- **Comprehensive Forms:** Complete patient information collection
- **Medical History:** Track patient medical background

**🧪 Laboratory Test Creation**

- **Test Type Selection:** Dropdown with common test categories (Blood, Urine, Biochemistry, etc.)
- **Doctor Referral:** Dropdown selection of referring physicians
- **Test Details:** Complete test information including technician and notes
- **Status Tracking:** Pending, Completed, Cancelled status management

**📊 Daily Test Overview**

- **Today's Tests Table:** View all tests created today
- **Patient Information:** Linked patient data for each test
- **Status Indicators:** Color-coded status badges
- **Sortable Columns:** Click headers to sort by different criteria

### Workflow

1. **Search Patient:** Enter phone number to find existing patients
2. **Select or Create:** Choose existing patient or create new profile
3. **Create Test:** Fill out laboratory test details with doctor referral
4. **Track Progress:** Monitor test status in daily overview table

### Technical Implementation

- **TanStack Query:** For efficient data fetching and caching
- **Form Validation:** Comprehensive validation with proper error handling
- **Real-time Updates:** Automatic UI updates after mutations
- **Responsive Design:** Works seamlessly on all device sizes
- **Type Safety:** Full TypeScript implementation with proper typing

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
