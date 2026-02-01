# Invoice Components Integration Guide

## Installation

First, install the required dependency:

```bash
bun install
```

This will install `@react-pdf/renderer` which was just added to package.json.

## Integration Example

### 1. Import the Component

Add the import to your bookings page (e.g., `/src/app/renter/bookings/page.tsx`):

```tsx
import { DownloadInvoiceButton } from '@/components/invoice';
import { FileText } from 'lucide-react'; // Add this if not already imported
```

### 2. Add the Download Button

Find the booking card actions section and add the Download Invoice button.

**Location:** Look for the section around line 706-745 where buttons are rendered for completed bookings.

**Current code:**

```tsx
<div className="flex items-center gap-3">
  {booking.status === 'completed' && (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // ... review button logic
        }}
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
      >
        <Star className="mr-1.5 h-4 w-4" />
        Write Review
      </Button>
    </motion.div>
  )}
  {/* ... chevron icon */}
</div>
```

**Add the Download Invoice button right after the review button (around line 737):**

```tsx
<div className="flex items-center gap-3">
  {booking.status === 'completed' && (
    <>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // ... review button logic
          }}
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
        >
          <Star className="mr-1.5 h-4 w-4" />
          Write Review
        </Button>
      </motion.div>

      {/* ADD THIS: Download Invoice Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DownloadInvoiceButton
          booking={booking}
          variant="outline"
          size="sm"
          onDownloadStart={() => {
            toast.success('Generating invoice...', { icon: '📄' });
          }}
          onDownloadComplete={() => {
            toast.success('Invoice downloaded!', { icon: '✅' });
          }}
          onError={(error) => {
            toast.error('Failed to generate invoice');
            console.error('Invoice generation error:', error);
          }}
          className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
        />
      </motion.div>
    </>
  )}
  {/* ... chevron icon */}
</div>
```

### 3. Alternative: Show for All Confirmed/Completed Bookings

If you want to show the invoice button for all confirmed bookings (not just completed):

```tsx
{
  (booking.status === 'completed' || booking.status === 'confirmed') && (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <DownloadInvoiceButton booking={booking} variant="primary" size="sm" />
    </motion.div>
  );
}
```

### 4. Provider Dashboard Integration

For the provider dashboard, add to `/src/app/provider/bookings/page.tsx`:

```tsx
import { DownloadInvoiceButton } from '@/components/invoice';

// In the booking actions section:
<DownloadInvoiceButton
  booking={booking}
  variant="outline"
  size="sm"
  className="border-gray-600 bg-gray-800 text-white"
/>;
```

## Component Props Reference

### DownloadInvoiceButton Props

| Prop                 | Type                                               | Default     | Description                         |
| -------------------- | -------------------------------------------------- | ----------- | ----------------------------------- |
| `booking`            | `Booking & { equipment?, renter?, provider? }`     | required    | The booking data                    |
| `variant`            | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Button style variant                |
| `size`               | `'sm' \| 'md' \| 'lg'`                             | `'md'`      | Button size                         |
| `className`          | `string`                                           | undefined   | Additional CSS classes              |
| `onDownloadStart`    | `() => void`                                       | undefined   | Callback when PDF generation starts |
| `onDownloadComplete` | `() => void`                                       | undefined   | Callback when download completes    |
| `onError`            | `(error: Error) => void`                           | undefined   | Callback on error                   |

### Button Variants

- **primary**: Emerald gradient with white text (best for primary actions)
- **secondary**: Dark gray with border (subtle, professional)
- **outline**: Transparent with border (minimal)
- **ghost**: Hover effect only (very minimal)

## Customization

### Modify Invoice Design

Edit `/src/components/invoice/InvoicePDF.tsx` to customize:

- **Colors**: Change `BRAND_COLOR`, `DARK_BG`, etc.
- **Logo**: Replace the emoji in `logoPlaceholder` with your actual logo
- **Sections**: Add/remove sections in the main component
- **Currency**: Already set to INR (Indian Rupees)

### Example: Add Your Logo

```tsx
// Instead of emoji, use an image (requires registering the font/image)
import { Image } from '@react-pdf/renderer';

// In HeaderSection:
<Image src="/path/to/logo.png" style={{ width: 60, height: 60 }} />;
```

### Example: Add QR Code

```bash
bun add qrcode
```

```tsx
import QRCode from 'qrcode';
import { Image } from '@react-pdf/renderer';

// Generate QR code in component
const qrCodeUrl = await QRCode.toDataURL(`https://agriserve.com/bookings/${booking.id}`);

// In FooterSection:
<Image src={qrCodeUrl} style={{ width: 80, height: 80 }} />;
```

## Testing

After integration:

1. Navigate to your bookings page
2. Find a completed booking
3. Click "Download Invoice"
4. Verify the PDF downloads and contains:
   - AgriServe branding
   - Booking details
   - Equipment information
   - Price breakdown
   - PAID status badge
   - Provider and renter details

## Troubleshooting

### "Cannot find module '@react-pdf/renderer'"

Run: `bun install`

### PDF not generating

- Check browser console for errors
- Ensure booking data has all required fields
- Verify the component is used in a Client Component ('use client')

### Styling issues

- PDFs use React-PDF's StyleSheet (not Tailwind)
- Check the styles object in InvoicePDF.tsx
- Note: Not all CSS properties are supported

## File Structure

```
src/components/invoice/
├── InvoicePDF.tsx           # PDF document component
├── DownloadInvoiceButton.tsx # Download button with loading states
└── index.ts                 # Barrel exports
```

All components are exported from the barrel file for clean imports:

```tsx
import { InvoicePDF, DownloadInvoiceButton } from '@/components/invoice';
```
