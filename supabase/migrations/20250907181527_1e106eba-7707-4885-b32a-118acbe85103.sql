-- Create MTN Corporate Gifting data plans table
CREATE TABLE public."MTN COOPORATE GIFTING" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."MTN COOPORATE GIFTING" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (all users can view data plans)
CREATE POLICY "Data plans are publicly readable" 
ON public."MTN COOPORATE GIFTING" 
FOR SELECT 
USING (true);

-- Insert the data plans
INSERT INTO public."MTN COOPORATE GIFTING" (size, validity, value, price) VALUES
('1GB', '1 day plus 1.5mins call', 244, 490),
('3.2GB', '2 days', 246, 980),
('6.7GB', '30 days', 302, 2950),
('14.5GB', '30 days', 303, 5000),
('16.5GB', '30 days plus 10 mins call', 247, 6400);