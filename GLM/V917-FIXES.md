# Manthan Agent v9.17 — Fix Wave

**Live**: https://saksham6062.github.io/SahuAI-PRO-Lite/ (commit `v9.17: Fix Wave…`)
**Base**: v9.16 (Skill Wave). All six user-reported issues fixed and verified end-to-end.

---

## 1. One microphone (the original mic now does live dictation)

**Reported**: v9.16 added a SECOND mic button next to the tools button; the original mic still used the old record-and-upload-to-Whisper flow.

**Fix (v9.17)**:
- The extra `v916MicBtn` is completely removed (builder, mount logic, MutationObserver, `micToggle`).
- The ORIGINAL chatbar mic (the dynamic action button) now runs **live dictation** via the Web Speech API:
  - interim text streams into the input WHILE you speak,
  - speech APPENDS to a half-written message (never replaces),
  - the button pulses red with a `rec` badge while listening,
  - tapping it again stops dictation and keeps the text (then tap send).
- `startVoiceInput` (and the legacy `fallbackBrowserSTT` path) are rewired to the same live engine.
- Data directives that need feedback (WEATHER, STOCK, SQL…) still run in the agent loop only.

## 2. "Artifacts" renamed to "Task" mode

- Tools-menu button now reads **Task** (icon: list-check).
- Mode chip, input tags, file prefixes and mode labels all say Task.
- Internal mode value stays `artifacts` — zero state-migration risk; old sessions keep working.

## 3. Image generation now works in standard chat

**Root cause found**: since v8.0, the `IMG:` directive (and IMGSEARCH/GIF/SPEAK) was only *taught* to the model and only *executed* inside the web-search agent loop. In plain standard / Task / Image-Studio chat the model never knew the directive — so it answered with a **text description** of the image instead of generating it.

**Fix (v9.17)**:
- New `_sahuV80StandardExtras()` (the hook `buildV64StandardHint()` always expected but never had) teaches the model the **IMG / IMGSEARCH / gifplan / SPEAK** directives plus the **chart (echarts/mermaid/infographic), pptd deck and pagedpdf** fences in EVERY mode.
- New `_sahuV80RunStandardDirectives()` executes the fire-and-forget directives directly on finished standard replies and injects their cards (image card, carousel, GIF, speech) into the answer bubble.
- The IMG line now also says explicitly: *never reply with only a text description of the image*.
- Data-fetching directives (WEATHER/STOCK/SQL/READ_FILE…) are deliberately not auto-run in standard chat — they need the agent loop (turn Web Search on) to feed results back.

**Verified E2E**: a standard-mode send whose reply contains `IMG: [seed=77] …` renders a real image card; a live Pollinations render (512×512) was confirmed displayed with Download/Regenerate buttons.

## 4. Skills cannot be disabled (and the re-enable bug is gone)

**Root cause found**: `saveState()` never persisted `enabledSkills` (nor the migration flags), so every reload reset the toggles — combined with the per-row toggle rebuild this produced the "disabled skill will not re-enable" state.

**Fix (v9.17)**:
- Settings → Skills now shows a green **🔒 Always on** badge on every skill — no toggles at all.
- `toggleSkill()` is a safe no-op.
- Every boot force-enables ALL skills (38 core + 27 library + any custom skills) and repairs any previously-disabled set.
- User-created custom skills keep their Delete button; core + library skills are permanent.

## 5. Effort / reasoning works again

**Root cause found**: `updateMode()` silently overrode `state.thinkingBudget` on EVERY mode switch AND on every app load (`init()` calls it), discarding the user's pill choice without even re-syncing the pills.

**Fix (v9.17)**:
- An explicitly chosen budget sets `state.budgetUserSet = true` (persisted).
- With a user pick, mode switches and reloads NEVER override it; without one, the old smart defaults still apply.
- The budget pills re-sync on load and after every mode change.
- Provider mappings unchanged (GLM `enable_thinking`, GPT-OSS `reasoning_effort`, OpenRouter `reasoning`, Z.ai `thinking`).

## 6. Version

9.16 → **9.17** everywhere (title, meta, sidebar, APP_VERSION, boot logs, toasts — including two stale `v9.15` strings that had been missed).

---

## Verification record

- `node --check` on all 10 inline script blocks: PASS.
- Browser harness (`test.html`): **13/13 PASS, 0 console errors** — one-mic boot, mic wiring, click-stop behavior, button states (pulsing stop-mic / mic / arrow), live dictation engine (real SpeechRecognition instance driven through a patched prototype `start()`), Task rename (menu + chip + internal value), skills always-on (65 badges, 0 toggles, no-op toggleSkill, repair logic), standard-mode prompt (IMG/IMGSEARCH/SPEAK/gifplan/charts/pptd/pagedpdf all taught), image card from a directive (seed + provider URL), transparent flag end-to-end, effort lock (pick survives `updateMode('research'/'task')`, pills synced, persisted, defaults still work without a pick).
- E2E standard-mode send with stubbed model replying `IMG: …`: image card rendered in the answer bubble, messages saved.
- Live Pollinations render: **IMAGE LOADED 512×512** in the card, with Download PNG + Regenerate buttons.
- VLM screenshot QA: image card (green square + buttons) PASS; skills panel (green Always-on lock badges, no toggles) PASS; tools menu (Task present, Artifacts absent) PASS.
- Push verified: commit in history, `raw.githubusercontent.com` byte-identical to the local build (md5 `d8c4a3120ba112e7bcf3a0f3687b6829`).

**Rollback**: `git revert` the v9.17 commit (v9.16 preserved in history).
