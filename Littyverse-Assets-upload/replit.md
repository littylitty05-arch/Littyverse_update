# Littyverse

## Overview

Littyverse is a full-stack creator platform built on Replit that combines AI-powered content generation, a chatbot, a digital asset marketplace, and monetization through Stripe. Users can generate AI images/videos, chat with an AI assistant, create and manage creator profiles, list items on a marketplace, and subscribe to paid plans. The app uses a dark "cyber/neon" aesthetic with purple, pink, and blue accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS and CSS variables
- **Forms**: react-hook-form with Zod validation via @hookform/resolvers
- **Animations**: Framer Motion
- **Design System**: Dark mode by default, neon cyber aesthetic. Fonts are Outfit and Space Grotesk. All CSS variables defined in `client/src/index.css`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`
- **Pages**: Home, Dashboard, Create (AI studio), Chat (AI chatbot), Marketplace, Profile, 404

### Backend
- **Framework**: Express.js on Node with TypeScript, compiled via tsx (dev) and esbuild (production)
- **HTTP Server**: Node's `http.createServer` wrapping Express (needed for potential WebSocket support)
- **API Pattern**: RESTful JSON APIs under `/api/`. Route definitions are shared between client and server via `shared/routes.ts` with Zod schemas for input/output validation
- **Build**: Custom build script (`script/build.ts`) uses Vite for client and esbuild for server. Production output goes to `dist/` with client assets in `dist/public/`
- **Dev Server**: Vite dev server runs as Express middleware with HMR via `server/vite.ts`
- **Static Serving**: In production, `server/static.ts` serves the built client with SPA fallback

### Authentication
- **Replit Auth**: OpenID Connect (OIDC) via Replit's identity provider
- **Session Management**: express-session with connect-pg-simple storing sessions in PostgreSQL (`sessions` table)
- **User Storage**: Users are upserted on login into a `users` table. Auth logic is in `server/replit_integrations/auth/`
- **Required env vars**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Database
- **Database**: PostgreSQL (provisioned via Replit)
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-Zod conversion
- **Schema Location**: `shared/schema.ts` (main tables) plus `shared/models/auth.ts` and `shared/models/chat.ts`
- **Migrations**: Drizzle Kit with `npm run db:push` for schema push. Migration output in `./migrations/`
- **Key Tables**:
  - `users` — Replit Auth user records
  - `sessions` — express-session storage
  - `creator_profiles` — creator bios, earnings, follower counts
  - `generated_content` — AI-generated videos/images with status tracking
  - `marketplace_items` — digital assets for sale
  - `conversations` / `messages` — AI chat history
  - `user_subscriptions` — subscription tier tracking
  - Stripe tables live in a `stripe` schema managed by `stripe-replit-sync`

### AI Integrations
All AI features use OpenAI API via Replit AI Integrations (custom base URL):
- **Chat**: `server/replit_integrations/chat/` — Streaming AI chat with conversation persistence. Routes at `/api/conversations/*`
- **Image Generation**: `server/replit_integrations/image/` — Uses `gpt-image-1` model. Route at `/api/generate-image`
- **Audio/Voice**: `server/replit_integrations/audio/` — Voice recording, speech-to-text, text-to-speech with AudioWorklet for browser playback (currently disabled to avoid route conflicts with chat)
- **Batch Processing**: `server/replit_integrations/batch/` — Generic batch utility with rate limiting and retries for bulk AI operations
- **Required env vars**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Payments (Stripe)
- **Integration**: Direct Stripe SDK usage via `server/stripeClient.ts` and `server/stripeService.ts`
- **Sync**: `stripe-replit-sync` library manages a `stripe` schema in PostgreSQL, syncing products/prices/subscriptions
- **Webhooks**: Managed webhook setup in `server/index.ts`, processed via `server/webhookHandlers.ts`. Webhook route must be registered BEFORE `express.json()` middleware (needs raw Buffer)
- **Features**: Customer creation, checkout sessions, billing portal, subscription management
- **Required env vars**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

### Shared Code (`shared/`)
- `schema.ts` — All Drizzle table definitions and Zod insert schemas
- `routes.ts` — API route definitions with paths, methods, Zod input/output schemas, and a `buildUrl` helper
- `models/auth.ts` — User and session table definitions
- `models/chat.ts` — Conversation and message table definitions

### Key Commands
- `npm run dev` — Start development server with Vite HMR
- `npm run build` — Build client (Vite) and server (esbuild) for production
- `npm start` — Run production build
- `npm run db:push` — Push Drizzle schema to PostgreSQL
- `npm run check` — TypeScript type checking

## External Dependencies

### Required Services
- **PostgreSQL** — Primary database (must set `DATABASE_URL`)
- **Replit Auth (OIDC)** — Authentication provider (needs `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`)
- **OpenAI API (via Replit AI Integrations)** — Powers chat, image generation, and audio features (needs `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Stripe** — Payment processing for subscriptions and credits (needs `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` + `express-session` — HTTP server and session management
- `connect-pg-simple` — PostgreSQL session store
- `openai` — OpenAI SDK for AI features
- `stripe` + `stripe-replit-sync` — Payment processing and data sync
- `passport` + `openid-client` — OIDC authentication flow
- `@tanstack/react-query` — Client-side data fetching
- `wouter` — Client-side routing
- `framer-motion` — Animations
- `zod` + `drizzle-zod` — Runtime validation
- `shadcn/ui` components (Radix UI primitives)