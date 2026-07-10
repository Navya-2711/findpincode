-- Seed sample pincode data

INSERT INTO pincodes (pincode, office_name, office_type, delivery, division, region, circle, taluk, district_name, state_name, telephone, related_suboffice, related_headoffice, longitude, latitude) VALUES
-- Delhi
('110001', 'New Delhi GPO', 'H.O', 'Delivery', 'Delhi', 'North', 'Delhi', 'Delhi', 'New Delhi', 'Delhi', NULL, NULL, NULL, 77.2195, 28.6139),
('110002', 'Connaught Place', 'S.O', 'Delivery', 'Delhi', 'North', 'Delhi', 'Delhi', 'New Delhi', 'Delhi', NULL, NULL, 'New Delhi GPO', 77.2215, 28.6315),
('110003', 'Kasturba Nagar', 'S.O', 'Delivery', 'Delhi', 'North', 'Delhi', 'Delhi', 'New Delhi', 'Delhi', NULL, NULL, 'New Delhi GPO', 77.2300, 28.5900),
('110004', 'East Delhi', 'S.O', 'Delivery', 'Delhi', 'North', 'Delhi', 'Delhi', 'East Delhi', 'Delhi', NULL, NULL, 'East Delhi GPO', 77.3000, 28.5500),
('110005', 'South Delhi', 'S.O', 'Delivery', 'Delhi', 'North', 'Delhi', 'Delhi', 'South Delhi', 'Delhi', NULL, NULL, 'South Delhi GPO', 77.1600, 28.5200),

-- Maharashtra
('400001', 'Mumbai GPO', 'H.O', 'Delivery', 'Mumbai', 'West', 'Mumbai', 'Mumbai', 'Mumbai', 'Maharashtra', NULL, NULL, NULL, 72.8777, 19.0760),
('400002', 'Fort', 'S.O', 'Delivery', 'Mumbai', 'West', 'Mumbai', 'Mumbai', 'Mumbai', 'Maharashtra', NULL, NULL, 'Mumbai GPO', 72.8347, 18.9653),
('400003', 'Marine Drive', 'S.O', 'Delivery', 'Mumbai', 'West', 'Mumbai', 'Mumbai', 'Mumbai', 'Maharashtra', NULL, NULL, 'Mumbai GPO', 72.8265, 18.9520),
('411001', 'Pune GPO', 'H.O', 'Delivery', 'Pune', 'West', 'Pune', 'Pune', 'Pune', 'Maharashtra', NULL, NULL, NULL, 73.8456, 18.5204),
('411002', 'Camp', 'S.O', 'Delivery', 'Pune', 'West', 'Pune', 'Pune', 'Pune', 'Maharashtra', NULL, NULL, 'Pune GPO', 73.8600, 18.5100),

-- Karnataka
('560001', 'Bangalore GPO', 'H.O', 'Delivery', 'Bangalore', 'South', 'Bangalore', 'Bangalore', 'Bengaluru Urban', 'Karnataka', NULL, NULL, NULL, 77.5946, 12.9716),
('560002', 'Ashok Nagar', 'S.O', 'Delivery', 'Bangalore', 'South', 'Bangalore', 'Bangalore', 'Bengaluru Urban', 'Karnataka', NULL, NULL, 'Bangalore GPO', 77.6000, 12.9800),
('560003', 'Koramangala', 'S.O', 'Delivery', 'Bangalore', 'South', 'Bangalore', 'Bangalore', 'Bengaluru Urban', 'Karnataka', NULL, NULL, 'Bangalore GPO', 77.6400, 12.9350),

-- West Bengal
('700001', 'Kolkata GPO', 'H.O', 'Delivery', 'Kolkata', 'East', 'Kolkata', 'Kolkata', 'Kolkata', 'West Bengal', NULL, NULL, NULL, 88.3639, 22.5726),
('700002', 'Dalhousie', 'S.O', 'Delivery', 'Kolkata', 'East', 'Kolkata', 'Kolkata', 'Kolkata', 'West Bengal', NULL, NULL, 'Kolkata GPO', 88.3700, 22.5600),
('700003', 'Park Circus', 'S.O', 'Delivery', 'Kolkata', 'East', 'Kolkata', 'Kolkata', 'Kolkata', 'West Bengal', NULL, NULL, 'Kolkata GPO', 88.3650, 22.5500),

-- Tamil Nadu
('600001', 'Chennai GPO', 'H.O', 'Delivery', 'Chennai', 'South', 'Chennai', 'Chennai', 'Chennai', 'Tamil Nadu', NULL, NULL, NULL, 80.2707, 13.0488),
('600002', 'Anna Salai', 'S.O', 'Delivery', 'Chennai', 'South', 'Chennai', 'Chennai', 'Chennai', 'Tamil Nadu', NULL, NULL, 'Chennai GPO', 80.2600, 13.0400),
('600003', 'Nungambakkam', 'S.O', 'Delivery', 'Chennai', 'South', 'Chennai', 'Chennai', 'Chennai', 'Tamil Nadu', NULL, NULL, 'Chennai GPO', 80.2500, 13.0350),

-- Telangana
('500001', 'Hyderabad GPO', 'H.O', 'Delivery', 'Hyderabad', 'South', 'Hyderabad', 'Hyderabad', 'Hyderabad', 'Telangana', NULL, NULL, NULL, 78.4744, 17.3850),
('500002', 'Secunderabad', 'S.O', 'Delivery', 'Hyderabad', 'South', 'Hyderabad', 'Hyderabad', 'Hyderabad', 'Telangana', NULL, NULL, 'Hyderabad GPO', 78.5030, 17.3633),
('500003', 'Banjara Hills', 'S.O', 'Delivery', 'Hyderabad', 'South', 'Hyderabad', 'Hyderabad', 'Hyderabad', 'Telangana', NULL, NULL, 'Hyderabad GPO', 78.4450, 17.3930),

-- Gujarat
('380001', 'Ahmedabad GPO', 'H.O', 'Delivery', 'Ahmedabad', 'West', 'Ahmedabad', 'Ahmedabad', 'Ahmedabad', 'Gujarat', NULL, NULL, NULL, 72.5797, 23.0225),
('380002', 'Civil Lines', 'S.O', 'Delivery', 'Ahmedabad', 'West', 'Ahmedabad', 'Ahmedabad', 'Ahmedabad', 'Gujarat', NULL, NULL, 'Ahmedabad GPO', 72.5900, 23.0300),
('380003', 'Vastrapur', 'S.O', 'Delivery', 'Ahmedabad', 'West', 'Ahmedabad', 'Ahmedabad', 'Ahmedabad', 'Gujarat', NULL, NULL, 'Ahmedabad GPO', 72.5500, 23.0100);
