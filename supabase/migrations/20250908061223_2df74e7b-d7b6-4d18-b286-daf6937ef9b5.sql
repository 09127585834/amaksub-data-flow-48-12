-- Create ELECTRICITY table
CREATE TABLE public."ELECTRICITY" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."ELECTRICITY" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "ELECTRICITY providers are publicly readable" 
ON public."ELECTRICITY" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."ELECTRICITY" (code, description, value) VALUES
('01', 'Eko Electric - EKEDC', 'eko-electric'),
('02', 'Ikeja Electric - IKEDC', 'ikeja-electric'),
('03', 'Abuja Electric - AEDC', 'abuja-electric'),
('04', 'Kano Electric - KEDC', 'kano-electric'),
('05', 'Porthacourt Electric - PHEDC', 'portharcourt-electric'),
('06', 'Jos Electric - JEDC', 'jos-electic'),
('07', 'Ibadan Electric - IBEDC', 'ibadan-electric'),
('08', 'Kaduna Elecdtric - KAEDC', 'Kaduna-electric'),
('09', 'Enugu Electric - EEDC', 'enugu-electric'),
('10', 'Benin Electric - BEDC', 'benin-electric'),
('11', 'Yola Electric - YEDC', 'yola-electric'),
('12', 'Aba Electric - APLE', 'aba-electric');