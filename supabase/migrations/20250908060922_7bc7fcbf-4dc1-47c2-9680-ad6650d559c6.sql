-- Create STARTIMES table
CREATE TABLE public."STARTIMES" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."STARTIMES" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "STARTIMES plans are publicly readable" 
ON public."STARTIMES" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."STARTIMES" (value, price, description) VALUES
('nova', 2100.00, 'Nova (Dish) - 1 Month'),
('basic', 4000.00, 'Basic (Antenna) - 4,000 Naira - 1 Month'),
('smart', 5100.00, 'Basic (Dish) - 5,100 Naira - 1 Month'),
('classic', 6000.00, 'Classic (Antenna) - 1 Month'),
('super', 9800.00, 'Super (Dish) - 9,800 Naira - 1 Month'),
('nova-weekly', 700.00, 'Nova (Antenna) - 1 Week'),
('basic-weekly', 1400.00, 'Basic (Antenna) - 1 Week'),
('smart-weekly', 1700.00, 'Basic (Dish) - 1,700 Naira - 1 Week'),
('classic-weekly', 2000.00, 'Classic (Antenna) - 1 Week'),
('super-weekly', 3300.00, 'Super (Dish) - 3,300 Naira - 1 Week'),
('uni-1', 21000.00, 'Chinese (Dish) - 21,000 Naira - 1 month'),
('uni-2', 2100.00, 'Nova (Antenna) - 2,100 Naira - 1 Month'),
('special-weekly', 2300.00, 'Classic (Dish) - 1 Week'),
('special-monthly', 7400.00, 'Classic (Dish) - 1 Month'),
('nova-dish-weekly', 700.00, 'Nova (Dish) - 1 Week'),
('super-antenna-weekly', 3200.00, 'Super (Antenna) - 3,200 Naira - 1 Week'),
('super-antenna-monthly', 9500.00, 'Super (Antenna) - 9,500 Naira - 1 Month'),
('classic-weekly-dish', 2500.00, 'Classic (Dish) - 1 Week'),
('global-monthly-dish', 21000.00, 'Global (Dish) - 1 Month'),
('global-weekly-dish', 7000.00, 'Global (Dish) - 1Week'),
('shs-weekly-2800', 2800.00, 'Startimes SHS - 2,800 Naira - Weekly'),
('shs-weekly-4620', 4620.00, 'Startimes SHS - 4,620 Naira - Weekly'),
('shs-weekly-4900', 4900.00, 'Startimes SHS - 4,900 Naira - Weekly'),
('shs-weekly-9100', 9100.00, 'Startimes SHS - 9,100 Naira - Weekly'),
('shs-monthly-12000', 12000.00, 'Startimes SHS - 12,000 Naira - Monthly'),
('shs-monthly-19800', 19800.00, 'Startimes SHS - 19,800 Naira - Monthly'),
('shs-monthly-21000', 21000.00, 'Startimes SHS - 21,000 Naira - Monthly'),
('shs-monthly-39000', 39000.00, 'Startimes SHS - 39,000 Naira - Monthly');