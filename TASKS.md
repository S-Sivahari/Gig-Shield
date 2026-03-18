# GigShield — Complete Project Task Tracker
> AI-Powered Parametric Income Insurance for India's Gig Economy  
> Guidewire Hackathon 2025
---
## Legend
| Symbol | Status |
|--------|--------|
| ⬜ | Not Started |
| 🔄 | In Progress |
| ✅ | Completed |
---

## Phase 0 — Environment & Foundation Setup

### 0.1 Local Development Environment
- ⬜ Install PostgreSQL 14+, Redis 7+, RabbitMQ 3.12+ locally
- ⬜ Install Python 3.11+ & create virtual environments per microservice
- ⬜ Install Node.js 18+ & pnpm/yarn
- ⬜ Set up IDE (VS Code) with recommended extensions (Python, ESLint, Prettier, Tailwind CSS IntelliSense)

### 0.2 Repository Setup
- ⬜ Initialize Git repository with `.gitignore`
- ⬜ Configure branch protection rules (main, develop, feature/*)
- ⬜ Set up pre-commit hooks (black, isort, flake8 for Python; eslint, prettier for React)
- ⬜ Configure `.env.development` and `.env.production` with real/mock values
- ⬜ Verify local infrastructure services are reachable (Postgres, Redis, RabbitMQ)

### 0.3 Database Bootstrap
- ⬜ Run `schema/run_all.sql` against PostgreSQL to create full schema
- ⬜ Run `database/seeds/` scripts to populate reference data
- ⬜ Verify all tables, enums, indexes, triggers, and views are created
- ⬜ Set up Redis instance with `database/redis/redis.conf`
- ⬜ Initialize MongoDB with `database/mongo/init.js` for activity logs

---

## Phase 1 — Shared Library (`services/shared/`)

> All microservices depend on this. Build first.

### 1.1 Configuration
- ⬜ Implement `config/settings.py` — Pydantic BaseSettings with env loading
- ⬜ Implement `config/constants.py` — app-wide constants (plan types, claim statuses, etc.)
- ⬜ Implement `config/logging.py` — structured JSON logging (structlog)

### 1.2 Database Layer
- ⬜ Implement `database/session.py` — SQLAlchemy async engine + session factory
- ⬜ Implement `database/base_model.py` — Base declarative model with `id`, `created_at`, `updated_at`
- ⬜ Implement `database/repository.py` — Generic CRUD repository pattern (get, list, create, update, delete)
- ⬜ Implement `database/redis_client.py` — async Redis connection with pooling

### 1.3 Messaging
- ⬜ Implement `messaging/publisher.py` — RabbitMQ/Kafka event publisher with retry
- ⬜ Implement `messaging/consumer.py` — Event consumer with dead-letter queue support
- ⬜ Implement `messaging/events.py` — Event schema definitions (dataclasses/Pydantic)
- ⬜ Implement `messaging/topics.py` — Topic/queue name constants

### 1.4 Authentication & Middleware
- ⬜ Implement `auth/jwt_handler.py` — JWT creation, verification, refresh
- ⬜ Implement `auth/dependencies.py` — FastAPI `Depends` for role-based access
- ⬜ Implement `middleware/cors.py` — CORS middleware configuration
- ⬜ Implement `middleware/rate_limit.py` — Redis-based rate limiter
- ⬜ Implement `middleware/request_logging.py` — Request/response logger with timing
- ⬜ Implement `middleware/error_handler.py` — Global exception handler

### 1.5 Utilities & Health
- ⬜ Implement `utils/date_utils.py` — IST timezone helpers, date formatting
- ⬜ Implement `utils/validators.py` — Phone, Aadhaar, PAN, IFSC validators
- ⬜ Implement `utils/encryption.py` — AES encryption for PII data
- ⬜ Implement `exceptions/base.py` — Custom exception hierarchy (AppError, NotFoundError, etc.)
- ⬜ Implement `health/health_check.py` — Liveness/readiness endpoints checking DB + Redis
- ⬜ Implement `schemas/pagination.py` — Pagination request/response schemas
- ⬜ Implement `schemas/response.py` — Standardized API response envelope

### 1.6 Testing Utilities
- ⬜ Implement `testing/factories.py` — Factory Boy factories for test data generation
- ⬜ Implement `testing/fixtures.py` — Pytest fixtures for DB, Redis, HTTP client
- ⬜ Implement `testing/mocks.py` — Common mock objects

---

## Phase 2 — Auth Service (`services/auth-service/`)

> User identity, KYC, and authentication

### 2.1 Core Setup
- ⬜ Configure `app/core/config.py` — Service-specific settings
- ⬜ Configure `app/core/security.py` — Password hashing, token generation
- ⬜ Configure `app/core/dependencies.py` — FastAPI dependencies
- ⬜ Set up `main.py` — FastAPI app with middleware, lifespan events

### 2.2 Models & Schemas
- ⬜ Implement `app/models/worker.py` — Worker SQLAlchemy model (maps to `workers` table)
- ⬜ Implement `app/models/worker_document.py` — KYC document model
- ⬜ Implement `app/models/otp_session.py` — OTP session model
- ⬜ Implement `app/models/system_user.py` — Admin user model
- ⬜ Define Pydantic schemas: WorkerCreate, WorkerResponse, OtpRequest, OtpVerify, KycUpload, LoginResponse

### 2.3 Services & Repositories
- ⬜ Implement `app/repositories/worker_repository.py` — Worker CRUD operations
- ⬜ Implement `app/services/registration_service.py` — Phone-based registration flow
- ⬜ Implement `app/services/otp_service.py` — Generate, send, verify OTP (Redis TTL)
- ⬜ Implement `app/services/kyc_service.py` — Aadhaar/PAN verification orchestration
- ⬜ Implement `app/services/aadhaar_service.py` — Aadhaar gateway integration
- ⬜ Implement `app/services/bank_verification_service.py` — Penny drop API
- ⬜ Implement `app/services/document_service.py` — S3 upload/retrieval

### 2.4 API Routes
- ⬜ `POST /api/v1/auth/register` — Register with phone number
- ⬜ `POST /api/v1/auth/otp/send` — Send OTP
- ⬜ `POST /api/v1/auth/otp/verify` — Verify OTP, return JWT
- ⬜ `POST /api/v1/auth/login` — Login flow
- ⬜ `POST /api/v1/auth/refresh` — Refresh JWT token
- ⬜ `POST /api/v1/kyc/aadhaar` — Submit Aadhaar for verification
- ⬜ `POST /api/v1/kyc/bank` — Submit bank details + penny drop
- ⬜ `POST /api/v1/kyc/documents` — Upload KYC documents
- ⬜ `GET /api/v1/kyc/status` — Get KYC verification status

### 2.5 Integrations
- ⬜ Implement `app/integrations/aadhaar_gateway.py` — UIDAI/DigiLocker integration
- ⬜ Implement `app/integrations/sms_provider.py` — MSG91/Twilio SMS client
- ⬜ Implement `app/integrations/s3_client.py` — AWS S3 document storage
- ⬜ Implement `app/integrations/penny_drop_client.py` — Bank verification

### 2.6 Events & Tasks
- ⬜ Publish events: `worker.registered`, `worker.kyc_completed`, `worker.kyc_failed`
- ⬜ Implement `app/tasks/kyc_review_task.py` — Async KYC review processing
- ⬜ Implement `app/tasks/document_cleanup_task.py` — Expired document cleanup

### 2.7 Tests
- ⬜ Unit tests for OTP service (generation, verification, expiry)
- ⬜ Unit tests for KYC orchestration logic
- ⬜ Integration tests for registration → OTP → KYC flow
- ⬜ Integration tests for JWT token lifecycle

---

## Phase 3 — Policy Service (`services/policy-service/`)

> Insurance policy lifecycle, plans, and premiums

### 3.1 Core Setup
- ⬜ Configure service settings, dependencies, `main.py`

### 3.2 Models & Schemas
- ⬜ Implement `app/models/plan_config.py` — Insurance plan configurations
- ⬜ Implement `app/models/policy.py` — Active/lapsed/renewed policies
- ⬜ Implement `app/models/premium_payment.py` — Payment tracking
- ⬜ Implement `app/models/policy_change_log.py` — Audit trail
- ⬜ Define Pydantic schemas for plan listing, policy creation, renewal, premium payment

### 3.3 Services & Repositories
- ⬜ Implement `app/services/plan_service.py` — Dynamic plan retrieval based on risk
- ⬜ Implement `app/services/policy_service.py` — Issue, renew, cancel, lapse
- ⬜ Implement `app/services/premium_service.py` — Premium calculation with risk multiplier
- ⬜ Implement `app/services/renewal_service.py` — Auto-renewal orchestration
- ⬜ Implement `app/services/mandate_service.py` — Razorpay mandate management

### 3.4 API Routes
- ⬜ `GET /api/v1/plans` — List available plans (personalized by risk)
- ⬜ `POST /api/v1/policies` — Issue new policy
- ⬜ `GET /api/v1/policies/{id}` — Get policy details
- ⬜ `GET /api/v1/policies/worker/{worker_id}` — Worker's policy history
- ⬜ `POST /api/v1/policies/{id}/renew` — Renew policy
- ⬜ `POST /api/v1/policies/{id}/cancel` — Cancel policy
- ⬜ `POST /api/v1/premiums/pay` — Record premium payment
- ⬜ `GET /api/v1/premiums/{policy_id}` — Premium payment history

### 3.5 Events & Tasks
- ⬜ Publish: `policy.issued`, `policy.renewed`, `policy.lapsed`, `policy.cancelled`
- ⬜ Consume: `worker.kyc_completed` → auto-generate plan recommendations
- ⬜ Implement `app/tasks/renewal_scheduler.py` — Batch renewal processing
- ⬜ Implement `app/tasks/premium_collection_task.py` — Auto-debit via mandate
- ⬜ Implement `app/tasks/grace_period_checker.py` — Lapse policies past grace period

### 3.6 Tests
- ⬜ Unit tests for premium calculation with different risk profiles
- ⬜ Unit tests for policy state machine (issue → renew → lapse → cancel)
- ⬜ Integration tests for full policy lifecycle

---

## Phase 4 — Risk Engine Service (`services/risk-engine/`)

> ML-powered risk scoring and premium personalization

### 4.1 Core Setup
- ⬜ Configure service with ML model paths, feature flags

### 4.2 Models & Schemas
- ⬜ Implement `app/models/risk_profile.py` — Worker risk profiles
- ⬜ Implement `app/models/zone_risk_snapshot.py` — Geographic risk data

### 4.3 ML Pipeline
- ⬜ Implement `app/ml/feature_engineering.py` — Build features from worker history, zone data
- ⬜ Implement `app/ml/risk_model.py` — Risk scoring model (gradient boosting / logistic)
- ⬜ Implement `app/ml/training/train.py` — Model training pipeline
- ⬜ Implement `app/ml/training/evaluate.py` — Model evaluation & metrics
- ⬜ Create initial model with synthetic training data
- ⬜ Store trained model artifacts in `app/ml/models/trained/`

### 4.4 Services
- ⬜ Implement `app/services/risk_scoring_service.py` — Compute worker risk score
- ⬜ Implement `app/services/premium_calculator_service.py` — Risk-adjusted premium pricing
- ⬜ Implement `app/services/zone_risk_service.py` — Aggregate zone risk levels
- ⬜ Implement `app/services/feature_builder_service.py` — Real-time feature computation

### 4.5 API Routes
- ⬜ `GET /api/v1/risk/worker/{worker_id}` — Get worker risk score
- ⬜ `GET /api/v1/risk/zone/{zone_id}` — Get zone risk level
- ⬜ `POST /api/v1/risk/premium-quote` — Calculate premium for risk profile
- ⬜ `POST /api/v1/risk/batch-score` — Batch risk scoring

### 4.6 Integrations
- ⬜ Implement weather API client (OpenWeatherMap)
- ⬜ Implement AQI API client (CPCB)
- ⬜ Implement NDMA client for disaster data

### 4.7 Events
- ⬜ Consume: `disruption.detected` → update zone risk snapshots
- ⬜ Publish: `risk.profile_updated`, `risk.zone_updated`

### 4.8 Tests
- ⬜ Unit tests for feature engineering pipeline
- ⬜ Unit tests for risk score calculation
- ⬜ Unit tests for premium price computation
- ⬜ Integration tests for end-to-end risk scoring

---

## Phase 5 — Disruption Monitor Service (`services/disruption-monitor/`)

> Real-time monitoring of weather, AQI, civic disruptions

### 5.1 Core Setup
- ⬜ Configure polling intervals, API keys, threshold settings

### 5.2 Models & Schemas
- ⬜ Implement `app/models/disruption_event.py` — Disruption event records
- ⬜ Implement `app/models/disruption_event_zone.py` — Zone impact mapping
- ⬜ Implement `app/models/disruption_threshold.py` — Configurable thresholds
- ⬜ Implement `app/models/delivery_zone.py` — Zone geometry/definitions
- ⬜ Implement `app/models/platform_activity_snapshot.py` — Gig platform activity logs

### 5.3 Services
- ⬜ Implement `app/services/weather_monitor.py` — OpenWeatherMap polling → event generation
- ⬜ Implement `app/services/aqi_monitor.py` — CPCB AQI polling → event generation
- ⬜ Implement `app/services/civic_monitor.py` — Civic disruption detection
- ⬜ Implement `app/services/event_evaluator.py` — Evaluate if conditions cross thresholds
- ⬜ Implement `app/services/threshold_evaluator.py` — Configurable threshold comparison
- ⬜ Implement `app/services/zone_service.py` — Map disruptions to affected zones
- ⬜ Implement `app/services/platform_activity_service.py` — Track platform-level drops

### 5.4 Schedulers
- ⬜ Implement `app/schedulers/monitor_scheduler.py` — APScheduler/Celery Beat setup
- ⬜ Configure `app/schedulers/cron_config.py` — Polling schedules per source

### 5.5 API Routes
- ⬜ `GET /api/v1/disruptions/active` — List active disruptions
- ⬜ `GET /api/v1/disruptions/{id}` — Disruption detail
- ⬜ `GET /api/v1/disruptions/zone/{zone_id}` — Disruptions by zone
- ⬜ `GET /api/v1/disruptions/history` — Historical disruption data
- ⬜ `GET /api/v1/zones` — List delivery zones
- ⬜ `PUT /api/v1/thresholds/{id}` — Update disruption thresholds (admin)

### 5.6 Integrations
- ⬜ Implement `app/integrations/openweathermap.py` — Weather data fetch
- ⬜ Implement `app/integrations/cpcb.py` — AQI data fetch
- ⬜ Implement `app/integrations/imd.py` — India Meteorological Department
- ⬜ Implement `app/integrations/ndma.py` — National Disaster Management
- ⬜ Implement `app/integrations/news_api.py` — Civic disruption news
- ⬜ Implement `app/integrations/platform_api.py` — Gig platform activity

### 5.7 Events & Tasks
- ⬜ Publish: `disruption.detected`, `disruption.escalated`, `disruption.resolved`
- ⬜ Implement polling tasks (weather, AQI, civic — every 15-30 min)
- ⬜ Implement event lifecycle task (auto-resolve stale events)

### 5.8 Tests
- ⬜ Unit tests for threshold evaluation logic
- ⬜ Unit tests for zone-disruption mapping
- ⬜ Integration tests with mock API responses
- ⬜ E2E test: weather spike → disruption event created → event published

---

## Phase 6 — Claims Service (`services/claims-service/`)

> Parametric claim auto-triggering, validation, lifecycle

### 6.1 Core Setup
- ⬜ Configure service with validation pipeline settings

### 6.2 Models & Schemas
- ⬜ Implement `app/models/claim.py` — Claim record model
- ⬜ Implement `app/models/claim_validation_step.py` — Per-step validation audit

### 6.3 Services
- ⬜ Implement `app/services/claim_trigger_service.py` — Auto-trigger claims from disruptions
- ⬜ Implement `app/services/claim_validation_service.py` — Multi-step validation orchestrator
- ⬜ Implement `app/services/eligibility_service.py` — Policy active? Coverage applies?
- ⬜ Implement `app/services/payout_calculator_service.py` — Payout amount computation
- ⬜ Implement `app/services/claim_lifecycle_service.py` — State transitions: triggered → validated → approved → paid

### 6.4 Validation Pipeline Steps
- ⬜ Step 1: Policy eligibility check (active policy, not lapsed)
- ⬜ Step 2: Disruption verification (fetch disruption from disruption-monitor)
- ⬜ Step 3: GPS/location validation (was worker in affected zone?)
- ⬜ Step 4: Fraud check (call fraud-service for risk score)
- ⬜ Step 5: Activity correlation (platform activity drop matches disruption?)
- ⬜ Step 6: Payout amount calculation
- ⬜ Step 7: Auto-approve or flag for manual review

### 6.5 API Routes
- ⬜ `GET /api/v1/claims/worker/{worker_id}` — Worker's claim history
- ⬜ `GET /api/v1/claims/{id}` — Claim detail with validation steps
- ⬜ `POST /api/v1/claims/manual` — Manual claim submission
- ⬜ `PATCH /api/v1/claims/{id}/approve` — Admin approve (for flagged claims)
- ⬜ `PATCH /api/v1/claims/{id}/reject` — Admin reject
- ⬜ `GET /api/v1/claims/queue` — Admin review queue

### 6.6 Events & Tasks
- ⬜ Consume: `disruption.detected` → auto-trigger claims for affected workers
- ⬜ Publish: `claim.triggered`, `claim.validated`, `claim.approved`, `claim.rejected`, `claim.paid`
- ⬜ Implement `app/tasks/auto_trigger.py` — Batch identify eligible workers
- ⬜ Implement `app/tasks/validation_pipeline.py` — Async validation step runner
- ⬜ Implement `app/tasks/claim_expiry.py` — Expire unclaimed/stale claims

### 6.7 Tests
- ⬜ Unit tests for each validation step
- ⬜ Unit tests for payout calculation (different plan types, coverage limits)
- ⬜ Integration tests for complete claim lifecycle
- ⬜ E2E test: disruption event → claim triggered → validated → approved → payout initiated

---

## Phase 7 — Fraud Detection Service (`services/fraud-service/`)

> ML-based fraud scoring using Isolation Forest

### 7.1 Core Setup
- ⬜ Configure fraud scoring thresholds, ML model paths

### 7.2 Models & Schemas
- ⬜ Implement `app/models/fraud_assessment.py` — Per-claim fraud scores
- ⬜ Implement `app/models/fraud_flag_catalog.py` — Configurable fraud flags
- ⬜ Implement `app/models/worker_fraud_watch.py` — Watch list tracking

### 7.3 ML Pipeline
- ⬜ Implement `app/ml/feature_engineering.py` — Fraud feature extraction
  - Claim frequency, GPS anomalies, activity patterns, timing analysis
- ⬜ Implement `app/ml/isolation_forest.py` — Isolation Forest model wrapper
- ⬜ Implement `app/ml/model_registry.py` — Model versioning & loading
- ⬜ Implement `app/ml/training/train.py` — Training pipeline
- ⬜ Implement `app/ml/training/data_prep.py` — Synthetic fraud data generation
- ⬜ Generate initial trained model

### 7.4 Services
- ⬜ Implement `app/services/fraud_engine.py` — Orchestrate all fraud checks
- ⬜ Implement `app/services/gps_validator.py` — GPS spoofing detection
- ⬜ Implement `app/services/activity_analyzer.py` — Platform activity cross-validation
- ⬜ Implement `app/services/duplicate_detector.py` — Duplicate claim detection
- ⬜ Implement `app/services/behavioral_analyzer.py` — Behavioral pattern anomaly detection
- ⬜ Implement `app/services/fraud_override.py` — Admin manual override logic

### 7.5 API Routes
- ⬜ `POST /api/v1/fraud/assess` — Score a claim for fraud
- ⬜ `GET /api/v1/fraud/assessment/{claim_id}` — Get fraud assessment detail
- ⬜ `GET /api/v1/fraud/watch-list` — View fraud watch list
- ⬜ `POST /api/v1/fraud/override` — Admin override fraud decision
- ⬜ `GET /api/v1/fraud/flags` — List fraud flag catalog

### 7.6 Events
- ⬜ Consume: `claim.triggered` → perform fraud assessment
- ⬜ Publish: `fraud.assessed`, `fraud.high_risk_flagged`, `fraud.cleared`

### 7.7 Tests
- ⬜ Unit tests for each fraud detection component
- ⬜ Unit tests for ML model inference
- ⬜ Integration tests with synthetic fraud scenarios

---

## Phase 8 — Payout Service (`services/payout-service/`)

> Razorpay payout processing, ledger, reconciliation

### 8.1 Core Setup
- ⬜ Configure Razorpay API keys, webhook secrets

### 8.2 Models & Schemas
- ⬜ Implement `app/models/payout.py` — Payout records
- ⬜ Implement `app/models/payout_webhook.py` — Webhook event logs
- ⬜ Implement `app/models/payout_ledger.py` — Double-entry ledger

### 8.3 Services
- ⬜ Implement `app/services/payout_service.py` — Initiate payout via Razorpay
- ⬜ Implement `app/services/ledger_service.py` — Ledger entries (credit/debit)
- ⬜ Implement `app/services/reconciliation_service.py` — Daily reconciliation
- ⬜ Implement `app/services/refund_service.py` — Handle refund scenarios

### 8.4 API Routes
- ⬜ `POST /api/v1/payouts` — Initiate payout for approved claim
- ⬜ `GET /api/v1/payouts/{id}` — Payout status
- ⬜ `GET /api/v1/payouts/worker/{worker_id}` — Worker payout history
- ⬜ `POST /api/v1/payouts/webhook` — Razorpay webhook receiver
- ⬜ `GET /api/v1/payouts/ledger` — Ledger view (admin)
- ⬜ `POST /api/v1/payouts/reconcile` — Trigger reconciliation (admin)

### 8.5 Integrations
- ⬜ Implement `app/integrations/razorpay_payout.py` — Razorpay Payout API client
- ⬜ Implement `app/integrations/razorpay_webhook_validator.py` — Webhook signature verification

### 8.6 Events & Tasks
- ⬜ Consume: `claim.approved` → initiate payout
- ⬜ Publish: `payout.initiated`, `payout.completed`, `payout.failed`
- ⬜ Implement `app/tasks/payout_processor.py` — Batch payout processing
- ⬜ Implement `app/tasks/retry_failed_payouts.py` — Retry logic with backoff
- ⬜ Implement `app/tasks/reconciliation.py` — Daily ledger reconciliation

### 8.7 Tests
- ⬜ Unit tests for payout orchestration
- ⬜ Unit tests for ledger double-entry correctness
- ⬜ Integration tests with mock Razorpay API
- ⬜ Webhook signature verification tests

---

## Phase 9 — Notification Service (`services/notification-service/`)

> Multi-channel notifications: SMS, WhatsApp, Push, Email

### 9.1 Core Setup
- ⬜ Configure MSG91, Twilio, Firebase, SMTP credentials

### 9.2 Models & Schemas
- ⬜ Implement `app/models/notification.py` — Notification log
- ⬜ Implement `app/models/notification_template.py` — Template management

### 9.3 Services
- ⬜ Implement `app/services/notification_service.py` — Channel routing orchestrator
- ⬜ Implement `app/services/template_service.py` — Template rendering (Jinja2/i18n)
- ⬜ Implement `app/services/sms_service.py` — SMS dispatch
- ⬜ Implement `app/services/whatsapp_service.py` — WhatsApp Business dispatch
- ⬜ Implement `app/services/push_service.py` — Firebase push dispatch
- ⬜ Implement `app/services/email_service.py` — SMTP/SES email dispatch

### 9.4 Templates
- ⬜ Create SMS templates: OTP, claim triggered, claim approved, payout sent
- ⬜ Create WhatsApp templates: Policy issued, disruption alert, claim update
- ⬜ Create Email templates: Welcome, KYC status, monthly summary
- ⬜ Create Push notification templates: Disruption alert, claim status
- ⬜ Multi-language support: en, hi, ta, te, kn, bn

### 9.5 API Routes
- ⬜ `POST /api/v1/notifications/send` — Send notification (internal)
- ⬜ `GET /api/v1/notifications/worker/{worker_id}` — Notification history
- ⬜ `PUT /api/v1/notifications/templates/{id}` — Update template (admin)
- ⬜ `POST /api/v1/notifications/broadcast` — Bulk notification (admin)

### 9.6 Events
- ⬜ Consume: `claim.triggered` → notify worker of auto-claim
- ⬜ Consume: `claim.approved` → notify worker claim approved
- ⬜ Consume: `payout.completed` → notify worker payout sent
- ⬜ Consume: `disruption.detected` → alert affected workers
- ⬜ Consume: `worker.kyc_completed` → onboarding next steps

### 9.7 Tests
- ⬜ Unit tests for template rendering with i18n
- ⬜ Unit tests for channel routing logic
- ⬜ Integration tests with mock SMS/WhatsApp providers

---

## Phase 10 — Analytics Service (`services/analytics-service/`)

> Dashboard KPIs, zone analytics, reports

### 10.1 Models & Schemas
- ⬜ Implement `app/models/daily_analytics_snapshot.py`
- ⬜ Implement `app/models/worker_weekly_summary.py`
- ⬜ Implement `app/models/zone_disruption_heatmap.py`

### 10.2 Services
- ⬜ Implement `app/services/dashboard_service.py` — Live KPIs (active workers, policies, claims, payouts)
- ⬜ Implement `app/services/worker_analytics_service.py` — Per-worker metrics
- ⬜ Implement `app/services/zone_analytics_service.py` — Zone-level aggregations
- ⬜ Implement `app/services/financial_analytics_service.py` — Loss ratio, premium collection, payout rates
- ⬜ Implement `app/services/report_generator_service.py` — PDF/CSV report generation

### 10.3 API Routes
- ⬜ `GET /api/v1/analytics/dashboard` — Admin dashboard KPIs
- ⬜ `GET /api/v1/analytics/worker/{worker_id}` — Worker performance summary
- ⬜ `GET /api/v1/analytics/zones` — Zone-wise disruption heatmap data
- ⬜ `GET /api/v1/analytics/financial` — Financial summary
- ⬜ `GET /api/v1/analytics/reports` — Generate downloadable reports
- ⬜ `GET /api/v1/analytics/exports/{format}` — Export data (CSV, PDF)

### 10.4 Tasks
- ⬜ Implement daily snapshot aggregation (Celery Beat — midnight IST)
- ⬜ Implement weekly worker summary generation
- ⬜ Implement heatmap data aggregation
- ⬜ Implement scheduled report generation

### 10.5 Tests
- ⬜ Unit tests for KPI computations
- ⬜ Unit tests for report generation
- ⬜ Integration tests for analytics endpoints

---

## Phase 11 — API Gateway (`services/api-gateway/`)

> Routing, rate limiting, JWT validation, circuit breaking

### 11.1 Implementation
- ⬜ Configure `nginx/nginx.conf` — Upstream routing to all services
- ⬜ Configure `nginx/upstream.conf` — Service discovery
- ⬜ Implement `app/middleware/rate_limit.py` — Per-IP / per-user rate limiting
- ⬜ Implement `app/middleware/jwt_auth.py` — JWT verification & injection
- ⬜ Implement `app/middleware/request_id.py` — X-Request-ID propagation
- ⬜ Implement `app/middleware/logging.py` — Access logging
- ⬜ Implement `app/services/circuit_breaker.py` — Circuit breaker for downstream calls
- ⬜ Implement `app/services/service_discovery.py` — Service registry
- ⬜ Implement `app/services/load_balancer.py` — Load balancing logic
- ⬜ Implement health check aggregation endpoint

### 11.2 Tests
- ⬜ Test rate limiting behavior
- ⬜ Test JWT validation and rejection
- ⬜ Test circuit breaker open/close states

---

## Phase 12 — Worker App Frontend (`frontend/worker-app/`)

> React PWA for gig workers

### 12.1 Foundation
- ⬜ Set up Vite + React + TypeScript project
- ⬜ Configure Tailwind CSS with GigShield theme
- ⬜ Set up Redux Toolkit store with slices
- ⬜ Set up React Router with protected routes
- ⬜ Configure i18n (Hindi, Tamil, Telugu, Kannada, Bengali, English)
- ⬜ Set up API client with axios interceptors (JWT refresh)
- ⬜ Configure PWA service worker

### 12.2 Auth Pages
- ⬜ Login page (phone number input)
- ⬜ OTP verification page
- ⬜ Registration page
- ⬜ KYC upload page (Aadhaar, PAN, bank details)

### 12.3 Onboarding Flow
- ⬜ Welcome/splash page
- ⬜ Plan selection page (with risk-adjusted pricing)
- ⬜ Payment setup (Razorpay mandate)

### 12.4 Dashboard
- ⬜ Main dashboard — active policy, recent disruptions, claim status
- ⬜ Policy details card — coverage, premium, renewal date
- ⬜ Disruption alerts — real-time weather/AQI cards

### 12.5 Claims
- ⬜ Claim history page with status timeline
- ⬜ Claim detail page — validation steps, payout amount
- ⬜ Manual claim submission form

### 12.6 Payouts
- ⬜ Payout history list
- ⬜ Payout detail with bank transfer status

### 12.7 Profile
- ⬜ Profile page — personal info, KYC status
- ⬜ Bank details management
- ⬜ Plan upgrade/downgrade

### 12.8 Cross-Cutting
- ⬜ Auth guard (redirect to login if no JWT)
- ⬜ KYC guard (redirect to KYC if incomplete)
- ⬜ Offline support (service worker caching)
- ⬜ Push notification opt-in
- ⬜ Responsive design testing (mobile-first)

### 12.9 Tests
- ⬜ Component unit tests (React Testing Library)
- ⬜ Redux slice unit tests
- ⬜ E2E tests (Cypress/Playwright)

---

## Phase 13 — Admin Dashboard Frontend (`frontend/admin-dashboard/`)

> React dashboard for insurers and Guidewire admins

### 13.1 Foundation
- ⬜ Set up Vite + React + TypeScript
- ⬜ Configure Tailwind CSS admin theme
- ⬜ Set up Redux Toolkit store
- ⬜ Set up React Router with role-based guards
- ⬜ Configure Recharts for charting
- ⬜ Configure Leaflet.js for heatmaps

### 13.2 Overview Dashboard
- ⬜ KPI cards — active workers, policies, claims today, payouts today
- ⬜ Live trend charts — claims volume, payout amounts
- ⬜ System health indicators

### 13.3 Worker Management
- ⬜ Worker list page with search/filter/pagination
- ⬜ Worker detail page — profile, policies, claims history
- ⬜ KYC review queue — pending verifications
- ⬜ KYC detail — document viewer, approve/reject actions

### 13.4 Claims Management
- ⬜ Claims list with advanced filters (status, date, zone)
- ⬜ Claim detail — full validation step audit trail
- ⬜ Manual review queue — fraud-flagged claims
- ⬜ Approve/reject actions with reason

### 13.5 Disruption Monitoring
- ⬜ Active disruption list
- ⬜ Disruption heatmap (Leaflet.js) — zone overlay
- ⬜ Threshold configuration page
- ⬜ Monitoring status — API health, last poll times

### 13.6 Fraud Management
- ⬜ Fraud alert feed — real-time high-risk flags
- ⬜ Fraud detail — ML scores, feature breakdown
- ⬜ Watch list management
- ⬜ Override actions

### 13.7 Financial / Payouts
- ⬜ Payout list with reconciliation status
- ⬜ Financial report page — loss ratio, premium vs payouts
- ⬜ Reconciliation dashboard

### 13.8 Analytics & Reports
- ⬜ Analytics overview page with charts
- ⬜ Zone analytics with map visualization
- ⬜ Export functionality (CSV, PDF)

### 13.9 Settings
- ⬜ User management (admin roles/permissions)
- ⬜ System configuration page
- ⬜ Audit log viewer

### 13.10 Tests
- ⬜ Component unit tests
- ⬜ DataTable and chart component tests
- ⬜ E2E tests for critical admin flows

---

## Phase 14 — Mock Services (`mocks/`)

> Simulate external APIs for development & demo

### 14.1 Platform Activity API
- ⬜ Mock endpoints for Swiggy, Zomato, Uber, Ola, Zepto, Blinkit
- ⬜ Generate realistic delivery/ride activity data
- ⬜ Simulate activity drops during disruptions

### 14.2 Weather & AQI APIs
- ⬜ Mock OpenWeatherMap responses for Indian cities
- ⬜ Mock CPCB AQI responses
- ⬜ Simulate extreme weather events

### 14.3 Civic Alerts API
- ⬜ Mock civic disruption data (protests, road closures)

### 14.4 Razorpay API
- ⬜ Mock payout initiation and status
- ⬜ Mock mandate creation
- ⬜ Mock webhook callbacks

### 14.5 Aadhaar API
- ⬜ Mock Aadhaar OTP + verification flow

---

## Phase 15 — Local Runtime & DevOps

### 15.1 Local Runtime
- ⬜ Finalize local startup scripts for all services
- ⬜ Add health-check script for local dependencies (Postgres/Redis/RabbitMQ)
- ⬜ Ensure hot-reload works for all backend and frontend services
- ⬜ Document local environment variables per service
- ⬜ Add one-command local start and smoke-check workflow

### 15.2 CI/CD (GitHub Actions)
- ⬜ Lint workflow — black, isort, flake8, eslint
- ⬜ Test workflow — pytest for all services, vitest for frontends
- ⬜ Build workflow — backend packages and frontend production bundles
- ⬜ CD staging — auto-deploy on merge to develop
- ⬜ CD production — deploy on tag/release

### 15.3 Monitoring
- ⬜ Configure Prometheus to scrape all service metrics
- ⬜ Create Grafana dashboards (system, claims, disruptions, fraud, payouts)
- ⬜ Configure Alertmanager rules
- ⬜ Set up Loki + Promtail for log aggregation

### 15.4 Kubernetes (Production)
- ⬜ Namespace configuration
- ⬜ Deployment manifests for all services
- ⬜ Service manifests + Ingress
- ⬜ ConfigMaps and Secrets
- ⬜ Horizontal Pod Autoscaler configs
- ⬜ Health check probes (liveness + readiness)

### 15.5 Scripts
- ⬜ `deploy.sh` — Full stack deployment
- ⬜ `seed-db.sh` — Seed reference data
- ⬜ `backup-db.sh` / `restore-db.sh` — DB backup/restore
- ⬜ `health-check.sh` — Verify all services are running
- ⬜ `start-dev.sh` — One-command local development startup

---

## Phase 16 — Documentation

### 16.1 Architecture Docs
- ⬜ System architecture diagram (Mermaid/draw.io)
- ⬜ Data flow documentation
- ⬜ Event flow documentation (pub/sub mapping)
- ⬜ Database ERD diagram
- ⬜ Microservices communication map

### 16.2 API Documentation
- ⬜ OpenAPI specifications for all 10 services
- ⬜ Postman collection with example requests
- ⬜ API integration guide

### 16.3 Guides
- ⬜ Local setup guide
- ⬜ Deployment guide
- ⬜ Testing guide
- ⬜ Contributing guide

### 16.4 Demo
- ⬜ Demo guide — step-by-step walkthrough
- ⬜ Demo scenarios — happy path + edge cases
- ⬜ Architecture Decision Records (ADRs)

---

## Phase 17 — Integration & E2E Testing

### 17.1 Cross-Service Integration Tests
- ⬜ Auth → Policy: Registration → KYC → Policy issuance
- ⬜ Disruption → Claims: Weather event → auto-claim trigger
- ⬜ Claims → Fraud → Payout: Claim validation pipeline
- ⬜ Claims → Payout → Notification: Approval → payout → notify
- ⬜ Risk → Policy: Risk score affects premium pricing

### 17.2 End-to-End Flows
- ⬜ **Happy Path**: Worker registers → KYC completes → policy issued → disruption occurs → claim auto-triggered → validated → fraud cleared → payout sent → worker notified
- ⬜ **Fraud Path**: Claim triggered → fraud flagged → manual review → admin override
- ⬜ **Renewal Path**: Policy expiry → auto-renewal attempt → mandate debit → renewed
- ⬜ **Disruption Cascade**: Weather event → multiple zones affected → batch claims triggered

### 17.3 Load & Performance
- ⬜ Load test with Locust/k6 — simulate 10K concurrent workers
- ⬜ Database query performance benchmarks
- ⬜ Event throughput testing (claims/second)

---

## Phase 18 — Demo Preparation (Hackathon)

### 18.1 Demo Data Setup
- ⬜ Seed database with realistic demo workers, zones, policies
- ⬜ Pre-populate disruption history
- ⬜ Generate sample claims and payouts
- ⬜ Configure mock APIs with demo-friendly responses

### 18.2 Demo Script
- ⬜ 5-minute walkthrough script
- ⬜ Screen recording preparation
- ⬜ Key talking points per feature

### 18.3 Final Polish
- ⬜ Verify all local services start cleanly
- ⬜ Test complete happy-path flow end-to-end
- ⬜ Verify admin dashboard shows live data
- ⬜ Verify worker app PWA installs correctly
- ⬜ Performance sanity check

---

## Quick Reference — Service Dependencies

```
Auth Service       → (standalone, optional S3/SMS integrations)
Policy Service     → Auth, Risk Engine
Risk Engine        → Disruption Monitor (weather/AQI data)
Disruption Monitor → (standalone, external API polling)
Claims Service     → Policy, Disruption Monitor, Fraud, Payout, Notification
Fraud Service      → (standalone, called by Claims)
Payout Service     → (standalone, Razorpay integration)
Notification       → (standalone, event-driven from all services)
Analytics          → (reads from all service databases/events)
API Gateway        → Routes to all backend services
```

## Recommended Build Order

1. **Shared Library** — all services depend on this
2. **Auth Service** — user identity foundation
3. **Policy Service** — core insurance product
4. **Risk Engine** — risk scoring for premiums
5. **Disruption Monitor** — real-time data pipeline
6. **Claims Service** — central business logic
7. **Fraud Detection** — ML-powered validation
8. **Payout Service** — financial transactions
9. **Notification Service** — communications layer
10. **Analytics Service** — reporting and dashboards
11. **API Gateway** — unified entry point
12. **Worker App** — consumer-facing frontend
13. **Admin Dashboard** — operator-facing frontend
14. **Mock Services** — testing/demo support
15. **Infrastructure** — CI/CD, monitoring, K8s
16. **Documentation** — architecture, API docs, guides
17. **Integration Testing** — cross-service verification
18. **Demo Preparation** — hackathon readiness

---

> **Total Estimated Tasks: ~350+**  
> **Recommended Team**: 4-6 developers  
> **Estimated Sprint Duration**: 8-12 weeks for full implementation  
> **Hackathon MVP Scope**: Phases 0-8 + Phase 12 (core backend + worker app)
