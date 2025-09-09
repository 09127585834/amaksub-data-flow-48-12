-- Create 9Mobile Corporate Gifting data plans table
CREATE TABLE public."9 Mobile COOPORATE GIFTING" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."9 Mobile COOPORATE GIFTING" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (all users can view data plans)
CREATE POLICY "9Mobile data plans are publicly readable" 
ON public."9 Mobile COOPORATE GIFTING" 
FOR SELECT 
USING (true);

-- Insert the 9Mobile data plans
INSERT INTO public."9 Mobile COOPORATE GIFTING" (size, validity, value, price) VALUES
('Basic Plan', '30Days', 182, 200),
('1GB', '30 days', 298, 400),
('2GB', '30Days', 299, 800),
('3GB', '30Days', 303, 1200),
('4GB', '30 days', 347, 1500),
('5GB', '30Days', 304, 1800),
('10GB', '30Days', 305, 3600);