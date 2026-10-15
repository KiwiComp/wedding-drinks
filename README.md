# Wedding Drinks
 
Order from the table, served at the table. Wedding guests order drinks from their phones, the bar sees every order in real time, and staff carry the drinks out, so nobody has to leave their seat during the speeches.
 
> **Status:** being rebuilt step by step. Progress is tracked in [docs/roadmap.md](docs/roadmap.md).
 
## Background
 
The first version was built in one week for a wedding in the summer of 2026. Each table had its own QR code, guests ordered from their phones, and staff brought the drinks to the tables. It did its job, but it was built fast: no sign-in, open database rules and no tests.
 
This repo rebuilds the app around the same idea, on a proper foundation: TypeScript, real-time data validated with Zod, security rules with tests, and a UI in English and Swedish.
 
## How it works
 
- **Guest view** (`/table/:tableId`): a mobile page reached through the table's QR code. Guests browse the menu, send an order and follow its status. They are signed in anonymously in the background.
- **Bar view** (`/bar`): a tablet page for staff. It shows active orders by table, oldest first, and lets staff move each order forward and mark drinks as sold out.
```mermaid
sequenceDiagram
  participant G as Guest (phone)
  participant F as Firestore
  participant B as Bar (tablet)
  G->>F: Order for table 3
  F-->>B: New order, in real time
  B->>F: Status: being prepared
  F-->>G: Being prepared
  Note over F,B: Staff carry the drinks to table 3
  B->>F: Status: served
  F-->>G: Served
```
 
## Tech stack
 
| Area | Choice |
| --- | --- |
| App | React 19 with React Compiler, TypeScript, Vite, React Router |
| Backend | Firebase: Firestore, Auth, Hosting and the Emulator Suite |
| Data | Real-time subscriptions with `onSnapshot`, validated with Zod |
| UI | Tailwind CSS and shadcn/ui, English and Swedish |
| Tests | Vitest, React Testing Library, Firestore rules tests and Playwright |
| CI | GitHub Actions |
 
## Getting started
 
You need Node.js 22 or later, and Java 21 or later for the Firebase emulators. No Firebase account is needed: `.env.development` points the app at the emulators with a demo project.
 
```bash
git clone https://github.com/KiwiComp/wedding-drinks.git
cd wedding-drinks
npm install
npm run emulators   # terminal 1: Firestore and Auth emulators
npm run seed        # terminal 2: the menu, 8 tables and a staff account
npm run dev
```
 
Then open `http://localhost:5173/table/3` as a guest and `http://localhost:5173/bar` as staff. The seeded staff account is `bar@demo.test` with the password `demo-bar-1234`.
 
These commands arrive with the first two phases of the roadmap. All scripts are listed in [AGENTS.md](AGENTS.md).
 
## Project documents
 
| Document | Content |
| --- | --- |
| [AGENTS.md](AGENTS.md) | The project, its commands, structure and data model |
| [docs/conventions.md](docs/conventions.md) | The rules for code, data, security, strings, tests and Git |
| [docs/data-model.md](docs/data-model.md) | The Firestore data, the Firebase layer, the security rules and the seed data |
| [docs/strings.md](docs/strings.md) | Every UI string in English and Swedish |
| [docs/roadmap.md](docs/roadmap.md) | The steps to build the app, one pull request each |
| [CLAUDE.md](CLAUDE.md) | How Claude Code works in this repo |
 
## Working with an AI agent
 
I build this project with Claude Code as a pair programmer. The agent follows the rules in AGENTS.md and `docs/conventions.md`, and works through the roadmap one step at a time. It proposes a plan for each step before writing any code, and I review and approve every plan and every pull request.
 
## License
 
[MIT](LICENSE)
 
Claude finished the response
