# AgriServe - Detailed UI/UX Style Guide by Page

> **Design Philosophy:** Organic Modernism + Glassmorphism  
> **Target Audience:** Indian Farmers & Agricultural Equipment Providers  
> **Core Values:** Trust, Growth, Community, Technology

---

## **🎨 GLOBAL DESIGN SYSTEM**

### Color Palette
```css
/* Primary - Earth & Growth */
--wheat-gold: #E8B86D        /* Primary CTA, highlights */
--terracotta: #D4754E        /* Secondary actions, warmth */
--forest-green: #2D5A3D      /* Success, agriculture */
--deep-green: #1A3D2E        /* Headers, depth */

/* Backgrounds */
--cream: #FAF7F2             /* Main background */
--warm-white: #FDFCFA        /* Cards, surfaces */
--sage: #E8EDE6              /* Secondary backgrounds */

/* Text */
--charcoal: #2C2416          /* Primary text */
--earth-brown: #5C4A32       /* Secondary text */
--warm-gray: #8B7355         /* Tertiary text */

/* Accents */
--harvest-orange: #F4A261    /* Urgency, warnings */
--sky-blue: #87CEEB          /* Information, links */
--sunset-pink: #E76F51       /* Destructive, alerts */
```

### Typography
```css
/* Headlines - Trust & Authority */
font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
font-weight: 700;
letter-spacing: -0.02em;

/* Body - Readability */
font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
font-weight: 400;
line-height: 1.6;

/* Scale */
--text-hero: 4rem (64px)     /* Landing headlines */
--text-h1: 2.5rem (40px)     /* Page titles */
--text-h2: 2rem (32px)       /* Section headers */
--text-h3: 1.5rem (24px)     /* Card titles */
--text-body: 1rem (16px)     /* Body text */
--text-small: 0.875rem (14px) /* Captions, meta */
```

### Spacing System
```css
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 3rem (48px)
--space-3xl: 4rem (64px)
```

### Component Primitives
```css
/* Cards - Glassmorphism Light */
.card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(232, 184, 109, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(45, 90, 61, 0.08);
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #E8B86D 0%, #D4754E 100%);
  color: white;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(232, 184, 109, 0.3);
}

/* Inputs */
.input {
  background: #FDFCFA;
  border: 2px solid #E8EDE6;
  border-radius: 12px;
  padding: 12px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
  border-color: #E8B86D;
  box-shadow: 0 0 0 3px rgba(232, 184, 109, 0.2);
}
```

---

## **📄 PAGE-BY-PAGE DESIGN SPECIFICATIONS**

---

### **1. LANDING PAGE (`/`)**

**Purpose:** First impression, conversion to signup/browse

**UI Style:** **Cinematic Organic Hero**

| Element | Design Specification |
|---------|---------------------|
| **Hero Section** | Full viewport height, parallax wheat field imagery or video, gradient overlay (transparent to cream), floating glassmorphic stats cards |
| **Headline** | "अपनी फसल, आपका Equipment" (Your Crop, Your Equipment) - Large gradient text (wheat-gold to terracotta) |
| **CTA Buttons** | Primary: "Browse Equipment" (wheat-gold), Secondary: "List Your Machine" (outline with terracotta) |
| **Trust Indicators** | Glass cards showing: "10,000+ Farmers", "5,000+ Machines", "₹50Cr+ Savings" with animated counters |
| **Category Cards** | 3 large cards (Tractors, Harvesters, Labour) with hover tilt effect, gradient borders |
| **Featured Section** | Horizontal scroll carousel with equipment cards, glass overlay on images showing price/location |
| **How It Works** | 4-step timeline with animated connecting line, circular step indicators with icons |
| **Testimonials** | Glass cards with farmer photos, star ratings, quote text |
| **Final CTA** | Full-width section with wheat field background, centered signup form |
| **Footer** | Multi-column with crop pattern background, social icons, app download badges |

**Animations:**
- Hero text: Fade up + stagger (0.1s delay per word)
- Stats: Count up animation on scroll into view
- Cards: Subtle float animation (translateY 0 → -8px)
- Parallax: Background moves at 0.5x scroll speed

---

### **2. ABOUT PAGE (`/about`)**

**Purpose:** Build trust, tell brand story

**UI Style:** **Editorial Storytelling**

| Element | Design Specification |
|---------|---------------------|
| **Hero** | Split layout - left: team/farmer photo, right: mission statement with large quote typography |
| **Story Section** | Timeline of company milestones with alternating left/right layout, connecting vertical line |
| **Values Cards** | 4 glass cards in 2x2 grid: Trust, Community, Growth, Innovation - each with icon + description |
| **Team Section** | Circular profile photos with hover reveal of name/role, organic blob shapes as backgrounds |
| **Stats Row** | Full-width band with animated counters on sage green background |
| **Partners** | Logo grid with grayscale → color on hover |
| **Contact CTA** | Bottom section with map illustration, contact form |

**Color Accent:** Terracotta for warmth, trust-building

---

### **3. CONTACT PAGE (`/contact`)**

**Purpose:** Easy communication channel

**UI Style:** **Clean Functional with Personal Touch**

| Element | Design Specification |
|---------|---------------------|
| **Hero** | Simple centered headline "We're Here to Help" with wheat illustration |
| **Contact Form** | Large, friendly inputs with inline icons, glass card container |
| **Contact Methods** | 3 cards side-by-side: Phone (click-to-call), WhatsApp (green accent), Email |
| **FAQ Accordion** | Expandable sections with smooth height animation, plus/minus icons |
| **Office Location** | Embedded map with custom marker (tractor icon), address card overlay |
| **Social Links** | Circular buttons with platform colors on hover |

**Special Feature:** WhatsApp integration button prominently displayed

---

### **4. EQUIPMENT LISTING PAGE (`/equipment`)**

**Purpose:** Browse and discover equipment

**UI Style:** **Marketplace Grid with Smart Filters**

| Element | Design Specification |
|---------|---------------------|
| **Header** | Sticky search bar with voice search icon, location picker with map pin |
| **Filter Sidebar** | Collapsible on mobile, glass panel with: Categories (checkboxes), Price Range (dual slider), Availability (toggle), Distance (radius), Rating (stars) |
| **Sort Bar** | Dropdown for: Recommended, Price Low-High, Price High-Low, Nearest, Top Rated |
| **Results Grid** | Responsive: 1 col mobile, 2 col tablet, 3 col desktop, 4 col large |
| **Equipment Card** | Image (16:9) with availability badge, title (2 lines max), price per day (large, wheat-gold), location with pin icon, rating stars, owner avatar |
| **Quick View** | Modal on hover/click with image gallery, specs table, instant book button |
| **Pagination** | Load more button with spinner, or infinite scroll |
| **Empty State** | Friendly illustration, "No machines found" with suggestions |

**Card Hover Effect:** Scale 1.02, shadow deepen, image zoom 1.1x

---

### **5. EQUIPMENT DETAIL PAGE (`/equipment/[id]`)**

**Purpose:** Convert browsers to bookers

**UI Style:** **Product Showcase with Trust Signals**

| Element | Design Specification |
|---------|---------------------|
| **Image Gallery** | Main large image with thumbnail strip below, zoom on hover, fullscreen lightbox |
| **Title Bar** | Equipment name (H1), verified badge, share/bookmark buttons |
| **Price Block** | Large price display with "per day", total calculator with date picker |
| **Quick Stats** | Horizontal row: Year, Hours Used, Fuel Type, Condition badges |
| **Owner Card** | Glass card with avatar, name, rating, response time, "Message Owner" button |
| **Description** | Expandable sections: About, Specifications, Features, Usage Guidelines |
| **Availability Calendar** | Interactive calendar showing booked/available dates |
| **Location Map** | Small embedded map with equipment location marked |
| **Reviews Section** | Average rating large display, rating breakdown bars, review cards with photos |
| **Similar Equipment** | Carousel of related items at bottom |
| **Sticky CTA** | Mobile: Bottom bar with price + "Book Now" button |

**Trust Elements:** Verification badges, response rate, member since date

---

### **6. BOOKING PAGE (`/equipment/[id]/book`)**

**Purpose:** Seamless checkout experience

**UI Style:** **Step-by-Step Wizard**

| Element | Design Specification |
|---------|---------------------|
| **Progress Bar** | 3 steps: Dates → Details → Payment, with animated fill |
| **Step 1: Dates** | Large calendar picker, duration display, price breakdown sidebar |
| **Step 2: Details** | Purpose of rental (dropdown), delivery preference (pickup/delivery), special requests textarea |
| **Step 3: Payment** | UPI/Card/Netbanking options, secure payment badge, order summary sticky sidebar |
| **Confirmation** | Success animation (checkmark with confetti), booking details card, next steps |
| **Sidebar** | Equipment summary card with image, owner info, price breakdown |

**UX Priority:** Minimize fields, auto-fill where possible, clear pricing

---

### **7. RENTER DASHBOARD (`/renter/dashboard`)**

**Purpose:** Central hub for renters

**UI Style:** **Personalized Command Center**

| Element | Design Specification |
|---------|---------------------|
| **Welcome Header** | "Good morning, [Name]" with weather widget for their location, date |
| **Quick Actions** | 4 glass cards: Search Equipment, My Bookings, Messages, Favorites |
| **Active Bookings** | Timeline view of upcoming/current rentals with status badges (confirmed, ongoing, completed) |
| **Recent Activity** | Feed of: messages, booking updates, recommendations |
| **Recommendations** | "Based on your searches" carousel with equipment cards |
| **Stats Widget** | Mini cards: Total spent, Days rented, Machines used |
| **Notifications** | Bell icon with red badge, dropdown with recent alerts |

**Personalization:** Show relevant content based on location, history

---

### **8. RENTER BOOKINGS (`/renter/bookings`)**

**Purpose:** Manage all rentals

**UI Style:** **Organized List with Status Clarity**

| Element | Design Specification |
|---------|---------------------|
| **Tabs** | Upcoming | Current | Past | Cancelled |
| **Booking Card** | Horizontal layout: Equipment thumbnail, name + dates, status badge (color-coded), price, action buttons |
| **Status Badges** | 🟢 Confirmed (green), 🔵 Ongoing (blue), 🟡 Pending (yellow), ⚪ Completed (gray), 🔴 Cancelled (red) |
| **Quick Actions** | View Details, Message Owner, Extend Rental, Cancel (if allowed) |
| **Filter/Sort** | Date range, equipment type, status |
| **Empty State** | "No bookings yet" with CTA to browse |

**Card Layout:** Image | Info | Status | Actions

---

### **9. PROVIDER DASHBOARD (`/provider/dashboard`)**

**Purpose:** Business management for equipment owners

**UI Style:** **Analytics-First Business Hub**

| Element | Design Specification |
|---------|---------------------|
| **Revenue Header** | Large earnings display ("₹45,000 this month"), vs last month indicator (↑12%) |
| **Quick Stats** | 4 cards: Total Earnings, Active Listings, Total Bookings, Rating |
| **Chart Section** | Line graph: Earnings over time (last 6 months), bar chart: Bookings by equipment |
| **Recent Bookings** | Table with: Customer, Equipment, Dates, Amount, Status |
| **Equipment Performance** | List of machines with booking rate, earnings, edit buttons |
| **Action Buttons** | Prominent "+ Add Equipment" CTA, "View Analytics" |
| **Alerts** | Pending booking requests, unread messages, low-rated reviews |

**Color Accent:** Forest green for positive metrics, wheat-gold for CTAs

---

### **10. PROVIDER EQUIPMENT (`/provider/equipment`)**

**Purpose:** Manage listings

**UI Style:** **Inventory Management Grid**

| Element | Design Specification |
|---------|---------------------|
| **Header** | "My Equipment" with "+ Add New" button, total count |
| **Filter Bar** | Status: All | Active | Inactive | Under Review |
| **Equipment Card** | Image, name, price/day, status badge, stats (views, bookings), edit/delete actions |
| **Quick Edit** | Inline editing for price, availability toggle |
| **Performance Indicators** | Small sparkline showing views over 7 days |
| **Bulk Actions** | Select multiple, delete, change status |
| **Empty State** | "Start earning" illustration with add equipment CTA |

**Card States:** Active (green border), Inactive (gray), Pending approval (yellow)

---

### **11. LOGIN PAGE (`/login`)**

**Purpose:** Authentication with low friction

**UI Style:** **Warm Welcome with Options**

| Element | Design Specification |
|---------|---------------------|
| **Split Layout** | Left: Illustration of farmer with tractor (warm colors), Right: Login form |
| **Form Container** | Glass card with subtle shadow |
| **Phone Input** | Country code selector + 10-digit input with validation |
| **OTP Flow** | Auto-focus 6 boxes, resend timer (30s), verify button |
| **Social Login** | Google button (prominent), "or continue with phone" divider |
| **Trust Badges** | "Secure login", "256-bit encryption" icons |
| **Footer Links** | Terms, Privacy, Help |

**UX Priority:** One-tap Google login, minimal typing, clear error messages

---

### **12. PROFILE PAGE (`/profile`)**

**Purpose:** Manage personal information

**UI Style:** **Personal Identity Card**

| Element | Design Specification |
|---------|---------------------|
| **Profile Header** | Large circular avatar with edit overlay, name, member since, verification badge |
| **Completion Meter** | Progress bar showing profile completeness ("80% Complete - Add PAN for verification") |
| **Form Sections** | Personal Info, Contact Details, Address, Documents (KYC), Preferences |
| **Photo Upload** | Drag-drop zone with preview, crop functionality |
| **Document Upload** | PAN, Aadhaar upload with verification status |
| **Save Button** | Sticky bottom bar on mobile |

**Visual:** Avatar surrounded by subtle wheat wreath illustration

---

### **13. MESSAGES (`/messages` & `/messages/[id]`)**

**Purpose:** Communication between renters and providers

**UI Style:** **Conversational Chat Interface**

| Element | Design Specification |
|---------|---------------------|
| **Sidebar (Desktop)** | Conversation list with: avatar, name, last message preview, timestamp, unread badge |
| **Chat Header** | Other person's info, online status, call button |
| **Message Bubbles** | Sent: wheat-gold background, Received: white/gray background |
| **Timestamps** | Grouped by date ("Today", "Yesterday") |
| **Input Area** | Text input with attachment (image/location), send button, emoji picker |
| **Quick Replies** | Suggested responses: "Is this available?", "What's the final price?" |
| **Booking Context** | Top banner showing related equipment/booking when relevant |
| **Typing Indicator** | Animated dots when other person is typing |

**Mobile:** Full-screen chat, back button to conversation list

---

### **14. NOTIFICATIONS (`/notifications`)**

**Purpose:** Stay informed of all activities

**UI Style:** **Activity Feed with Priority**

| Element | Design Specification |
|---------|---------------------|
| **Filter Tabs** | All | Bookings | Messages | System |
| **Notification Card** | Icon (colored by type), title, description, timestamp, unread indicator |
| **Types & Colors** | Booking (green), Message (blue), Alert (orange), System (gray) |
| **Actions** | Mark as read, Delete, "View" button |
| **Empty State** | "All caught up!" with relaxing illustration |
| **Settings Link** | "Manage notification preferences" |

**Swipe Actions (Mobile):** Swipe right to mark read, left to delete

---

### **15. ADMIN DASHBOARD (`/admin/dashboard`)**

**Purpose:** Platform oversight and management

**UI Style:** **Professional Data-Heavy Interface**

| Element | Design Specification |
|---------|---------------------|
| **KPI Cards** | 6 metrics: Total Users, Active Listings, Monthly Bookings, Revenue, Disputes, Growth % |
| **Main Chart** | Large area chart: Revenue + Bookings over time |
| **Secondary Charts** | Pie: User types, Bar: Top categories, Line: New registrations |
| **Recent Activity** | Live feed of: new signups, bookings, reviews, disputes |
| **Alerts Panel** | Priority items requiring action (pending verifications, open disputes) |
| **Quick Links** | Grid to all admin sections |
| **Date Range** | Global date picker affecting all charts |

**Color Scheme:** Professional dark sidebar, light content area, accent colors for data

---

### **16. ADMIN USER MANAGEMENT (`/admin/users`)**

**Purpose:** Manage platform users

**UI Style:** **Data Table with Actions**

| Element | Design Specification |
|---------|---------------------|
| **Search & Filter** | Search by name/phone, filter by: role, status, join date, verification |
| **Data Table** | Columns: Avatar+Name, Phone, Role, Status, Joined, Actions |
| **Row Actions** | View profile, Edit, Suspend, Delete (with confirmation) |
| **Bulk Actions** | Select multiple, export CSV, bulk status change |
| **User Card Modal** | Full profile view with activity timeline |
| **Pagination** | 25/50/100 per page, page numbers |

**Status Badges:** Active (green), Suspended (red), Pending (yellow)

---

### **17. HELP PAGE (`/help`)**

**Purpose:** Self-service support

**UI Style:** **Friendly Knowledge Base**

| Element | Design Specification |
|---------|---------------------|
| **Search Hero** | Large search bar "How can we help?" with popular searches below |
| **Category Cards** | 6 glass cards: Getting Started, Bookings, Payments, Equipment, Account, Safety |
| **FAQ Accordion** | Most asked questions with expand/collapse |
| **Video Tutorials** | Thumbnail grid with play buttons, duration |
| **Contact Options** | "Still need help?" with chat, call, email options |
| **Quick Links** | Terms, Privacy, Community Guidelines |

**Visual:** Friendly illustrations, warm colors

---

### **18. TERMS & PRIVACY (`/terms`, `/privacy`)**

**Purpose:** Legal information

**UI Style:** **Readable Document**

| Element | Design Specification |
|---------|---------------------|
| **Header** | Simple, clean with last updated date |
| **Table of Contents** | Sticky sidebar with anchor links (desktop) |
| **Content** | Well-typographed, clear hierarchy, section dividers |
| **Highlight Boxes** | Important info in colored callout boxes |
| **Print Button** | "Download PDF" option |

**Typography:** Maximum readability, generous line-height

---

## **📱 RESPONSIVE BREAKPOINTS**

```css
/* Mobile First */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

**Mobile Adaptations:**
- Cards stack vertically
- Sidebar becomes bottom sheet or hamburger menu
- Tables become cards
- Touch targets minimum 44px
- Reduced animations for performance

---

## **♿ ACCESSIBILITY REQUIREMENTS**

- WCAG 2.1 AA compliance
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators on all interactive elements
- Screen reader labels for icons
- Keyboard navigation support
- Reduced motion preference support
- Hindi language support

---

## **🎭 ANIMATION GUIDELINES**

```css
/* Micro-interactions */
--duration-fast: 150ms;    /* Hover states */
--duration-normal: 300ms;  /* Transitions */
--duration-slow: 500ms;    /* Page transitions */

/* Easing */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
```

**Principles:**
- Purposeful: Every animation guides attention
- Subtle: Enhance, don't distract
- Performant: Use transform/opacity only
- Respectful: Honor `prefers-reduced-motion`

---

## **🚀 IMPLEMENTATION PRIORITY**

### Phase 1: Core Pages (Week 1-2)
1. Landing Page (`/`)
2. Equipment Listing (`/equipment`)
3. Equipment Detail (`/equipment/[id]`)
4. Login (`/login`)

### Phase 2: User Dashboards (Week 3-4)
5. Renter Dashboard (`/renter/dashboard`)
6. Provider Dashboard (`/provider/dashboard`)
7. Bookings Flow (`/bookings`, `/equipment/[id]/book`)

### Phase 3: Supporting Pages (Week 5-6)
8. Profile & Settings
9. Messages
10. Notifications

### Phase 4: Admin (Week 7-8)
11. Admin Dashboard
12. Admin Management Pages

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Design System:** Organic Modernism + Glassmorphism  
**Target Platform:** Web (Responsive)  
**Primary Language:** English + Hindi Support