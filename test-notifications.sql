-- Test if notification tables exist and create sample data

-- Check if tables exist
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) as notifications_exists,
EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_preferences'
) as preferences_exists;

-- If logged in, create sample notifications
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the first user (you should replace this with your actual user ID)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Create sample notifications if tables exist
        INSERT INTO notifications (
            user_id, title, message, category, event_type, priority, action_url, action_label
        ) VALUES
        (
            v_user_id,
            'Welcome to AgriServe! 🎉',
            'Thank you for joining our platform. Start by listing your equipment or browsing available rentals.',
            'system',
            'system.welcome',
            'normal',
            '/dashboard',
            'Go to Dashboard'
        ),
        (
            v_user_id,
            'New Booking Request',
            'You have received a new booking request for your Tractor JD 5050.',
            'booking',
            'booking.new',
            'high',
            '/provider/bookings',
            'View Request'
        ),
        (
            v_user_id,
            'Payment Received 💰',
            'You received ₹5,000 for the booking of your equipment.',
            'payment',
            'payment.received',
            'normal',
            '/provider/earnings',
            'View Earnings'
        ),
        (
            v_user_id,
            'New Message from Renter',
            'Rajesh Kumar sent you a message regarding your equipment listing.',
            'message',
            'message.new',
            'normal',
            '/messages',
            'View Message'
        ),
        (
            v_user_id,
            'Security Alert ⚠️',
            'A new device logged into your account from Chrome on Windows.',
            'security',
            'security.new_device',
            'critical',
            '/settings/security',
            'Review Activity'
        );
        
        RAISE NOTICE 'Created % sample notifications for user %', 5, v_user_id;
    ELSE
        RAISE NOTICE 'No users found. Please sign up first.';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Show all notifications
SELECT 
    id,
    title,
    category,
    priority,
    is_read,
    created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
