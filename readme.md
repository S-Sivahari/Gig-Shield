# 🛡️ GigShield — AI-Powered Parametric Income Insurance for India's Gig Economy

> **Hackathon Project | Guidewire Insurance Platform Challenge**
> Protecting India's delivery workers against income loss from uncontrollable external disruptions.

---

## 📌 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Module Breakdown](#module-breakdown)
   - [User Registration & Verification](#1-user-registration--verification-layer)
   - [Risk Profiling & Premium Calculation](#2-risk-profiling--premium-calculation-layer)
   - [Policy Management](#3-policy-management-layer)
   - [Disruption Monitoring](#4-disruption-monitoring-layer)
   - [Claim Trigger & Validation](#5-claim-trigger--validation-layer)
   - [Fraud Detection](#6-fraud-detection-layer)
   - [Automated Payout Processing](#7-automated-payout-processing-layer)
   - [Analytics & Dashboard](#8-analytics--dashboard-layer)
7. [Insurance Plans & Pricing](#insurance-plans--pricing)
8. [Disruption Coverage Matrix](#disruption-coverage-matrix)
9. [User Roles](#user-roles)
10. [API Integrations](#api-integrations)
11. [Data Models](#data-models)
12. [Fraud Detection Logic](#fraud-detection-logic)
13. [Parametric Automation Flow](#parametric-automation-flow)
14. [Project Structure](#project-structure)
15. [Setup & Installation](#setup--installation)
16. [Environment Variables](#environment-variables)
17. [Running the Application](#running-the-application)
18. [Testing](#testing)
19. [Demo Scenarios](#demo-scenarios)
20. [Compliance & Constraints](#compliance--constraints)
21. [Future Roadmap](#future-roadmap)
22. [Team](#team)

---

## Problem Statement

India's platform-based delivery partners — working for **Zomato, Swiggy, Zepto, Amazon, Dunzo**, and others — are the backbone of the digital economy. They earn on a per-delivery basis, with no fixed salary and no safety net.

**External disruptions** such as extreme weather events, heavy pollution, floods, and sudden civic unrest (curfews, strikes) can reduce working hours dramatically, causing a **20–30% drop in monthly earnings**. These workers have no existing mechanism to recover this lost income.

### The Gap

| Current Reality | What's Needed |
|-----------------|---------------|
| No income protection | Parametric income insurance |
| Manual claim processes | Automated, event-triggered payouts |
| No fraud safeguards | AI-powered anomaly detection |
| No gig-specific products | Weekly premium cycle aligned to gig earnings |

> **GigShield** solves this by providing an AI-enabled parametric insurance platform with automated claims, fraud detection, and instant payouts.

---

## Solution Overview

GigShield is a **full-stack parametric insurance platform** built on a microservices architecture. It continuously monitors real-world disruption data (weather, pollution, civic events), automatically triggers claims when a covered disruption occurs in a worker's active delivery zone, validates the claim using GPS and activity data, runs it through an AI fraud detection engine, and initiates an instant UPI/bank payout — all without any manual claim filing by the worker.

### How It Works (30-Second Flow)

```
Worker registers → AI risk profile created → Weekly plan activated →
Disruption detected in zone → Claim auto-triggered → Fraud check passed →
Payout credited to UPI/bank within 2 hours
```

---

## Key Features

### 🔄 Latest Demo Updates (Phase 2 Refactor)
- **One-click Worker Demo Login** — Use the worker login page demo button to auto-fill randomized profile details and jump straight into the dashboard.
- **Zero-touch Claim Workflow** — Worker app auto-detects disruption triggers and moves policy state from Protected to Claim Processing without manual claim filing.
- **Cross-App Threat Sync** — When a worker disruption is triggered, the worker app publishes the affected city and zone signal and the admin dashboard marks the same area as **THREAT**.
- **Claims Visibility** — Worker app now includes a Claims History view with auto-triggered event status progression (Pending → Approved).
- **Admin Liability Awareness** — Admin dashboard includes active disrupted workers and event-level estimated liability view.

### ✅ Must-Have (Fully Implemented)
- **AI-Powered Risk Assessment** — Dynamic weekly premium based on location, delivery history, and environmental risk
- **Parametric Automation** — Real-time disruption monitoring with zero-touch claim initiation
- **Intelligent Fraud Detection** — GPS spoofing detection, behavioral anomaly analysis, duplicate claim prevention
- **Instant Payout Processing** — UPI and bank transfer via Razorpay sandbox
- **Analytics Dashboard** — Worker and admin views with live disruption heatmaps

### 🚀 Innovation Add-ons
- **Vernacular Onboarding** — Support for Hindi, Tamil, Telugu, Kannada, Bengali
- **WhatsApp Notifications** — Policy updates and payout alerts via WhatsApp Business API
- **Zone-Level Risk Heatmaps** — City-level disruption intensity visualization
- **Offline Claim Registration** — USSD-based fallback for low-connectivity workers
- **Earnings Intelligence** — AI estimation of income loss based on historical platform data

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Worker App   │  │ Verification     │  │  Admin Dashboard     │  │
│  │ (React PWA)  │  │ Portal (React)   │  │  (React + Charts)    │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────┬───────────┘  │
└─────────┼───────────────────┼────────────────────────┼─────────────┘
          │                   │                        │
          ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                │
│               (Node.js / Express — JWT Auth + Rate Limiting)        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────────┐
        ▼                      ▼                           ▼
┌───────────────┐   ┌──────────────────┐      ┌──────────────────────┐
│  Auth Service │   │  Policy Service  │      │  Claims Service      │
│  (KYC/OTP)    │   │  (Premium Calc)  │      │  (Trigger/Validate)  │
└───────┬───────┘   └────────┬─────────┘      └──────────┬───────────┘
        │                    │                            │
        ▼                    ▼                            ▼
┌───────────────┐   ┌──────────────────┐      ┌──────────────────────┐
│  Risk AI      │   │  Disruption      │      │  Fraud Detection     │
│  Engine       │   │  Monitor Service │      │  AI Engine           │
│  (Python/ML)  │   │  (Python)        │      │  (Python/ML)         │
└───────┬───────┘   └────────┬─────────┘      └──────────┬───────────┘
        │                    │                            │
        ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│   PostgreSQL (Users/Policies)   Redis (Sessions/Cache)              │
│   MongoDB (Activity Logs)       InfluxDB (Disruption Time Series)   │
└─────────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────────┐
        ▼                      ▼                           ▼
┌───────────────┐   ┌──────────────────┐      ┌──────────────────────┐
│ OpenWeatherMap│   │  CPCB Pollution  │      │  Razorpay Sandbox    │
│ / IMD API     │   │  API (Mock)      │      │  (Payouts)           │
└───────────────┘   └──────────────────┘      └──────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js (PWA) | Worker app, Admin dashboard |
| Tailwind CSS | UI styling |
| Recharts / Leaflet.js | Analytics charts and zone heatmaps |
| i18next | Multilingual support |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | API Gateway, Auth, Policy Service |
| Python (FastAPI) | AI/ML Risk Engine, Fraud Detection, Disruption Monitor |
| PostgreSQL | Core data (users, policies, claims) |
| MongoDB | Activity logs, GPS history |
| Redis | Session cache, rate limiting |

### AI/ML
| Technology | Purpose |
|------------|---------|
| scikit-learn | Risk scoring, premium prediction |
| Isolation Forest | Fraud anomaly detection |
| Prophet / ARIMA | Disruption frequency forecasting |
| Pandas / NumPy | Data processing |

### Integrations
| Service | Usage |
|---------|-------|
| OpenWeatherMap API | Real-time weather data |
| CPCB AQI API (mocked) | Pollution / AQI levels |
| Razorpay Sandbox | UPI/bank payout processing |
| MSG91 / Twilio | OTP and SMS notifications |
| WhatsApp Business API | Claim and payout alerts |

---

## Module Breakdown

### 1. User Registration & Verification Layer

**Purpose:** Onboard delivery workers with KYC and platform verification.

**Input Data Collected:**
- Aadhaar card number + OTP-based verification
- Driving license (upload)
- Bike insurance proof (if applicable)
- Bank account number + IFSC code
- Smartphone OTP
- Delivery platform selection (Zomato / Swiggy / Zepto / Amazon / Dunzo / Other)
- Worker ID or platform account screenshot proof

**System Actions:**
```
1. Aadhaar OTP verification via UIDAI sandbox
2. Document upload → stored in encrypted S3 bucket
3. Delivery platform ID validated (manual review queue for unverified)
4. Bank account penny-drop verification
5. Worker profile created in PostgreSQL
6. Unique GigShield Worker ID generated (e.g., GS-MH-20241-00423)
7. WhatsApp/SMS welcome notification sent
```

**Verification States:**
```
PENDING_DOCS → DOCS_SUBMITTED → UNDER_REVIEW → VERIFIED → ACTIVE
                                              ↓
                                         REJECTED (with reason)
```

**API Endpoints:**
```
POST   /api/auth/register           → Initiate registration
POST   /api/auth/verify-aadhaar     → OTP-based Aadhaar verify
POST   /api/auth/upload-docs        → Document upload
GET    /api/auth/verification-status → Check KYC status
POST   /api/auth/verify-bank        → Penny-drop bank verification
```

---

### 2. Risk Profiling & Premium Calculation Layer

**Purpose:** Build an AI-driven risk profile for each worker to set fair weekly premiums.

**Risk Factors Used:**

| Factor | Weight | Data Source |
|--------|--------|-------------|
| City / Delivery Zone | 25% | Worker registration |
| Historical flood frequency | 20% | NDMA historical data |
| Average AQI in zone | 15% | CPCB API |
| Extreme heat days/year | 15% | IMD climate data |
| Delivery platform (urban density) | 10% | Platform metadata |
| Worker's delivery hours (day/night) | 10% | Platform activity sync |
| Strike/curfew frequency in zone | 5% | News API / mock |

**AI Risk Score Calculation:**
```python
# Simplified risk scoring model
risk_score = weighted_sum([
    zone_flood_risk,
    aq_risk,
    heat_risk,
    civic_risk,
    activity_risk
])
# Output: 0–100 risk score → maps to premium tier
```

**Premium Output:**

| Risk Score | Plan | Weekly Premium |
|------------|------|---------------|
| 0–33 | Basic | ₹29/week |
| 34–66 | Standard | ₹49/week |
| 67–100 | Pro | ₹79/week |

Workers can also **manually upgrade** their plan.

**API Endpoints:**
```
POST   /api/risk/profile            → Generate risk profile
GET    /api/risk/premium-quote      → Get premium recommendation
GET    /api/risk/zone-risk/:zoneId  → Zone-level risk score
```

---

### 3. Policy Management Layer

**Purpose:** Create, manage, renew, and terminate insurance policies.

**Policy Object:**
```json
{
  "policy_id": "GS-POL-2024-00892",
  "worker_id": "GS-MH-20241-00423",
  "plan": "Standard",
  "weekly_premium": 49,
  "coverage_start": "2024-11-04",
  "renewal_day": "Monday",
  "max_payout_per_week": 600,
  "max_payout_per_event": 150,
  "min_active_days_per_week": 3,
  "covered_disruptions": ["extreme_rain", "flood", "extreme_heat", "severe_aqi", "curfew", "strike"],
  "status": "ACTIVE",
  "auto_renew": true
}
```

**Policy Lifecycle:**
```
DRAFT → ACTIVATED → ACTIVE → [SUSPENDED | RENEWED | TERMINATED]
```

**Weekly Renewal Logic:**
- Premium auto-debits every Monday via UPI mandate
- If payment fails, policy moves to `GRACE_PERIOD` (48 hours)
- After grace period, policy is `SUSPENDED` (no claims accepted)
- Worker can reactivate within 30 days without re-KYC

**API Endpoints:**
```
POST   /api/policies/create         → Create new policy
GET    /api/policies/:workerId      → Get active policy
PUT    /api/policies/:id/upgrade    → Upgrade plan
POST   /api/policies/:id/renew      → Manual renewal
DELETE /api/policies/:id/terminate  → Cancel policy
GET    /api/policies/:id/history    → Renewal and claim history
```

---

### 4. Disruption Monitoring Layer

**Purpose:** Continuously monitor real-world data for covered disruption events.

**Monitored Parameters:**

| Disruption Type | Trigger Threshold | Data Source |
|-----------------|------------------|-------------|
| Heavy Rain | > 64.5mm/day (IMD scale) | OpenWeatherMap |
| Extreme Heat | > 45°C OR Heat Index > 54°C | OpenWeatherMap |
| Flood Alert | Official flood warning in zone | NDMA RSS feed |
| Severe AQI | AQI > 300 (Hazardous) | CPCB API (mocked) |
| Civic Curfew | Section 144 order detected | News API (mocked) |
| Platform Strike | Platform-wide delivery halt | Platform API (mocked) |
| Cyclone | Cyclone warning within 200km | IMD Cyclone Portal |

**Monitoring Cycle:**
```
Every 15 minutes:
  → Fetch weather data for all active delivery zones
  → Fetch AQI data
  → Check news/civic alert feeds
  → Evaluate disruption thresholds
  → If threshold crossed → create DisruptionEvent
  → Notify Claims Service to trigger eligible workers
```

**DisruptionEvent Object:**
```json
{
  "event_id": "EVT-2024-MH-004421",
  "disruption_type": "extreme_rain",
  "severity": "HIGH",
  "affected_zones": ["mumbai_andheri", "mumbai_bandra", "mumbai_dadar"],
  "start_time": "2024-11-04T14:30:00Z",
  "end_time": null,
  "data_source": "openweathermap",
  "raw_value": "82.3mm/day",
  "status": "ACTIVE"
}
```

---

### 5. Claim Trigger & Validation Layer

**Purpose:** Automatically trigger and validate claims when a covered disruption occurs.

**Auto-Trigger Flow:**
```
DisruptionEvent created
  ↓
Find all ACTIVE policies in affected zones
  ↓
For each eligible worker:
  → Check policy is ACTIVE and premium is paid
  → Verify worker had scheduled work hours during event
  → Check GPS/location aligns with affected zone (within 5km)
  → Verify minimum activity threshold (≥3 deliveries attempted OR
     platform shows "no orders available" signal)
  ↓
If all checks pass → Auto-create ClaimRequest
  ↓
Forward to Fraud Detection Layer
```

**Validation Checks:**

| Check | Method | Pass Condition |
|-------|--------|---------------|
| Event Verification | Disruption event exists and is ACTIVE | Threshold crossed in official data |
| Location Check | GPS coordinates during event | Worker in affected zone ± 5km |
| Activity Check | Platform activity log (simulated) | Active or attempted delivery in window |
| Policy Eligibility | Policy DB check | Status = ACTIVE, premium paid, min_active_days met |
| Duplicate Check | Redis claim cache | No claim for same worker + same event |

**Claim Object:**
```json
{
  "claim_id": "CLM-2024-00041",
  "worker_id": "GS-MH-20241-00423",
  "policy_id": "GS-POL-2024-00892",
  "event_id": "EVT-2024-MH-004421",
  "disruption_type": "extreme_rain",
  "disruption_date": "2024-11-04",
  "hours_affected": 4.5,
  "estimated_income_loss": 270,
  "payout_amount": 150,
  "claim_status": "PENDING_FRAUD_CHECK",
  "auto_triggered": true,
  "created_at": "2024-11-04T16:15:00Z"
}
```

**API Endpoints:**
```
POST   /api/claims/auto-trigger     → System-initiated trigger
POST   /api/claims/manual           → Worker-initiated manual claim
GET    /api/claims/:workerId        → Worker's claim history
GET    /api/claims/:id/status       → Claim status check
PUT    /api/claims/:id/review       → Verification agent review
```

---

### 6. Fraud Detection Layer

**Purpose:** Prevent fraudulent claims using ML-based anomaly detection before any payout.

**Fraud Detection Methods:**

#### A. GPS Spoofing Detection
```python
# Check GPS coordinates consistency
def detect_gps_spoofing(gps_history, claimed_zone):
    - Verify movement patterns are physically possible
    - Check for teleportation (>50km in <5 mins)
    - Cross-reference with telecom cell tower data (mocked)
    - Validate GPS coordinates aren't VPN-routed
```

#### B. Behavioral Anomaly Detection (Isolation Forest)
```python
# Features used:
features = [
    claim_frequency_this_month,
    avg_claims_last_3_months,
    payout_amount_vs_history,
    time_since_last_claim,
    delivery_activity_on_claim_day,
    zone_match_score
]
model = IsolationForest(contamination=0.05)
anomaly_score = model.decision_function([features])
# Score < -0.3 → FLAG FOR MANUAL REVIEW
```

#### C. Duplicate Claim Prevention
```
Redis SET: claim:{worker_id}:{event_id} = 1 (TTL: 72 hours)
If key exists → Reject as duplicate
```

#### D. Activity-Claim Correlation
```
Platform activity API (simulated):
  - If platform shows 0 login during disruption window → Low risk
  - If worker accepted orders DURING claimed disruption → FLAG
  - If GPS shows worker at home during rain → Valid (rain is disruptive)
```

**Fraud Decision Output:**

| Fraud Score | Action |
|-------------|--------|
| 0.0 – 0.3 | AUTO-APPROVE → proceed to payout |
| 0.3 – 0.6 | SOFT FLAG → notify verification agent |
| 0.6 – 1.0 | HARD FLAG → block payout, manual review required |

---

### 7. Automated Payout Processing Layer

**Purpose:** Instantly credit approved claim amounts to the worker's registered payment method.

**Payout Amounts:**

| Plan | Per Disruption Day | Max Per Event | Max Per Week |
|------|--------------------|---------------|--------------|
| Basic | ₹100 | ₹100 | ₹300 |
| Standard | ₹150 | ₹150 | ₹450 |
| Pro | ₹200–₹300 (severity-based) | ₹300 | ₹750 |

**Severity Multiplier (Pro Plan):**
```
LOW severity    → ₹200/day
MEDIUM severity → ₹250/day
HIGH severity   → ₹300/day
```

**Payout Flow:**
```
Claim APPROVED
  ↓
Calculate payout_amount (based on plan + severity + hours affected)
  ↓
Initiate Razorpay Payout API (sandbox)
  → Transfer to registered bank account (NEFT/IMPS)
  → OR UPI transfer to registered UPI ID
  ↓
Update claim status → PAID
  ↓
Send WhatsApp/SMS notification to worker
  ↓
Log transaction in PayoutLedger
```

**Payment Channels:**
- UPI (preferred, instant)
- IMPS Bank Transfer (within 2 hours)
- NEFT (T+1 for edge cases)

**API Endpoints:**
```
POST   /api/payouts/initiate        → Trigger payout (internal)
GET    /api/payouts/:workerId       → Payout history
GET    /api/payouts/:id/status      → Transaction status
POST   /api/payouts/webhook         → Razorpay payout webhook
```

---

### 8. Analytics & Dashboard Layer

**Purpose:** Provide actionable insights for workers and full operational visibility for admins.

#### Worker Dashboard
| Widget | Data Shown |
|--------|-----------|
| Policy Status Card | Plan, premium, next renewal date |
| Weekly Earnings Protected | Estimated coverage value this week |
| Claims Timeline | All claims with status and payout |
| Disruption Alerts | Active disruptions in your zone |
| Total Payouts Received | Cumulative lifetime payout |
| Premium vs Payout Ratio | Value visualization |

#### Verification Agent Dashboard
| Widget | Data Shown |
|--------|-----------|
| Pending Document Reviews | KYC queue with priority |
| Flagged Claims | Soft/hard fraud flags |
| Manual Review Queue | Claims needing human decision |
| Strike/Event Confirmations | Civic event verification |

#### Insurance Admin Dashboard
| Widget | Data Shown |
|--------|-----------|
| Live Policy Count | Active, suspended, new this week |
| Claims Triggered Today | Auto vs manual breakdown |
| Payout Disbursed | Daily/weekly/monthly totals |
| Fraud Alerts | Real-time anomaly feed |
| Disruption Heatmap | Zone-level risk visualization (Leaflet.js) |
| Loss Ratio | Premiums collected vs payouts |
| Zone-wise Risk Analytics | High-risk zone identification |
| Worker Retention | Renewal rates by plan |

---

## Insurance Plans & Pricing

```
┌─────────────────────────────────────────────────────────────┐
│                     GIGSHIELD PLANS                         │
├─────────────┬─────────────────┬───────────────┬────────────┤
│ Feature     │ BASIC           │ STANDARD      │ PRO        │
├─────────────┼─────────────────┼───────────────┼────────────┤
│ Weekly Cost │ ₹29/week        │ ₹49/week      │ ₹79/week   │
│ Payout/Day  │ ₹100            │ ₹150          │ ₹200–300   │
│ Max/Week    │ ₹300            │ ₹450          │ ₹750       │
│ Disruptions │ Rain, Flood     │ + Heat, AQI   │ All types  │
│ Claim Limit │ 3/month         │ 5/month       │ Unlimited  │
│ Response    │ 24 hours        │ 4 hours        │ 2 hours    │
│ Severity    │ Moderate+       │ Low+          │ All levels │
│ Support     │ SMS             │ SMS + WA      │ SMS+WA+Call│
└─────────────┴─────────────────┴───────────────┴────────────┘
```

---

## Disruption Coverage Matrix

| Disruption | Trigger Threshold | Basic | Standard | Pro |
|------------|-----------------|-------|----------|-----|
| Heavy Rain | > 64.5mm/day | ✅ | ✅ | ✅ |
| Flood (Official Alert) | NDMA Level 2+ | ✅ | ✅ | ✅ |
| Extreme Heat | > 45°C | ❌ | ✅ | ✅ |
| Severe AQI | AQI > 300 | ❌ | ✅ | ✅ |
| Cyclone Warning | Within 200km | ✅ | ✅ | ✅ |
| Civic Curfew | Sec 144 Order | ❌ | ✅ | ✅ |
| Platform Strike | Zone-wide halt | ❌ | ❌ | ✅ |
| Dense Fog (visibility < 50m) | IMD Alert | ❌ | ✅ | ✅ |
| Hailstorm | IMD Severe Alert | ✅ | ✅ | ✅ |
| Local Market Closure | Verified event | ❌ | ❌ | ✅ |

---

## User Roles

### 1. Delivery Worker (Gig Worker)
- Self-registers via mobile app
- Completes KYC (Aadhaar + platform proof)
- Selects and activates insurance plan
- Views policy status and disruption alerts
- Receives automatic claim payouts
- Can raise manual claim if auto-trigger missed

### 2. Verification Agent
- Receives KYC document queue
- Approves or rejects worker onboarding
- Reviews soft-flagged fraud claims
- Confirms civic events (strikes, curfews) from news sources
- Escalates hard-fraud cases to admin

### 3. Insurance Company Admin (Guidewire)
- Full system access and configuration
- Sets premium bands and coverage rules
- Views all claims, payouts, and fraud alerts
- Generates compliance and actuary reports
- Manages zone-level risk parameters
- Configures disruption thresholds

---

## API Integrations

### Weather: OpenWeatherMap API
```javascript
// Real-time weather for delivery zones
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={zone_lat}&lon={zone_lon}
  &appid={API_KEY}
  &units=metric

// Relevant fields:
// rain.1h (mm), main.temp, weather[0].id (thunderstorm = 2xx)
```

### Pollution: CPCB AQI (Mocked)
```javascript
// Mock response structure matching CPCB API
{
  "station": "Andheri East, Mumbai",
  "aqi": 312,
  "category": "Hazardous",
  "pm25": 180.4,
  "timestamp": "2024-11-04T15:00:00"
}
```

### Payouts: Razorpay Sandbox
```javascript
// Initiate payout
POST https://api.razorpay.com/v1/payouts
{
  "account_number": "GIGSHIELD_VA_001",
  "fund_account_id": "{worker_fund_account_id}",
  "amount": 15000,        // in paise
  "currency": "INR",
  "mode": "UPI",
  "purpose": "insurance_claim",
  "narration": "GigShield Claim CLM-2024-00041"
}
```

### Platform Activity: Simulated API
```javascript
// Mock delivery platform activity
GET /mock/platform-activity/{worker_id}
  ?from={iso_datetime}&to={iso_datetime}

// Returns:
{
  "deliveries_attempted": 0,
  "deliveries_completed": 0,
  "app_open_duration_mins": 45,
  "status_during_window": "WAITING_FOR_ORDERS"
}
```

---

## Data Models

### Worker
```sql
CREATE TABLE workers (
  id              UUID PRIMARY KEY,
  gigshield_id    VARCHAR(20) UNIQUE,
  full_name       VARCHAR(100),
  phone           VARCHAR(15) UNIQUE,
  aadhaar_hash    VARCHAR(64),  -- SHA256 of Aadhaar (not stored plain)
  platform        ENUM('zomato','swiggy','zepto','amazon','dunzo','other'),
  platform_worker_id VARCHAR(50),
  zone_id         VARCHAR(50),
  city            VARCHAR(50),
  upi_id          VARCHAR(50),
  bank_account    VARCHAR(30),  -- encrypted
  bank_ifsc       VARCHAR(11),
  kyc_status      ENUM('pending','verified','rejected'),
  created_at      TIMESTAMP,
  risk_score      FLOAT
);
```

### Policy
```sql
CREATE TABLE policies (
  id              UUID PRIMARY KEY,
  worker_id       UUID REFERENCES workers(id),
  plan            ENUM('basic','standard','pro'),
  weekly_premium  DECIMAL(8,2),
  start_date      DATE,
  last_renewed    DATE,
  next_renewal    DATE,
  status          ENUM('draft','active','suspended','terminated'),
  auto_renew      BOOLEAN DEFAULT TRUE,
  covered_events  JSONB
);
```

### Claim
```sql
CREATE TABLE claims (
  id                UUID PRIMARY KEY,
  worker_id         UUID REFERENCES workers(id),
  policy_id         UUID REFERENCES policies(id),
  event_id          VARCHAR(50),
  disruption_type   VARCHAR(50),
  claim_date        DATE,
  hours_affected    FLOAT,
  payout_amount     DECIMAL(8,2),
  status            ENUM('triggered','fraud_check','approved','rejected','paid'),
  fraud_score       FLOAT,
  auto_triggered    BOOLEAN,
  payout_ref        VARCHAR(50),
  created_at        TIMESTAMP
);
```

---

## Fraud Detection Logic

```python
class FraudDetector:
    def analyze_claim(self, claim, worker):

        score = 0.0
        flags = []

        # 1. GPS validation
        if not self.gps_in_zone(claim.gps_coords, claim.zone):
            score += 0.4
            flags.append("GPS_ZONE_MISMATCH")

        # 2. Duplicate claim
        if self.redis.exists(f"claim:{worker.id}:{claim.event_id}"):
            score += 1.0
            flags.append("DUPLICATE_CLAIM")

        # 3. Platform activity check
        activity = self.get_platform_activity(worker.id, claim.window)
        if activity.deliveries_completed > 3:
            score += 0.5
            flags.append("ACTIVE_DURING_DISRUPTION")

        # 4. ML anomaly detection
        features = self.extract_features(worker, claim)
        anomaly = self.isolation_forest.decision_function([features])[0]
        if anomaly < -0.3:
            score += 0.3
            flags.append("BEHAVIORAL_ANOMALY")

        # 5. Claim frequency
        recent_claims = self.get_recent_claims(worker.id, days=30)
        if len(recent_claims) > worker.policy.monthly_claim_limit:
            score += 0.4
            flags.append("EXCESS_CLAIM_FREQUENCY")

        return FraudResult(score=score, flags=flags,
                          decision="AUTO_APPROVE" if score < 0.3
                                   else "MANUAL_REVIEW" if score < 0.6
                                   else "BLOCKED")
```

---

## Parametric Automation Flow

```
[CRON: Every 15 minutes]
         │
         ▼
┌─────────────────────────┐
│  DisruptionMonitor      │
│  fetch_weather_all_zones│
│  fetch_aqi_all_zones    │
│  fetch_civic_alerts     │
└────────────┬────────────┘
             │ If threshold crossed
             ▼
┌─────────────────────────┐
│  Create DisruptionEvent │
│  event_id, zones, level │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Find Eligible Workers  │
│  - Active policy        │
│  - In affected zone     │
│  - Worked today         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐     ┌───────────────┐
│  ClaimsService          │────▶│ FraudDetector │
│  auto_trigger_claims()  │     └───────┬───────┘
└─────────────────────────┘             │
                                        │ Score < 0.3
                                        ▼
                              ┌──────────────────────┐
                              │  PayoutService        │
                              │  razorpay.payout()    │
                              └──────────┬────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Notify Worker        │
                              │  WhatsApp + SMS       │
                              └──────────────────────┘
```

---

## Project Structure

```
gigshield/
├── frontend/
│   ├── worker-app/              # React PWA for delivery workers
│   │   ├── src/
│   │   │   ├── pages/           # Registration, Dashboard, Claims
│   │   │   ├── components/      # PolicyCard, ClaimStatus, etc.
│   │   │   ├── i18n/            # Language files (hi, ta, te, kn, bn)
│   │   │   └── api/             # API client
│   │   └── public/
│   ├── admin-dashboard/         # React app for admins/agents
│   │   ├── src/
│   │   │   ├── pages/           # Analytics, Claims Review, Workers
│   │   │   ├── components/      # Heatmap, FraudQueue, PolicyTable
│   │   │   └── charts/          # Recharts configs
│   │   └── public/
│
├── backend/
│   ├── api-gateway/             # Node.js/Express — routes, auth, rate limit
│   │   ├── routes/
│   │   ├── middleware/          # JWT, rate-limiter, logger
│   │   └── server.js
│   ├── auth-service/            # KYC, OTP, Aadhaar verify
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   ├── policy-service/          # Policy CRUD, renewal logic
│   ├── claims-service/          # Claim trigger, validation, lifecycle
│   └── payout-service/          # Razorpay integration, ledger
│
├── ai-engine/                   # Python/FastAPI AI services
│   ├── risk_profiler/
│   │   ├── model.py             # Risk scoring model
│   │   ├── features.py          # Feature engineering
│   │   └── train.py             # Model training script
│   ├── fraud_detector/
│   │   ├── isolation_forest.py  # Anomaly detection
│   │   ├── gps_validator.py     # GPS spoofing checks
│   │   └── activity_checker.py  # Platform activity validation
│   ├── disruption_monitor/
│   │   ├── weather_fetcher.py   # OpenWeatherMap integration
│   │   ├── aqi_fetcher.py       # AQI data (mocked CPCB)
│   │   ├── civic_monitor.py     # News/curfew alerts
│   │   └── scheduler.py        # 15-minute cron
│   └── main.py                  # FastAPI entry point
│
├── database/
│   ├── migrations/              # PostgreSQL schema migrations
│   ├── seeds/                   # Test data seeders
│   └── redis/                   # Cache config
│
├── mocks/                       # Mock APIs for demo
│   ├── platform_activity_api/   # Simulated Zomato/Swiggy data
│   ├── aqi_api/                 # Simulated CPCB AQI data
│   └── civic_alerts_api/        # Simulated curfew/strike events
│
├── docs/
│   ├── api/                     # OpenAPI / Swagger specs
│   ├── architecture/            # Architecture diagrams
│   └── demo-guide.md            # Hackathon demo walkthrough
│
├── .env.example
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- PostgreSQL >= 14
- Redis >= 7
- RabbitMQ >= 3.12

### Quick Start (Local, Windows)

```bash
# Clone the repository
git clone https://github.com/your-team/gigshield.git
cd gigshield

# Start local dependencies first (manual):
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
# - RabbitMQ on localhost:5672

# Start all GigShield services locally
start_all.bat

# Services will be available at:
# Worker App:       http://localhost:3000
# Admin Dashboard:  http://localhost:3001
# API Gateway:      http://localhost:8000
# Service Docs:     http://localhost:8001/docs ... http://localhost:8004/docs
```

### Manual Setup

```bash
# 1. Install Node dependencies
cd backend/api-gateway && npm install
cd backend/policy-service && npm install
cd backend/claims-service && npm install
cd backend/payout-service && npm install

# 2. Install Python dependencies
cd ai-engine && pip install -r requirements.txt

# 3. Setup PostgreSQL
psql -U postgres -c "CREATE DATABASE gigshield;"
cd database && npm run migrate && npm run seed

# 4. Start Redis
redis-server

# 5. Start backend services
cd backend/api-gateway && npm start         # Port 4000
cd backend/policy-service && npm start      # Port 4001
cd backend/claims-service && npm start      # Port 4002
cd backend/payout-service && npm start      # Port 4003

# 6. Start AI engine
cd ai-engine && uvicorn main:app --port 8000

# 7. Start frontend apps
cd frontend/worker-app && npm start         # Port 3000
cd frontend/admin-dashboard && npm start    # Port 3001
```

---

## Environment Variables

```env
# Application
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_char_key_here

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/gigshield
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/gigshield_logs

# Weather API
OPENWEATHER_API_KEY=your_openweathermap_api_key

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_ACCOUNT_NUMBER=your_virtual_account

# SMS/OTP
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=GIGSHD

# WhatsApp
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_number_id

# AI Engine
AI_ENGINE_URL=http://localhost:8000
MODEL_RETRAIN_INTERVAL_DAYS=7

# Feature Flags
ENABLE_AUTO_CLAIMS=true
ENABLE_FRAUD_DETECTION=true
ENABLE_AUTO_PAYOUT=true
USE_MOCK_PLATFORM_API=true
USE_MOCK_AQI_API=true
```

---

## Running the Application

### Starting the Disruption Monitor
```bash
cd ai-engine
python disruption_monitor/scheduler.py
# Runs every 15 minutes, monitors all active zones
```

### Seeding Demo Data
```bash
cd database
npm run seed:demo
# Creates 50 mock workers across 5 cities
# Creates historical disruption events for demo
# Creates sample claims in various states
```

### Triggering a Demo Disruption (for Demo)
```bash
# Manually fire a disruption event for testing
curl -X POST http://localhost:8000/mock/trigger-disruption \
  -H "Content-Type: application/json" \
  -d '{
    "disruption_type": "extreme_rain",
    "severity": "HIGH",
    "zone": "mumbai_andheri",
    "duration_hours": 6
  }'
```

---

## Testing

```bash
# Backend unit tests
cd backend/api-gateway && npm test
cd backend/claims-service && npm test

# AI engine tests
cd ai-engine && pytest tests/ -v

# Integration tests
npm run test:integration

# End-to-end demo test (full claim lifecycle)
npm run test:e2e:claim-flow

# Fraud detection accuracy test
cd ai-engine && python tests/test_fraud_accuracy.py
# Expected: Precision > 0.92, Recall > 0.88
```

---

## Demo Scenarios

### Scenario 1: Full Auto-Claim Flow (Mumbai Heavy Rain)
```
1. Login as worker: phone=9876543210, OTP=1234 (test mode)
2. View active Standard plan on dashboard
3. Admin triggers mock rain disruption in Andheri zone
4. Watch claim auto-appear on worker dashboard within 60 seconds
5. Fraud check passes (score: 0.12)
6. Payout of ₹150 initiated via Razorpay sandbox
7. Worker receives WhatsApp notification
```

### Scenario 2: Fraud Detection Block
```
1. Login as flagged worker: phone=9876543299
2. Attempt manual claim for same event (duplicate)
3. Fraud score = 1.0 → claim blocked
4. Alert appears in Verification Agent queue
```

### Scenario 3: Admin Analytics View
```
1. Login as admin: admin@gigshield.com / admin123 (test)
2. View live disruption heatmap for Mumbai
3. Check claims triggered in last 24 hours
4. View payout disbursement totals
5. Review fraud alert feed
```

---

## Compliance & Constraints

| Constraint | Implementation |
|------------|---------------|
| ❌ No health/life/accident coverage | Hard-coded exclusion in policy engine; claim types restricted to income-loss events only |
| ❌ No vehicle repair coverage | Disruption types explicitly exclude vehicle damage events |
| ✅ Weekly premium model | All plans priced weekly; renewal every Monday; aligns with gig worker pay cycles |
| ✅ Income loss only | Payout is fixed parametric amount (not actual income calculation), triggered by external events |
| ✅ IRDAI-aligned design | Platform designed following IRDAI sandbox guidelines for micro-insurance products |
| ✅ Data privacy | Aadhaar stored as SHA-256 hash; bank account encrypted; GDPR/DPDP compliant design |

---

## Future Roadmap

### Phase 2 (Post-Hackathon)
- [ ] Direct platform API integration (Zomato/Swiggy partner program)
- [ ] IRDAI regulatory filing for micro-insurance license
- [ ] ML model trained on real historical earnings data
- [ ] USSD interface for feature phone users
- [ ] Group policy for delivery hubs (fleet insurance)

### Phase 3 (Scale)
- [ ] Expand to auto-rickshaw drivers, construction workers, street vendors
- [ ] Pan-India zone coverage (500+ pin codes)
- [ ] Reinsurance integration
- [ ] Blockchain-based claim immutability (audit trail)
- [ ] Satellite imagery for flood verification

---

## Team

| Name | Role |
|------|------|
| [Team Member 1] | Full-Stack Development |
| [Team Member 2] | AI/ML Engineering |
| [Team Member 3] | Product Design & UX |
| [Team Member 4] | Insurance Domain & Business |

---

## License

This project was built for the **Guidewire Hackathon 2024**. All third-party API integrations use free-tier or sandbox credentials. Not intended for production use without proper regulatory approvals.

---

> **GigShield** — *Because every delivery warrior deserves a safety net.*