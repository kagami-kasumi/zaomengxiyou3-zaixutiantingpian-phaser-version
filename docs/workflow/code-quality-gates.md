# Code Quality Gates

This document records harness-level rules for AI agents that edit game code. It is not a game task board.

## Required Gates

- Source edits under `src/` must run `npm run test:systems` and `npm run build` before the task is marked complete.
- Workflow, task, domain, or harness document edits must run `npm run check:workflow`.
- Mixed code and workflow edits should run `npm run check:all`.
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

## Git Gates

- Keep the project in a Git repository before substantial AI edits.
- Before large edits, check `git status --short`.
- After verification, review `git diff --stat` and the focused diff before committing or pushing.
- Do not commit `node_modules/`, `dist/`, `.tmp/`, or local log files.
