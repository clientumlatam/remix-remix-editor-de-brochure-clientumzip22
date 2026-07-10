# Clientum CRM

CRM/ERP SaaS for Argentine SMEs (PyMEs) — manage contacts, leads, deals, invoicing, and inventory in one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/clientum run dev` — run the frontend (port 21496)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + wouter + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (contacts, companies, leads, deals, activities, invoices, products)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/clientum/src/` — React frontend (pages, components)

## Architecture decisions

- OpenAPI-first: spec in `lib/api-spec/openapi.yaml` drives both server validation (Zod) and client hooks (React Query)
- Single API server at `/api` serves all routes; frontend at `/` proxied through Replit's shared proxy
- JSON stored in `items` column for invoice line items (JSONB)
- Contact-company relationship via `company_id` foreign key (soft — no FK constraint in DB for flexibility)
- Invoice numbers auto-generated server-side as `INV-XXXX`

## Product

- **Landing page** (`/`) — Marketing page for Clientum SaaS with CTA to enter dashboard
- **Dashboard** (`/app/dashboard`) — KPI stats, pipeline chart, recent activities
- **Contacts** (`/app/contacts`, `/app/contacts/:id`) — Contact management with search/filter
- **Companies** (`/app/companies`) — Company directory with contact counts
- **Leads** (`/app/leads`) — Kanban pipeline by stage
- **Deals** (`/app/deals`) — Deal pipeline with value and probability tracking
- **Activities** (`/app/activities`) — Activity feed (calls, emails, meetings, tasks, notes)
- **Invoices** (`/app/invoices`) — Invoice management with status tracking
- **Products** (`/app/products`) — Product/inventory catalog

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always re-run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs`
- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before leaf artifact typechecks or they won't see new exports
- DB push: `pnpm --filter @workspace/db run push` (force variant: `push-force`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
