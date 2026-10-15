# Roadmap

The work is split into 36 small steps in five phases. Each step is one branch and one pull request, and leaves `main` working.

## How to work through the roadmap

- **Take one step at a time, in order.** Start the next step only when the previous one is merged.
- **One step is one branch and one pull request.** Use the branch name from the table, and a PR title as described in [docs/conventions.md](conventions.md).
- **Update the status in the same branch.** Set it to In progress when work on the step starts, and to Done before the pull request is opened.
- **Keep steps small.** If a step grows past about 300 changed lines, not counting the lockfile and generated files, stop and propose how to split it before going on.
- **Every step meets the definition of done in AGENTS.md** and leaves `main` working.
- **Strings, rules and tests belong to the step that needs them**, never to a later clean-up step.
- **Do not pull work forward.** If a step needs something from a later step, say so and propose moving it.
- **Record every change to the plan under Decisions**, with the step number and a short reason.

The status of a step is one of `Not started`, `In progress` and `Done`.

## Phase 0: Project foundation

An empty app with tooling, CI, styling, strings and routes in place, before any Firebase code.

| # | Step | Branch | Content | Status |
| --- | --- | --- | --- | --- |
| 0.1 | Project setup | `chore/project-setup` | Vite React + TS template, strict TypeScript, `@/` alias, an empty start page, MIT license, AGENTS.md, CLAUDE.md, docs/conventions.md, docs/data-model.md, docs/strings.md and this roadmap in docs/roadmap.md | Done |
| 0.2 | Lint and format | `chore/lint-and-format` | ESLint flat config with `typescript-eslint` and `eslint-plugin-react-hooks`, Prettier, the `lint`, `format` and `typecheck` scripts | Done |
| 0.3 | React Compiler | `chore/react-compiler` | React Compiler enabled in the Vite config | Done |
| 0.4 | Unit tests | `test/vitest-setup` | Vitest, React Testing Library and jsdom, `npm test`, one smoke test | Not started |
| 0.5 | CI | `ci/checks` | GitHub Actions running lint, typecheck, tests and build on every pull request. Branch protection on `main`. | Not started |
| 0.6 | Styling | `chore/tailwind-and-shadcn` | Tailwind CSS with theme tokens in CSS variables, shadcn/ui set up with Button | Not started |
| 0.7 | Strings | `feat/i18n` | `en.ts` and `sv.ts` with the `common` strings, `locale.ts`, `I18nContext`, `I18nProvider`, `useStrings`, tests | Not started |
| 0.8 | Router shell | `feat/router-shell` | `createBrowserRouter` with placeholder pages for `/table/:tableId`, `/bar` (lazy), `/login` and 404, plus an `errorElement` per route | Not started |
| 0.9 | Language picker | `feat/language-picker` | Language picker in the layout, the choice saved, `<html lang>` following the locale | Not started |

## Phase 1: Firebase foundation

Emulators, rules testing, schemas and the read layer, ending with a table route that knows which tables exist.

| # | Step | Branch | Content | Status |
| --- | --- | --- | --- | --- |
| 1.1 | Firebase setup | `chore/firebase-init` | `firebase init` for Firestore, Hosting and Emulators, a deny-all `firestore.rules`, `npm run emulators`, `.env.example` and `.env.development` | Not started |
| 1.2 | Rules testing | `test/rules-setup` | `@firebase/rules-unit-testing`, `npm run test:rules`, a test proving that everything is denied, a rules job in CI | Not started |
| 1.3 | Firebase client | `feat/firebase-client` | `app.ts` with the emulator connection, typed environment variables in `vite-env.d.ts` | Not started |
| 1.4 | Schemas | `feat/schemas` | Zod schemas for drink, order, event config and staff, with tests for `parseTableId`, `canTransition` and parsing | Not started |
| 1.5 | Read layer | `feat/read-layer` | `readConverter`, `refs.ts`, `useLiveQuery` and `useLiveDoc`, with tests for the converter | Not started |
| 1.6 | Seed and menu rules | `feat/seed-and-menu-rules` | `scripts/seed.ts`, `npm run seed`, read rules for `drinks` and `config/event` with rules tests | Not started |
| 1.7 | Table validation | `feat/table-validation` | `useEventConfig`, `/table/:tableId` validated with `parseTableId`, the 404 view for unknown tables, the `notFound` strings | Not started |

## Phase 2: Guest view

A guest can browse the menu, send an order and follow its status until the drinks are served at the table.

| # | Step | Branch | Content | Status |
| --- | --- | --- | --- | --- |
| 2.1 | Anonymous sign-in | `feat/anonymous-sign-in` | `AuthProvider` with `AuthState`, anonymous sign-in on the guest route, the Auth emulator | Not started |
| 2.2 | Menu | `feat/menu` | `useMenu`, drinks in category tabs with ingredients, the `menu` and `category` strings | Not started |
| 2.3 | Cart | `feat/cart` | `cartReducer` with tests, add and remove buttons with accessible names, a cart summary with `cart.count` | Not started |
| 2.4 | Clear cart | `feat/clear-cart` | A clear button with a confirmation dialog | Not started |
| 2.5 | Guest order rules | `feat/guest-order-rules` | Rules for creating orders and reading your own, with allow and deny tests, `firestore.indexes.json` | Not started |
| 2.6 | Send order | `feat/send-order` | `createOrder`, a sending state, confirmation that the drinks will be brought to the table, an error message, the cart cleared on success | Not started |
| 2.7 | Sold out for guests | `feat/sold-out-for-guests` | Sold-out drinks disabled in the menu, a warning from `unavailableInCart` that blocks sending | Not started |
| 2.8 | My orders | `feat/my-orders` | `useMyOrders`, the guest's orders with time and status, `aria-live` on status changes | Not started |

## Phase 3: Bar view

Staff sign in, see active orders by table, move them forward until they are served, and mark drinks as sold out.

| # | Step | Branch | Content | Status |
| --- | --- | --- | --- | --- |
| 3.1 | Staff sign-in | `feat/staff-sign-in` | `/login` with email and password, `isStaff` from `staff/{uid}`, the rule for reading your own staff document with tests, the `login` strings | Not started |
| 3.2 | Protected bar route | `feat/protected-bar-route` | `/bar` redirects to `/login` unless the user is staff, the signed-in name and sign-out | Not started |
| 3.3 | Staff order rules | `feat/staff-order-rules` | Rules for staff reading all orders and moving the status forward, with allow and deny tests | Not started |
| 3.4 | Active orders | `feat/active-orders` | `useActiveOrders`, oldest first, the table number in large type, the drinks, the age of each order and an empty state | Not started |
| 3.5 | Status actions | `feat/order-status-actions` | Start preparing and mark as served, with `updateOrderStatus`, `canTransition` and an error message | Not started |
| 3.6 | New order signal | `feat/new-order-signal` | A visual highlight and an `aria-live` announcement when a new order arrives | Not started |
| 3.7 | Sold-out switch | `feat/sold-out-switch` | A menu tab in the bar view with an availability switch per drink, `setDrinkAvailable`, the rule with tests | Not started |

## Phase 4: Quality and delivery

The whole flow tested end to end, polished, live on Firebase Hosting and presented in the README.

| # | Step | Branch | Content | Status |
| --- | --- | --- | --- | --- |
| 4.1 | End-to-end test | `test/e2e-flow` | Playwright against the emulators: a guest orders, the bar serves the order and the guest sees it. A job in CI. | Not started |
| 4.2 | Archipelago look | `feat/archipelago-look` | The archipelago images and final styling from version 1, checked on a phone and a tablet | Not started |
| 4.3 | Accessibility pass | `chore/accessibility-pass` | A keyboard and screen reader walkthrough of both views, with fixes for what it finds | Not started |
| 4.4 | Hosting | `ci/hosting-and-previews` | The demo project on Firebase Hosting, rules and indexes deployed, a preview channel per pull request | Not started |
| 4.5 | README | `docs/readme` | The story, the live demo and demo login, a GIF of phone and bar side by side, the data model, the rules and the decisions | Not started |

## Not planned yet

These ideas are outside the current plan. Do not start on them without a decision recorded below.

- **Printable QR codes**, one per table.
- **Menu editing in the bar view.** This is the point where React Hook Form would earn its place.
- **Drink names in both languages.** This needs a name per language in the `drinks` data model.

## Decisions

Record decisions that change this roadmap here, newest first, with the step number and a short reason.
