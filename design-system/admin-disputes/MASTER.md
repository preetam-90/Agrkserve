# Admin Disputes Management - Design Skeleton

## Overview
Dispute resolution interface for managing conflicts between renters and providers.

## Layout Structure

### Header Section
- Page title: "Disputes & Resolution"
- Search bar (dispute ID, user, booking)
- Filter toggle
- Create Dispute button (manual)

### Stats Bar (4 metrics)
1. Open Disputes
2. Resolved This Month
3. Average Resolution Time
4. Pending Admin Action

### Priority Indicators
- Urgent disputes banner
- Escalated cases highlight
- SLA warning indicators

### Filters Panel
- Status filter (Open, In Progress, Resolved, Closed)
- Priority filter (Low, Medium, High, Urgent)
- Category filter (Payment, Damage, No-show, Other)
- Date range
- Assigned to filter
- Sort options

### Disputes Table
Columns:
- Dispute ID
- Priority badge
- Category
- Booking ID (link)
- Parties (Renter vs Provider)
- Created Date
- Status
- Assigned To
- Last Updated
- Actions

Priority Colors:
- Urgent: Red
- High: Orange
- Medium: Yellow
- Low: Blue

Status Colors:
- Open: Red
- In Progress: Yellow
- Resolved: Green
- Closed: Gray

Actions Dropdown:
- View Details
- Assign to Me
- Change Status
- Add Note
- Contact Parties
- Close Dispute

### Pagination
- Standard controls
- Items per page

## Dispute Detail View (Full Page/Modal)

### Header
- Dispute ID
- Priority badge
- Status badge
- Created date
- Action buttons (Assign, Resolve, Close)

### Parties Section (2 columns)

#### Renter Card
- Avatar + Name
- Contact information
- Account status
- Previous disputes
- Quick message button

#### Provider Card
- Avatar + Name
- Contact information
- Account status
- Previous disputes
- Quick message button

### Dispute Information

#### Overview
- Category
- Booking reference (link)
- Equipment involved
- Dispute amount (if applicable)
- Created date
- Last updated

#### Description
- Initial complaint
- Renter's statement
- Provider's statement
- Supporting evidence (images, documents)

### Timeline
- Dispute opened
- Messages exchanged
- Status changes
- Admin actions
- Evidence submitted
- Resolution proposed
- Dispute resolved/closed

### Messages Thread
- Chronological message history
- Sender identification
- Timestamps
- Attachments
- Reply functionality
- Internal notes (admin only)

### Evidence Section
- Uploaded files
- Images gallery
- Documents list
- Download options
- Add evidence button

### Resolution Section

#### Proposed Resolution
- Resolution type
- Amount (if financial)
- Terms
- Deadline

#### Admin Decision
- Decision form
- Outcome selection
- Refund amount (if applicable)
- Penalty assignment
- Resolution notes
- Confirmation

### Action Panel
- Assign to admin
- Change priority
- Update status
- Request more information
- Propose resolution
- Make decision
- Close dispute
- Escalate

## Resolution Workflow

### Decision Options
- Favor renter (full/partial refund)
- Favor provider (no refund)
- Split decision (partial refund)
- Dismiss dispute
- Escalate to legal

### Financial Actions
- Process refund
- Apply penalty
- Adjust fees
- Update booking status

## Dispute Analytics

### Charts
- Disputes by category
- Resolution time trends
- Outcome distribution
- Recurring issues

### Reports
- Monthly dispute summary
- Resolution rate
- Common dispute reasons
- User dispute history

## Quick Actions Panel
- Urgent disputes queue
- Unassigned disputes
- Pending decisions
- Escalated cases

## Templates & Tools
- Response templates
- Resolution templates
- Email notifications
- Document generation

## Color Coding
- Open: Red
- In Progress: Yellow
- Resolved: Green
- Closed: Gray
- Escalated: Purple
