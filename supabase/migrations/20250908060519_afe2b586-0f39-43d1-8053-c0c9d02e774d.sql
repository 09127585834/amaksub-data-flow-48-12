-- Create MTN DATA CARD SME table
CREATE TABLE public."MTN DATA CARD SME" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  price INTEGER NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."MTN DATA CARD SME" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "MTN DATA CARD SME data plans are publicly readable" 
ON public."MTN DATA CARD SME" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."MTN DATA CARD SME" (size, validity, price, value) VALUES
('500MB', '30Days', 150, 2),
('1GB', '30Days', 250, 3),
('1.5GB', '30Days', 310, 1),
('2GB', '30Days', 480, 4),
('3GB', '30Days', 660, 5),
('5GB', '30Days', 1100, 6),
('10GB', '30Days', 2250, 7);