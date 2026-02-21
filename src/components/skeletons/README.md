# Admin Panel Skeleton Components

Accurate, detailed skeleton loading states for all admin panel pages based on actual implementations.

## Available Skeletons

### 1. AdminDashboardSkeleton
**File:** `AdminDashboardSkeleton.tsx`  
**Used in:** `/admin` (Dashboard)

**Structure:**
- Header with title and time range selector
- 4 stat cards (Revenue, Users, Bookings, Equipment)
- Two-column grid:
  - Recent Users list (5 items with avatars)
  - Activity Feed (5 items with icons)
- Bottom section:
  - Recent Transactions table (2/3 width)
  - Sidebar with Quick Actions and System Health (1/3 width)

### 2. AdminAnalyticsSkeleton
**File:** `AdminAnalyticsSkeleton.tsx`  
**Used in:** `/admin/analytics`

**Structure:**
- Header with filters and export button
- 4 metric cards with gradients
- Main content grid:
  - Revenue Chart (2/3 width, 240px height)
  - Platform Overview cards (1/3 width)
- Bottom row: 3 additional stat sections

**Theme:** Dark background (#0f0f0f) with slate-800 skeletons

### 3. AdminUsersSkeleton
**File:** `AdminUsersSkeleton.tsx`  
**Used in:** `/admin/users`

**Structure:**
- Header with "Add New User" button
- Stats grid (3 cards)
- Search bar with role/status filters
- Data table with columns:
  - User (avatar + name + city)
  - Email
  - Roles (badges)
  - Status (badge)
  - Joined date
- Pagination (10 rows)

### 4. AdminBookingsSkeleton
**File:** `AdminBookingsSkeleton.tsx`  
**Used in:** `/admin/bookings`

**Structure:**
- Header
- Search bar with status filter
- Data table with columns:
  - Booking ID
  - Equipment (image + name + category)
  - Renter (avatar + name + phone)
  - Schedule (start/end dates)
  - Amount (price + days)
  - Status badge
- Pagination (10 rows)

### 5. AdminEquipmentSkeleton
**File:** `AdminEquipmentSkeleton.tsx`  
**Used in:** `/admin/equipment`

**Structure:**
- Header with "Add Equipment" button
- 4 stat cards (Total Assets, Available, Rented, Revenue Potential)
- Search bar
- Data table with columns:
  - Equipment (14x14 image + name + category + brand)
  - Owner (name + phone)
  - Price/Day
  - Availability badge
  - Rating (stars + count)
- Pagination (10 rows)

### 6. AdminPaymentsSkeleton
**File:** `AdminPaymentsSkeleton.tsx`  
**Used in:** `/admin/payments`

**Structure:**
- Header
- 3 revenue summary cards
- Search bar with status filter
- Data table with columns:
  - Payment ID
  - Equipment
  - Customer (name + email)
  - Amount
  - Method
  - Transaction ID
  - Status badge
  - Date
- Pagination (10 rows)

### 7. AdminDisputesSkeleton
**File:** `AdminDisputesSkeleton.tsx`  
**Used in:** `/admin/disputes`

**Structure:**
- Header
- Search bar with status and priority filters
- Dispute cards (5 cards) with:
  - Status & ID section (left)
  - Main content (center) - title, description, parties
  - Action buttons (right)

### 8. AdminReviewsSkeleton
**File:** `AdminReviewsSkeleton.tsx`  
**Used in:** `/admin/reviews`

**Structure:**
- Header
- Search bar with rating filter
- Review cards (5 cards) with:
  - Equipment image (20x20)
  - Equipment name
  - Reviewer info (avatar + name + date)
  - Rating stars
  - Comment text
  - Review images (3 thumbnails 16x16)
  - Delete button
- Pagination

### 9. AdminMediaSkeleton
**File:** `AdminMediaSkeleton.tsx`  
**Used in:** `/admin/media/cloudinary`

**Structure:**
- Header with view toggle and upload button
- 4 stats cards
- Filters panel (search + 3 filters)
- Media grid (5 columns, 15 items):
  - Square aspect ratio image
  - File name
  - File size
  - User info
- Pagination

### 10. AdminStorageSkeleton
**File:** `AdminStorageSkeleton.tsx`  
**Used in:** `/admin/storage`

**Structure:**
- Header with action buttons
- 4 storage overview cards with progress bars
- Storage distribution chart (pie chart placeholder)
- Storage trends chart
- Large files table (8 rows) with columns:
  - File/Table name
  - Type badge
  - Size
  - Owner
  - Last Modified
  - Actions

### 11. AdminLogsSkeleton
**File:** `AdminLogsSkeleton.tsx`  
**Used in:** `/admin/logs`

**Structure:**
- Header with export and clear buttons
- 4 stats cards
- Filters panel (search + 3 filters)
- Logs table (15 rows) with columns:
  - Timestamp
  - Level badge
  - User (avatar + name)
  - Action/Event
  - Module
  - Message
  - IP Address
- Pagination

### 12. AdminSettingsSkeleton
**File:** `AdminSettingsSkeleton.tsx`  
**Used in:** `/admin/settings`

**Structure:**
- Header
- Tabs navigation (6 tabs)
- Settings sections:
  - Section 1: 4 input fields
  - Section 2: 3 toggle switches
  - Section 3: 5 input fields
- Save button

### 13. AdminPageSkeleton (Generic)
**File:** `AdminPageSkeleton.tsx`  
**Used in:** Generic fallback for admin pages

**Structure:**
- Full-page dark gradient background
- Header bar
- Page header with breadcrumbs
- 4 stat cards
- Quick actions grid
- Data table with search/filters
- Pagination
- Footer

## Usage

```tsx
import { AdminDashboardSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <AdminDashboardSkeleton />;
  }
  
  return <DashboardContent />;
}
```

## Design Principles

1. **Accurate Dimensions:** All skeletons match the exact layout of their corresponding pages
2. **Proper Spacing:** Uses the same gap/padding as actual components
3. **Realistic Counts:** Shows the same number of items as default page loads
4. **Theme Consistency:** Matches dark/light theme of actual pages
5. **Responsive:** Includes same breakpoints as actual components

## Component Patterns

### Stats Cards
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {[...Array(4)].map((_, i) => (
    <div key={i} className="rounded-xl border p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-32" />
    </div>
  ))}
</div>
```

### Data Table Row
```tsx
<tr className="border-b">
  <td className="px-6 py-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-4 w-32" />
    </div>
  </td>
  {/* More columns */}
</tr>
```

### Search Bar
```tsx
<div className="glass-card rounded-2xl p-4">
  <div className="flex flex-col gap-4 md:flex-row">
    <Skeleton className="h-10 flex-1" />
    <Skeleton className="h-10 w-32" />
  </div>
</div>
```

## Notes

- All skeletons use the `Skeleton` component from `@/components/ui/skeleton`
- Dimensions are based on actual implementations examined in the codebase
- Each skeleton is optimized for its specific page layout
- Skeletons include responsive breakpoints matching the actual pages
