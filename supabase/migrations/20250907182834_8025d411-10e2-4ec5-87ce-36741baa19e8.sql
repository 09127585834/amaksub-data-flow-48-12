-- Create MTN GIFTING PROMO data plans table
CREATE TABLE public."MTN GIFTING PROMO" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."MTN GIFTING PROMO" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (all users can view data plans)
CREATE POLICY "MTN Gifting Promo data plans are publicly readable" 
ON public."MTN GIFTING PROMO" 
FOR SELECT 
USING (true);

-- Insert the MTN GIFTING PROMO data plans
INSERT INTO public."MTN GIFTING PROMO" (size, validity, value, price) VALUES
('500MB', '1 day', 1, 380),
('1GB', '7 days', 121, 550),
('2GB', '30 days', 122, 1050),
('3GB', '30 days', 123, 1550),
('5GB', '30 days', 124, 2300),
('6GB', '7 days', 175, 2500),
('12.5GB', '30 days', 178, 5400),
('20GB', '30 days', 248, 7350),
('25GB', '30 days', 249, 550),
('36GB', '30days', 250, 550),
('75GB', '30 days', 251, 550);