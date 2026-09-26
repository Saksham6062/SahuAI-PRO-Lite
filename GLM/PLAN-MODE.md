# Plan Mode (v9.15) — MiniMax plan-mode port

**App:** Manthan Agent v9.15 · **Change:** Travel Planner → **Plan Mode** (renamed + refunctioned) · **Date:** 26 September 2026
**Source spec:** `MiniMax-Skills.pdf` (MAVIS Skill Atlas, Part 01.B — plan-mode), user-directed.

---

## 1. The MiniMax plan-mode skill (source spec)

> A **"talk before you build"** skill. Instead of executing immediately, Mavis enters plan mode: it surveys the request, surfaces the design decisions, raises hidden risks, and gets an aligned direction from the user — only then does it switch to execution mode and start making changes.

- **What it does:** identifies meaningful ambiguity, multiple valid approaches, or an explicit "let's discuss" request. Produces a structured plan: **scope, options, trade-offs, open questions, recommended path**. Pauses for confirmation before any tool with side effects runs.
- **When to use:** multiple valid approaches · architecture decisions that lock in cost · "let's discuss" / "before you start…" · refactors with non-obvious blast radius · cross-cutting changes (deps, schema, config).
- **When NOT to use:** bug fixes with an obvious cause · one-line edits · execution-stage clarity already there.
- **Note:** plan-mode is for design decisions, not codebase discovery.

## 2. What changed in the app (v9.14 → v9.15)

| Touchpoint | Before (Travel Planner, v7.0) | After (Plan Mode, v9.15) |
|---|---|---|
| Tools menu button | ✈️ `Travel Planner` (`fa-plane`, sky) | 🧭 `Plan Mode` (`fa-drafting-compass`, violet) |
| Mode selector option | `travel` — ✈️ Travel Plan | `plan` — 🧭 Plan Mode |
| Mode chip / labels | "Travel Plan" | "Plan Mode" (toast fixed to "Plan Mode Active") |
| System prompt | 8-section travel itinerary contract (Overview, Best Time, Day-by-Day, Budget, Food, Transport, Booking, Practical Tips) | MiniMax plan-mode contract (below) |
| Behavior | Immediately outputs a full itinerary | **Talks before building**: structured plan + `PLAN READY` gate, executes only after the user confirms ("go" / picks an option) |
| Pre-search grounding | live web search before answering | **kept** — read-only grounding; MiniMax pauses only for tools *with side effects*, and search is side-effect-free. Facts, versions and prices cited as [n] |
| Old sessions | — | automatic migration: saved `mode='travel'` states load as `plan` |
| Persona | "Travel Guide" style persona is a separate feature | **untouched** — still available under Choose style |

## 3. The v9.15 Plan Mode contract (system prompt)

1. **Understanding** — 2–4 sentences: what is being asked; assumptions stated (scale, stack, budget, timeline) when unspecified.
2. **Scope** — table `| In scope | Out of scope |` so "done" is unambiguous.
3. **Options** — 2–3 genuinely viable approaches; what each optimizes / costs (effort, complexity, lock-in); comparison table.
4. **Trade-offs & Risks** — what each option locks in + hidden risks the user did not mention (migration, security, cost cliffs, reversibility, blast radius).
5. **Open Questions** — only questions whose answers change the plan (max 5; skip if unambiguous).
6. **Recommended Path** — the pick, why, and a numbered execution outline with independently verifiable steps.

**GATE:** every planning turn ends with `PLAN READY - reply go to execute, or tell me what to change.` No actual code/document/content in the planning turn.
**EXECUTION:** after "go" / approval / option pick — deliver the approved path completely (no placeholders); deviations marked inline as `DEVIATION:` with a one-line reason.
**SKIP:** exactly one obvious approach and nothing to decide → "Plan not needed - answering directly", then a normal answer.

## 4. Verification results (local, headless browser)

- App loads v9.15, zero console errors; tools menu shows Plan Mode; activation sets `state.mode='plan'`, chatbar chip "Plan Mode", toast "Plan Mode Active".
- Migration: seeded `mode='travel'` state reloads as `plan`.
- End-to-end (stubbed model + search, real `sendMessage()`): pre-search fired, toast "Plan Mode: grounded with live search", model request's **system prompt contains the full PLAN MODE contract** (incl. GATE + MiniMax plan-mode attribution), both search results delivered into the model context, rendered answer shows the plan + `PLAN READY`, chat history saved, mode persists.
- All 8 inline script blocks pass `node --check`.

## 5. Where the code lives

Root `index.html` (v9.15): mode option (~line 3319), tools button (~3494), `updateMode` normalization + labels (~5901/5934), high-capacity branch (~9479), **the plan-mode system prompt (~9511)**, pre-search condition (~11062), routing branch (~11137), `loadState` migration (~5634). Screenshot: `verify-v915/plan-mode-e2e.png`.
