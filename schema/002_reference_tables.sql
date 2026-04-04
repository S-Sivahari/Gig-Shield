-- =============================================================================
-- GigShield — Reference / Lookup Tables
-- File:    002_reference_tables.sql
-- DB:      PostgreSQL 14+
-- Depends: 001_enumerations.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1  delivery_zones  — geographic delivery zones (cities / pin-code clusters)
-- ---------------------------------------------------------------------------
CREATE TABLE delivery_zones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_code           VARCHAR(60) UNIQUE NOT NULL,     -- e.g. mumbai_andheri
  zone_name           VARCHAR(120) NOT NULL,
  city                VARCHAR(80) NOT NULL,
  state               VARCHAR(80) NOT NULL,
  state_code          CHAR(2) NOT NULL,                -- MH, KA, TN …
  country             CHAR(2) NOT NULL DEFAULT 'IN',
  pincode_list        TEXT[],                          -- array of pin codes in zone
  centroid_lat        NUMERIC(10,7),
  centroid_lng        NUMERIC(10,7),
  boundary_geom       GEOMETRY(MULTIPOLYGON, 4326),    -- PostGIS polygon
  flood_risk_score    NUMERIC(5,2) DEFAULT 0,          -- 0-100
  heat_risk_score     NUMERIC(5,2) DEFAULT 0,
  aqi_risk_score      NUMERIC(5,2) DEFAULT 0,
  civic_risk_score    NUMERIC(5,2) DEFAULT 0,
  composite_risk_score NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND((flood_risk_score * 0.25 +
           heat_risk_score  * 0.25 +
           aqi_risk_score   * 0.20 +
           civic_risk_score * 0.15), 2)
  ) STORED,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  weather_station_id  VARCHAR(50),                     -- OpenWeatherMap station
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ---------------------------------------------------------------------------
-- 2.2  plan_configs  — plan definitions and payout rules
-- ---------------------------------------------------------------------------
CREATE TABLE plan_configs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan                    plan_enum UNIQUE NOT NULL,
  display_name            VARCHAR(40) NOT NULL,
  weekly_premium_inr      NUMERIC(8,2) NOT NULL,
  base_premium_pct        NUMERIC(5,4) NOT NULL DEFAULT 0.0200,   -- 2% of weekly income
  plan_multiplier         NUMERIC(4,2) NOT NULL DEFAULT 1.00,     -- Basic=1.0, Shield+=1.25, Elite=1.5
  income_replacement      NUMERIC(4,2) NOT NULL DEFAULT 1.00,     -- 1x / 1.5x / 2x payout multiplier
  payout_per_day_low      NUMERIC(8,2) NOT NULL,       -- severity=low
  payout_per_day_moderate NUMERIC(8,2) NOT NULL,
  payout_per_day_high     NUMERIC(8,2) NOT NULL,
  payout_per_day_extreme  NUMERIC(8,2) NOT NULL,
  max_payout_per_event    NUMERIC(8,2) NOT NULL,
  max_payout_per_week     NUMERIC(8,2) NOT NULL,
  max_payout_per_month    NUMERIC(8,2) NOT NULL,
  max_claims_per_month    SMALLINT NOT NULL,
  min_active_days_per_week SMALLINT NOT NULL DEFAULT 3,
  claim_response_hours    SMALLINT NOT NULL,            -- SLA hours
  covered_disruptions     disruption_type_enum[] NOT NULL,
  min_severity_trigger    severity_enum NOT NULL DEFAULT 'moderate',
  support_channels        TEXT[] NOT NULL,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to            DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_plan_configs_updated_at
  BEFORE UPDATE ON plan_configs
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed canonical plan data
INSERT INTO plan_configs (
  plan, display_name,
  weekly_premium_inr, base_premium_pct, plan_multiplier, income_replacement,
  payout_per_day_low, payout_per_day_moderate,
  payout_per_day_high, payout_per_day_extreme,
  max_payout_per_event, max_payout_per_week, max_payout_per_month,
  max_claims_per_month, min_active_days_per_week, claim_response_hours,
  covered_disruptions, min_severity_trigger, support_channels
) VALUES
(
  'basic', 'Basic',
  100.00, 0.0200, 1.00, 1.0,
  100.00, 100.00, 100.00, 100.00,
  100.00, 300.00, 900.00,
  3, 3, 24,
  ARRAY['heavy_rain','flood','cyclone','hailstorm']::disruption_type_enum[],
  'moderate',
  ARRAY['sms']
),
(
  'shield_plus', 'Shield+',
  125.00, 0.0200, 1.25, 1.5,
  120.00, 150.00, 150.00, 150.00,
  150.00, 450.00, 1350.00,
  5, 3, 4,
  ARRAY['heavy_rain','flood','cyclone','hailstorm','extreme_heat',
        'severe_aqi','civic_curfew','dense_fog','thunderstorm']::disruption_type_enum[],
  'low',
  ARRAY['sms','whatsapp']
),
(
  'elite', 'Elite',
  150.00, 0.0200, 1.50, 2.0,
  200.00, 250.00, 300.00, 300.00,
  300.00, 750.00, 2250.00,
  999, 3, 2,
  ARRAY['heavy_rain','flood','cyclone','hailstorm','extreme_heat',
        'severe_aqi','civic_curfew','dense_fog','thunderstorm',
        'platform_strike','local_market_closure','earthquake_alert']::disruption_type_enum[],
  'low',
  ARRAY['sms','whatsapp','push']
);

-- ---------------------------------------------------------------------------
-- 2.3  disruption_thresholds  — per-type trigger thresholds
-- ---------------------------------------------------------------------------
CREATE TABLE disruption_thresholds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disruption_type disruption_type_enum NOT NULL,
  severity        severity_enum NOT NULL,
  metric_name     VARCHAR(60) NOT NULL,    -- e.g. rainfall_mm_per_day
  operator        VARCHAR(10) NOT NULL,    -- >, >=, <, <=, =
  threshold_value NUMERIC(10,4) NOT NULL,
  unit            VARCHAR(30),             -- mm, celsius, aqi_index, km/h
  data_source     VARCHAR(80) NOT NULL,    -- openweathermap, cpcb, ndma, imd
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (disruption_type, severity, metric_name)
);

INSERT INTO disruption_thresholds
  (disruption_type, severity, metric_name, operator, threshold_value, unit, data_source, description)
VALUES
  ('heavy_rain','low',      'rainfall_mm_per_day',  '>=', 35.5,  'mm',      'openweathermap', 'IMD Moderate rain'),
  ('heavy_rain','moderate', 'rainfall_mm_per_day',  '>=', 64.5,  'mm',      'openweathermap', 'IMD Heavy rain'),
  ('heavy_rain','high',     'rainfall_mm_per_day',  '>=', 115.5, 'mm',      'openweathermap', 'IMD Very heavy rain'),
  ('heavy_rain','extreme',  'rainfall_mm_per_day',  '>=', 204.5, 'mm',      'openweathermap', 'IMD Extremely heavy'),
  ('extreme_heat','low',    'temp_celsius',          '>=', 40.0,  'celsius', 'openweathermap', 'Heat warning'),
  ('extreme_heat','moderate','temp_celsius',         '>=', 43.0,  'celsius', 'openweathermap', 'Severe heat'),
  ('extreme_heat','high',   'temp_celsius',          '>=', 45.0,  'celsius', 'openweathermap', 'Extreme heat'),
  ('extreme_heat','extreme','heat_index_celsius',    '>=', 54.0,  'celsius', 'openweathermap', 'Danger level heat index'),
  ('severe_aqi','low',      'aqi_index',             '>=', 201.0, 'aqi',     'cpcb',           'Very poor air quality'),
  ('severe_aqi','moderate', 'aqi_index',             '>=', 251.0, 'aqi',     'cpcb',           'Severe air quality'),
  ('severe_aqi','high',     'aqi_index',             '>=', 301.0, 'aqi',     'cpcb',           'Hazardous AQI'),
  ('severe_aqi','extreme',  'aqi_index',             '>=', 401.0, 'aqi',     'cpcb',           'Emergency AQI'),
  ('dense_fog', 'moderate', 'visibility_meters',     '<=', 200.0, 'meters',  'openweathermap', 'Dense fog advisory'),
  ('dense_fog', 'high',     'visibility_meters',     '<=', 50.0,  'meters',  'openweathermap', 'Very dense fog'),
  ('cyclone',   'moderate', 'wind_speed_kmh',        '>=', 89.0,  'kmh',     'imd',            'Cyclone warning'),
  ('cyclone',   'high',     'wind_speed_kmh',        '>=', 118.0, 'kmh',     'imd',            'Severe cyclone'),
  ('thunderstorm','low',    'weather_code',          '=',  2.0,   'code_prefix', 'openweathermap', 'OWM 2xx = thunderstorm'),
  ('hailstorm', 'high',     'imd_alert_level',       '>=', 2.0,   'level',   'imd',            'IMD orange/red alert'),
  ('flood',     'moderate', 'ndma_alert_level',      '>=', 2.0,   'level',   'ndma',           'NDMA flood alert'),
  ('civic_curfew','high',   'section_144_active',    '=',  1.0,   'boolean', 'news_api',       'Section 144 in zone'),
  ('platform_strike','high','platform_halt_pct',     '>=', 80.0,  'percent', 'platform_api',   'Zone-wide delivery halt'),
  ('local_market_closure','moderate','closure_verified','=',1.0,  'boolean', 'news_api',       'Verified market closure');
