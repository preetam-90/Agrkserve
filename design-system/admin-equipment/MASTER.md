# Admin Equipment Management - Design Skeleton

## Overview
Equipment catalog management for viewing, editing, and moderating equipment listings.

## Layout Structure

### Header Section
- Page title: "Equipment Management"
- Search bar (name, ID, category)
- Filter toggle
- Add Equipment button

### Stats Bar (4 metrics)
1. Total Equipment
2. Active Listings
3. Pending Approval
4. Flagged Items

### Filters Panel
- Category filter (multi-select)
- Status filter (Active, Inactive, Pending, Flagged)
- Price range slider
- Provider filter
- Availability filter
- Sort options (Date, Price, Popularity)

### View Toggle
- Grid view (default)
- List view
- Table view

### Equipment Grid/List

#### Grid View Cards
- Equipment image
- Title
- Category badge
- Price per day
- Provider name
- Status badge
- Rating stars
- Quick actions (Edit, Approve, Flag, Delete)

#### List View Rows
- Thumbnail
- Equipment details (name, category, provider)
- Pricing
- Availability
- Status
- Actions dropdown

#### Table View Columns
- Image
- Name
- Category
- Provider
- Price/Day
- Status
- Created Date
- Views
- Bookings
- Actions

### Pagination
- Standard controls
- Items per page selector

## Equipment Detail View (Modal/Page)

### Image Gallery
- Main image display
- Thumbnail carousel
- Zoom functionality
- Image management tools

### Information Tabs

#### Details Tab
- Equipment name
- Description
- Category
- Specifications
- Pricing structure
- Availability calendar
- Location

#### Provider Tab
- Provider information
- Contact details
- Other listings
- Rating/reviews

#### Bookings Tab
- Booking history
- Current bookings
- Revenue generated
- Utilization rate

#### Reviews Tab
- Review list
- Average rating
- Review moderation tools

#### Activity Tab
- View history
- Edit history
- Status changes
- Admin notes

### Action Panel
- Approve/Reject (for pending)
- Edit Equipment
- Change Status
- Flag/Unflag
- Delete Equipment
- Contact Provider
- View Analytics

## Moderation Features
- Bulk approval
- Bulk status change
- Flagged items queue
- Pending approvals queue
- Quick review interface

## Color Coding
- Active: Green
- Pending: Yellow
- Inactive: Gray
- Flagged: Red
- Featured: Blue
