-- Create MTN SME table
CREATE TABLE public."MTN SME" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."MTN SME" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "MTN SME data plans are publicly readable" 
ON public."MTN SME" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."MTN SME" (size, validity, value, price) VALUES
('500MB', '30 days', 179, 430),
('1GB', '30 days', 166, 630),
('2GB', '30 days', 167, 1250),
('3GB', '30 days', 168, 1800),
('5GB', '30 days', 357, 2700);