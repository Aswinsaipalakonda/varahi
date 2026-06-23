# Investment & Payout Management Platform — Product Requirements Document

> **Version:** 1.0  
> **Status:** Active Development  
> **Classification:** Confidential  
> **Prepared by:** HPS (OPC) Pvt. Ltd.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Environment & API Configuration](#5-environment--api-configuration)
6. [Authentication & Security](#6-authentication--security)
7. [Customer Mobile App (Expo Go)](#7-customer-mobile-app-expo-go)
8. [Owner Dashboard (Next.js)](#8-owner-dashboard-nextjs)
9. [Supervisor Dashboard (Next.js)](#9-supervisor-dashboard-nextjs)
10. [Shared / Reusable Components](#10-shared--reusable-components)
11. [Backend API Contract](#11-backend-api-contract)
12. [Database Schema](#12-database-schema)
13. [UPI Payment Flow](#13-upi-payment-flow)
14. [Notification System](#14-notification-system)
15. [Referral System](#15-referral-system)
16. [Non-Functional Requirements](#16-non-functional-requirements)

---

## 1. Product Overview

### 1.1 Problem Statement

A financial services operator needs a digital platform to:
- Accept investments from customers across flexible plan types
- Track and automate payout schedules
- Verify UPI-based payments without a third-party gateway
- Manage three distinct operational roles from separate interfaces

### 1.2 Solution

A three-platform system:

|
 Platform 
|
 Technology 
|
 Primary User 
|
|
---
|
---
|
---
|
|
 Customer Mobile App 
|
 React Native (Expo Go) 
|
 Retail investors 
|
|
 Owner Dashboard 
|
 Next.js 14 
|
 Platform operator 
|
|
 Supervisor Dashboard 
|
 Next.js 14 
|
 Compliance/ops officer 
|

### 1.3 Core Principles

- **No payment gateway** — UPI deep-link to owner's bank account, manual screenshot verification
- **No API keys in frontend** — all secrets live server-side only
- **Component reuse** — shared UI library consumed by both Next.js apps
- **Mobile-first auth** — PIN + biometric for daily use; OTP only on first login and sensitive events

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│   ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│   │  Customer App   │   │  Owner Dashboard  │   │  Supervisor      │   │
│   │  (Expo Go /     │   │  (Next.js 14)     │   │  Dashboard       │   │
│   │  React Native)  │   │  Port: 3000       │   │  (Next.js 14)    │   │
│   │  iOS + Android  │   │  /owner/*         │   │  Port: 3001      │   │
│   └────────┬────────┘   └────────┬──────────┘   │  /supervisor/*   │   │
│            │                     │               └────────┬─────────┘   │
└────────────┼─────────────────────┼────────────────────────┼─────────────┘
             │                     │                        │
             │         HTTPS / REST API (JWT Bearer)        │
             │                     │                        │
┌────────────▼─────────────────────▼────────────────────────▼─────────────┐
│                        API GATEWAY / NGINX                               │
│                     api.yourdomain.com / 443                             │
│              Rate Limiting  •  CORS  •  SSL Termination                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                         DJANGO REST FRAMEWORK                            │
│                                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│   │  Auth Service│  │  Investment  │  │  Payout      │  │  Referral │  │
│   │  (JWT+OTP)   │  │  Service     │  │  Service     │  │  Service  │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│   │  KYC Service │  │  Plan Service│  │  Notif.      │  │  Audit    │  │
│   │              │  │              │  │  Service     │  │  Service  │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼──────────────────────────┐
         │                         │                          │
┌────────▼────────┐   ┌────────────▼───────────┐  ┌──────────▼─────────┐
│   PostgreSQL 16  │   │       Redis 7           │  │  Object Storage    │
│   Primary DB     │   │  OTP cache (5 min TTL)  │  │  (Cloudflare R2 /  │
│   (all entities) │   │  Session tokens         │  │  AWS S3)           │
│                  │   │  Rate limit counters     │  │  KYC docs          │
└──────────────────┘   │  Payout job queue        │  │  Screenshots       │
                       └────────────────────────┘  └────────────────────┘
                                   │
         ┌─────────────────────────┼──────────────────────────┐
         │                         │                          │
┌────────▼────────┐   ┌────────────▼───────────┐  ┌──────────▼─────────┐
│  Firebase (FCM)  │   │      Twilio SMS         │  │  Celery + Beat     │
│  Push notifs     │   │  OTP delivery           │  │  Async tasks       │
│  iOS + Android   │   │  Alert SMS              │  │  Payout scheduler  │
└──────────────────┘   └────────────────────────┘  └────────────────────┘
```

### 2.2 Authentication Flow

```
FIRST TIME (any device)
──────────────────────────────────────────────────────
  Enter Mobile Number
        │
        ▼
  [Backend] Generate 6-digit OTP → Store in Redis (TTL: 5 min)
        │
        ▼
  Twilio SMS → Customer's Phone
        │
        ▼
  Customer enters OTP
        │
        ▼
  [Backend] Validate OTP → Issue JWT access + refresh token
        │
        ▼
  Customer sets 4-digit PIN → PIN hash stored (bcrypt)
        │
        ▼
  Optional: Enable Biometric (Face ID / Fingerprint)
        │
        ▼
  ✅ Logged in — access token stored in SecureStore


DAILY LOGIN (same device, PIN set)
──────────────────────────────────────────────────────
  App opens → detect stored refresh token + device_id
        │
        ├──► Biometric enabled? → FaceID/Fingerprint prompt
        │           │
        │           └──► Success → Silently refresh JWT → Home
        │
        └──► PIN screen → Enter 4 digits
                    │
                    └──► Validate locally hashed PIN → Refresh JWT → Home


NEW DEVICE LOGIN
──────────────────────────────────────────────────────
  Enter Mobile Number → OTP sent → Verify OTP
        │
        ▼
  [Backend] device_id not in trusted list → require OTP
        │
        ▼
  OTP verified → New device added to trusted list
        │
        ▼
  Set PIN on new device → Continue


SENSITIVE ACTIONS (change mobile, large withdrawal)
──────────────────────────────────────────────────────
  Action triggered → OTP sent → User verifies → Action proceeds
```

### 2.3 UPI Payment Flow

```
Customer                     App (Expo)                    Backend (Django)         Supervisor
   │                             │                               │                      │
   │  Tap "Invest Now"           │                               │                      │
   │────────────────────────────►│                               │                      │
   │                             │  POST /investments/initiate   │                      │
   │                             │──────────────────────────────►│                      │
   │                             │  ◄── { txn_ref, upi_id, amt } │                      │
   │                             │                               │                      │
   │  UPI deep-link opens        │                               │                      │
   │  ◄────────────────────────── upi://pay?pa=X&am=Y&tn=Z       │                      │
   │                             │                               │                      │
   │  Pays in UPI app (GPay etc) │                               │                      │
   │────────────────────────────►│                               │                      │
   │  Returns to app             │                               │                      │
   │────────────────────────────►│                               │                      │
   │                             │                               │                      │
   │  Upload screenshot          │                               │                      │
   │────────────────────────────►│  POST /investments/submit     │                      │
   │                             │──────────────────────────────►│                      │
   │                             │                               │  Push notif to Sup.  │
   │                             │                               │─────────────────────►│
   │                             │                               │                      │
   │  "Pending Verification"     │                               │  Review screenshot   │
   │  status shown               │                               │◄─────────────────────│
   │                             │                               │                      │
   │                             │                               │  POST /verify (approve)
   │                             │                               │◄─────────────────────│
   │                             │                               │                      │
   │  Push: "Investment Active!" │                               │                      │
   │◄────────────────────────────│◄──────────────────────────────│                      │
```

### 2.4 Payout Calculation Flow

```
Celery Beat (daily cron, 9:00 AM IST)
        │
        ▼
  Query: investments WHERE status='active'
        │
        ▼
  For each investment:
    ├── Calculate due_date from start_date + payout_frequency
    ├── If due_date == today:
    │     ├── Create payout record (status=pending)
    │     └── Push notification to customer
    └── If maturity_date == today:
          ├── Create final payout record
          ├── Update investment status = 'matured'
          └── Push notification to customer

  Supervisor sees payout queue → marks as "Paid" after bank transfer
```

---

## 3. Tech Stack

### 3.1 Full Stack Summary

|
 Layer 
|
 Technology 
|
 Version 
|
 Purpose 
|
|
---
|
---
|
---
|
---
|
|
 Mobile App 
|
 React Native + Expo Go 
|
 SDK 51+ 
|
 iOS & Android customer app 
|
|
 Web Dashboards 
|
 Next.js (App Router) 
|
 14.x 
|
 Owner & Supervisor interfaces 
|
|
 Shared UI 
|
 Custom component library 
|
 — 
|
 Reused across both dashboards 
|
|
 Backend 
|
 Django + DRF 
|
 5.x / 3.x 
|
 REST API, business logic 
|
|
 Auth 
|
 SimpleJWT + Twilio 
|
 — 
|
 JWT tokens + SMS OTP 
|
|
 Database 
|
 PostgreSQL 
|
 16 
|
 Primary relational store 
|
|
 Cache 
|
 Redis 
|
 7 
|
 OTP, sessions, rate limits 
|
|
 Queue 
|
 Celery + Celery Beat 
|
 — 
|
 Async tasks, payout cron 
|
|
 Storage 
|
 Cloudflare R2 (or AWS S3) 
|
 — 
|
 KYC docs, screenshots 
|
|
 Push Notifs 
|
 Firebase Cloud Messaging 
|
 — 
|
 iOS & Android push 
|
|
 SMS 
|
 Twilio 
|
 — 
|
 OTP delivery 
|
|
 Web Server 
|
 Nginx + Gunicorn 
|
 — 
|
 Reverse proxy + WSGI 
|
|
 Process Mgr 
|
 PM2 
|
 — 
|
 Node.js process management 
|
|
 Containerization 
|
 Docker + Docker Compose 
|
 — 
|
 Local dev + production parity 
|

### 3.2 Mobile Dependencies

```json
{
  "expo": "^51.0.0",
  "react-native": "0.74.x",
  "expo-router": "^3.x",
  "expo-local-authentication": "^13.x",
  "expo-secure-store": "^13.x",
  "expo-image-picker": "^15.x",
  "expo-file-system": "^17.x",
  "expo-notifications": "^0.28.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "react-query": "^5.x",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "axios": "^1.x",
  "react-native-reanimated": "^3.x",
  "react-native-safe-area-context": "^4.x",
  "react-native-screens": "^3.x",
  "react-native-svg": "^15.x",
  "victory-native": "^37.x"
}
```

### 3.3 Dashboard Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "^5.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "date-fns": "^3.x",
  "tailwindcss": "^3.x",
  "shadcn/ui": "latest",
  "lucide-react": "^0.38.x",
  "@radix-ui/react-*": "latest",
  "next-themes": "^0.3.x",
  "js-cookie": "^3.x"
}
```

---

## 4. Folder Structure

### 4.1 Monorepo Root

```
investment-platform/
├── apps/
│   ├── mobile/               ← Expo Go customer app
│   ├── owner-dashboard/      ← Next.js owner web app
│   └── supervisor-dashboard/ ← Next.js supervisor web app
├── packages/
│   ├── ui/                   ← Shared React/RN component library
│   ├── types/                ← Shared TypeScript types & interfaces
│   └── utils/                ← Shared utility functions
├── backend/                  ← Django REST API
├── docker-compose.yml
├── .env.example
└── README.md
```

### 4.2 Mobile App (`apps/mobile/`)

```
mobile/
├── app/                          ← Expo Router (file-based routing)
│   ├── (auth)/                   ← Auth group (no tab bar)
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx           ← Splash / landing screen
│   │   ├── login.tsx             ← Mobile number entry
│   │   ├── otp-verify.tsx        ← OTP input screen
│   │   ├── set-pin.tsx           ← Set 4-digit PIN
│   │   └── biometric-setup.tsx   ← Optional biometric setup
│   ├── (app)/                    ← Protected group (tab bar visible)
│   │   ├── _layout.tsx           ← Tab bar layout
│   │   ├── home/
│   │   │   ├── index.tsx         ← Home dashboard
│   │   │   └── announcement.tsx  ← Announcement detail
│   │   ├── plans/
│   │   │   ├── index.tsx         ← Plan listing
│   │   │   ├── [id].tsx          ← Plan detail
│   │   │   └── invest.tsx        ← Investment flow
│   │   ├── portfolio/
│   │   │   ├── index.tsx         ← Portfolio overview
│   │   │   ├── [investmentId].tsx← Investment detail
│   │   │   └── certificate.tsx   ← Investment certificate
│   │   ├── payouts/
│   │   │   ├── index.tsx         ← Payout schedule & history
│   │   │   └── withdraw.tsx      ← Withdrawal request
│   │   ├── referral/
│   │   │   └── index.tsx         ← Referral code & earnings
│   │   └── profile/
│   │       ├── index.tsx         ← Profile & settings
│   │       ├── kyc.tsx           ← KYC form & status
│   │       ├── change-pin.tsx    ← Change PIN screen
│   │       └── notifications.tsx ← Notification centre
│   ├── payment/
│   │   ├── upi-redirect.tsx      ← UPI deep-link launcher
│   │   └── screenshot-upload.tsx ← Screenshot upload
│   └── _layout.tsx               ← Root layout
├── components/
│   ├── ui/                       ← Atomic UI components (from packages/ui adapted for RN)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PinInput.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── TabBar.tsx
│   │   ├── Header.tsx
│   │   └── SafeScreen.tsx
│   ├── auth/
│   │   ├── OtpInput.tsx
│   │   ├── PinKeypad.tsx
│   │   └── BiometricPrompt.tsx
│   ├── home/
│   │   ├── PortfolioSummaryCard.tsx
│   │   ├── QuickActions.tsx
│   │   ├── NextPayoutCard.tsx
│   │   └── AnnouncementBanner.tsx
│   ├── plans/
│   │   ├── PlanCard.tsx
│   │   ├── PlanDetailCard.tsx
│   │   └── ReturnCalculator.tsx
│   ├── portfolio/
│   │   ├── InvestmentCard.tsx
│   │   ├── PayoutRow.tsx
│   │   └── ProgressBar.tsx
│   └── kyc/
│       ├── DocumentUploader.tsx
│       └── KycStatusBanner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useBiometric.ts
│   ├── useOtp.ts
│   ├── useInvestments.ts
│   ├── usePlans.ts
│   ├── usePayouts.ts
│   ├── useReferral.ts
│   └── useNotifications.ts
├── services/
│   ├── api.ts                    ← Axios instance (base URL from env, NO keys)
│   ├── auth.service.ts
│   ├── investment.service.ts
│   ├── plan.service.ts
│   ├── payout.service.ts
│   ├── kyc.service.ts
│   ├── referral.service.ts
│   └── notification.service.ts
├── store/
│   ├── auth.store.ts             ← Zustand: user, tokens
│   ├── ui.store.ts               ← Zustand: loading, toast queue
│   └── index.ts
├── utils/
│   ├── currency.ts               ← formatINR(), formatCompact()
│   ├── date.ts                   ← formatDate(), daysDiff()
│   ├── upi.ts                    ← buildUPIDeepLink()
│   └── validation.ts             ← Zod schemas
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   └── config.ts                 ← API_BASE_URL from process.env (no keys)
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── babel.config.js
├── tsconfig.json
└── .env                          ← EXPO_PUBLIC_API_URL only (no secrets)
```

### 4.3 Owner Dashboard (`apps/owner-dashboard/`)

```
owner-dashboard/
├── app/                          ← Next.js App Router
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← Sidebar + top nav wrapper
│   │   ├── page.tsx              ← Analytics overview (/)
│   │   ├── customers/
│   │   │   ├── page.tsx          ← Customer list
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Customer detail
│   │   ├── plans/
│   │   │   ├── page.tsx          ← Plan list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      ← Create plan
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← Plan detail
│   │   │       └── edit/
│   │   │           └── page.tsx  ← Edit plan
│   │   ├── transactions/
│   │   │   └── page.tsx          ← Transaction verification queue
│   │   ├── payouts/
│   │   │   └── page.tsx          ← Payout management
│   │   ├── supervisors/
│   │   │   ├── page.tsx          ← Supervisor list
│   │   │   └── new/
│   │   │       └── page.tsx      ← Create supervisor
│   │   ├── referrals/
│   │   │   └── page.tsx          ← Referral overview
│   │   ├── notifications/
│   │   │   └── page.tsx          ← Broadcast notification
│   │   └── reports/
│   │       └── page.tsx          ← Reports & exports
│   ├── api/                      ← Next.js Route Handlers (proxy layer)
│   │   └── [...path]/
│   │       └── route.ts          ← Proxy: attaches server-side JWT, forwards to Django
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       ← Re-exports from packages/ui (shadcn wrappers)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── PageHeader.tsx
│   ├── analytics/
│   │   ├── AUMCard.tsx
│   │   ├── InvestorStatsCard.tsx
│   │   ├── InvestmentChart.tsx
│   │   ├── PayoutCalendar.tsx
│   │   └── RecentActivity.tsx
│   ├── customers/
│   │   ├── CustomerTable.tsx
│   │   ├── CustomerFilters.tsx
│   │   ├── CustomerProfileCard.tsx
│   │   ├── KycDocumentViewer.tsx
│   │   └── WalletAdjustModal.tsx
│   ├── plans/
│   │   ├── PlanTable.tsx
│   │   ├── PlanForm.tsx
│   │   └── PlanStatusToggle.tsx
│   ├── transactions/
│   │   ├── TransactionQueue.tsx
│   │   ├── ScreenshotViewer.tsx
│   │   └── VerificationModal.tsx
│   ├── payouts/
│   │   ├── PayoutTable.tsx
│   │   ├── BulkMarkPaidModal.tsx
│   │   └── PayoutExport.tsx
│   └── supervisors/
│       ├── SupervisorTable.tsx
│       └── SupervisorForm.tsx
├── hooks/
│   ├── useAnalytics.ts
│   ├── useCustomers.ts
│   ├── usePlans.ts
│   ├── useTransactions.ts
│   ├── usePayouts.ts
│   └── useSupervisors.ts
├── lib/
│   ├── api.ts                    ← Axios instance (points to /api proxy, NOT Django directly)
│   └── auth.ts                   ← next-auth or custom session helper
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
├── utils/
│   ├── currency.ts
│   ├── date.ts
│   └── export.ts                 ← CSV/PDF export helpers
├── types/                        ← Re-exports from packages/types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                    ← NEXT_PUBLIC_APP_URL only; API_URL server-side only
```

### 4.4 Supervisor Dashboard (`apps/supervisor-dashboard/`)

```
supervisor-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Summary / pending queue count
│   │   ├── transactions/
│   │   │   └── page.tsx          ← Verification queue
│   │   ├── payouts/
│   │   │   └── page.tsx          ← Payout processing
│   │   ├── customers/
│   │   │   ├── page.tsx          ← Read-only customer search
│   │   │   └── [id]/page.tsx     ← Read-only customer view
│   │   └── reports/
│   │       └── page.tsx
│   ├── api/
│   │   └── [...path]/route.ts    ← Same proxy pattern as Owner
│   └── layout.tsx
├── components/                   ← Mostly re-used from packages/ui + local scoped overrides
│   ├── layout/
│   ├── transactions/
│   ├── payouts/
│   └── customers/
├── hooks/
├── lib/
├── utils/
├── next.config.ts
└── .env.local
```

### 4.5 Shared Packages

```
packages/
├── ui/                           ← Shared component library
│   ├── src/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Skeleton/
│   │   ├── EmptyState/
│   │   ├── DataTable/
│   │   ├── StatusBadge/         ← Reused everywhere: pending/active/rejected/paid
│   │   ├── ConfirmDialog/
│   │   ├── SearchInput/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── types/                        ← Shared TypeScript interfaces
│   ├── src/
│   │   ├── user.types.ts
│   │   ├── investment.types.ts
│   │   ├── plan.types.ts
│   │   ├── payout.types.ts
│   │   ├── kyc.types.ts
│   │   ├── referral.types.ts
│   │   ├── notification.types.ts
│   │   └── index.ts
│   └── package.json
│
└── utils/                        ← Shared pure functions
    ├── src/
    │   ├── currency.ts           ← formatINR, parseAmount
    │   ├── date.ts               ← formatDate, getPayoutDates
    │   ├── validation.ts         ← Shared Zod schemas
    │   └── index.ts
    └── package.json
```

### 4.6 Backend (`backend/`)

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── apps/
│   ├── authentication/
│   │   ├── models.py             ← CustomUser, DeviceTrust
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services/
│   │       ├── otp_service.py    ← Twilio OTP send/verify
│   │       └── jwt_service.py
│   ├── kyc/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── plans/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── investments/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services/
│   │       └── payout_calculator.py
│   ├── payouts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py              ← Celery periodic tasks
│   ├── referrals/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── notifications/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── services/
│   │       ├── fcm_service.py    ← Firebase push
│   │       └── sms_service.py    ← Twilio SMS
│   └── audit/
│       ├── models.py
│       └── signals.py            ← Auto-log on model save/delete
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── manage.py
└── .env                          ← All secrets (DB, Twilio, Firebase, S3, JWT secret)
```

---

## 5. Environment & API Configuration

### 5.1 Rule: No API Keys in Frontend

All secrets (Twilio SID, Firebase service account, S3 keys, JWT secret) live **only** in the backend `.env`. Frontends never call Twilio, Firebase Admin, or S3 directly.

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Expo / Next.js)                          │
│                                                     │
│  .env / .env.local contains ONLY:                  │
│    EXPO_PUBLIC_API_URL=https://api.yourdomain.com   │  ← Mobile
│    NEXT_PUBLIC_APP_URL=https://owner.yourdomain.com │  ← Web dashboards
│                                                     │
│  NO Twilio keys, NO Firebase keys, NO S3 keys       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BACKEND (Django) .env                              │
│                                                     │
│  SECRET_KEY=...                                     │
│  DATABASE_URL=postgresql://...                      │
│  REDIS_URL=redis://...                              │
│  TWILIO_ACCOUNT_SID=...                             │
│  TWILIO_AUTH_TOKEN=...                              │
│  TWILIO_PHONE_NUMBER=...                            │
│  FIREBASE_CREDENTIALS_JSON=...                      │
│  AWS_S3_ACCESS_KEY_ID=...                           │
│  AWS_S3_SECRET_ACCESS_KEY=...                       │
│  AWS_S3_BUCKET_NAME=...                             │
│  JWT_SECRET_KEY=...                                 │
│  OWNER_UPI_ID=yourname@bank                         │
└─────────────────────────────────────────────────────┘
```

### 5.2 Next.js API Proxy (Prevents Direct Django Access)

Both dashboards route all API calls through Next.js route handlers, which attach the server-side session token. The browser never holds a raw JWT from Django.

```typescript
// apps/owner-dashboard/app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const DJANGO_API = process.env.DJANGO_API_URL  // server-side only, not NEXT_PUBLIC_*

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const token = cookies().get('access_token')?.value

  const res = await fetch(`${DJANGO_API}/${path}?${req.nextUrl.searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
```

### 5.3 Mobile Axios Instance

```typescript
// apps/mobile/services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,  // Only non-secret URL
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto-refresh token logic
      const refresh = await SecureStore.getItemAsync('refresh_token')
      if (refresh) {
        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/token/refresh/`, { refresh })
        await SecureStore.setItemAsync('access_token', data.access)
        error.config.headers.Authorization = `Bearer ${data.access}`
        return axios(error.config)
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 6. Authentication & Security

### 6.1 Screens & Components

#### `(auth)/login.tsx` — Mobile Number Entry

**Purpose:** First step of authentication. Collects mobile number and triggers OTP.

**UI Elements:**
- Country flag + dial code prefix (`+91`)
- 10-digit mobile number `TextInput` (numeric keyboard)
- `Button` — "Send OTP" (primary, full-width)
- Loading spinner inside button while OTP is dispatching
- Error text below input for invalid number format
- Terms & Privacy footer links

**Functionality:**
- Validates 10-digit Indian mobile format with Zod
- Calls `POST /api/auth/send-otp/` with `{ mobile: "+91XXXXXXXXXX" }`
- On success → navigate to `otp-verify.tsx` with mobile as param
- Rate-limit feedback: if backend returns 429 → "Wait X minutes before requesting again"

---

#### `(auth)/otp-verify.tsx` — OTP Input

**Purpose:** Verify 6-digit OTP received via SMS.

**UI Elements:**
- 6-box OTP input (auto-focus, auto-advance on each digit)
- Countdown timer: "Resend in 04:32"
- `TextButton` — "Resend OTP" (disabled until countdown reaches 0)
- `Button` — "Verify" (primary)
- "Didn't get OTP? Check your number" helper link

**Functionality:**
- Auto-submits when all 6 digits are entered
- Calls `POST /api/auth/verify-otp/` with `{ mobile, otp }`
- On success: if new user → navigate to `set-pin.tsx`; if existing user → navigate to `(app)/home`
- Error: wrong OTP → shake animation + "Incorrect OTP. X attempts remaining"
- Expired OTP → "OTP expired. Request a new one"

---

#### `(auth)/set-pin.tsx` — Set PIN

**Purpose:** Set a 4-digit PIN for daily login.

**UI Elements:**
- 4-dot PIN indicator (filled dots as user types)
- Custom numpad (0–9, delete key)
- "Confirm PIN" step — enter PIN again to confirm
- `Button` — "Set PIN" (enabled only when both entries match)
- PIN mismatch error: "PINs don't match. Try again"

**Functionality:**
- PIN hashed on device before sending? No — PIN is sent to backend, hashed with bcrypt server-side
- Calls `POST /api/auth/set-pin/` with `{ pin: "XXXX" }`
- On success → navigate to `biometric-setup.tsx`

---

#### `(auth)/biometric-setup.tsx` — Biometric Setup

**Purpose:** Optionally enable fingerprint/FaceID for login.

**UI Elements:**
- Biometric icon (fingerprint or face depending on device)
- "Enable Fingerprint / Face ID" heading
- `Button` — "Enable" (primary)
- `TextButton` — "Skip for now"

**Functionality:**
- Uses `expo-local-authentication` to check available types
- On enable: store `biometric_enabled = true` in `SecureStore`
- Skip → go to KYC or Home based on user status

---

### 6.2 PIN Login Screen (daily)

**UI Elements:**
- User greeting: "Welcome back, [First Name]"
- 4-dot PIN indicator
- Custom numpad
- Biometric button (fingerprint icon, if enabled)
- `TextButton` — "Forgot PIN?" → triggers OTP flow → reset PIN

**Functionality:**
- Wrong PIN 5× → lock account for 30 minutes, show countdown
- Biometric tap → `LocalAuthentication.authenticateAsync()` → on success, refresh JWT silently

---

## 7. Customer Mobile App (Expo Go)

### 7.1 Home Screen (`home/index.tsx`)

**Purpose:** Central dashboard showing portfolio summary and quick actions.

**UI Sections:**

#### Portfolio Summary Card (`PortfolioSummaryCard.tsx`)
- Total Invested: `₹X,XX,XXX` (large, bold)
- Current Value with returns: `₹X,XX,XXX (+12.5%)`
- Subtle gradient background (brand color)
- Skeleton loading state while fetching

#### Next Payout Card (`NextPayoutCard.tsx`)
- "Next Payout in X days"
- Payout amount: `₹X,XXX`
- Plan name
- Tap → navigates to `payouts/index.tsx`

#### Quick Actions (`QuickActions.tsx`)
4 icon-button grid:
- **Invest** → `plans/index.tsx`
- **Withdraw** → `payouts/withdraw.tsx`
- **Statement** → `portfolio/index.tsx`
- **Refer & Earn** → `referral/index.tsx`

#### Active Plans (horizontal scroll cards)
- Each card: Plan name, invested amount, maturity date, monthly/quarterly return
- Tap → `portfolio/[investmentId].tsx`

#### Announcement Banner (`AnnouncementBanner.tsx`)
- Dismissible banner for owner broadcasts
- Tap → `home/announcement.tsx`

---

### 7.2 Plans Screen (`plans/index.tsx`)

**Purpose:** Browse available investment plans.

**UI Elements:**
- Search bar: filter plans by name
- Filter chips: "All" | "Monthly" | "Quarterly" | "On Maturity"
- Plan cards (`PlanCard.tsx`) in vertical list:
  - Plan name + status badge (Active)
  - Return rate (e.g., `12% p.a.`)
  - Duration options (chips: 3M / 6M / 12M)
  - Min investment amount
  - "View Details" button

**Plan Detail Screen (`plans/[id].tsx`)**

**UI Elements:**
- Plan name + description
- Key metrics row: Return Rate | Duration | Min Amount | Payout Frequency
- Return Calculator (`ReturnCalculator.tsx`):
  - Slider or text input: "Enter amount"
  - Calculates: Total return, payout per period, maturity amount
- Full terms & conditions (expandable)
- `Button` — "Invest Now" (primary, sticky bottom bar)

---

### 7.3 Investment Flow (`plans/invest.tsx`)

**Step 1 — Amount Entry**
- Input: "Enter investment amount"
- Validation: min/max from plan config
- Shows: calculated payout schedule preview
- `Button` — "Proceed to Payment"

**Step 2 — UPI Payment (`payment/upi-redirect.tsx`)**
- Payment summary card (plan, amount, UPI ID, reference number)
- `Button` — "Open UPI App" → triggers `Linking.openURL(upiDeepLink)`
- UPI deep-link format: `upi://pay?pa={OWNER_UPI_ID}&pn=InvestmentPlatform&am={amount}&tn={txnRef}`
- `OWNER_UPI_ID` is fetched from backend — never hardcoded in app

**Step 3 — Screenshot Upload (`payment/screenshot-upload.tsx`)**
- "Payment done? Upload your screenshot"
- Image picker (camera / gallery)
- Preview of selected screenshot
- `Button` — "Submit Payment Proof"
- On submit → `POST /api/investments/submit/` with screenshot + txnRef
- Navigate to confirmation screen showing "Pending Verification" status

---

### 7.4 Portfolio Screen (`portfolio/index.tsx`)

**UI Sections:**

**Summary Row:**
- Total Invested | Total Returns | Active Plans count

**Filter Tabs:** All | Active | Matured | Pending

**Investment Cards (`InvestmentCard.tsx`):**
- Plan name + invested amount
- Progress bar (`ProgressBar.tsx`): % of tenure elapsed
- Status badge: Pending / Active / Matured
- Next payout date
- Tap → `portfolio/[investmentId].tsx`

**Investment Detail (`portfolio/[investmentId].tsx`):**
- Full plan name, invested amount, start date, maturity date
- Payout schedule table: due date, amount, status (paid/pending)
- Returns summary
- `Button` — "Download Certificate" (only if Active/Matured)
- `Button` — "Request Withdrawal" (only if Active; shows penalty warning)

---

### 7.5 Payouts Screen (`payouts/index.tsx`)

**Tabs:** Upcoming | History

**Upcoming Payouts:**
- Each row: due date, amount, plan name, status badge
- "Next payout" highlighted row

**Payout History:**
- Chronological list with paid/pending/overdue badges
- `FilterBar`: by month, by plan

**Withdrawal Screen (`payouts/withdraw.tsx`):**
- Select investment to withdraw from (dropdown of active investments)
- Shows: invested amount, penalty (%), net payout
- Confirmation checkbox: "I understand the early withdrawal penalty"
- `Button` — "Request Withdrawal"
- OTP verification modal triggered for large amounts (configurable threshold)

---

### 7.6 Referral Screen (`referral/index.tsx`)

**UI Sections:**

**Your Referral Code Card:**
- Code displayed large (e.g., `INV-AXW92`)
- `Button` — "Share on WhatsApp" → `Linking.openURL('whatsapp://send?text=...')`
- `Button` — "Copy Code" → `Clipboard.setStringAsync(code)`
- QR code of referral link (`react-native-svg` QR)

**Earnings Summary:**
- Total referred: X people
- Total earned: `₹X,XXX`
- Pending bonus: `₹XXX` (awaiting referred user's first investment)

**Referrals List:**
- Each row: referred person (masked name), join date, bonus status (pending/credited)

---

### 7.7 Profile & Settings (`profile/index.tsx`)

**Sections:**

**Profile Header:**
- Avatar initials circle
- Full name, mobile number
- KYC status badge

**Menu Items (list with chevron):**
- My KYC → `profile/kyc.tsx`
- Change PIN → `profile/change-pin.tsx`
- Notifications → `profile/notifications.tsx`
- Biometric Login (toggle switch)
- App Lock Timeout (selector: 1 min / 2 min / 5 min)
- Help & Support (link)
- Logout (red text, confirmation dialog)

**KYC Screen (`profile/kyc.tsx`):**
- Status banner: Pending / Under Review / Approved / Rejected
- If Rejected: rejection reason + re-upload option
- Form fields: name, DOB, address, bank details
- Document upload sections: Aadhaar Front, Aadhaar Back, PAN, Selfie
- `DocumentUploader.tsx`: tap → image picker → preview → replace button
- `Button` — "Submit KYC"

---

## 8. Owner Dashboard (Next.js)

### 8.1 Layout (`(dashboard)/layout.tsx`)

**Sidebar (`Sidebar.tsx`):**

Navigation items (icon + label):
- **Overview** (chart icon)
- **Customers** (users icon)
- **Investment Plans** (trending up icon)
- **Transactions** (refresh icon) + pending badge count
- **Payouts** (wallet icon) + due today count
- **Supervisors** (shield icon)
- **Referrals** (share icon)
- **Notifications** (bell icon)
- **Reports** (download icon)
- **Logout** (bottom, sign-out icon)

**Top Nav (`TopNav.tsx`):**
- Page title (dynamic)
- Search bar (global customer search)
- Notification bell (unread count badge)
- Owner avatar + name + dropdown (Profile, Logout)

---

### 8.2 Analytics Overview (`page.tsx`)

**Stat Cards Row (4 cards):**
- Total AUM (`AUMCard.tsx`): total active investment value
- Active Investors: count + "+X this month"
- Payout Due This Month: `₹X,XX,XXX`
- Pending Verifications: count (links to transactions page)

**Charts Section:**

Investment Chart (`InvestmentChart.tsx`) — Recharts AreaChart:
- X-axis: last 30 days
- Y-axis: total amount invested
- Toggle: Day / Week / Month

Payout Calendar (`PayoutCalendar.tsx`):
- Monthly calendar view
- Dates with payouts highlighted with amount tooltip

**Recent Activity (`RecentActivity.tsx`):**
- Feed of latest transactions, KYC submissions, payouts
- Each item: avatar, description, time ago, status badge

---

### 8.3 Customers (`customers/page.tsx`)

**`CustomerTable.tsx`:**
- Columns: Name, Mobile, KYC Status, Total Invested, Plans Count, Joined, Actions
- Sortable columns
- Row actions: View, Suspend
- Inline KYC status badge (color-coded)

**`CustomerFilters.tsx`:**
- Search: name or mobile
- Filter: KYC Status (All / Approved / Pending / Rejected)
- Filter: Plan enrolled in
- Date range: joined between
- `Button` — "Export CSV"

**Customer Detail (`customers/[id]/page.tsx`):**

Tabs:
1. **Profile** — personal info, bank details, KYC documents (`KycDocumentViewer.tsx`)
2. **Investments** — table of all investments with status
3. **Payouts** — payout history
4. **Referrals** — who they referred, bonus earned

**Actions (top right):**
- `Button` — "Approve KYC" (green, if status=under_review)
- `Button` — "Reject KYC" (red, opens modal with reason input)
- `Button` — "Adjust Wallet" → `WalletAdjustModal.tsx` (credit/debit with memo)
- `Button` — "Suspend Account" (with confirmation)

---

### 8.4 Investment Plans (`plans/page.tsx`)

**`PlanTable.tsx`:**
- Columns: Name, Return Rate, Duration, Payout Frequency, Min/Max, Enrolled Count, Status, Actions
- Row actions: View | Edit | Toggle Active/Inactive

**`PlanStatusToggle.tsx`:**
- Toggle switch inline in table
- Confirm dialog: "Deactivating will hide this plan from new investors. Existing investments are unaffected."

**Create/Edit Plan (`plans/new/page.tsx` & `plans/[id]/edit/page.tsx`):**

`PlanForm.tsx` fields:
- Plan Name (text input)
- Description (textarea)
- Minimum Investment Amount (number input, `₹` prefix)
- Maximum Investment Amount (number input)
- Return Rate % p.a. (number input, decimal allowed)
- Tenure in Months (select: 1, 2, 3, 6, 12, 18, 24)
- Payout Frequency (radio: Monthly / Quarterly / On Maturity)
- Premature Withdrawal Penalty % (number input)
- Terms & Conditions (rich text / textarea)
- Status (toggle: Active / Inactive)

Buttons:
- `Button` — "Save Plan" (primary)
- `Button` — "Cancel" (secondary → back to list)
- Edit mode only: "Delete Plan" (danger, only if 0 enrolled investors)

---

### 8.5 Transactions (`transactions/page.tsx`)

**`TransactionQueue.tsx`:**

Filter bar:
- Status tabs: All | Pending | Approved | Rejected
- Date range picker
- Search by customer name / txn reference

**Transaction Table:**
- Columns: Customer, Plan, Amount, Reference, Submitted At, Screenshot, Status, Actions

**`ScreenshotViewer.tsx`:**
- Inline thumbnail in table
- Click → opens lightbox modal with full screenshot

**`VerificationModal.tsx`:**
- Shows: Customer name, plan, amount, txn reference, screenshot full view
- `Button` — "Approve" (green)
- `Button` — "Reject" (red, requires rejection reason text input)
- `Button` — "Flag for Owner Review" (supervisor only)

---

### 8.6 Payouts (`payouts/page.tsx`)

**`PayoutTable.tsx`:**
- Columns: Customer, Plan, Amount Due, Due Date, Status, Actions
- Status: Pending (yellow) | Paid (green) | Overdue (red)
- Sortable by due date

**Actions:**
- Row-level: "Mark as Paid" button
- `Button` — "Mark Selected as Paid" (bulk, after checkbox selection)
- `BulkMarkPaidModal.tsx`: shows list of selected payouts, confirm + optional note

**`PayoutExport.tsx`:**
- `Button` — "Export CSV"
- `Button` — "Export PDF" → generates payout report for selected date range

---

### 8.7 Supervisors (`supervisors/page.tsx`)

**`SupervisorTable.tsx`:**
- Columns: Name, Email, Status, Last Active, Permissions, Actions
- Row actions: Edit Permissions | Disable | Delete

**`SupervisorForm.tsx` (create/edit):**
- Full Name (text input)
- Email (text input)
- Temporary Password (auto-generated, shown once)
- Permissions checkboxes:
  - Verify Transactions
  - Mark Payouts Paid
  - View Customer KYC
  - Generate Reports

---

### 8.8 Reports (`reports/page.tsx`)

**Report Types (tab or select):**
- Investment Report
- Payout Report
- Customer Report
- Referral Earnings Report

**Filters:**
- Date Range (date picker)
- Plan (select, multi)
- Status (select)
- Customer (search)

**`Button` — "Generate Report"** → preview table in page  
**`Button` — "Export CSV"**  
**`Button` — "Export PDF"**

---

## 9. Supervisor Dashboard (Next.js)

The Supervisor Dashboard reuses the same component library as Owner Dashboard, with a scoped sidebar and read-only/limited write access.

### 9.1 Sidebar (Scoped)

Navigation items visible to Supervisor:
- Overview (pending counts only)
- Transactions (verify queue)
- Payouts (mark as paid)
- Customers (read-only)
- Reports (limited)

Items **hidden** from Supervisor:
- Plan Management
- Supervisor Management
- Wallet Adjustments
- Notification Broadcast
- Full Analytics

### 9.2 Transactions — Supervisor View

Same `TransactionQueue.tsx` component, same `VerificationModal.tsx`.

Difference: Supervisor sees "Flag for Owner Review" instead of final "Approve" if amount exceeds configured threshold (configurable by Owner).

### 9.3 Payouts — Supervisor View

Same `PayoutTable.tsx`. Supervisor can mark payouts as paid. Cannot override amounts.

### 9.4 Customers — Supervisor View (Read Only)

Same `CustomerTable.tsx` but action column shows only "View".  
`CustomerDetailPage` renders all tabs but all inputs are disabled/read-only.  
"Approve KYC", "Adjust Wallet", "Suspend" buttons are hidden.

---

## 10. Shared / Reusable Components

All components in `packages/ui/` are used across both Next.js apps. React Native equivalents live in `apps/mobile/components/ui/` but follow the same prop API.

### 10.1 `Button`

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean        // shows spinner, disables click
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onClick: () => void
  children: ReactNode
}
```

Usage examples:
- "Send OTP" → `variant="primary" size="lg" fullWidth loading={isSending}`
- "Cancel" → `variant="secondary" size="md"`
- "Delete Plan" → `variant="danger" size="sm"`
- "View" → `variant="ghost" size="sm"`

### 10.2 `StatusBadge`

```typescript
interface StatusBadgeProps {
  status: 'pending' | 'active' | 'approved' | 'rejected' | 'matured'
        | 'paid' | 'overdue' | 'processing' | 'withdrawn'
  size?: 'sm' | 'md'
}
```

Color mapping (consistent across all platforms):
- `pending` → amber
- `active` / `approved` / `paid` → green
- `rejected` / `overdue` → red
- `matured` / `processing` → blue
- `withdrawn` → gray

### 10.3 `DataTable`

```typescript
interface DataTableProps {
  columns: ColumnDef[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  selectable?: boolean          // enables checkboxes for bulk actions
  pagination?: PaginationConfig
}
```

Used in: CustomerTable, PlanTable, PayoutTable, TransactionQueue, SupervisorTable.

### 10.4 `ConfirmDialog`

```typescript
interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string    // default: "Confirm"
  cancelLabel?: string     // default: "Cancel"
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}
```

Used for: KYC rejection, plan deactivation, account suspension, bulk payout marking.

### 10.5 `SearchInput`

```typescript
interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (val: string) => void
  debounceMs?: number    // default: 300
  loading?: boolean
}
```

### 10.6 `EmptyState`

```typescript
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}
```

Examples:
- No plans: "No investment plans yet. Create your first plan."
- No customers: "No customers have registered yet."
- No transactions: "All caught up! No pending verifications."

### 10.7 `Skeleton`

Used as loading placeholder for every data-fetching component. Matches the shape of the content it replaces (card skeleton, table row skeleton, stat card skeleton).

---

## 11. Backend API Contract

All endpoints prefixed with `/api/v1/`. JWT Bearer token required on all protected routes.

### 11.1 Authentication

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 POST 
|
`/auth/send-otp/`
|
 None 
|
 Send OTP to mobile number 
|
|
 POST 
|
`/auth/verify-otp/`
|
 None 
|
 Verify OTP, return JWT tokens 
|
|
 POST 
|
`/auth/token/refresh/`
|
 None 
|
 Refresh access token 
|
|
 POST 
|
`/auth/set-pin/`
|
 JWT 
|
 Set 4-digit PIN (hashed server-side) 
|
|
 POST 
|
`/auth/verify-pin/`
|
 JWT 
|
 Verify PIN for sensitive action 
|
|
 POST 
|
`/auth/change-pin/`
|
 JWT + OTP 
|
 Change PIN 
|
|
 GET 
|
`/auth/me/`
|
 JWT 
|
 Get current user profile 
|
|
 POST 
|
`/auth/logout/`
|
 JWT 
|
 Invalidate refresh token 
|

### 11.2 KYC

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 POST 
|
`/kyc/submit/`
|
 JWT (Customer) 
|
 Submit KYC documents (multipart) 
|
|
 GET 
|
`/kyc/status/`
|
 JWT (Customer) 
|
 Get own KYC status 
|
|
 GET 
|
`/kyc/list/`
|
 JWT (Owner/Sup.) 
|
 List all KYC submissions 
|
|
 GET 
|
`/kyc/{id}/`
|
 JWT (Owner/Sup.) 
|
 Get KYC detail with document URLs 
|
|
 POST 
|
`/kyc/{id}/approve/`
|
 JWT (Owner) 
|
 Approve KYC 
|
|
 POST 
|
`/kyc/{id}/reject/`
|
 JWT (Owner/Sup.) 
|
 Reject KYC with reason 
|

### 11.3 Investment Plans

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 GET 
|
`/plans/`
|
 JWT 
|
 List active plans (customer sees only active) 
|
|
 POST 
|
`/plans/`
|
 JWT (Owner) 
|
 Create plan 
|
|
 GET 
|
`/plans/{id}/`
|
 JWT 
|
 Plan detail 
|
|
 PUT 
|
`/plans/{id}/`
|
 JWT (Owner) 
|
 Update plan 
|
|
 PATCH 
|
`/plans/{id}/toggle/`
|
 JWT (Owner) 
|
 Toggle active/inactive 
|
|
 DELETE 
|
`/plans/{id}/`
|
 JWT (Owner) 
|
 Delete plan (only if 0 investors) 
|

### 11.4 Investments

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 POST 
|
`/investments/initiate/`
|
 JWT (Customer) 
|
 Initiate investment, get txn_ref + UPI details 
|
|
 POST 
|
`/investments/submit/`
|
 JWT (Customer) 
|
 Submit screenshot + txn_ref 
|
|
 GET 
|
`/investments/`
|
 JWT 
|
 Customer: own investments; Owner/Sup: all 
|
|
 GET 
|
`/investments/{id}/`
|
 JWT 
|
 Investment detail 
|
|
 POST 
|
`/investments/{id}/approve/`
|
 JWT (Owner/Sup.) 
|
 Approve investment 
|
|
 POST 
|
`/investments/{id}/reject/`
|
 JWT (Owner/Sup.) 
|
 Reject investment 
|
|
 GET 
|
`/investments/{id}/certificate/`
|
 JWT (Customer) 
|
 Download PDF certificate 
|

### 11.5 Payouts

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 GET 
|
`/payouts/`
|
 JWT 
|
 Customer: own payouts; Owner/Sup: all 
|
|
 GET 
|
`/payouts/schedule/`
|
 JWT (Customer) 
|
 Upcoming payout schedule 
|
|
 POST 
|
`/payouts/{id}/mark-paid/`
|
 JWT (Owner/Sup.) 
|
 Mark payout as paid 
|
|
 POST 
|
`/payouts/bulk-mark-paid/`
|
 JWT (Owner/Sup.) 
|
 Mark multiple as paid 
|
|
 POST 
|
`/payouts/withdrawal-request/`
|
 JWT (Customer) 
|
 Request premature withdrawal 
|

### 11.6 Referrals

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 GET 
|
`/referrals/my-code/`
|
 JWT (Customer) 
|
 Get referral code + QR 
|
|
 GET 
|
`/referrals/earnings/`
|
 JWT (Customer) 
|
 Referral earnings summary 
|
|
 GET 
|
`/referrals/tree/{customer_id}/`
|
 JWT (Owner) 
|
 View referral tree 
|

### 11.7 Notifications

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 GET 
|
`/notifications/`
|
 JWT 
|
 List notifications (paginated) 
|
|
 POST 
|
`/notifications/{id}/read/`
|
 JWT 
|
 Mark as read 
|
|
 POST 
|
`/notifications/broadcast/`
|
 JWT (Owner) 
|
 Broadcast to all or filtered users 
|
|
 POST 
|
`/notifications/register-token/`
|
 JWT 
|
 Register FCM device token 
|

### 11.8 Admin / Owner

|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 GET 
|
`/admin/analytics/`
|
 JWT (Owner) 
|
 AUM, investor stats, charts data 
|
|
 POST 
|
`/admin/wallet-adjust/`
|
 JWT (Owner) 
|
 Manual wallet credit/debit 
|
|
 GET 
|
`/admin/supervisors/`
|
 JWT (Owner) 
|
 List supervisors 
|
|
 POST 
|
`/admin/supervisors/`
|
 JWT (Owner) 
|
 Create supervisor 
|
|
 PUT 
|
`/admin/supervisors/{id}/`
|
 JWT (Owner) 
|
 Update supervisor permissions 
|
|
 POST 
|
`/admin/supervisors/{id}/toggle/`
|
 JWT (Owner) 
|
 Enable/disable supervisor 
|
|
 GET 
|
`/admin/reports/`
|
 JWT (Owner/Sup.) 
|
 Generate report (query params) 
|
|
 GET 
|
`/admin/audit-logs/`
|
 JWT (Owner) 
|
 View audit log 
|

---

## 12. Database Schema

### 12.1 Entity Relationship Overview

```
users (1) ──────────────────────────────── (*) investments
  │                                              │
  │── (1) kyc_documents                          │── (*) payouts
  │                                              │
  │── (1) referral_code ───────── (*) referral_bonuses
  │
  │── (*) notifications
  │
  │── (*) audit_logs (as actor)

investment_plans (1) ──────── (*) investments
```

### 12.2 Table Definitions

#### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
mobile_number   VARCHAR(15) UNIQUE NOT NULL
full_name       VARCHAR(255)
email           VARCHAR(255) UNIQUE
date_of_birth   DATE
address         TEXT
role            VARCHAR(20)  -- 'customer' | 'supervisor' | 'owner'
pin_hash        VARCHAR(255)  -- bcrypt hash
biometric_enabled BOOLEAN DEFAULT FALSE
kyc_status      VARCHAR(20) DEFAULT 'pending'
  -- 'pending' | 'under_review' | 'approved' | 'rejected'
is_active       BOOLEAN DEFAULT TRUE
fcm_token       VARCHAR(500)  -- Firebase device token
referral_code   VARCHAR(20) UNIQUE
referred_by_id  UUID REFERENCES users(id)
wallet_balance  DECIMAL(15,2) DEFAULT 0.00
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### `device_trust`
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
device_id     VARCHAR(255)  -- expo device ID
device_name   VARCHAR(255)
trusted_at    TIMESTAMPTZ DEFAULT NOW()
last_used_at  TIMESTAMPTZ
```

#### `kyc_documents`
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users(id)
aadhaar_front_url   VARCHAR(500)
aadhaar_back_url    VARCHAR(500)
pan_url             VARCHAR(500)
selfie_url          VARCHAR(500)
bank_account_number VARCHAR(20)
ifsc_code           VARCHAR(11)
bank_name           VARCHAR(100)
reviewed_by_id      UUID REFERENCES users(id)
review_remarks      TEXT
submitted_at        TIMESTAMPTZ DEFAULT NOW()
reviewed_at         TIMESTAMPTZ
```

#### `investment_plans`
```sql
id                          UUID PRIMARY KEY
name                        VARCHAR(255)
description                 TEXT
min_amount                  DECIMAL(15,2)
max_amount                  DECIMAL(15,2)
return_rate_percent         DECIMAL(5,2)   -- e.g. 12.50
tenure_months               INTEGER
payout_frequency            VARCHAR(20)
  -- 'monthly' | 'quarterly' | 'on_maturity'
premature_penalty_percent   DECIMAL(5,2) DEFAULT 0
terms_text                  TEXT
is_active                   BOOLEAN DEFAULT TRUE
created_by_id               UUID REFERENCES users(id)
created_at                  TIMESTAMPTZ DEFAULT NOW()
updated_at                  TIMESTAMPTZ DEFAULT NOW()
```

#### `investments`
```sql
id              UUID PRIMARY KEY
customer_id     UUID REFERENCES users(id)
plan_id         UUID REFERENCES investment_plans(id)
amount          DECIMAL(15,2)
start_date      DATE
maturity_date   DATE
status          VARCHAR(20)
  -- 'pending' | 'active' | 'rejected' | 'matured' | 'withdrawn'
upi_txn_ref     VARCHAR(100)
screenshot_url  VARCHAR(500)
approved_by_id  UUID REFERENCES users(id)
approved_at     TIMESTAMPTZ
rejection_reason TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

#### `payouts`
```sql
id                UUID PRIMARY KEY
investment_id     UUID REFERENCES investments(id)
due_date          DATE
amount            DECIMAL(15,2)
status            VARCHAR(20)
  -- 'pending' | 'paid' | 'overdue' | 'skipped'
paid_at           TIMESTAMPTZ
processed_by_id   UUID REFERENCES users(id)
remarks           TEXT
created_at        TIMESTAMPTZ DEFAULT NOW()
```

#### `referral_bonuses`
```sql
id                UUID PRIMARY KEY
referrer_id       UUID REFERENCES users(id)
referred_user_id  UUID REFERENCES users(id)
investment_id     UUID REFERENCES investments(id)
bonus_amount      DECIMAL(15,2)
status            VARCHAR(20)  -- 'pending' | 'credited'
credited_at       TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT NOW()
```

#### `notifications`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
title       VARCHAR(255)
body        TEXT
type        VARCHAR(50)
  -- 'investment_approved' | 'payout_due' | 'kyc_approved' | 'announcement' | ...
is_read     BOOLEAN DEFAULT FALSE
sent_via    VARCHAR(20)  -- 'push' | 'sms' | 'both'
created_at  TIMESTAMPTZ DEFAULT NOW()
```

#### `audit_logs`
```sql
id            UUID PRIMARY KEY
actor_id      UUID REFERENCES users(id)
action        VARCHAR(100)  -- e.g. 'kyc.approved', 'investment.rejected'
entity_type   VARCHAR(50)
entity_id     UUID
old_value     JSONB
new_value     JSONB
ip_address    INET
created_at    TIMESTAMPTZ DEFAULT NOW()
```

---

## 13. UPI Payment Flow

### 13.1 Deep-Link Construction

```typescript
// packages/utils/src/upi.ts
export function buildUPIDeepLink(params: {
  upiId: string       // fetched from backend, not hardcoded
  payeeName: string
  amount: number
  txnRef: string
  note?: string
}): string {
  const { upiId, payeeName, amount, txnRef, note } = params
  const base = 'upi://pay'
  const query = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: txnRef,
    cu: 'INR',
    ...(note ? { mc: note } : {}),
  })
  return `${base}?${query.toString()}`
}
```

### 13.2 UPI ID Source

The `OWNER_UPI_ID` is stored in Django settings / database (configurable by Owner). The mobile app calls `GET /api/investments/initiate/` and receives `{ upi_id, txn_ref, amount }`. It is **never** in the Expo `.env` file.

### 13.3 Payment States

```
not_started
    │
    ▼ Customer taps "Invest"
initiated
    │
    ▼ UPI app opened (deep-link)
awaiting_screenshot
    │
    ▼ Customer uploads screenshot
pending_verification
    │
    ├──► Approved by Supervisor/Owner
    │           │
    │           ▼
    │         active  ──► payouts generated ──► matured
    │
    └──► Rejected
                │
                ▼
            rejected (customer notified, can re-invest)
```

---

## 14. Notification System

### 14.1 Notification Events

|
 Event 
|
 Recipient 
|
 Channel 
|
 Trigger 
|
|
---
|
---
|
---
|
---
|
|
 OTP requested 
|
 Customer 
|
 SMS (Twilio) 
|
 Auth flow 
|
|
 New device login 
|
 Customer 
|
 SMS 
|
 Login from new device_id 
|
|
 KYC submitted 
|
 Owner + Supervisors 
|
 Push 
|
 Customer submits KYC 
|
|
 KYC approved 
|
 Customer 
|
 Push + SMS 
|
 Owner approves 
|
|
 KYC rejected 
|
 Customer 
|
 Push + SMS 
|
 Owner rejects 
|
|
 Investment received 
|
 Owner + Supervisors 
|
 Push 
|
 Customer submits screenshot 
|
|
 Investment approved 
|
 Customer 
|
 Push + SMS 
|
 Supervisor/Owner approves 
|
|
 Investment rejected 
|
 Customer 
|
 Push + SMS 
|
 Supervisor/Owner rejects 
|
|
 Payout scheduled 
|
 Customer 
|
 Push 
|
 Celery cron creates payout record 
|
|
 Payout due tomorrow 
|
 Owner + Supervisors 
|
 Push 
|
 Celery cron: 1 day before 
|
|
 Payout marked paid 
|
 Customer 
|
 Push + SMS 
|
 Supervisor/Owner marks paid 
|
|
 Withdrawal requested 
|
 Owner + Supervisors 
|
 Push 
|
 Customer requests withdrawal 
|
|
 Referral bonus credited 
|
 Customer 
|
 Push 
|
 Referred user's investment approved 
|
|
 Announcement 
|
 All / filtered 
|
 Push 
|
 Owner broadcasts manually 
|

### 14.2 FCM Token Registration

```typescript
// apps/mobile/hooks/useNotifications.ts
import * as Notifications from 'expo-notifications'
import api from '../services/api'

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const token = (await Notifications.getExpoPushTokenAsync()).data
  await api.post('/notifications/register-token/', { fcm_token: token })
}
```

---

## 15. Referral System

### 15.1 Referral Code Generation

- Generated on KYC approval
- Format: `INV-[6 alphanumeric chars]` (e.g., `INV-AXW92K`)
- Stored unique on `users.referral_code`

### 15.2 Bonus Credit Logic (Backend)

```python
# apps/referrals/signals.py
# Triggered when Investment status changes to 'active'

@receiver(post_save, sender=Investment)
def credit_referral_bonus(sender, instance, **kwargs):
    if instance.status != 'active':
        return
    if ReferralBonus.objects.filter(investment=instance).exists():
        return  # idempotent — don't double-credit

    referrer = instance.customer.referred_by
    if not referrer:
        return

    config = ReferralConfig.objects.get_current()
    bonus = config.flat_amount or (instance.amount * config.percent / 100)

    ReferralBonus.objects.create(
        referrer=referrer,
        referred_user=instance.customer,
        investment=instance,
        bonus_amount=bonus,
        status='credited'
    )
    referrer.wallet_balance = F('wallet_balance') + bonus
    referrer.save(update_fields=['wallet_balance'])

    # Notify referrer
    send_push_notification(referrer, 'Referral Bonus Credited!',
        f'₹{bonus} credited for referring {instance.customer.full_name}')
```

### 15.3 Abuse Prevention

- `referred_by` can only be set at registration — immutable after
- Self-referral blocked (backend validates `referrer_id != customer_id`)
- Bonus only on first investment of referred user (one-time per referred user)
- Same device ID cannot register multiple accounts with same referral code

---

## 16. Non-Functional Requirements

### 16.1 Security

- HTTPS only (HTTP redirected to HTTPS via Nginx)
- JWT access token TTL: 15 minutes; refresh token TTL: 30 days
- Refresh token invalidated on logout (stored in Redis blacklist)
- OTP: 6 digits, TTL 5 minutes, max 3 attempts per OTP, max 3 OTP requests per mobile per 10 minutes
- API rate limiting: 100 req/min per IP (anonymous), 300 req/min per authenticated user
- KYC documents stored in private S3 bucket — access via signed URLs (TTL: 15 min)
- Payment screenshots stored in private bucket — same signed URL approach
- All PII fields (Aadhaar number, PAN, bank account) encrypted at rest (AES-256)
- PIN stored as bcrypt hash (cost factor 12) — never logged or returned via API
- Content-Security-Policy headers on all web responses
- CORS restricted to approved origins only
- Audit log written for every state-changing action (immutable, append-only)

### 16.2 Performance

- API response time P95 < 300ms for read endpoints
- Image uploads (KYC, screenshots) processed asynchronously (Celery task)
- Redis caching for: plan listings (TTL: 5 min), analytics summary (TTL: 1 min), user profile (TTL: 2 min)
- Pagination on all list endpoints (default page size: 20)
- Database indices on: `users.mobile_number`, `investments.customer_id`, `investments.status`, `payouts.due_date`, `payouts.status`

### 16.3 Reliability

- Celery Beat for payout cron (daily 9:00 AM IST) with retry on failure
- Celery task idempotency — duplicate payout records prevented via unique constraint on `(investment_id, due_date)`
- Database connection pooling (PgBouncer or Django's persistent connections)
- Health check endpoint: `GET /api/health/` (returns DB + Redis status)

### 16.4 Mobile-Specific

- Offline graceful degradation: show cached data with "Last updated X ago" banner
- Deep link handling for referral: `yourapp://referral?code=INV-XXX`
- Expo OTA updates via EAS Update (JS bundle, no app store re-submission for minor updates)
- App built with EAS Build for production `.apk` / `.ipa`

### 16.5 Accessibility

- Minimum touch target size: 44×44pt
- Text contrast ratio ≥ 4.5:1
- Screen reader labels on all interactive elements (`accessibilityLabel` on RN, `aria-label` on web)
- Reduced motion respected (`prefers-reduced-motion` on web, `AccessibilityInfo.isReduceMotionEnabled` on RN)

---

*End of PRD — Investment & Payout Management Platform v1.0*