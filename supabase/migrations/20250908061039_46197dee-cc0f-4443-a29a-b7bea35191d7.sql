-- Create DSTV table
CREATE TABLE public."DSTV" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public."DSTV" ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "DSTV plans are publicly readable" 
ON public."DSTV" 
FOR SELECT 
USING (true);

-- Insert the data
INSERT INTO public."DSTV" (value, price, description) VALUES
('dstv-padi', 4400.00, 'DStv Padi N4,400'),
('dstv-yanga', 6000.00, 'DStv Yanga N6,000'),
('dstv-confam', 11000.00, 'Dstv Confam N11,000'),
('dstv79', 19000.00, 'DStv Compact N19,000'),
('dstv3', 44500.00, 'DStv Premium N44,500'),
('dstv7', 30000.00, 'DStv Compact Plus N30,000'),
('dstv9', 69000.00, 'DStv Premium-French N69,000'),
('dstv10', 50500.00, 'DStv Premium-Asia N50,500'),
('confam-extra', 17000.00, 'DStv Confam + ExtraView N17,000'),
('yanga-extra', 12000.00, 'DStv Yanga + ExtraView N12,000'),
('padi-extra', 10400.00, 'DStv Padi + ExtraView N10,400'),
('dstv30', 25000.00, 'DStv Compact + Extra View N25,000'),
('com-frenchtouch', 26000.00, 'DStv Compact + French Touch N26,000'),
('dstv33', 50500.00, 'DStv Premium + Extra View N50,500'),
('com-frenchtouch-extra', 32000.00, 'DStv Compact + French Touch + ExtraView N32,000'),
('dstv43', 54500.00, 'DStv Compact Plus + French Plus N54,500'),
('complus-frenchtouch', 37000.00, 'DStv Compact Plus + French Touch N37,000'),
('dstv45', 36000.00, 'DStv Compact Plus + Extra View N36,000'),
('complus-french-extraview', 60500.00, 'DStv Compact Plus + FrenchPlus + Extra View N60,500'),
('dstv47', 43500.00, 'DStv Compact + French Plus N43,500'),
('dstv62', 75000.00, 'DStv Premium + French + Extra View N75,000'),
('frenchplus-addon', 24500.00, 'DStv French Plus Add-on N24,500'),
('dstv-greatwall', 3800.00, 'DStv Great Wall Standalone Bouquet N3,800'),
('frenchtouch-addon', 7000.00, 'DStv French Touch Add-on N7,000'),
('extraview-access', 6000.00, 'ExtraView Access N6,000'),
('dstv-yanga-showmax', 7750.00, 'DStv Yanga + Showmax N7,750'),
('dstv-greatwall-showmax', 7300.00, 'DStv Great Wall Standalone Bouquet + Showmax N7,300'),
('dstv-compact-plus-showmax', 31750.00, 'DStv Compact Plus + Showmax N31,750'),
('dstv-confam-showmax', 12750.00, 'Dstv Confam + Showmax N12,750'),
('dstv-compact-showmax', 20750.00, 'DStv Compact + Showmax N20,750'),
('dstv-padi-showmax', 7900.00, 'DStv Padi + Showmax N7,900'),
('dstv-asia-showmax', 18400.00, 'DStv Asia + Showmax N18,400'),
('dstv-premium-french-showmax', 69000.00, 'DStv Premium + French + Showmax N69,000'),
('dstv-premium-showmax', 44500.00, 'DStv Premium + Showmax N44,500'),
('dstv-indian', 14900.00, 'DStv Indian N14,900'),
('dstv-premium-indian', 16530.00, 'DStv Premium East Africa and Indian N16,530'),
('dstv-fta-plus', 1600.00, 'DStv FTA Plus N1,600'),
('dstv-premium-hd', 39000.00, 'DStv PREMIUM HD N39,000'),
('dstv-access-1', 2000.00, 'DStv Access N2,000'),
('dstv-family-1', 4000.00, 'DStv Family'),
('dstv-indian-add-on', 14900.00, 'DStv India Add-on N14,900'),
('dstv-mobile-1', 790.00, 'DSTV MOBILE N790'),
('dstv-movie-bundle-add-on', 3500.00, 'DStv Movie Bundle Add-on N3,500'),
('dstv-pvr-access', 4000.00, 'DStv PVR Access Service N4,000'),
('dstv-premium-wafr-showmax', 50500.00, 'DStv Premium W/Afr + Showmax N50,500');