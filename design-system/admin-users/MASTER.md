# Admin Users Management - Design Skeleton

## Overview
User management interface for viewing, editing, and managing platform users.

## Layout Structure

### Header Section
- Page title: "User Management"
- Search bar (name, email, ID)
- Filter button
- Create User button (primary action)

### Filters Panel (Collapsible)
- User role filter (Renter, Provider, Admin)
- Status filter (Active, Inactive, Suspended)
- Registration date range
- Verification status
- Sort options

### Stats Summary Bar
- Total Users count
- Active Users
- New This Month
- Suspended Users

### Users Table
Columns:
- Avatar + Name
- Email
- Role (badge)
- Status (badge with color)
- Registration Date
- Last Active
- Verification Status
- Actions (dropdown menu)

Actions Menu:
- View Details
- Edit User
- Suspend/Activate
- Reset Password
- Delete User
- View Activity Log

### Pagination
- Items per page selector
- Page navigation
- Total count display

## User Detail View (Modal/Slide-over)
- User profile information
- Account statistics
- Activity timeline
- Bookings history
- Equipment listings (if provider)
- Edit capabilities
- Action buttons

## Create/Edit User Modal
- Form fields:
  - Name
  - Email
  - Role selection
  - Password (create only)
  - Status toggle
  - Verification status
- Validation messages
- Save/Cancel actions

## Color Coding
- Active: Green
- Inactive: Gray
- Suspended: Red
- Pending: Yellow
