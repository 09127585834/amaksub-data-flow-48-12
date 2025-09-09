-- Add biometric registration status to users table
ALTER TABLE public.users 
ADD COLUMN biometric_registered boolean DEFAULT false;