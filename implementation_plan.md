# Implementation Plan - Investment & Payout Management Platform

This document outlines the step-by-step build order and provides exact Antigravity prompts to implement the Investment & Payout Management Platform. The plan is designed for rapid execution to meet tomorrow's demo deadline.

---

## User Review Required

> [!IMPORTANT]
> **Demo Timeline Priority:** To complete the system for tomorrow's demo:
> 1. We will establish the core monorepo structure and Docker services first.
> 2. Then, we will build the Django backend API service to handle database structures and business logic.
> 3. After the backend is verified, we will generate the Next.js Dashboards (Owner & Supervisor) and the Expo Mobile App.
> 4. For mock services during the demo, Twilio SMS and Firebase Push Notifications will fall back to console logging if real API credentials are not provided, ensuring functional flows remain testable.

---

## Proposed Changes

We will organize the code into a unified monorepo:
- `backend/`: Django + DRF API service
- `apps/owner-dashboard/`: Next.js 14 owner portal
- `apps/supervisor-dashboard/`: Next.js 14 supervisor portal
- `apps/mobile/`: React Native Expo Go client app
- `packages/ui/`, `packages/types/`, `packages/utils/`: Shared monorepo packages
- `docker-compose.yml`: For local PostgreSQL and Redis

---

## Sequential Build Order & Prompts

### Phase 1: Infrastructure & Monorepo Setup

#### Prompt 1: Initializing Monorepo and Docker Environment
```text
Set up the workspace root for the 'Varahi' investment platform monorepo. 
Create the following files in the project root f:\Projects\Varahi:

1. `docker-compose.yml` defining:
   - A PostgreSQL 16 database service on port 5432, with a persistent volume and credentials.
   - A Redis 7 service on port 6379 for OTP/cache.
2. Root `package.json` utilizing npm workspaces:
   - Workspaces configured for: `"apps/*"`, `"packages/*"`
   - Script to spin up docker services: `"docker:up": "docker compose up -d"`, `"docker:down": "docker compose down"`
3. A root `.env.example` containing environment skeletons for backend, mobile, and web applications.
4. Run `npm install` and start the Docker services using `docker compose up -d` to ensure both PostgreSQL and Redis are active and ready.
```

---

### Phase 2: Django Backend API Setup

#### Prompt 2: Django Project Scaffold and Configuration
```text
Scaffold a Django project named `config` inside a `backend/` directory in the monorepo root.
1. Create a Python virtual environment at `backend/venv` and install:
   - `django>=5.0`
   - `djangorestframework`
   - `djangorestframework-simplejwt`
   - `psycopg[binary]`
   - `django-cors-headers`
   - `redis`
   - `celery`
   - `django-environ`
2. Structure the settings file at `backend/config/settings.py` to:
   - Load environment variables from `backend/.env`.
   - Set up database connection using the dockerized PostgreSQL database.
   - Configure cache using the dockerized Redis database.
   - Configure REST Framework to use SimpleJWT authentication by default.
   - Enable CORS for localhost (ports 3000, 3001, 8081).
3. Create `backend/manage.py` and run a health check verification to ensure the server starts on port 8000.
```

#### Prompt 3: User Authentication & OTP Service
```text
Implement the `authentication` app in the Django backend.
1. Create the `CustomUser` model inheriting from `AbstractUser` with fields:
   - `id` (UUID Primary Key)
   - `mobile_number` (unique, VARCHAR(15))
   - `role` ('customer', 'supervisor', 'owner')
   - `pin_hash` (hashed PIN value)
   - `biometric_enabled` (boolean)
   - `kyc_status` ('pending', 'under_review', 'approved', 'rejected')
   - `wallet_balance` (decimal)
   - `referral_code` (unique, nullable)
   - `referred_by` (foreign key to self)
2. Create the `DeviceTrust` model to log trusted device IDs.
3. Write a service module at `backend/apps/authentication/services/otp_service.py`:
   - `send_otp(mobile)`: Generates a 6-digit OTP, stores it in Redis with 5-minute TTL, and logs it to console for demo fallback (or calls Twilio SMS if credentials are in .env).
   - `verify_otp(mobile, otp)`: Checks Redis cache.
4. Implement API views and endpoints:
   - `POST /api/v1/auth/send-otp/`
   - `POST /api/v1/auth/verify-otp/` (returns Access/Refresh JWT and user role)
   - `POST /api/v1/auth/set-pin/` (hashes and sets PIN code)
   - `POST /api/v1/auth/verify-pin/` (verifies PIN)
```

#### Prompt 4: Plans, Investments & Manual UPI Flow
```text
Create two apps in the backend: `plans` and `investments`.
1. Model `InvestmentPlan` in `plans/models.py`:
   - `name`, `description`, `min_amount`, `max_amount`
   - `return_rate_percent`, `tenure_months`, `payout_frequency` ('monthly', 'quarterly', 'on_maturity')
   - `premature_penalty_percent`, `is_active`
2. Model `Investment` in `investments/models.py`:
   - `customer` (FK to User), `plan` (FK to InvestmentPlan), `amount`, `status` ('pending', 'active', 'rejected', 'matured', 'withdrawn')
   - `start_date`, `maturity_date`, `upi_txn_ref`, `screenshot_url`
   - `approved_by` (FK to User), `approved_at`, `rejection_reason`
3. Write API views for:
   - `GET /api/v1/plans/` (customers see active only, admin sees all)
   - `POST /api/v1/plans/` (owner only)
   - `POST /api/v1/investments/initiate/` (initiates investment, generates unique transaction reference, returns Owner's UPI ID from environment settings)
   - `POST /api/v1/investments/submit/` (uploads screenshot and reference number)
   - `POST /api/v1/investments/{id}/approve/` (owner/supervisor only; calculates and sets start_date/maturity_date, generates empty pending payouts)
   - `POST /api/v1/investments/{id}/reject/` (owner/supervisor only)
```

#### Prompt 5: Payouts Scheduler, KYC, and Referrals
```text
Implement `payouts`, `kyc`, and `referrals` modules on the backend.
1. Model `Payout` in `payouts/models.py`:
   - `investment` (FK to Investment), `due_date`, `amount`, `status` ('pending', 'paid', 'overdue', 'skipped'), `paid_at`, `processed_by`
2. Model `KycDocument` in `kyc/models.py`:
   - `user` (FK to User), `aadhaar_front_url`, `aadhaar_back_url`, `pan_url`, `selfie_url`
   - Bank details: `bank_account_number`, `ifsc_code`, `bank_name`
   - `reviewed_by`, `review_remarks`, `submitted_at`, `reviewed_at`
3. Model `ReferralBonus` in `referrals/models.py`:
   - `referrer`, `referred_user`, `investment`, `bonus_amount`, `status` ('pending', 'credited')
4. Set up Celery config `backend/config/celery.py`:
   - Define a daily periodic task (9:00 AM IST) that finds active investments, checks if a payout due_date is today, and creates pending `Payout` records.
   - Auto-credit referral bonus to `referred_by` user's wallet when a referred user's first investment goes 'active'.
5. Create APIs:
   - `POST /api/v1/kyc/submit/`
   - `POST /api/v1/kyc/{id}/approve/` and `POST /api/v1/kyc/{id}/reject/`
   - `GET /api/v1/payouts/` (filter by status/date range)
   - `POST /api/v1/payouts/{id}/mark-paid/` & `/api/v1/payouts/bulk-mark-paid/` (updates status to 'paid', logs auditor ID)
   - `POST /api/v1/payouts/withdrawal-request/` (premature exit, applies configured penalty)
```

---

### Phase 3: Shared Workspace Packages

#### Prompt 6: Setup Monorepo Packages (Types, Utils, Components)
```text
Set up the `packages/` directory for code sharing.
1. Create `packages/types/`:
   - Define TypeScript interfaces matching Django database schema (User, Investment, Payout, KYC, Plan, Referral).
2. Create `packages/utils/`:
   - Write standard formatting and calculation helpers:
     - `formatINR(amount)`: formats currency into Indian format (e.g. ₹1,00,000.00).
     - `calculateMaturity(amount, rate, months)`: returns maturity value.
     - `calculatePayoutDates(startDate, months, frequency)`: computes schedule dates.
3. Configure `tsconfig.json` and package linking so `apps/*` can import from `@packages/types` and `@packages/utils` natively.
```

---

### Phase 4: Owner & Supervisor Web Dashboards

#### Prompt 7: Web Project Scaffolding
```text
Set up two Next.js 14 applications in `apps/owner-dashboard` and `apps/supervisor-dashboard`.
1. Initialize each project using Tailwind CSS and TypeScript.
2. In both dashboards, create a Next.js App Router route handler at `app/api/[...path]/route.ts` acting as an API proxy:
   - Forwards request headers.
   - Extracts the auth cookie and attaches it as `Authorization: Bearer <token>` to the Django backend requests.
3. Implement global themes (dark mode preferred), Inter font integration, and set up lucide-react icons.
```

#### Prompt 8: Admin Shared Components & Layouts
```text
Build shared dashboard layouts in `packages/ui` or as local shared folders:
1. Create `Sidebar.tsx`:
   - Owner tabs: Overview, Customers, Investment Plans, Transactions (with pending badge count), Payouts (with due today count), Supervisors, Referrals, Notifications, Reports, Logout.
   - Supervisor tabs: Scoped view hiding Plan Management, Supervisor Management, Wallet Adjustments, and Broadcasts.
2. Create standard data components:
   - `DataTable.tsx`: Flexible table supporting loading skeletons, search filtering, and bulk checkboxes.
   - `StatusBadge.tsx`: Consistent badge colors (pending: amber, active/approved/paid: green, rejected/overdue: red, matured: blue).
   - `ConfirmDialog.tsx`: Modal for confirm/cancel dialogs.
```

#### Prompt 9: Owner Dashboard Screens Implementation
```text
Implement the core screens for the Owner Dashboard in `apps/owner-dashboard/app/(dashboard)`:
1. **Overview / Analytics (`page.tsx`)**:
   - Total AUM card, active investor counts, pending verifications, monthly payout estimates.
   - Area chart showing growth of investments over 30 days using Recharts.
2. **Customers (`customers/page.tsx` & `[id]/page.tsx`)**:
   - Interactive table with filters.
   - Customer profile detail with Aadhaar/PAN image viewer, Approve/Reject KYC action buttons, wallet balance adjustments modal.
3. **Investment Plans (`plans/page.tsx` & `new/page.tsx` & `[id]/edit/page.tsx`)**:
   - Plan form with inputs for return rate, tenure, frequency, minimum/maximum amount, and status toggle.
4. **Transactions Verification (`transactions/page.tsx`)**:
   - Verification queue table. Click row to open screenshot image lightbox, with Accept/Reject buttons.
5. **Payouts (`payouts/page.tsx`)**:
   - Table of upcoming and overdue payouts. Multi-select bulk payout marker ("Mark Selected as Paid").
```

#### Prompt 10: Supervisor Dashboard Scoped Screens
```text
Implement Supervisor Dashboard pages in `apps/supervisor-dashboard/app/(dashboard)`:
1. Re-use customer, transactions, and payouts components.
2. Apply strict permissions mapping:
   - Hides edit buttons for plans.
   - Restricts customers screen to read-only (no approve KYC, suspend, or adjust wallet buttons).
   - Limits transactions approval: if transaction amount is > 1 Lakh (100,000 INR), show "Flag for Owner Review" instead of final "Approve" button.
```

---

### Phase 5: Customer Mobile App (Expo Go)

#### Prompt 11: Expo Go Project Structure and App Router Setup
```text
Scaffold a React Native Expo Go app (SDK 51+) in `apps/mobile/` using `expo-router` for file-based navigation.
1. Define folder layout:
   - `app/(auth)/` containing `login.tsx`, `otp-verify.tsx`, `set-pin.tsx`, `biometric-setup.tsx`.
   - `app/(app)/` containing tab layout with routes: `home`, `plans`, `portfolio`, `payouts`, `profile`.
2. Configure Axios interceptors using `expo-secure-store` to handle:
   - Access token injection in outgoing requests.
   - Silent JWT token refresh using stored refresh tokens when a 401 error is encountered.
```

#### Prompt 12: Mobile Onboarding & Authentication Flow
```text
Implement the authentication screens inside `app/(auth)` using a cohesive, premium design:
1. **Login (`login.tsx`)**:
   - Mobile number input (with validation) and primary "Send OTP" button.
2. **OTP Verification (`otp-verify.tsx`)**:
   - 6-box custom verification code fields with countdown resend timer. On success, routes to PIN setup or home.
3. **Set PIN (`set-pin.tsx`)**:
   - Custom keypad to input and confirm a 4-digit daily login PIN.
4. **Biometric Setup (`biometric-setup.tsx`)**:
   - Checks device capability (FaceID/Fingerprint) and enables biometric token login in SecureStore.
```

#### Prompt 13: Customer Portfolio & Return Calculator
```text
Implement the primary investment browsing screens in the mobile app:
1. **Home Screen (`home/index.tsx`)**:
   - Premium gradient card displaying Total Invested, returns percentage, and active plan count.
   - Next Payout card showing date and amount.
   - Quick action grid (Invest, Withdraw, Portfolio, Referrals).
2. **Plans & Calculator (`plans/index.tsx` & `[id].tsx`)**:
   - Plan browsing cards filtered by payout frequency.
   - Investment calculator interface where users slider-adjust an investment amount and view real-time monthly payouts and maturity totals.
```

#### Prompt 14: Mobile UPI Payment Deep-Linking & Verification
```text
Build the investment checkout workflow in `apps/mobile/app/payment/`:
1. **Checkout Initiate**:
   - Tapping "Invest Now" sends request to backend `/investments/initiate/` and returns transaction reference.
2. **UPI Redirect (`upi-redirect.tsx`)**:
   - Displays payment summary. Tapping "Pay Now" fires React Native `Linking.openURL` using deep link schema:
     `upi://pay?pa={backendUpiId}&pn=VarahiCapital&am={amount}&tn={txnRef}&cu=INR`
3. **Screenshot Upload (`screenshot-upload.tsx`)**:
   - Integration with `expo-image-picker` to select transaction screenshot from gallery or take a photo.
   - Post screenshot file and txnRef to `/api/v1/investments/submit/`.
   - Shows "Pending Verification" confirmation page with status guidelines.
```

#### Prompt 15: Payouts, KYC forms, and Referral Page
```text
Complete the customer mobile app tabs:
1. **Portfolio & Payouts (`portfolio/index.tsx` & `payouts/index.tsx`)**:
   - Progress bar showing elapsed time of plan.
   - Payout history list with pending/paid/overdue status.
2. **KYC Form (`profile/kyc.tsx`)**:
   - Personal and bank information inputs.
   - Document upload slots for Aadhaar (Front/Back), PAN, and Selfie.
3. **Referral Screen (`referral/index.tsx`)**:
   - Large copyable referral code. WhatsApp sharing button.
   - Earnings tracker showing referred users count and wallet balance.
```

---

## Verification Plan

### Automated Verification
- Run backend unit tests to verify:
  - OTP creation, caching in Redis, verification.
  - JWT generation, validation, refresh, and PIN login hashing validation.
  - Investment creation, payout scheduling logic, Celery periodic run triggers, and referral reward credits.
  
### Manual Demo Walkthrough (Day-of Demo)
1. **Customer Registration**:
   - Register mobile, receive mock OTP from CLI logs.
   - Set PIN and submit KYC documents.
2. **Plan Creation**:
   - Log in to Owner Dashboard.
   - Create a 12% p.a. plan.
3. **Investment & UPI Flow**:
   - Select plan on mobile app. Enter ₹1,00,000.
   - Launch deep link.
   - Upload mock screenshot to submit.
4. **Transaction Approval**:
   - View pending transaction in Supervisor Dashboard. Approve it.
   - Verify that investment moves to active on mobile app.
5. **Payout Distribution**:
   - Verify payouts are created. Mark a payout as paid in Dashboard.
   - Check mobile app for updated payout status.
