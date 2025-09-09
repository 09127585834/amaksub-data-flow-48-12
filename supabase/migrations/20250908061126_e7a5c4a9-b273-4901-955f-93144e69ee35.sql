-- Create GOTV table
CREATE TABLE public."GOTV" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."GOTV" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "GOTV plans are publicly readable" 
ON public."GOTV" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."GOTV" (value, price, description) VALUES
('gotv-max', 8500.00, 'GOtv Max N8,500'),
('gotv-jolli', 5800.00, 'GOtv Jolli N5,800'),
('gotv-jinja', 3900.00, 'GOtv Jinja N3,900'),
('gotv-smallie', 1900.00, 'GOtv Smallie - monthly N1900'),
('gotv-smallie-3months', 5100.00, 'GOtv Smallie - quarterly N5,100'),
('gotv-smallie-1year', 15000.00, 'GOtv Smallie - yearly N15,000'),
('gotv-supa', 11400.00, 'GOtv Supa - monthly N11,400'),
('gotv-supa-plus', 16800.00, 'GOtv Supa Plus - monthly N16,800');