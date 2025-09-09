-- Delete existing MTN GIFTING PROMO data
DELETE FROM "MTN GIFTING PROMO";

-- Insert new VTU NAIJA MTN GIFTING PROMO data
INSERT INTO "MTN GIFTING PROMO" (size, validity, value, price) VALUES
('500MB', '1 day', 1, 380),
('1GB', '7 days', 121, 550),
('2GB', '30 days', 122, 1050),
('3GB', '30 days', 123, 1550),
('5GB', '30 days', 124, 2300),
('6GB', '7 days', 175, 2500),
('12.5GB', '30 days', 178, 5400),
('20GB', '30 days', 248, 7350),
('25GB', '30 days', 249, 8800),
('36GB', '30 days', 250, 10800),
('75GB', '30 days', 251, 17600);