# Plan: agent-friendly, no behavior change

## Goal

Make the repo agent-readable. Keep every function and all UI/UX exactly as they are.

## This cut

- Add `AGENTS.md` with the four project rules.
- Keep the plan in this repo (`docs/`), not only Notion.
- Do not change components, RSS ingest, or visual output.

## Out of scope (later)

`series.ts`, chips, `displayTitle`, excerpt cards. Architect’s Episode contract is parked, not cancelled.

## Done when

`AGENTS.md` is on `main`. `npm test` still passes. Homepage and episode page look unchanged.
