# Fix Payments Admin Access

## Problem
The admin payments page at `/admin/payments` shows "No payments found" even when there are payments in the database.

## Root Cause
The Row Level Security (RLS) policies on the `payments` table only allowed users to view payments related to their own bookings. Admins were not granted permission to view all payments.

## Solution
Created migration `027_fix_payments_admin_access.sql` that:

1. **Updates the SELECT policy** to allow admins to view all payments
2. **Adds UPDATE policy** for admins to modify payment records
3. **Adds DELETE policy** for admins to remove payment records

## How to Apply

### Option 1: Using the Script (Recommended)
```bash
./scripts/fix-payments-access.sh
```

### Option 2: Manual Application
```bash
supabase db push
```

### Option 3: Direct SQL (If using Supabase Dashboard)
Run the SQL from `supabase/migrations/027_fix_payments_admin_access.sql` in your Supabase SQL Editor.

## What Changed

### Before
```sql
CREATE POLICY "Users can view related payments"
    ON public.payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT renter_id FROM public.bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM public.equipment 
            WHERE id IN (SELECT equipment_id FROM public.bookings WHERE id = booking_id)
        )
    );
```

### After
```sql
CREATE POLICY "Users can view related payments"
    ON public.payments FOR SELECT
    USING (
        -- Allow admins to view all payments
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
        OR
        -- Allow users to view their own payments
        auth.uid() IN (
            SELECT renter_id FROM public.bookings WHERE id = booking_id
            UNION
            SELECT owner_id FROM public.equipment 
            WHERE id IN (SELECT equipment_id FROM public.bookings WHERE id = booking_id)
        )
    );
```

## Verification

After applying the migration:

1. Log in as an admin user
2. Navigate to `/admin/payments`
3. You should now see all payment records in the database

## Security Notes

- Only users with an active `admin` role in the `user_roles` table can access all payments
- Regular users can still only see their own payments
- The policy maintains data privacy while granting necessary admin access

## Related Files

- Migration: `supabase/migrations/027_fix_payments_admin_access.sql`
- Script: `scripts/fix-payments-access.sh`
- Page: `src/app/admin/payments/page.tsx`
