
# PickCar — Frontend
 
Next.js (App Router) client for **PickCar**, a car rental platform with three roles: **Driver**, **Company** and **Admin**. It consumes the PickCar Spring Data REST (HAL+JSON) backend, built from the [`spring-template`](https://github.com/UdL-EPS-SoftArch/spring-template), and uses shadcn/ui, `react-hook-form`, and Cucumber + Playwright E2E BDD testing.
 
## Vision
 
**For** drivers who need a car for a few days, and rental companies that want to rent out their fleet
**who** want to find, book and pick up a vehicle at a nearby pickup point without paperwork at a counter
**the project** is a car rental web platform
**that** lets drivers search, book, pay and check vehicles in and out; lets companies manage vehicles, pickup points and bookings; and lets admins verify drivers, companies and vehicles and resolve deposit disputes
**Unlike** traditional rental counters, every step (identity check, payment, deposit, vehicle inspection with photos) happens in the app, with the deposit released automatically when there are no incidents
 
## Getting Started
 
1. Start the PickCar Spring Boot backend on `http://127.0.0.1:8080`.
2. Install dependencies and run the Next.js development server:
```bash
npm install
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
 
## Running E2E BDD Tests
 
With both the backend (`http://127.0.0.1:8080`) and frontend (`http://localhost:3000`) running:
 
```bash
npm run test:e2e
# or concise CI output:
npm run test:e2e:ci
```
 
Reports are generated in `playwright-report/results.html` and `playwright-report/results.json`.
 
The backend already defines its behaviour in `.feature` files (driver registration, admin verification, vehicle search, booking, cancellation, check-in/check-out, company fleet, incidents, notifications). The frontend E2E features in `tests/e2e/` reuse the same scenarios and **the same error messages**, so both sides stay aligned.
 
## Tech Stack
 
| Area | Tool |
| --- | --- |
| Framework | Next.js (App Router), React Server/Client Components, TypeScript |
| API | Spring Data REST, HAL+JSON, Basic authentication |
| UI | shadcn/ui + Tailwind, brand colours: night blue, mint and coral |
| Forms | `react-hook-form` (+ Zod schemas mirroring backend validation) |
| Maps | Leaflet + OpenStreetMap for pickup points |
| Payments | Payment gateway to be decided with the backend (charge and deposit hold are separate operations) |
| Testing | Cucumber + Playwright E2E BDD |
 
The UI is **responsive from day one**: check-in and check-out happen on a phone, using the camera and geolocation.
 
## Project Structure
 
```
src/
  app/                 # App Router pages, grouped by role
    (public)/          # landing, login, register, verify email
    (driver)/          # search, vehicle details, booking, my bookings
    company/           # fleet, pickup points, company bookings
    admin/             # verification queues, incidents, audit
  api/                 # Spring Data REST service classes (HAL)
  types/               # TypeScript HAL entity types
  components/          # shared UI components
  lib/                 # auth, money, dates, validation schemas
tests/
  e2e/                 # Cucumber .feature specs
  e2e/steps/           # Playwright step definitions
```
 
### Domain entities (`src/types/`)
 
`User`, `DriverProfile`, `Document`, `Company`, `PickupPoint`, `Vehicle`, `Booking`, `Payment`, `Inspection`, `InspectionPhoto`, `Incident`, `Notification`, `AuditLog`.
 
Money is always stored in **cents** (`dailyPriceCents`, `totalCents`, `depositCents`…) and formatted in the UI as `cents / 100`.
 
## Routes by Role
 
| Public | Driver (`DRIVER`) | Company (`COMPANY_STAFF`) | Admin (`ADMIN`) |
| --- | --- | --- | --- |
| `/` landing + search | `/search` results + filters | `/company/register` | `/admin` dashboard |
| `/login`, `/register` | `/vehicles/[id]` vehicle details | `/company/documents` (tax ID, insurance) | `/admin/drivers` verification queue |
| `/verify-email/[token]` | `/booking/new` price breakdown + payment | `/company/pickup-points` | `/admin/companies` |
| `/reset-password` | `/me/documents` driving licence | `/company/vehicles` (create, pause, retire) | `/admin/vehicles` |
| | `/me/bookings` history | `/company/bookings` (+ cancel with reason) | `/admin/incidents` (review and resolve) |
| | `/me/bookings/[id]` details, cancel, check-in/out, incident | `/company/incidents` | `/admin/audit` |
| | `/me/notifications`, `/me/settings` | `/company/staff` (`OWNER` only) | |
 
### Access rules
 
- **By role:** each area is only for its role; otherwise show "Access denied".
- **By `verificationStatus`:** a `PENDING` or `REJECTED` driver can search but cannot book. Show a banner with the rejection reason.
- **By `companyRole`:** only `OWNER` and `FLEET_MANAGER` can manage the fleet. `AGENT` and `ACCOUNTANT` get read-only access.
## Key Screens and Business Rules
 
- **Search (RF-CON-07):** location and dates required; filters by transmission, category and max daily price; empty state "No vehicles available for the selected dates"; list + map.
- **Booking (RF-CON-13/14/16):** price breakdown (rate, extras, taxes, total) with the deposit shown separately as a hold; countdown on `holdExpiresAt` while `PENDING_PAYMENT`; pay button disabled after the first click to avoid double charges; separate errors for card declined, deposit not authorised and vehicle no longer available. The backend calculates the price; the frontend only displays it.
- **Cancellation (RF-CON-17):** show the calculated refund first; cancel only if the user confirms.
- **Check-in / check-out (RF-CON-20/25):** wizard with 5 required photos (front, rear, left, right, interior), optional damage photos and notes, mileage, fuel level and geolocation. Check-in only on the pickup day; check-out mileage cannot be lower than check-in. Result: differences table, photos side by side and final summary.
- **Incidents:** drivers report on `ACTIVE` or `COMPLETED` bookings; companies can add an `estimatedCost`; admins resolve with or without a deposit deduction (never above the deposit).
- **Admin panel:** verification queues with document preview (front and back); a reason is required to reject; a vehicle cannot be approved before its company.
## Shared Components
 
| Component | Purpose |
| --- | --- |
| `StatusBadge` | Maps every backend enum to a colour and label |
| `Money` | Formats cents as EUR |
| `FileUploader` | File type (JPG/PNG/PDF), size, front/back sides and errors |
| `PhotoStepCapture` | Guided photos by angle for inspections |
| `PriceBreakdown` | Rate, extras, taxes, total and deposit |
| `DateTimeRangePicker` | Pickup and return dates with validation |
| `RejectionBanner` | Shows the rejection reason (driver, company, vehicle) |
| `NotificationBell` | List, mark as read, preferences by type and channel (mandatory ones locked, `MARKETING` off by default) |
 
## Roadmap
 
1. **Foundation:** layout and design tokens, Basic auth (register, login, verify email), role access rules and shared components.
2. **Driver flow:** document upload → search → vehicle details → booking and payment → history → cancellation.
3. **Company:** registration and documents → pickup points → vehicles with extras and photos → company bookings.
4. **Admin:** verification queues → incidents → audit log.
5. **On the road:** mobile check-in, check-out and incidents → notifications and preferences.
Each feature follows the SDD cycle below: `.feature` spec → HAL types and API service → pages and forms → step definitions → verify.
 
## AI-Assisted Spec-Driven Development (SDD)
 
This repository follows **AI-Assisted Spec-Driven Development (SDD)** with **Next.js (App Router)**, **Spring Data REST (HAL)**, and **Cucumber + Playwright BDD**.
 
It is pre-configured with agent skills (`skills/`), repository instructions (`AGENTS.md`, `CONVENTIONS.md`), and Aider configuration (`.aider.conf.yml`) to support both:
1. **Full-Capability AI Agents** (OpenCode, Claude Code, Cursor, GitHub Copilot, Windsurf).
2. **Token-Constrained APIs** (Aider paired with Groq free tier - 8K token limits).
For complete stage-by-stage instructions and command workflows, see **[AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md)**.
 
### SDD Agent Skills (`skills/`)
- **`skills/sdd-feature-designer/SKILL.md`**: Draft concise Cucumber E2E `.feature` specs in `tests/e2e/`.
- **`skills/sdd-cucumber-steps/SKILL.md`**: Implement Cucumber + Playwright step definitions in `tests/e2e/steps/*.steps.ts`.
- **`skills/nextjs-hal-api/SKILL.md`**: Create TypeScript HAL entity types (`src/types/`) and Spring Data REST API service classes (`src/api/`).
- **`skills/nextjs-ui-pages/SKILL.md`**: Create Next.js App Router Server/Client pages and `react-hook-form` + shadcn/ui forms (`src/app/`).
- **`skills/sdd-bdd-verifier/SKILL.md`**: Run `npm run test:e2e:ci` and `npm run build` and diagnose test failures.
## Open Questions
 
To agree with the backend team before phase 2:
 
1. **Custom endpoints.** Spring Data REST exposes CRUD for each repository, but booking with payment, cancellation with refund, check-in/check-out and admin approvals need custom controllers. Their paths and error format (e.g. `{ code, message }` with the `.feature` messages) must be agreed.
2. **Undefined values:** maximum upload size (we only know 15 MB fails), payment hold duration, payment gateway, and notification channels (`EMAIL` and `PUSH` appear).
3. **Contradictions in the backend spec:** "Basic notifications" is out of scope but RF-CON-27 and a whole `.feature` define them; "lock and unlock the car" is in the driver list but "Digital key" is out of scope (left out of the frontend for now).
4. **Entity types:** the entity table uses `String` for `*Cents` amounts and lat/long, `Boolean` for `emailVerifiedAt`, a UQ on `passwordHash` and an FK on `reviewedAt`. The ER diagram is correct; the backend should follow it.
5. **Language:** Spanish, Catalan or both? If more than one, add i18n in phase 1.
 
