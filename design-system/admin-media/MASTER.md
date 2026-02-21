# Admin Media Management - Design Skeleton

## Overview
Cloudinary media asset management interface for monitoring and managing platform images and videos.

## Layout Structure

### Header Section
- Page title: "Media Library"
- Search bar (filename, user, tags)
- View toggle (Grid/List)
- Upload button
- Filter toggle

### Stats Bar (4 metrics)
1. Total Assets
2. Storage Used
3. Bandwidth This Month
4. Recent Uploads

### Filters Panel
- Media type (All, Images, Videos, Documents)
- Upload date range
- Uploaded by (user filter)
- File size range
- Tags filter
- Folder/category filter
- Sort options (Date, Size, Name, Type)

### View Modes

#### Grid View
- Thumbnail cards
- Asset preview
- File type icon
- File name
- Upload date
- User avatar
- Quick actions overlay

#### List View
- Thumbnail
- File name
- Type
- Size
- Dimensions
- Uploaded by
- Upload date
- Actions

### Asset Grid/List
Each asset shows:
- Preview thumbnail
- File name
- File type badge
- File size
- Upload date
- Uploader info
- Status indicators
- Actions menu

Actions Menu:
- Preview
- Download
- Rename
- Replace
- Copy URL
- Edit metadata
- View audit log
- Delete

### Pagination
- Standard controls
- Items per page selector
- Total count display

## Asset Preview Modal

### Preview Section
- Large preview (image/video player)
- Zoom controls (images)
- Playback controls (videos)
- Navigation (previous/next)

### Information Panel

#### File Details
- File name
- File type
- File size
- Dimensions
- Format
- Color space (images)
- Duration (videos)

#### Upload Information
- Uploaded by (avatar + name)
- Upload date
- Original filename
- Folder/path

#### URLs Section
- Public URL
- Secure URL
- Thumbnail URL
- Copy buttons
- Format options

#### Metadata
- Tags
- Description
- Alt text
- Custom metadata
- Edit capability

#### Usage Information
- Used in bookings
- Used by users
- Reference count
- Last accessed

### Action Panel
- Download original
- Download optimized
- Replace file
- Rename
- Move to folder
- Add tags
- Delete
- View audit log

## Audit Log View (Modal/Page)

### Log Entries
- Timestamp
- Action type (Upload, Download, Delete, Edit, etc.)
- User (avatar + name)
- IP address
- Details
- Status

### Filters
- Action type filter
- Date range
- User filter
- Status filter

## Bulk Operations

### Selection Mode
- Select multiple assets
- Select all toggle
- Selection count

### Bulk Actions
- Download selected
- Delete selected
- Move to folder
- Add tags
- Change permissions
- Export metadata

## Storage Analytics

### Storage Overview
- Total storage used
- Storage by type
- Storage by user
- Storage trends chart

### Bandwidth Usage
- Monthly bandwidth
- Bandwidth by asset type
- Top consuming assets
- Trends chart

## Upload Interface

### Upload Modal
- Drag & drop area
- File browser
- Multiple file support
- Upload progress
- Preview thumbnails
- Metadata input
- Folder selection
- Tag input

### Upload Queue
- File list
- Progress bars
- Status indicators
- Cancel option
- Retry failed

## Folder Management

### Folder Tree
- Hierarchical structure
- Expand/collapse
- Asset count per folder
- Quick navigation

### Folder Actions
- Create folder
- Rename folder
- Move folder
- Delete folder
- Set permissions

## Permissions & Access

### Asset Permissions
- Public/Private toggle
- User access control
- Role-based access
- Expiry dates

### Access Log
- Who accessed
- When accessed
- Access type
- IP address

## Color Coding
- Images: Blue
- Videos: Purple
- Documents: Green
- Audio: Orange
- Other: Gray
- Public: Green badge
- Private: Red badge
