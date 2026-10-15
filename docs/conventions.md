# Conventions

These rules apply to all work in this repo. AGENTS.md describes the project, and `docs/roadmap.md` lists the steps to build it. Read the sections that apply before changing code.

## Architecture

- **Features stay separate.** A feature imports from `shared/` and never from another feature. Code that two features need moves to `shared/`. Only `app/` imports from every feature.
- **Logic lives in hooks and pure functions.** Components render data and forward events. Components never call Firestore directly.
- **Lazy-load `/bar`**, so that guests never download the bar code.
- **Validate route parameters.** `/table/:tableId` goes through `parseTableId` against `config/event`, and an unknown table renders the 404 view.
- **Every route has an `errorElement`.**

## Code style

- **Named exports only.** The exception is config files that require a default export, such as `vite.config.ts`.
- **One component per file**, named in `PascalCase.tsx`. Hooks are named `useXxx` and may share a feature's `hooks.ts`.
- **Unit tests sit next to the file they test**, as `cart.test.ts` next to `cart.ts`.
- **Use `@/` imports between folders.** Relative imports are only for files in the same folder.
- **A comment must say something the code cannot:** why a value is what it is, a non-obvious constraint, or a link to a spec.
- **Never comment what the code already says.** No section dividers, no commented-out code, and no JSDoc on private or self-explanatory declarations.

## Data access

The schemas, converters, hooks and rules are specified in [docs/data-model.md](data-model.md). Build them as specified there, and propose a change before deviating from it.

- **Read through `refs.ts`.** Its collection and document refs carry a converter that validates with Zod. Subscribe with `useLiveQuery` or `useLiveDoc`.
- **Write only through `api.ts` functions.** Validate the input with Zod before writing. Write with plain `collection(db, ...)` and `doc(db, ...)`, never with the converter refs, which throw on write.
- **Use `serverTimestamp()`** for `createdAt`, never the client clock.
- **Keep queries stable.** Define a query as a module constant or inside `useMemo`. A query built during render starts a new subscription on every render.
- **Filter guest queries by `createdBy`.** Rules are not filters, so a query that could return other guests' orders is rejected.
- **Order status only moves forward:** from `new` to `preparing` or `done`, and from `preparing` to `done`. Done means the drinks have been served at the table. The transitions are defined in both `order.ts` and `firestore.rules`.
- **Change a data shape everywhere at once.** In the same pull request, update the Zod schema, `firestore.rules`, the rules tests, the seed script, and `firestore.indexes.json` if a query changes.

### Firestore pitfalls

- **`serverTimestamp()` is empty locally until the server answers.** The converter reads with `serverTimestamps: 'estimate'`, so `createdAt` is never `null`.
- **Rules cannot loop over lists.** They check that `items` has 1–20 rows, but not each row. Zod covers the rows, both on write and on read.
- **`useLiveQuery` skips and logs invalid documents**, so that one broken or tampered order cannot stop the bar view. Do not change it to fail the whole list.
- **The emulator does not need composite indexes, but the real project does.** Deploy `firestore.indexes.json` with `firebase deploy --only firestore`.

## Auth and security

- **Guests sign in anonymously.** Staff sign in with email and password.
- **A user is staff only if `staff/{uid}` exists.** Never base permissions on the email address or on `isAnonymous`. Anyone can create an email account through the client API.
- **`firestore.rules` is the security boundary.** Client-side checks are only there for the user experience.
- **Start from deny.** Each new rule opens one specific operation and comes with tests for both what is allowed and what is denied.
- **Never commit secrets.** The Firebase web config goes in `.env` files. `.env.example` lists `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` and `VITE_USE_EMULATORS`. Service account keys never go in the repo.

## State

- **Local state uses `useState` or `useReducer`.** The cart uses `cartReducer` from `features/ordering/cart.ts`.
- **Context is only for values that rarely change:** the auth state in `AuthProvider` and the locale in `I18nProvider`.
- **There is no global store.** All server data comes from Firestore subscriptions.
- **Derive values during render.** Never use an effect to copy one piece of state into another.
- **Update state immutably.**
- **Every view handles loading, errors and empty data**, using `QueryState`.

## UI

- **Use Tailwind CSS and shadcn/ui.** Colours, spacing and radii come from the theme tokens in CSS variables. Never hard-code a colour or a size in a component, and ask before adding a token.
- **Reuse before you build.** Check `shared/ui/` for an existing component before creating a new one.
- **The guest view is mobile-first.** The bar view is designed for a tablet in landscape and shows the table number in large type on every order, since staff carry the drinks out.
- **Keep the archipelago look** from the first version of the app.

## Strings and languages

Every planned string is listed in [docs/strings.md](strings.md), with its key and its English and Swedish text. Use that copy, and add any new string to the table as well as to the code.

- **No hard-coded user-facing strings.** Every string lives in `src/shared/i18n/en.ts`, with Swedish in `sv.ts`. Components read them with `useStrings()`.
- **English is the default locale.** Swedish is used when the browser language starts with `sv` or when the user picks it. The choice is saved in `localStorage`, and `<html lang>` follows the locale.
- **`sv.ts` is typed as `Strings`**, the type of `en.ts`, so a missing key or a wrong parameter fails the typecheck. Add every new string to both files in the same change.
- **Strings with values are functions**, such as `common.table(3)`. Plurals are functions of `count`. Never build a sentence by joining translated pieces.
- **Format dates, times and lists with `Intl`** and the current locale.
- **Menu content is data, not UI text.** Drink names and ingredients come from Firestore and are not translated.

## Accessibility

- **Use semantic HTML.** Actions are `<button>` elements, never `<div onClick>`.
- **Every form field has a `<label>`.** Icon-only buttons get an accessible name from the strings.
- **Focus is visible on everything interactive**, and the whole app works with a keyboard.
- **Announce changes with `aria-live`:** a new status on the guest's order, and a new order in the bar.
- **Query by role in tests.** If `getByRole` cannot find an element, the markup is probably not accessible.

## Testing

| Kind | Tool | Location | Covers |
| --- | --- | --- | --- |
| Unit | Vitest | Next to the file | Pure logic such as `cartReducer`, `parseTableId`, `canTransition` and the schemas |
| Component | Vitest and React Testing Library | Next to the component | Behaviour through roles and visible text |
| Security rules | `@firebase/rules-unit-testing` | `tests/rules/` | Every rule, both allowed and denied |
| End-to-end | Playwright | `tests/e2e/` | A guest orders, the bar sees it, the bar marks it served and the guest sees that |

- **Test behaviour, not implementation.** Query with `getByRole` first, and do not use snapshot tests.
- **Keep component tests away from Firebase.** Split a component that reads data, so that the part that renders takes the data as props. Test that part with plain data.
- **Run anything that needs Firestore against the emulator**, never against a real project.
- **Write a failing test before fixing a bug.**
- **CI runs every kind of test**, including the rules and end-to-end tests.

## Git, pull requests and the roadmap

- **Work from [docs/roadmap.md](roadmap.md).** Take the steps in order, with one branch and one pull request per step. The roadmap gives each step its branch name.
- **Update the step's status in the same branch.** Set it to In progress when work on the step starts, and to Done before the pull request is opened.
- **`main` is protected.** All work merges through a pull request with green CI.
- **Branch names follow `<type>/<short-description>`**, such as `feat/cart` or `fix/table-validation`. The types are `feat`, `fix`, `chore`, `docs`, `refactor`, `test` and `ci`.
- **Commit messages are one short imperative line.** Pull requests are squash-merged, so the PR title becomes the commit on `main`.
- **PR titles follow `<type>: <description>`** and mirror the branch name. The branch `feat/cart` becomes `feat: cart`.
- **PR bodies use exactly these headings:**
  - **What:** the change in one or two sentences.
  - **Issue:** the roadmap step, such as `Roadmap 2.3`, and any linked issue.
  - **Notes:** decisions, trade-offs and follow-ups. Leave it out if there are none.
  - **Verification:** the commands that were run and any manual checks.
  - **Screenshots:** only when the UI changed, with before and after where it applies.
- **Keep pull requests small.** A step that grows past about 300 changed lines is split in the roadmap first.

## Deliberately not used

Do not add any of these without discussing it first.

| Tool | Why it is not used |
| --- | --- |
| TanStack Query | All data arrives in real time through `onSnapshot`. TanStack Query is built for request and response. |
| Zustand or Redux | There is no shared client state beyond auth and locale, which live in Context. |
| MSW | Firestore does not make plain REST calls, so tests run against the emulator instead. |
| React Hook Form | The only form is the two-field sign-in. Add it if a larger form, such as menu editing, is built. |
| react-i18next | There are two locales and about 60 strings. Typed dictionaries check keys and parameters at compile time without a library. |
| Husky | CI catches the same problems. |
