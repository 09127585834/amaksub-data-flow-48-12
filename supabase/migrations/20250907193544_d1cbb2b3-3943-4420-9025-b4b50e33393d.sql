-- Create GLO GIFTING PROMO table
CREATE TABLE public."GLO GIFTING PROMO" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size TEXT NOT NULL,
  validity TEXT NOT NULL,
  value INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."GLO GIFTING PROMO" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "GLO GIFTING PROMO data plans are publicly readable" 
ON public."GLO GIFTING PROMO" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."GLO GIFTING PROMO" (size, validity, value, price) VALUES
('1.5GB', '1day', 126, 297),
('2.5GB', '2days', 127, 495),
('5GB', '30Days', 157, 1600),
('7.5GB', '30Days', 158, 2550),
('11GB', '30Days', 159, 3050),
('14GB', '30Days', 160, 4050),
('18GB', '30Days', 161, 5020),
('29GB', '30Days', 162, 8050),
('40GB', '30Days', 163, 10000),
('69GB', '30Days', 164, 15100),
('110GB', '30Days', 166, 20100),
('165GB', '30Days', 167, 30500),
('220GB', '30Days', 168, 37000),
('320GB', '60days', 169, 50500),
('380GB', '90days', 170, 60500),
('475GB', '90days', 171, 75500);