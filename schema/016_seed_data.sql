-- =============================================================================
-- GigShield — Seed Data: Delivery Zones
-- File:    016_seed_data.sql
-- DB:      PostgreSQL 14+
-- Depends: 002_reference_tables.sql
-- =============================================================================

INSERT INTO delivery_zones
  (zone_code, zone_name, city, state, state_code,
   centroid_lat, centroid_lng,
   flood_risk_score, heat_risk_score, aqi_risk_score, civic_risk_score)
VALUES
  ('mumbai_andheri',       'Andheri',         'Mumbai',    'Maharashtra', 'MH', 19.1136, 72.8697, 75, 45, 60, 40),
  ('mumbai_bandra',        'Bandra',          'Mumbai',    'Maharashtra', 'MH', 19.0596, 72.8295, 70, 43, 58, 38),
  ('mumbai_dadar',         'Dadar',           'Mumbai',    'Maharashtra', 'MH', 19.0178, 72.8478, 72, 44, 62, 42),
  ('mumbai_kurla',         'Kurla',           'Mumbai',    'Maharashtra', 'MH', 19.0728, 72.8826, 78, 46, 65, 45),
  ('mumbai_thane',         'Thane',           'Mumbai',    'Maharashtra', 'MH', 19.2183, 72.9781, 68, 47, 55, 30),
  ('delhi_connaught',      'Connaught Place', 'Delhi',     'Delhi',       'DL', 28.6315, 77.2167, 40, 82, 90, 55),
  ('delhi_rohini',         'Rohini',          'Delhi',     'Delhi',       'DL', 28.7041, 77.1025, 38, 85, 92, 50),
  ('delhi_dwarka',         'Dwarka',          'Delhi',     'Delhi',       'DL', 28.5921, 77.0460, 35, 83, 88, 45),
  ('bengaluru_koramangala','Koramangala',     'Bengaluru', 'Karnataka',   'KA', 12.9279, 77.6271, 30, 35, 50, 40),
  ('bengaluru_hsr',        'HSR Layout',      'Bengaluru', 'Karnataka',   'KA', 12.9116, 77.6389, 28, 34, 48, 35),
  ('bengaluru_whitefield', 'Whitefield',      'Bengaluru', 'Karnataka',   'KA', 12.9698, 77.7500, 25, 36, 52, 30),
  ('chennai_tnagar',       'T. Nagar',        'Chennai',   'Tamil Nadu',  'TN', 13.0418, 80.2341, 55, 65, 55, 35),
  ('chennai_velachery',    'Velachery',       'Chennai',   'Tamil Nadu',  'TN', 12.9815, 80.2209, 60, 68, 58, 32),
  ('hyderabad_hitech',     'HITEC City',      'Hyderabad', 'Telangana',   'TS', 17.4435, 78.3772, 35, 70, 60, 30),
  ('hyderabad_secunderabad','Secunderabad',   'Hyderabad', 'Telangana',   'TS', 17.4399, 78.4983, 38, 72, 62, 35),
  ('kolkata_salt_lake',    'Salt Lake',       'Kolkata',   'West Bengal', 'WB', 22.5729, 88.4195, 80, 42, 70, 48),
  ('kolkata_howrah',       'Howrah',          'Kolkata',   'West Bengal', 'WB', 22.5958, 88.2636, 82, 40, 68, 50),
  ('pune_kothrud',         'Kothrud',         'Pune',      'Maharashtra', 'MH', 18.5018, 73.8071, 45, 48, 45, 30),
  ('pune_hinjewadi',       'Hinjewadi',       'Pune',      'Maharashtra', 'MH', 18.5912, 73.7389, 40, 50, 42, 25),
  ('ahmedabad_sg_highway', 'SG Highway',      'Ahmedabad', 'Gujarat',     'GJ', 23.0395, 72.5262, 25, 88, 72, 32);
