# Admin Audit Logs - Design Skeleton

## Overview
Cloudinary asset audit trail for tracking all media operations and changes.

## Layout Structure

### Header Section
- Page title: "Media Audit Logs"
- Search bar (asset, user, action)
- Filter toggle
- Export button

### Stats Bar (4 metrics)
1. Total Events Today
2. Upload Count
3. Delete Count
4. Modification Count

### Filters Panel
- Action type (Upload, Download, Delete, Edit, View)
- Date/time range
- User filter
- Asset type filter
- Status filter
- Sort by (Time, User, Action)

### Audit Logs Table
Columns:
- Timestamp
- Action type (badge)
- Asset (thumbnail + name)
- User (avatar + name)
- IP Address
- Status
- Details (expandable)

Action Type Colors:
- Upload: Green
- Download: Blue
- Edit: Yellow
- Delete: Red
- View: Gray

### Log Detail View (Expandable)
- Full action details
- Before/after comparison (edits)
- Asset metadata
- User information
- Request details
- Response status
