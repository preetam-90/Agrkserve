# Admin Reviews Management - Design Skeleton

## Overview
Review moderation and management interface for monitoring user feedback and ratings.

## Layout Structure

### Header Section
- Page title: "Reviews & Ratings"
- Search bar (reviewer, equipment, content)
- Filter toggle
- Export button

### Stats Overview (4 cards)
1. Total Reviews
2. Average Rating
3. Pending Moderation
4. Flagged Reviews

### Rating Distribution Chart
- 5-star breakdown
- Bar chart visualization
- Percentage display
- Total count per rating

### Filters Bar
- Rating filter (5, 4, 3, 2, 1 stars)
- Status filter (Published, Pending, Flagged, Hidden)
- Review type (Equipment, Provider, Renter)
- Date range
- Has response toggle
- Sort by (Date, Rating, Helpful)

### Reviews List

#### Review Card Layout
- Header:
  - Reviewer avatar + name
  - Rating stars
  - Date posted
  - Status badge
  
- Content:
  - Review text
  - Equipment/Provider being reviewed (with link)
  - Booking reference
  - Images (if any)
  
- Metadata:
  - Helpful count
  - Report count
  - Response status
  
- Actions:
  - Approve/Reject
  - Flag/Unflag
  - Hide/Show
  - Edit
  - Delete
  - View Details

### Pagination
- Standard controls
- Items per page selector

## Review Detail View (Modal/Slide-over)

### Review Information
- Full review content
- Rating breakdown (if multi-criteria)
- Review images gallery
- Edit history

### Context Section
- Booking details
- Equipment information
- Reviewer profile
- Reviewee profile

### Response Section
- Provider/User response (if exists)
- Response date
- Edit response option

### Moderation Section
- Flag reasons (if flagged)
- Report details
- Moderation history
- Admin notes

### Action Panel
- Approve/Reject buttons
- Hide/Show toggle
- Flag/Unflag
- Delete review
- Contact reviewer
- Contact reviewee
- Add admin note

## Flagged Reviews Queue

### Priority List
- High priority flags
- Review content
- Flag reason
- Reporter information
- Quick action buttons

### Bulk Actions
- Approve selected
- Reject selected
- Hide selected
- Mark as reviewed

## Review Analytics

### Charts Section
- Rating trends over time
- Review volume by category
- Response rate metrics
- Average rating by equipment type

### Top Reviews
- Most helpful reviews
- Most reported reviews
- Recent high-impact reviews

## Moderation Tools

### Quick Filters
- Needs attention
- Recently flagged
- No response
- Low ratings
- High ratings

### Bulk Operations
- Select multiple reviews
- Bulk approve/reject
- Bulk hide/show
- Export selected

## Response Management

### Pending Responses
- Reviews awaiting provider response
- Response time tracking
- Reminder system

### Response Templates
- Common response templates
- Quick reply options
- Template management

## Color Coding
- 5 stars: Green
- 4 stars: Light Green
- 3 stars: Yellow
- 2 stars: Orange
- 1 star: Red
- Flagged: Red border
- Pending: Yellow border
- Hidden: Gray
