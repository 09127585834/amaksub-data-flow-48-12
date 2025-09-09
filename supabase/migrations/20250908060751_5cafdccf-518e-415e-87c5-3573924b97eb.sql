-- Create AIRTEL DATA CARD COOPORATE GIFTING table
CREATE TABLE public."AIRTEL DATA CARD COOPORATE GIFTING" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  price INTEGER NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."AIRTEL DATA CARD COOPORATE GIFTING" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "AIRTEL DATA CARD COOPORATE GIFTING data plans are publicly readable" 
ON public."AIRTEL DATA CARD COOPORATE GIFTING" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."AIRTEL DATA CARD COOPORATE GIFTING" (size, validity, price, value) VALUES
('500MB', '30Days', 135, 8),
('1GB', '30Days', 240, 9),
('2GB', '30Days', 420, 10),
('5GB', '30Days', 1250, 11),
('10GB', '30Days', 2250, 12);