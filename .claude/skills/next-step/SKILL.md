---
name: next-step
description: Find the next step in docs/roadmap.md, create its branch and propose a plan for it. Use when the developer asks to start the next step.
disable-model-invocation: true
---

# Next step

Running /next-step means: find the step to work on and plan it. It is not approval to write code.

## Find the step

- Read AGENTS.md, `docs/conventions.md` and `docs/roadmap.md` with the Read tool. In the roadmap, also read the Decisions section, which can move content between steps, and Not planned yet, which must never be started.
- If a step is `In progress`, that is the step. Switch to its branch (`git checkout <branch>`) and continue it instead of starting a new one. Run `git status` and `git log main..HEAD --oneline` to see what is already done.
- Otherwise the step is the first one that is `Not started`. If every step is `Done`, say so and stop.

## Check before starting a new step

Stop and report if any of these fail:

- The step before it is `Done`.
- The working tree is clean (`git status`).
- `main` is up to date: `git checkout main` and `git pull --ff-only`.
- No pull request is open for an earlier step (`gh pr list --state open`). An open one means the earlier step is not merged yet.

Then create the branch named in the roadmap table from `main`: `git checkout -b <branch>`.

## Plan

- Read the sections of `docs/conventions.md` that the step's content requires, with the Read tool:
  - Always: "Code style", "Testing" and "Git, pull requests and the roadmap".
  - A step that touches Firestore or rules: also "Data access" and "Auth and security", and `docs/data-model.md`.
  - A step with UI: also "State", "UI", "Strings and languages" and "Accessibility", and `docs/strings.md`.
- Read the existing code the step builds on.
- Enter plan mode and propose a plan: which files are created or changed, in what order, which tests come with them, and which strings and rules the step adds. Point out anything in the step that the conventions do not answer, or where the conventions and the code disagree.
- If the plan looks larger than about 300 changed lines, or needs something from a later step, say so and propose how to split or move it. Never start work from a later step or from Not planned yet.
- Wait for the developer's approval. Never write code before the plan is approved.

## After approval

- Set the step's status to `In progress` in `docs/roadmap.md`, in the step's branch.
- After running a code generator such as `shadcn add`, check `git status` and the `package.json` diff, and review the generated imports, before continuing.
- Implement the plan. Verify with the checks from the definition of done in AGENTS.md: `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`, plus `npm run test:rules` when the step touches `firestore.rules`, a schema, an `api.ts` file or a query. Skip a script that does not exist yet in the roadmap, and say so.
- When the step is complete and verified, set its status to `Done` in the same branch.
- Do not commit. Finish with a short summary: what changed, each check with its result, and anything that could not be verified. Remind the developer that /pull-request commits and opens the pull request.
