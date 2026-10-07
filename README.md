# Health Pin Super Admin

Next.js 16 (App Router, TypeScript, Tailwind CSS 4, ESLint) console for Health Pin Super Admins.
It has no backend of its own: it uses the Django API in `../../backend`, which uses PostgreSQL.

```
Browser ──► Next.js server (this app) ──► Django REST API ──► PostgreSQL
```

## Run

```powershell
# 1. Django (from backend/), with the Super Admin account created once:
.\.venv\Scripts\python manage.py create_super_admin
.\.venv\Scripts\python manage.py runserver 0.0.0.0:8000

# 2. This app
cd web-applications/super-admin
copy .env.example .env.local      # first time only
npm install
npm run dev                        # http://localhost:3000
```

One sign-in page (`/login`) for Super Admins and hospitals. Super Admin: the account from
`backend/.env` (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`) → `/dashboard`. A hospital: the
email and password the Super Admin set in Hospitals → `/hospital/dashboard`.

Checks: `npm run lint`, `npm run build`.

## Configuration

| Variable | Where | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `.env.local` | Django origin only: `http://192.168.31.107:8000` locally, `https://api.healthpin.in` in production |

The existing shared client adds `/api/v1`; normal API requests and JWT refresh
use the same configuration in `lib/config/env.ts`. The origin is public, while
JWTs remain in httpOnly cookies and Django requests still run on the Next.js
server. No database credentials or Django secrets live here. Browser requests
in future web apps must use the same public origin configuration.

For local development, copy `.env.example` to `.env.local` and run `npm run dev`.
For production, set `NEXT_PUBLIC_API_BASE_URL=https://api.healthpin.in` before
`npm run build`, then run `npm run start`. Restart development after changes;
rebuild production because Next.js embeds public environment variables at build
time. Remove the old `API_BASE_URL` setting when migrating an existing deployment.

Native Flutter and the current server-side Next.js calls do not require CORS.
For any client that calls Django directly from a browser, configure its exact
origin in Django's `CORS_ALLOWED_ORIGINS`. Production must list only trusted
HTTPS frontend origins; there is no allow-all CORS setting.

## How authentication works

1. **Login**: the form posts to a Server Action (`features/authentication/actions`), which calls
   the shared `POST /api/v1/auth/login/`. Django checks the hashed password and returns the
   account's role; the app goes to that role's home (`lib/auth/roles.ts`).
2. **Session**: the JWTs are stored in two **httpOnly**, `SameSite=Lax` cookies (`Secure` in
   production), so page JavaScript and XSS can't read them.
3. **Route guard** (`proxy.ts`): no session → `/login`. Using the token's `role` claim, signed-in
   users on `/login` or on the other account type's area go to their own dashboard
   (`super_admin` → `/dashboard` and everything outside `/hospital`; `hospital` → `/hospital/...`).
   An expired access token is refreshed here before the page renders (refresh tokens rotate).
4. **Real check** (`lib/auth/session.ts`): admin pages ask Django `GET /admin/auth/me/`
   (`IsSuperAdmin`), hospital pages ask `GET /hospital/auth/me/` (`IsHospital`). Django decides:
   - 401 (no / invalid / expired token, revoked refresh) → cookies cleared, back to `/login`
   - 403 (wrong kind of account) → "Access denied" page with a link to the user's own dashboard
5. **Logout**: Server Action blacklists the refresh token on Django and clears the cookies.

Frontend checks are convenience only; every admin API must be protected in Django with
`IsSuperAdmin` (`backend/apps/authentication/permissions.py`).

## Structure

```
app/
  (admin)/            Super Admin area: layout checks the session with Django
  hospital/           hospital area (/hospital/dashboard placeholder), its own Django check
    dashboard/        page, loading skeleton
    error.tsx         error boundary (e.g. API down)
  login/              sign-in page
  api/auth/session-expired/   clears a dead session, redirects to /login
components/
  layout/             AppShell (both areas), AuthLayout, PageHeader, AccessDenied
  sidebar/            Sidebar + navigation.ts (add new modules here)
  header/             Header, LogoutButton
  ui/                 Button, TextField, PasswordField, Alert, Card, Badge, Logo, Dialog,
                      toast, Pagination, EmptyState, icons
features/
  authentication/     api (Django calls), actions (Server Actions), components, hooks, types
  dashboard/          StatCard, StatGrid, data (mock until APIs exist), types
  hospitals/          Super Admin hospital management: api, actions, components, types, validation
  hospital-portal/    the signed-in hospital (api, types); portal features go here later
lib/
  api/django.ts       server-only Django client + error type
  auth/               cookies, JWT expiry, token refresh, session check
  config/env.ts       server-only env
  utils/
proxy.ts              route guard + token refresh
```

## Hospitals module

`/hospitals` (sidebar → Hospitals): searchable, paginated list from `GET /admin/hospitals/`,
an **Add Hospital** dialog (name, email, password with show/hide), Edit (name/email),
**Password** (new password + confirmation; the hospital is signed out everywhere) and
Activate/Deactivate with confirmation. Everything is real data from Django; the list refreshes
after each change (`revalidatePath`). Code: `features/hospitals/` (api, actions, components,
types, validation) and `app/(admin)/hospitals/`. Reusable pieces added for it:
`components/ui/Dialog`, `toast`, `Pagination`, `EmptyState`.

The browser validates first for instant feedback; Django re-validates everything (duplicates,
common passwords, ...), and its messages are shown on the right field.

## Hospital Directory

`/dashboard/hospital-directory` (sidebar → Hospital Directory): the imported national directory,
read-only. Name and location search, state → district and category filters (all kept in the URL),
pagination, and a detail page per hospital (`/dashboard/hospital-directory/{id}`) with all 18
fields, a map link for valid coordinates and specialties/facilities as chips. Directory hospitals
are reference data, not login accounts. Code: `features/hospital-directory/` and
`app/(admin)/dashboard/hospital-directory/`. Data is loaded on the server with
`python manage.py import_hospitals` (no upload from the browser).

## Adding an admin module later

1. Django: add the API under `/api/v1/admin/...` with `permission_classes = [IsSuperAdmin]`.
2. Here: `features/<module>/` (api, components, types), a page under `app/(admin)/<module>/`, and
   one entry in `components/sidebar/navigation.ts`.

The dashboard numbers are placeholders from `features/dashboard/data/mockDashboardStats.ts`
(shown with a "Demo data" badge). Replace the body of `getDashboardStats()` when a stats API exists.
