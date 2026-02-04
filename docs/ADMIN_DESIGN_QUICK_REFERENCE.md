# Admin Futuristic Design - Quick Reference Guide

## 🎨 CSS Classes Reference

### Layout & Containers

```css
.admin-container          /* Main container with background */
.admin-grid-bg           /* Animated grid background */
.admin-scanline          /* Scanline overlay effect */
.admin-glass-card        /* Glass morphism card */
.admin-table-container   /* Table wrapper */
```

### Buttons

```css
.admin-btn-neon          /* Primary neon button */
.admin-btn-danger        /* Danger variant */
.admin-btn-warning       /* Warning variant */
```

### Badges & Status

```css
.admin-badge             /* Base badge */
.admin-badge-success     /* Green success badge */
.admin-badge-warning     /* Amber warning badge */
.admin-badge-danger      /* Red danger badge */
.admin-badge-info        /* Cyan info badge */
.admin-status-pulse      /* Animated pulse indicator */
```

### Data Display

```css
.admin-stat-card         /* Stat card with holographic effect */
.admin-stat-value        /* Large gradient value */
.admin-stat-label        /* Uppercase label */
.admin-stat-trend        /* Trend indicator */
.admin-stat-trend.up     /* Upward trend (green) */
.admin-stat-trend.down   /* Downward trend (red) */
```

### Tables

```css
.admin-table             /* Futuristic table */
.admin-table thead       /* Table header */
.admin-table tbody tr    /* Table row with hover */
```

### Forms

```css
.admin-input             /* Input field with glow focus */
```

### Progress & Loading

```css
.admin-progress-bar      /* Progress bar container */
.admin-progress-fill     /* Animated fill */
.admin-loading-spinner   /* Loading spinner */
.admin-skeleton          /* Skeleton loader */
```

### Utilities

```css
.admin-scrollbar         /* Custom scrollbar styling */
```

---

## 🎯 CSS Variables

### Colors

```css
/* Primary Colors */
var(--admin-primary)      /* #00ff9d - Neon Green */
var(--admin-secondary)    /* #00d4ff - Cyan */
var(--admin-accent)       /* #ff00ff - Magenta */
var(--admin-warning)      /* #ffaa00 - Amber */
var(--admin-danger)       /* #ff0055 - Hot Pink */
var(--admin-success)      /* #00ff9d - Neon Green */

/* Backgrounds */
var(--admin-bg-base)      /* #0a0a0f - Deep Black */
var(--admin-bg-elevated)  /* #12121a - Elevated */
var(--admin-bg-card)      /* #1a1a24 - Card */
var(--admin-bg-hover)     /* #22222e - Hover */

/* Borders */
var(--admin-border)       /* rgba(0, 255, 157, 0.1) */
var(--admin-border-hover) /* rgba(0, 255, 157, 0.3) */
var(--admin-divider)      /* rgba(255, 255, 255, 0.05) */

/* Text */
var(--admin-text-primary)   /* #ffffff */
var(--admin-text-secondary) /* #a0a0b0 */
var(--admin-text-muted)     /* #606070 */

/* Effects */
var(--glow-sm)            /* Small glow */
var(--glow-md)            /* Medium glow */
var(--glow-lg)            /* Large glow */
```

---

## 📝 Component Examples

### Glass Card

```tsx
<div className="admin-glass-card p-6">
  <h3 className="font-['Fira_Code'] text-lg font-bold text-white">
    CARD TITLE
  </h3>
  <p className="text-[var(--admin-text-secondary)]">
    Card content goes here
  </p>
</div>
```

### Neon Button

```tsx
<button className="admin-btn-neon">
  EXECUTE ACTION
</button>

<button className="admin-btn-neon admin-btn-danger">
  DELETE
</button>
```

### Status Badge

```tsx
<span className="admin-badge admin-badge-success">
  <div className="admin-status-pulse" />
  ACTIVE
</span>

<span className="admin-badge admin-badge-warning">
  PENDING
</span>
```

### Stat Card (Use Component)

```tsx
import StatsCard from '@/components/admin/StatsCard';
import { Users } from 'lucide-react';

<StatsCard
  title="Total Users"
  value={1234}
  icon={Users}
  color="blue"
  trend={{ value: 12.5, isUp: true }}
/>
```

### Progress Bar

```tsx
<div className="admin-progress-bar">
  <div 
    className="admin-progress-fill" 
    style={{ width: '75%' }}
  />
</div>
```

### Data Table

```tsx
<div className="admin-table-container">
  <table className="admin-table">
    <thead>
      <tr>
        <th>COLUMN 1</th>
        <th>COLUMN 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Input Field

```tsx
<input
  type="text"
  className="admin-input"
  placeholder="Enter value..."
/>
```

---

## 🎨 Typography

### Font Families

```tsx
/* Headings & Labels */
className="font-['Fira_Code']"

/* Body Text */
className="font-['Fira_Sans']"
```

### Common Text Styles

```tsx
/* Page Title */
className="font-['Fira_Code'] text-3xl font-bold text-white"

/* Section Heading */
className="font-['Fira_Code'] text-lg font-bold text-white"

/* Label (Uppercase) */
className="font-['Fira_Code'] text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]"

/* Body Text */
className="text-sm text-[var(--admin-text-secondary)]"

/* Muted Text */
className="text-xs text-[var(--admin-text-muted)]"
```

---

## 🎯 Color Usage Guide

### When to Use Each Color

| Color | Use For | Example |
|-------|---------|---------|
| **Primary (Green)** | Success, primary actions, active states | Save button, success messages, active indicators |
| **Secondary (Cyan)** | Info, secondary actions, links | Info badges, secondary buttons, hyperlinks |
| **Warning (Amber)** | Warnings, pending states | Pending status, warning messages |
| **Danger (Red)** | Errors, destructive actions | Delete button, error messages |
| **Accent (Magenta)** | Highlights, special features | Premium features, highlights |

---

## ⚡ Animation Guidelines

### Hover Effects

```tsx
/* Card Hover */
className="transition-all hover:scale-[1.02]"

/* Button Hover */
className="transition-all hover:border-[var(--admin-primary)]/30"

/* Icon Hover */
className="transition-colors hover:text-white"
```

### Transitions

```tsx
/* Standard */
className="transition-all duration-300"

/* Fast */
className="transition-all duration-150"

/* Smooth */
className="transition-all duration-500"
```

---

## 📱 Responsive Patterns

### Grid Layouts

```tsx
/* 1 col mobile, 2 tablet, 4 desktop */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

/* 1 col mobile, 2 desktop */
className="grid grid-cols-1 lg:grid-cols-2 gap-8"

/* 2/3 + 1/3 split */
className="grid grid-cols-1 lg:grid-cols-3 gap-8"
<div className="lg:col-span-2">Main content</div>
<div>Sidebar</div>
```

### Responsive Spacing

```tsx
/* Padding */
className="p-4 md:p-6 lg:p-8"

/* Margin */
className="m-4 md:m-6 lg:m-8"

/* Gap */
className="gap-4 md:gap-6 lg:gap-8"
```

---

## ♿ Accessibility

### Focus States

All interactive elements automatically get focus states:
- Visible outline on keyboard focus
- High contrast for visibility
- Respects `prefers-reduced-motion`

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate
- Escape to close modals/dropdowns

### Screen Readers

```tsx
/* Add aria labels */
<button aria-label="Close menu">
  <X className="h-5 w-5" />
</button>

/* Add alt text */
<img src="..." alt="User profile picture" />
```

---

## 🚀 Performance Tips

### DO ✅

- Use CSS classes instead of inline styles
- Leverage CSS variables for theming
- Use CSS animations (GPU accelerated)
- Lazy load heavy components
- Optimize images with next/image

### DON'T ❌

- Don't use JavaScript for animations
- Don't inline large SVGs
- Don't forget loading states
- Don't ignore reduced motion
- Don't use emojis as icons

---

## 🔧 Common Patterns

### Card with Header

```tsx
<div className="admin-glass-card overflow-hidden">
  <div className="border-b border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-primary)]/10 to-transparent p-6">
    <h2 className="font-['Fira_Code'] text-lg font-bold text-white">
      CARD TITLE
    </h2>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Icon with Badge

```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-primary)]/10 border border-[var(--admin-primary)]/30">
  <Icon className="h-5 w-5 text-[var(--admin-primary)]" />
</div>
```

### List Item with Hover

```tsx
<div className="admin-glass-card flex items-center gap-3 p-3 transition-all hover:scale-[1.02] cursor-pointer">
  {/* Content */}
</div>
```

---

## 📚 Resources

- **Full Documentation**: `ADMIN_FUTURISTIC_REDESIGN.md`
- **Implementation Summary**: `.sisyphus/notepads/admin-futuristic-redesign-summary.md`
- **CSS Theme**: `src/app/admin/admin-theme-futuristic.css`

---

**Quick Tip**: Use browser DevTools to inspect existing components and copy their class names for consistency!
