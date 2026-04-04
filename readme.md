# GigShield - Parametric Income Protection Demo

GigShield is a local-first demo platform for gig-worker income protection.
It includes two production-style frontends:
- Worker App: onboarding, risk pricing, policy consent, live protection, zero-touch claims.
- Admin Dashboard: trigger simulation, zone risk map, solvency analytics, live claim feed.

This repository also contains backend and infra folders, but the current demo flow is designed to run locally through frontend state and mocks.

## What Is Implemented (Current)

### 1) Worker Onboarding and Risk Profiling
- Multi-step registration flow:
  - Personal details
  - Identity proof
  - Work profile
  - Income and plan selection
  - Payout and account setup
- Dynamic fields include:
  - Weekly income input
  - Delivery platform and work persona
  - Vehicle type (2-wheeler or 4-wheeler)
  - City + operational zone selector (city-specific areas)
  - Safety gear toggle (applies discount in pricing engine)

### 2) Earn-Lock Math Engine
Centralized pricing service (no hardcoded UI math):
- Base premium: 2% of weekly income
- Multipliers:
  - Location risk modeled by zone category cues
  - Vehicle risk: 2-wheeler and 4-wheeler differentiated
- Safety discount: 5% when safety gear is enabled
- Plan tiers:
  - Basic: calculated base tier
  - Shield+: 1.25x premium
  - Elite: 1.5x premium
- Tier semantics:
  - Basic: red-alert coverage
  - Shield+: moderate rain + heatwave posture
  - Elite: riots/curfew support + payout multiplier path + rollover messaging

### 3) Shield Wallet (30/70 Split)
- Weekly premium split logic:
  - 30% -> personal Safety Net balance
  - 70% -> community pool
- Ledger is persisted in localStorage with weekly rollover accumulation
- Dashboard displays:
  - Safety Net balance
  - Weekly wallet/pool split
  - Total premiums tracked
  - Community pool reserve

### 4) Parametric Trigger System
- Weather monitor is integrated through mock city weather feeds
- Trigger thresholds are configurable and normalized
- Current default thresholds:
  - Watch: 10 mm
  - Alert: 15 mm
  - Severe: 24 mm
- Developer simulation mode exists:
  - Simulate heavy rain
  - Reset weather
  - Threshold sliders (watch, alert, severe)

### 5) Zero-Touch UX
- Auto disruption detection triggers claim events without manual filing
- Auto alert banner appears when trigger is crossed
- Instant estimated payout shown in UI
- Live protection state labels:
  - Active
  - At Risk
  - Disrupted
- Claims timeline includes status progression:
  - Pending -> Approved

### 6) Admin Command Center
- Solvency analytics card compares:
  - Total premiums collected
  - Total projected liability
  - Coverage ratio and gauge
- Risk visibility:
  - Zone risk map and threat markers
  - Clickable risk cards and simulated area escalations
- Trigger management:
  - Global rainfall threshold sliders
  - Trigger fire/reset simulation controls
- Live claim feed:
  - Auto-approved and manual-review stream during simulation

## Apps and Paths
- Worker app: frontend/worker-app
- Admin dashboard: frontend/admin-dashboard
- Landing: landing
- Service/backend and infra assets remain in services, infrastructure, monitoring, and mocks

## Run Locally

### Prerequisites
- Node.js 20+
- npm 10+

### Worker App
1. cd frontend/worker-app
2. npm install
3. npm run dev
4. Open the printed localhost URL

### Admin Dashboard
1. cd frontend/admin-dashboard
2. npm install
3. npm run dev
4. Open the printed localhost URL

## Login Notes

### Worker
- Use normal login fields, or use Demo Worker Login for seeded sample state.

### Admin
- Login screen is username + password only.
- Enter username and password, then continue.

## Build Validation

Use these commands to produce production builds:
- Worker: cd frontend/worker-app && npm run build
- Admin: cd frontend/admin-dashboard && npm run build

Both apps currently build successfully in this repository state.

## Key Local Data Stores
- Worker registration profile
- Weather state and thresholds
- Claim history
- Wallet ledger (safety net + pool balances)
- Admin auth/session flags

All of the above are persisted in browser localStorage for local demo continuity.

## Repo Structure (High Level)

- frontend/
  - worker-app/
  - admin-dashboard/
- mocks/
- services/
- infrastructure/
- monitoring/
- landing/
- docs/

## Disclaimer
This is a demo implementation intended for product validation and hackathon-level simulation.
External integrations are represented with local mocks where needed.
