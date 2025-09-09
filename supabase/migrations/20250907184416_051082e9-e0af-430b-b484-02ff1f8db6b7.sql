-- Create AIRTEL SME table
CREATE TABLE public."AIRTEL SME" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."AIRTEL SME" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "AIRTEL SME data plans are publicly readable" 
ON public."AIRTEL SME" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."AIRTEL SME" (size, validity, value, price) VALUES
('300MB', '2 days', 476, 140),
('600MB', '2 days', 478, 225),
('1GB', '3days (Social)', 479, 350),
('1.5GB', '1day', 484, 420),
('2GB', '1 day', 480, 520),
('3GB', '2 days', 485, 780),
('3.5GB', '7 days', 481, 1550),
('7GB', '7 days', 482, 2100),
('10GB', '30 days', 483, 3100);