-- Create AIRTEL GIFTING PROMO table
CREATE TABLE public."AIRTEL GIFTING PROMO" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."AIRTEL GIFTING PROMO" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "AIRTEL GIFTING PROMO data plans are publicly readable" 
ON public."AIRTEL GIFTING PROMO" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."AIRTEL GIFTING PROMO" (size, validity, value, price) VALUES
('500MB', '7Days', 203, 490),
('1.5GB', '7Days', 204, 980),
('3GB', '7Days', 205, 1480),
('4GB', '30Days', 206, 2470),
('6GB', '30Days', 207, 2950),
('10GB', '30Days', 208, 3950),
('13GB', '30Days', 209, 4900),
('18GB', '30days', 311, 5690),
('25GB', '30days', 312, 7860),
('35GB', '30Days', 313, 9850),
('60GB', '30Days', 314, 14700),
('100GB', '30Days', 315, 19700);