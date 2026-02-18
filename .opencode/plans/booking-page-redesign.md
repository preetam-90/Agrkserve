# Booking Page UI/UX Redesign Plan

## Goal

Redesign `/equipment/item/[id]/book` page to match the provided desktop and mobile design mockups while preserving all existing business logic.

## Files to Modify

### 1. `src/app/equipment/item/[id]/book/BookEquipmentClient.tsx` (Full rewrite of JSX/styles only)

### 2. `src/components/skeletons/BookingSkeleton.tsx` (Update to match new layout)

## What STAYS THE SAME (zero logic changes)

- All `useState` and `useEffect` hooks
- `loadData()`, `calculatePricing()`, `handleDateSelect()`, `validateForm()`, `handleSubmit()`
- Service calls (`equipmentService`, `bookingService`)
- Auth redirect, date blocking, pricing calculation
- All imports and types
- No new dependencies

---

## Detailed Changes for `BookEquipmentClient.tsx`

### A. Mobile Header Simplification

**Current:** Uses full `<Header />` on all viewports
**New:**

- `lg:hidden` sticky top bar: back arrow button (rounded-full, slate-800 bg) + "Book Equipment" bold title + "Help" green link
- `hidden lg:block` for the full `<Header />`
- Mobile header: `sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-md`

### B. Desktop Top Section

- Breadcrumb: `hidden lg:block`
- Page title: "Book Your Equipment" (h1, 3xl bold white) with subtitle "Confirm your rental period and delivery details to proceed."

### C. Section 1: Select Dates (& Time on desktop)

**Card styling:** `rounded-2xl border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-900/40 shadow-lg`

**Header:**

- Desktop: green numbered badge (1) + "Select Dates & Time"
- Mobile: CalendarIcon (emerald-400) + "Select Dates"
- Right side: "X Days Selected" green pill badge when days > 0

**Calendar:**

- Same `react-day-picker` `Calendar` component, re-styled via `classNames`
- Compact on mobile (h-10 cells), slightly larger on desktop (h-11 cells)
- Day headers: `text-[11px] font-semibold uppercase tracking-widest`
- Month/year caption: `text-sm font-bold uppercase tracking-wider`
- Nav buttons: `rounded-lg bg-slate-800/80 border-slate-700/60`, hover: emerald glow
- Selected: `bg-emerald-500 text-white shadow-md shadow-emerald-500/25`
- Range middle: `bg-emerald-500/15 text-emerald-300`
- Today: `bg-slate-800/80 text-emerald-400 ring-1 ring-emerald-500/40`
- Disabled: `text-slate-700 line-through opacity-40`

**Legend:** Centered row below calendar: Selected (green square) | Range (light green) | Available (gray)

**Time inputs:** `hidden lg:grid grid-cols-2 gap-4` — only visible on desktop. Clock icon + label + `h-12 rounded-xl` time inputs.

### D. Section 2: Delivery Details

**Card styling:** Same as Section 1

**Header:**

- Desktop: green numbered badge (2) + "Delivery Details"
- Mobile: MapPin icon (emerald-400) + "Delivery Details"

**Content:**

- Label: `text-xs font-semibold uppercase tracking-wider text-slate-500` — "FULL ADDRESS & LANDMARK \*"
- Textarea: `rounded-xl border-slate-700/60 bg-slate-900/80`, placeholder: "e.g. Near Shiv Temple, Main Road, Malviya Nagar, Jaipur, Rajasthan - 302017"
- Info banner: `rounded-xl border-emerald-500/20 bg-emerald-500/8` with Info icon + "Free delivery within 15km of your location."
- Additional Notes: `hidden lg:block` — desktop only, same styling

### E. Mobile Order Summary Card (inline, below delivery details)

**Visibility:** `lg:hidden`
**Card styling:** Same rounded-2xl dark card

**Content:**

- Header: CreditCard icon + "Order Summary"
- Equipment preview: rounded-xl bg-slate-800/40 container with:
  - 16x16 thumbnail (rounded-lg)
  - Equipment name (bold white)
  - Specs line: "XX HP · Category"
  - "Verified Equipment" badge with CheckCircle2 icon (emerald)
- Pricing breakdown (border-t above):
  - "Rental Fee (N days)" → amount
  - "Platform Fee" → amount
  - "Delivery & Logistics" → "FREE" in emerald
  - Dashed divider
  - "Total Amount" (bold) → large emerald price
- If no dates selected: "Select dates to see pricing"

### F. Mobile Bottom Section (below Order Summary, inside form)

**Visibility:** `lg:hidden`

- Two-column layout when pricing.days > 0:
  - Left: "PAYABLE AMOUNT" label (10px uppercase tracking) + price (xl bold white)
  - Right: "SECURITY DEPOSIT" label + "₹2,000 Waived" (strikethrough, italic)
- Full-width "Proceed to Payment →" button: `h-13 rounded-2xl bg-emerald-600`, with ArrowRight icon

### G. Desktop Order Summary Sidebar

**Visibility:** `hidden lg:block`
**Positioned:** `sticky top-24`, `space-y-5`

**Main card:**

- Equipment image hero (h-48) with gradient overlay `bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent`
- Text overlay: equipment name (lg bold white) + MapPin + location
- Body (p-5):
  - "ORDER SUMMARY" label (11px bold uppercase tracking-widest)
  - Pricing rows: "Rental Amount (₹X × N days)", "Platform Fee (5%)", "GST on Fee (18%)"
  - "GRAND TOTAL" section: large price (3xl extrabold emerald) + "ALL TAXES INCL." badge
  - "Proceed to Payment" button: full-width, rounded-2xl emerald
  - Shield icon + "Secure checkout via Razorpay Gateway" text below

**Need Help card:**

- Separate card below main card
- Phone icon in emerald circle + "Need help booking?" + clickable phone number (+91 1800-555-0123)

### H. Footer

- Desktop only: `hidden lg:block` wrapping `<Footer />`

---

## New Icons Imported

Add to lucide-react imports: `ArrowRight`, `Shield`, `CheckCircle2`, `Phone`

## Removed Elements

- Date display boxes ("Start Date" / "End Date" readouts)
- "strikethrough info" banner about booked dates
- "Free delivery on this equipment" badge (replaced by info banner)
- Provider Info section in sidebar (not in design)
- AlertCircle info box in sidebar
- Mobile sticky bottom bar (replaced by inline bottom section)
- Mobile bottom spacer div

---

## BookingSkeleton.tsx Updates

Rewrite skeleton to match the new two-column layout:

- Left column: two card skeletons (calendar card, delivery card)
- Right column (desktop): image skeleton + pricing skeleton rows
- Mobile: single column with stacked card skeletons

---

## Verification

After implementation, verify:

1. Page loads without errors
2. Calendar date selection works (single day + range)
3. Booked dates are blocked
4. Pricing updates dynamically
5. Form validation works
6. Submission flow works
7. Mobile layout matches mobile mockup
8. Desktop layout matches desktop mockup
9. All responsive breakpoints are smooth
