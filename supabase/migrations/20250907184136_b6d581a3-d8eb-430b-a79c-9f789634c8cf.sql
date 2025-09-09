-- Create GLO COOPORATE GIFTING table
CREATE TABLE public."GLO COOPORATE GIFTING" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."GLO COOPORATE GIFTING" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "GLO data plans are publicly readable" 
ON public."GLO COOPORATE GIFTING" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."GLO COOPORATE GIFTING" (size, validity, value, price) VALUES
('200MB', '14 days', 200, 100),
('500MB', '30 days', 500, 200),
('1GB', '30 days', 1007, 400),
('2GB', '30 days', 2000, 800),
('3GB', '30 days', 3000, 1205),
('5GB', '30 days', 5000, 2010),
('10GB', '30 days', 10000, 4035);