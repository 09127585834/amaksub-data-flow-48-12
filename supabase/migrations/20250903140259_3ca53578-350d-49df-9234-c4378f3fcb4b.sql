-- Enable realtime for users table to get balance updates
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;