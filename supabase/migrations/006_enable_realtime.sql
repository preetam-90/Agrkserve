-- Enable real-time for bookings table
-- This allows subscriptions to receive live updates when bookings are created, updated, or deleted

-- Enable replica identity for real-time subscriptions
-- This ensures the subscription gets the full row data on updates
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Enable real-time publication for bookings table
-- Note: In Supabase Dashboard, you also need to enable Realtime for the bookings table
-- Go to Database → Replication → Enable realtime for 'bookings' table

-- Add comment to remind about Supabase Dashboard configuration
COMMENT ON TABLE public.bookings IS 'Real-time enabled. Remember to enable in Supabase Dashboard: Database → Replication → bookings';

-- Optional: Enable for equipment table as well (for inventory updates)
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
COMMENT ON TABLE public.equipment IS 'Real-time enabled. Remember to enable in Supabase Dashboard: Database → Replication → equipment';

-- Optional: Enable for messages table (for real-time chat)
ALTER TABLE public.messages REPLICA IDENTITY FULL;
COMMENT ON TABLE public.messages IS 'Real-time enabled. Remember to enable in Supabase Dashboard: Database → Replication → messages';

-- Optional: Enable for notifications table (for real-time notifications)
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
COMMENT ON TABLE public.notifications IS 'Real-time enabled. Remember to enable in Supabase Dashboard: Database → Replication → notifications';
