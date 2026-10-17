# CLAUDE.md

@AGENTS.md

@docs/conventions.md

AGENTS.md describes the project, `docs/conventions.md` holds the rules, and `docs/roadmap.md` lists the steps to build the app. This file adds how Claude Code works with me in this repo.

## Working agreement

- **Never create, edit, delete or move files unless I explicitly ask for the change in the current message.** Questions such as "what would X involve?" or "how does Y work?" are read-only. Answer them, propose a change if useful, and wait for an explicit instruction.
- **An instruction to change files covers that request only**, not later messages.
- **Read-only commands are fine**, such as `grep`, `cat`, `npm run lint`, `npm run typecheck` and `npm test`.
- **Work from `docs/roadmap.md`.** Unless I say otherwise, the task is the first step that is not Done. Never start the next step on your own.
- **Use plan mode for each roadmap step**, and for any other change across several files. Wait for my approval before editing.
- **Re-read the sections of `docs/conventions.md` that apply before editing.** Do not rely on what you remember from earlier sessions.
- **Propose changes to the plan instead of making them.** If a step turns out too big, or needs something from a later step, tell me. Once I agree, update the roadmap and record the change under Decisions.
- **Tell me instead of saving to memory.** If you would add something to auto memory that contradicts AGENTS.md or `docs/conventions.md`, tell me, so that the rule can be updated in the repo.

## Git

- **Never commit or push on your own.** Do it only when I explicitly ask. Permission to commit is not permission to push.
- **Never merge a pull request.** I review and merge every pull request myself.
- **Create the step's branch from an up-to-date `main` before the first edit**, with the name from `docs/roadmap.md`. Never commit to `main`.
- **Update the step's status in `docs/roadmap.md` as part of the step:** In progress when work on the step starts, and Done before the pull request is opened.
- **Follow the Git and pull request rules in `docs/conventions.md`.** They take precedence over your default Git behaviour.

## Verifying

- **Run `npm run lint`, `npm run typecheck` and `npm test` after every change**, and report the result.
- **Also run `npm run test:rules`** when the change touches `firestore.rules`, a schema, an `api.ts` file or a query.
- **Check the definition of done in AGENTS.md** before you say that a step is finished.
- **Never report a task as done while a check fails.** Say what failed and why.

## Communication with the developer

These guidelines apply to every response to the developer, without exception.

- **Always communicate with the developer in Swedish**, regardless of the language used in the developer's messages.
- **Write all project content in English**, including code, comments, documentation, commit messages and other project files.
- **Minimise cognitive load.** The developer experiences cognitive fatigue (brain fatigue). Always adapt your communication to it.
- **Use clear, simple and straightforward Swedish.**
- **Keep explanations short and structured.** Avoid unnecessary technical jargon and long paragraphs.
- **Explain technical concepts in plain language** when needed.
- **Prioritise clarity over brevity** when the two conflict.

## Communication

- **Be brief** in answers, explanations, summaries and commit messages. No preamble, and do not restate the question.
- **Lead with the answer or the recommendation.** Add reasoning only where it changes the decision.
- **Flag uncertain Swedish.** When you add a string, write your best Swedish version and mention it in the pull request notes if you are unsure of the wording.
