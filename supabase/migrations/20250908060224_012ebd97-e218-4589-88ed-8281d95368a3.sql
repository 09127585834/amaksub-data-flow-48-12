-- Create MTN GIFTING table with correct column order
CREATE TABLE public."MTN GIFTING" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  price INTEGER NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."MTN GIFTING" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "MTN GIFTING data plans are publicly readable" 
ON public."MTN GIFTING" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."MTN GIFTING" (size, validity, price, value) VALUES
('500MB', '1day', 350, 141),
('1GB', '1day', 500, 142),
('2.5GB', '2days', 900, 144),
('3.2GB', '2Days', 1000, 145),
('6GB', '7Days', 2460, 146),
('7GB', '30Days', 3500, 147),
('1GB', '30Days', 800, 149),
('2GB', '30Days', 1480, 150),
('2.7GB', '30Days', 1980, 151),
('3.5GB', '30Days', 2470, 152),
('10GB', '30Days', 4500, 153),
('12.5GB', '30Days', 5450, 154),
('14.5GB', '30Days', 4950, 155),
('16.5GB', '30Days', 6450, 156),
('40GB', '60days', 9000, 157),
('36GB', '30Days', 10900, 158);