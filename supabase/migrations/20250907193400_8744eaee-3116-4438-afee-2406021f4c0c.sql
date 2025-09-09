-- Create 9 MOBILE SME table
CREATE TABLE public."9 MOBILE SME" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."9 MOBILE SME" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "9 MOBILE SME data plans are publicly readable" 
ON public."9 MOBILE SME" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."9 MOBILE SME" (size, validity, value, price) VALUES
('500MB', '30Days', 34, 150),
('1GB', '30Days', 35, 250),
('2GB', '30Days', 36, 350),
('3GB', '30Days', 37, 450),
('4GB', '30Days', 68, 550),
('6.2GB', '30Days (2.2GB+4GB Night)', 224, 1300),
('9.5GB', '30Days (5.5GB+4GB Night)', 225, 2300),
('15GB', '30Days', 226, 3000),
('20GB', '30Days', 69, 3100),
('35GB', '30Days', 228, 7200),
('50GB', '30Days', 229, 10100),
('80GB', '30Days', 230, 15200),
('125GB', '30Days', 231, 20100);