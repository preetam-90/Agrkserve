-- Check if there are any payments in the database
SELECT COUNT(*) as total_payments FROM public.payments;

-- Check if there are any bookings (payments require bookings)
SELECT COUNT(*) as total_bookings FROM public.bookings;

-- Check if there are any equipment (bookings require equipment)
SELECT COUNT(*) as total_equipment FROM public.equipment;

-- View all payments with details
SELECT 
    p.id,
    p.amount,
    p.status,
    p.payment_method,
    p.created_at,
    b.id as booking_id,
    e.name as equipment_name
FROM public.payments p
LEFT JOIN public.bookings b ON p.booking_id = b.id
LEFT JOIN public.equipment e ON b.equipment_id = e.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Check your current user's role
SELECT 
    ur.role,
    ur.is_active,
    up.email
FROM public.user_roles ur
JOIN public.user_profiles up ON ur.user_id = up.id
WHERE ur.user_id = auth.uid();
