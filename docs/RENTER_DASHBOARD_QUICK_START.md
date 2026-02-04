# Renter Dashboard - Quick Start Guide

## 🚀 Getting Started

### View the Dashboard

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the dashboard:**
   ```
   http://localhost:3001/dashboard
   ```

3. **Login as a renter** to see the new design

## 🎨 Design Features

### Dark Theme
The dashboard uses a professional OLED dark theme with:
- Deep black background (`#020617`)
- Emerald green accents (`#22C55E`)
- Glassmorphism effects
- Smooth animations

### Key Sections

#### 1. Welcome Header
- Personalized greeting
- Location display
- Quick access buttons (Notifications, Settings)

#### 2. Search Bar
- Large, prominent search
- Integrated filter button
- Smooth focus animations

#### 3. Stats Dashboard (4 Cards)
- 💰 Total Spent
- 📅 Active Bookings
- ✅ Completed
- ❤️ Saved Items

#### 4. Quick Actions (6 Cards)
- 🚜 Browse Equipment
- 👥 Hire Labour
- 📅 My Bookings
- 💬 Messages
- 📊 Activity
- ❤️ Favorites

#### 5. Recent Activity
- Visual booking timeline
- Equipment details
- Status badges
- Price display

#### 6. Category Browser
- 8 equipment categories
- Visual icons
- Hover animations

#### 7. Available Equipment
- High-quality images
- Availability badges
- Price per day
- Star ratings

## 🛠️ Customization

### Change Colors

Edit the color variables in the component:

```typescript
// Primary gradient
className="bg-gradient-to-r from-emerald-500 to-green-500"

// Change to blue:
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

### Modify Stats

Add or remove stats in the stats array:

```typescript
{
  icon: YourIcon,
  value: yourValue,
  label: 'Your Label',
  change: 'Your change text',
  trend: 'up' | 'down' | 'neutral',
  bgGradient: 'from-color-500/10 to-color-500/10',
  iconBg: 'from-color-500 to-color-500',
}
```

### Add Quick Actions

Add new actions to the quick actions array:

```typescript
{
  icon: YourIcon,
  title: 'Your Title',
  description: 'Your description',
  href: '/your-route',
  gradient: 'from-color-500 to-color-500',
}
```

## 📱 Responsive Behavior

### Mobile (< 768px)
- 1 column layout
- Stacked cards
- Simplified navigation

### Tablet (768px - 1023px)
- 2 column layout
- Balanced spacing

### Desktop (1024px+)
- 3-4 column layout
- Full feature display

## 🔧 Development

### Component Location
```
src/components/dashboard/EnhancedRenterDashboard.tsx
```

### Main Features
- Real-time updates via Supabase
- Framer Motion animations
- Responsive grid layouts
- Loading states
- Empty states

### State Management
```typescript
const [nearbyEquipment, setNearbyEquipment] = useState<Equipment[]>([]);
const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
const [stats, setStats] = useState({...});
```

### Real-time Subscriptions
```typescript
// Automatically updates when bookings change
channel = supabase
  .channel('renter-dashboard-bookings')
  .on('postgres_changes', {...})
  .subscribe();
```

## 🎯 Key Interactions

### Hover Effects
- Cards lift on hover (`hover:-translate-y-2`)
- Icons rotate and scale
- Gradients reveal
- Shadows intensify

### Click Actions
- All cards are clickable
- Navigate to relevant pages
- Smooth transitions

### Animations
- Staggered reveal on load
- Smooth transitions (150-300ms)
- Icon animations
- Gradient transitions

## 🐛 Troubleshooting

### Dashboard not loading?
1. Check if user is logged in
2. Verify user has 'renter' role
3. Check console for errors

### Stats showing 0?
1. Ensure bookings exist in database
2. Check Supabase connection
3. Verify RLS policies

### Images not loading?
1. Check image URLs
2. Verify Cloudinary/storage setup
3. Check CORS settings

### Real-time not working?
1. Verify Supabase realtime is enabled
2. Check subscription setup
3. Ensure RLS policies allow access

## 📚 Documentation

### Full Documentation
- **Design System:** `design-system/renter-dashboard/MASTER.md`
- **Implementation:** `design-system/renter-dashboard/IMPLEMENTATION_SUMMARY.md`
- **Overview:** `RENTER_DASHBOARD_REDESIGN.md`

### Related Components
- `src/components/dashboard/RenterDashboardView.tsx` (original)
- `src/components/dashboard/ProviderDashboardView.tsx`
- `src/components/dashboard/LabourDashboardView.tsx`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Dashboard loads correctly
- [ ] Stats display accurate data
- [ ] Search works
- [ ] All links navigate correctly
- [ ] Hover effects work
- [ ] Animations are smooth
- [ ] Responsive on mobile
- [ ] Real-time updates work

### Test Data
Create test bookings to see:
- Active bookings in stats
- Recent activity timeline
- Total spent calculation

## 🎨 Design Tokens

### Colors
```css
--primary: #0F172A
--secondary: #1E293B
--accent: #22C55E
--background: #020617
--text: #F8FAFC
```

### Spacing
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```

## 🚀 Deployment

### Before Deploying
1. Run TypeScript check: `npm run type-check`
2. Run linter: `npm run lint`
3. Test on multiple browsers
4. Test on mobile devices
5. Verify all links work
6. Check performance metrics

### Production Build
```bash
npm run build
npm start
```

## 💡 Tips

### Performance
- Images are lazy loaded
- Use Next.js Image component
- Optimize animations
- Minimize re-renders

### Accessibility
- All interactive elements have `cursor-pointer`
- Focus states are visible
- Color contrast meets WCAG AA
- Keyboard navigation works

### UX
- Loading states prevent confusion
- Empty states guide users
- Error messages are helpful
- Success feedback is clear

## 🎉 Success!

You now have a modern, feature-rich renter dashboard with:
- ✅ Professional dark theme
- ✅ Comprehensive stats
- ✅ Quick action access
- ✅ Real-time updates
- ✅ Smooth animations
- ✅ Mobile responsive

**Happy coding!** 🚀
