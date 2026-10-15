# AGENTS.md

## Project

Wedding Drinks lets wedding guests order drinks from their phones while the bar sees the orders in real time. A guest scans the QR code on their table, picks drinks and sends the order. Staff make the drinks and carry them to the table, so that guests never have to leave their seats during speeches. That is the core idea of the app: never add a pick-up step, or text that asks guests to collect their drinks. The guest can follow the status of the order in the app.

- **Guest view** (`/table/:tableId`) is mobile-first. Guests are signed in anonymously in the background.
- **Bar view** (`/bar`) is built for a tablet and requires a staff account.
- **The UI is in English by default**, with Swedish as a second language.

The project rewrites two earlier repos that were built in one week for a real wedding. It is a portfolio project, so keep it small, tested and easy to read.

## Tech stack

| Area | Choice |
| --- | --- |
| Language | TypeScript with `strict: true` |
| UI | React 19 with React Compiler, function components and hooks only |
| Build | Vite (React + TS template), path alias `@/` for `src/` |
| Routing | React Router with `createBrowserRouter` |
| Backend | Firebase: Firestore, Auth (anonymous and email/password), Hosting, Emulator Suite |
| Validation | Zod for every Firestore document and every write |
| Styling | Tailwind CSS with theme tokens in CSS variables, shadcn/ui |
| Strings | Typed dictionaries in `src/shared/i18n/`, English and Swedish |
| Tests | Vitest, React Testing Library, `@firebase/rules-unit-testing`, Playwright |
| Code quality | ESLint flat config with `typescript-eslint` and `eslint-plugin-react-hooks`, Prettier |
| CI/CD | GitHub Actions, Firebase Hosting with a preview channel per pull request |

## How the work is organised

Three documents guide the work. Read them in this order:

1. **This file** describes the project, its commands, its structure and its data model.
2. **[docs/conventions.md](docs/conventions.md)** holds the rules for code, data, security, strings, tests and Git. Read the sections that apply before changing code.
3. **[docs/roadmap.md](docs/roadmap.md)** splits the work into small steps, each one branch and one pull request. Work on the first step that is not Done, and only on that step.

Two reference files hold the details. [docs/data-model.md](docs/data-model.md) specifies the Firestore data, the Firebase layer, the security rules and the seed data. [docs/strings.md](docs/strings.md) lists every UI string with its English and Swedish text.

## Commands

These scripts are the contract for `package.json`. If one is missing, add it under this name instead of inventing another.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server. `.env.development` sets `VITE_USE_EMULATORS=true`. |
| `npm run emulators` | `firebase emulators:start --only firestore,auth --project demo-wedding-drinks` |
| `npm run seed` | `tsx scripts/seed.ts` with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Vitest unit and component tests. Excludes `tests/rules` and `tests/e2e`. |
| `npm run test:rules` | `firebase emulators:exec --only firestore --project demo-wedding-drinks "vitest run tests/rules"` |
| `npm run test:e2e` | Playwright against the emulators |
| `npm run build` | `tsc -b && vite build` |

The `demo-` prefix on the project id makes the emulators run without a real Firebase project.

## Definition of done

A change is done when all of these hold:

1. `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass.
2. `npm run test:rules` passes, if the change touches `firestore.rules`, a schema, an `api.ts` file or a query.
3. The change follows `docs/conventions.md`.
4. New behaviour has tests.
5. New user-facing text exists in both `en.ts` and `sv.ts`.
6. The step's status in `docs/roadmap.md` is updated.

## Project structure

```
src/
├─ app/                    # router, providers, layout
├─ features/
│  ├─ ordering/            # guest view: menu, cart, my orders
│  │  ├─ cart.ts           # cartReducer and helpers
│  │  ├─ api.ts            # createOrder
│  │  ├─ hooks.ts          # useMenu, useMyOrders
│  │  └─ components/
│  ├─ bar/                 # bar view: active orders, status, sold out
│  │  ├─ api.ts            # updateOrderStatus, setDrinkAvailable
│  │  ├─ hooks.ts          # useActiveOrders
│  │  └─ components/
│  └─ auth/                # AuthProvider, sign-in, protected route
├─ shared/
│  ├─ firebase/            # app.ts, converters.ts, refs.ts, useLiveQuery.ts, hooks.ts
│  ├─ i18n/                # en.ts, sv.ts, locale.ts, I18nContext.ts, I18nProvider.tsx, useStrings.ts
│  ├─ schemas/             # Zod: drink.ts, order.ts, eventConfig.ts, staff.ts
│  └─ ui/                  # shadcn/ui components
└─ test/
   └─ setup.ts             # Vitest setup: jest-dom matchers and cleanup
tests/
├─ rules/                  # security rules tests, run against the emulator
└─ e2e/                    # Playwright
docs/
├─ conventions.md          # rules for code, data, tests and Git
├─ data-model.md           # Firestore data, Firebase layer, rules and seed data
├─ roadmap.md              # the steps to build the app, one pull request each
└─ strings.md              # every UI string in English and Swedish
scripts/seed.ts            # menu, config/event and a staff account
AGENTS.md                  # this file
CLAUDE.md                  # how Claude Code works in this repo
firestore.rules
firestore.indexes.json
firebase.json
```

## Data model

The Zod schemas in `src/shared/schemas/` are the source of truth for these shapes.

| Document | Fields | Written by |
| --- | --- | --- |
| `orders/{orderId}` | `table`, `items` (1–20 rows of `drinkId`, `name`, `quantity` 1–10), `status`, `createdAt`, `createdBy` | Guests create. Staff update `status`. |
| `drinks/{drinkId}` | `name`, `category`, `ingredients`, `available`, `sortOrder` | Seed script. Staff update `available`. |
| `staff/{uid}` | `displayName` | Seed script or the Firebase console only |
| `config/event` | `name`, `tableCount` | Seed script or the Firebase console only |

The schemas, converters, hooks, rules and seed data are specified in full in `docs/data-model.md`.
