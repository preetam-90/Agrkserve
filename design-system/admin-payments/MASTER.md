# Admin Payments Management - Design Skeleton

## Overview
Payment processing and financial transaction management interface.

## Layout Structure

### Header Section
- Page title: "Payments & Transactions"
- Search bar (transaction ID, user, amount)
- Date range selector
- Export button

### Financial Summary (4 cards)
1. Total Revenue
   - Current period
   - Trend indicator
   
2. Pending Payouts
   - Amount awaiting processing
   - Count of pending
   
3. Refunds Processed
   - Total refunded
   - Count of refunds
   
4. Platform Fees
   - Fees collected
   - Percentage breakdown

### Revenue Chart
- Time-based revenue visualization
- Multiple series (Bookings, Fees, Refunds)
- Interactive tooltips
- Zoom controls

### Filters Bar
- Transaction type (All, Payment, Refund, Payout, Fee)
- Status filter (Completed, Pending, Failed, Cancelled)
- Payment method filter
- Amount range
- User filter
- Sort options

### Transactions Table
Columns:
- Transaction ID
- Date & Time
- Type (badge)
- User (avatar + name)
- Booking ID (link)
- Amount
- Payment Method
- Status (badge)
- Actions

Transaction Types:
- Payment: Green
- Refund: Orange
- Payout: Blue
- Fee: Purple
- Failed: Red

Actions Dropdown:
- View Details
- Process Refund
- Download Receipt
- Contact User
- Mark as Reviewed
- Add Note

### Pagination
- Standard controls
- Items per page

## Transaction Detail View (Modal)

### Header
- Transaction ID
- Status badge
- Timestamp
- Action buttons

### Information Sections

#### Transaction Details
- Amount breakdown
- Payment method
- Transaction fee
- Net amount
- Currency

#### Related Information
- Booking details (link)
- User information
- Equipment information
- Provider information

#### Payment Timeline
- Initiated
- Processing
- Completed/Failed
- Refund (if applicable)

#### Metadata
- Payment gateway response
- Transaction reference
- IP address
- Device information

#### Admin Actions
- Process refund
- Retry payment
- Mark as reviewed
- Add internal note
- Download receipt

## Payout Management Section

### Pending Payouts Table
- Provider name
- Amount due
- Bookings count
- Payout method
- Scheduled date
- Actions (Process, Hold, Review)

### Payout History
- Processed payouts list
- Status tracking
- Download statements

## Refund Management

### Refund Requests Queue
- Booking information
- Refund amount
- Reason
- Requested date
- Status
- Actions (Approve, Reject, Review)

### Refund Processing
- Refund amount calculator
- Partial/full refund options
- Reason selection
- Confirmation workflow

## Financial Reports
- Revenue reports
- Payout reports
- Refund reports
- Fee analysis
- Export options (CSV, PDF)

## Interactions
- Real-time status updates
- Bulk payout processing
- Quick refund approval
- Transaction search
- Advanced filtering
