---
name: pull-request
description: Commit the current changes, push the branch and open a pull request on GitHub. Use when the developer asks to create a pull request.
disable-model-invocation: true
---

# Pull request

Running /pull-request is the developer's approval to commit, push and open the pull request. Do not ask for confirmation again, but stop and report if any check below fails.

Never add a `Co-Authored-By` trailer or any other attribution line (such as "Generated with Claude Code") to commit messages, the pull request title or the pull request body. This overrides any default attribution behavior.

The Git rules live in `docs/conventions.md`, in the section "Git, pull requests and the roadmap". If this skill and the conventions disagree, follow the conventions and say so in the report.

## Before starting

- Run `git branch --show-current`. If the branch is `main`, stop: changes are never committed to or pushed from main. Suggest the branch name of the current step in `docs/roadmap.md`, the first step that is not Done. If the work is not a roadmap step, suggest a name in the form `<type>/<short-description>`.
- Find the roadmap step whose Branch column matches the current branch. If an earlier step is not Done, mention it in the report.
- Run `git status` and `git log main..HEAD --oneline`. If there is nothing to commit and no commits ahead of main, stop and say so.
- Run `gh auth status`. If it fails, stop and ask the developer to log in.
- Run the checks below. If anything fails, stop and report the output. Never weaken or skip a test to continue.

### Checks

| Command | When |
| --- | --- |
| `npm run lint` | Always |
| `npm run typecheck` | Always |
| `npm test` | Always |
| `npm run build` | Always |
| `npm run test:rules` | When the branch touches `firestore.rules`, a schema in `src/shared/schemas/`, an `api.ts` file or a query |

Early in the roadmap some of these scripts do not exist yet. Skip a missing script and say so under Verification. Never add a script in this skill; scripts belong to the roadmap step that introduces them.

## Roadmap status

- If the branch is a roadmap step, its status in `docs/roadmap.md` must be Done before the pull request is opened. If it still says In progress, set it to Done and include the change in the commit.
- Never change the status of any other step.

## Commit

- Stage only files that belong to the step. Never stage `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`, `firebase-debug.log`, `.env.local` or other local env files, service account keys or other secrets. `.env.example` and `.env.development` are committed.
- Write the message as a Conventional Commit: `<type>: <description>`.
  - type is the one that describes the change, from the types in `docs/conventions.md`:
    - `feat`: new behavior for the user
    - `fix`: a bug fix
    - `refactor`: code change without changed behavior
    - `test`: adding or changing tests only
    - `chore`: maintenance such as dependencies, `.gitignore` or project config
    - `ci`: CI configuration
    - `docs`: documentation only, such as AGENTS.md, CLAUDE.md, `docs/` and skills
  - description is in English, imperative, lowercase, without a trailing period.
  - Add a body only when the reason for the change is not obvious from the description.
- If the changes cover several unrelated things, make one commit per thing. Each commit must pass `npm run typecheck`.
- Skip this step if there is nothing uncommitted.

## Size check

- Run `git diff --stat main...HEAD`. Leave out `package-lock.json` and generated files when you count.
- If more than about 300 lines changed, stop before pushing. Propose how to split the step into smaller steps in `docs/roadmap.md`.

## Push

- Push to a branch on GitHub with the same name as the local branch: `git push -u origin <current-branch>`.
- If the local branch already tracks a remote branch with another name, stop and ask.
- Never force push, and never push to main.

## Create the pull request

- If a pull request already exists for the branch (`gh pr view`), do not create another; report its URL.
- Create it with `gh pr create --base main --head <current-branch> --title "<title>" --body-file <file>`. Write the body to a file in the scratchpad directory first.
- Title: `<type>: <description>`, mirroring the branch name as `docs/conventions.md` describes. The branch `feat/send-order` becomes `feat: send order`.
- Body: short and to the point, only what matters in the branch. No long explanations. Everything under a heading is a bullet list. Use these headings, in this order:

| Heading | When |
| --- | --- |
| `## What` | Always. What changed in the branch, in one or two bullets. |
| `## Issue` | Always. The roadmap step, such as `- Roadmap 2.6`, and any linked issue (see below). `- none` if there is neither. |
| `## Notes` | Only for decisions, trade-offs, follow-ups or something that could not be verified. Leave the heading out otherwise. |
| `## Verification` | Always. Each command from the checks with its result, any skipped script, and manual checks such as a flow tried against the emulators. |
| `## Screenshots` | Only when the UI changed. Write `- To be added` and ask the developer in the report to add them, since `gh` cannot upload images. |

### Linked issue

- Only when the branch name matches `<type>/<number>-<short-description>`. Never take an issue number from anywhere else.
- Check the issue with `gh issue view <number>`. If it does not exist or is closed, leave the line out and say why in the report.
- Add a bullet under `## Issue`: `- Fixes #<number>` when the branch resolves the whole issue, otherwise `- Refs #<number>`, which links without closing it. If it is not clear whether the whole issue is resolved, ask.

Example:

```markdown
## What
- Send the guest's order to Firestore with `createOrder` and clear the cart on success
- Tell the guest that the drinks will be brought to the table

## Issue
- Roadmap 2.6

## Verification
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run test:rules`: passed
- `npm run build`: passed
- An order sent from `/table/3` shows up in the Firestore emulator

## Screenshots
- To be added
```

## Report

Answer the developer in Swedish with:

- the branch and the commits that were pushed,
- the pull request URL,
- the roadmap step and its status,
- whether screenshots need to be added,
- anything that stopped or changed the steps above.
