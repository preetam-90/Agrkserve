# Admin Bookings Management - Design Skeleton

## Overview
Comprehensive booking management interface for monitoring and managing all platform bookings.

## Layout Structure

### Header Section
- Page title: "Bookings Management"
- Search bar (booking ID, user, equipment)
- Filter toggle
- Export button

### Quick Stats (4 cards)
1. Total Bookings
2. Active Bookings
3. Pending Approvals
4. Completed This Month

### Filters Bar
- Status filter (All, Pending, Confirmed, Active, Completed, Cancelled)
- Date range picker
- Provider filter
- Renter filter
- Equipment category filter
- Sort by (Date, Amount, Status)

### Bookings Table
Columns:
- Booking ID
- Equipment (thumbnail + name)
- Renter (avatar + name)
- Provider (avatar + name)
- Start Date
- End Date
- Duration
- Total Amount
- Status (badge)
- Actions

Status Badges:
- Pending: Yellow
- Confirmed: Blue
- Active: Green
- Completed: Gray
- Cancelled: Red
- Disputed: Orange

Actions Dropdown:
- View Details
- Edit Booking
- Cancel Booking
- Process Refund
- Contact Renter
- Contact Provider
- View Messages

### Pagination
- Standard pagination controls
- Items per page selector

## Booking Detail View (Modal/Page)

### Header
- Booking ID
- Status badge
- Action buttons (Edit, Cancel, Refund)

### Information Sections

#### Booking Details
- Equipment information with image
- Rental period
- Pricing breakdown
- Payment status
- Booking timeline

#### Parties Involved
- Renter card (avatar, name, contact)
- Provider card (avatar, name, contact)
- Quick message buttons

#### Timeline
- Booking created
- Payment received
- Confirmed by provider
- Equipment picked up
- Equipment returned
- Review submitted
- Completed

#### Payment Information
- Total amount
- Payment method
- Transaction ID
- Payment date
- Refund status (if applicable)

#### Messages/Notes
- Communication thread
- Admin notes section
- Add note functionality

## Interactions
- Real-time status updates
- Inline editing capabilities
- Bulk actions for multiple bookings
- Quick filters
- Export selected bookings
