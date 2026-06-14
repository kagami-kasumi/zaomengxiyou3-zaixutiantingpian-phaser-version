# Code Quality Gates

This document records harness-level rules for AI agents that edit game code. It is not a game task board.

## Required Gates

- Source edits under `src/` must run `npm run test:systems` and `npm run build` before the task is marked complete.
- Workflow, task, domain, or harness document edits must run `npm run check:workflow`.
- Mixed code and workflow edits should run `npm run check:all`.
- Before adding new logic to any file, run `npm run check:structure`. If the target file appears in errors, splitting is mandatory before adding logic. If the target file appears only in warnings, split it first for feature work; for a small local fix, document the reason and keep the edit narrow. Warnings in unrelated files do not block the current task.
- Visual testing is useful, but it is not enough for completion. A visual pass must be paired with a deterministic command whenever the changed behavior can be represented as a system invariant.
- Do not start `npm run dev` by default. The user owns local visual inspection.

## System Test Triggers

Add or update `tools/system-tests.ts` when a change touches any of these areas:

- hit de-duplication, damage events, target identity, or projectile hit cadence;
- monster spawning, level gates, stop points, boss triggers, or clear conditions;
- player input mapping, skill slots, skill binding, MP gates, or combo state;
- state machines where an empty frame, multiple entities, or repeated key press can alter the result.

## Architecture Gates

- Every damageable or interactable runtime entity must have a stable ID. Array index, display object identity, and localized label text are not valid IDs.
- `src/scenes/` may create Phaser objects and schedule systems, but complex combat, level, skill, inventory, save, or AI rules belong in `src/systems/`.
- If a scene method begins to coordinate more than one domain rule, extract a system function before adding the next feature on top of it.
- Avoid marking a vertical slice complete when the only verification is screenshot or manual play.

## Structural Gates

Enforced by `npm run check:structure` (`tools/check-structure.mjs`). Agents must consult this check before adding logic to an existing file.

### File size limits

| Location | Warn at | Error at | Rule |
|---|---|---|---|
| `src/systems/*.ts` | 800 lines | 1,500 lines | Split before adding features. Error = must split first. |
| `src/scenes/*.ts` | 600 lines | 1,200 lines | Split before adding features. Error = must split first. |
| `src/scenes/test-scene/*Bridge.ts` | 800 lines | 1,200 lines | Transitional scene bridges get a higher warning threshold, but must not absorb domain rules. |
| `tools/*.ts` | 6,000 lines | 10,000 lines | Test files are more tolerant but still subject to splitting. |

### Code duplication

- When three or more code blocks within a single file share the same structural fingerprint, the check flags them.
- A "structural fingerprint" normalizes identifiers, string literals, and numeric constants — identical logic with different variable names still counts.
- Resolution: extract a shared helper function or parameterize the repeated pattern.

### Scene import coupling

- A scene importing more than 10 system files triggers a warning (God-object risk).
- A scene importing more than 15 system files is an error (must extract orchestration or view factories).

### Scene boundary documentation

- Any scene file over 300 lines must document what it does NOT own in a top-of-file comment.

### How to resolve structural warnings

1. Run `npm run check:structure` before starting a task.
2. If the file you plan to edit has an error, split it first — extract one responsibility cluster into a new file under `src/systems/` or `src/scenes/test-scene/`.
3. If the file has only a warning, prefer splitting before feature work. For typo fixes, comments, or narrow bug fixes, keep the edit local and mention why no split was needed.
4. Keep `npm run build` green throughout the split.
5. Re-run `npm run check:structure` to confirm errors are cleared and warnings are understood.

## Git Gates

- Keep the project in a Git repository before substantial AI edits.
- Before large edits, check `git status --short`.
- After verification, review `git diff --stat` and the focused diff before committing or pushing.
- Do not commit `node_modules/`, `dist/`, `.tmp/`, or local log files.
