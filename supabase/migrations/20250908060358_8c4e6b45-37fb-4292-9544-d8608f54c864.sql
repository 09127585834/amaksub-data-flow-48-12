-- Clear existing data and update MTN COOPORATE GIFTING table
DELETE FROM public."MTN COOPORATE GIFTING";

-- Insert the new data
INSERT INTO public."MTN COOPORATE GIFTING" (size, validity, value, price) VALUES
('150MB', '30Days', 75, 60),
('250MB', '30Days', 76, 85),
('500MB', '30Days', 77, 190),
('1GB', '30Days', 320, 0),
('2GB', '30Days', 85, 640),
('3GB', '30Days', 86, 950),
('5GB', '30Days', 87, 1600),
('20GB', '30Days', 88, 6250);