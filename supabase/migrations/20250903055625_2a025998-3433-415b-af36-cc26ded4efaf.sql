-- Add welcome_email_sent column to users table
ALTER TABLE public.users ADD COLUMN welcome_email_sent boolean DEFAULT false;