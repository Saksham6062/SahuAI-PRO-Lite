# v9.16 Skill Wave — 13 New Skills

**Repo:** `Saksham6062/SahuAI-PRO-Lite` · **App:** Manthan Agent **v9.16** · **Date:** 26 September 2026
**Source spec:** `GLM/ADDABLE-SKILLS.md` (user-selected: Engineering & Dev guidance #10, #13–18 + Tier B #2, #4, #5, #13, #14, #15)
**Result:** 53 → **65 skills** (38 core + 27 library), all backend-less, zero new servers, zero OAuth.

---

## Tier A — Engineering & Dev Guidance (7 library skills)

Seeded into Settings → Skills → Skill Library (toggleable, deletable). Each is a full Kimi-methodology directive set.

| Skill | What it does |
|---|---|
| **Code-to-Diagram** | Pasted code / file trees / imports → the RIGHT diagram (dependency graph, sequence, ER, flowchart) as a live Mermaid card + a guided walkthrough. Never invents nodes. |
| **Backend Builder** | tRPC + Drizzle + Hono discipline: schema + API design tables FIRST, then complete runnable project as FILE blocks (schema, routes, index, config, package.json, README) + honest "what can't run in a browser" notes. |
| **Webapp Builder** | React 18 + TS + Tailwind single-file apps with a fixed structure (types → helpers → hooks → leaf → page → App), design rules (no default blue, 4/8px rhythm, real states), everything wired, "local demo" labels for simulated parts. |
| **Vibecoding Swarm** | Large builds split across Agent Swarm workers (per-feature, shared logic, design system) with a pre-published contract; the model integrates the reports into ONE preview app + a self-review pass. |
| **Swarm Workspace** | Coordination rules for every swarm: task ownership boundaries, shared contracts, fill-in output templates, no handoff chains, explicit contradiction reconciliation, no re-work in later rounds. |
| **Skill Creator Swarm** | Skill factory: spec → parallel drafting + eval-writing + guardrail agents → the model fixes every eval miss → installs via MAKESKILL with the eval table included. |
| **Find Skills** | "What can you do / which skill for X?" answered from the app's REAL capability list with a need → skill → exact-trigger-line table; never invents capabilities. |

## Tier B — Runtime features (6)

### 1. SQL Sandbox (SQLite) — `sql.js` WASM, keyless
- `SQL[load=<attached file>]: tablename` — any attached **CSV / XLSX (first sheet) / JSON array** becomes a real table (RFC-4180 CSV parser, column types inferred INTEGER/REAL/TEXT, 20k-row cap).
- `SQL: <statement>` — real SQLite execution (SELECT/JOIN/GROUP BY/window functions, DDL/DML, `EXPLAIN QUERY PLAN`); sequential directives support load → query → refine chains.
- Results: styled table card (50-row preview, sticky header), row count + timing + affected-rows, **Download .db** and **Clear database** buttons; the model receives up to 100 real rows.
- The database persists for the whole session (window-side).

### 2. Deck Studio (PPTD) — the kimi-slides pipeline
- ` ```pptd ` fenced JSON deck spec: `{"title","theme","slides":[...]}` with slide types **title / section / bullets / two-col / stats / quote / table**, 5 themes (professional, editorial, dark, minimal, vibrant) and per-slide **speaker notes**.
- Renders a **styled slide-by-slide preview** (real 16:9 minis, theme-colored, footers + page numbers) and builds a **real .pptx** with pptxgenjs (accent bands, section dividers, stat slides, themed tables, fit-shrink text) — verified 106 KB deck.
- Full schema validation with model-fixable error cards; "Copy spec" button for iteration.

### 3. Paged PDF Studio — the Sarvam Paged.js engine
- ` ```pagedpdf ` fenced semantic HTML → **Paged.js A4 pagination** inside a sandboxed iframe: running header (from the first `h1`), `page / pages` footers, section-aware breaks, figure/table/pre styling, base print typography + optional custom `<style>`.
- **Layout QA gate**: every page is checked for overflow — the card reports "N pages · layout check passed" or names the offending pages.
- Buttons: **Save as PDF** (print dialog), **Open full size** (standalone tab), **Download HTML**. Verified end-to-end (2-page report, QA passed).

### 4. Live Voice Input — keyless, browser-native
- A dedicated **live mic button** next to the input (always available, not only when the box is empty).
- **Live transcription preview** while you speak (interim results), **append mode** (dictate into a half-written message instead of replacing it), pulsing rec indicator, per-error toasts (permission / no-speech / network).
- The legacy Whisper path is untouched; its browser fallback was upgraded to the same live + append engine.

### 5. Vision Input — broad detection + protocol
- New shared `_sahuIsVisionModel()` matcher: **Gemini (all), Claude (all), GLM-4.6V/4.6V-Flash/5V-Turbo, GPT-5.x/4o/4.1, o3, Kimi-K2/K2.5/K3, ERNIE-4.5-VL, Llama-4, Gemma-3N/4, Pixtral, DeepSeek-VL/OCR, Qwen-VL family…** (the old list missed most of these — and its case-sensitive `'vl'` never matched `ERNIE-4.5-VL`).
- **👁 badge** on every vision-capable model in the picker (verified: 16 badged).
- Attach-time toast: how many of your selected models can actually see the image (with switch suggestions when none can).
- **[VISION INPUT PROTOCOL]** injected for capable models: layout → read all text verbatim → extract data → answer → honesty about unreadable parts.

### 6. Transparent Image Generation — flag-parser fix
- The `IMG: [transparent] [w=] [h=] [model=] [seed=]` flags were documented but **never parsed** — `_sahuParseFlags` only knew `rate/pitch/lang/voice`, so size was always 1024² and `&transparent=true` never reached Pollinations. Now a generic `[key=value]` + bare `[transparent|nologo]` parser; verified: `IMG: [transparent] [w=768] [h=512] a cat logo` → 768×512 + `transparent=true`.

## Bonus fixes found during the build

1. **IMG "Download PNG" was a silent no-op** — the button called `sahuV80Dl`, which requires a registered blob, but image cards never registered one. Now the image is fetched once, cached as the blob, and the button works (verified live).
2. **Vision false-negatives** (see #5) — Claude/Gemini/GLM-4.6V users were told images "cannot be processed".

## Engineering notes

- Implementation: `scripts/v916/part1_core.js … part7_wiring.js` (7 parts) + `scripts/v916/patch_v916.py` (14 anchor patches, injection before the last `</body>`), reproducible from the pristine v9.15 source.
- All function integrations are **wraps, not edits** (`buildSearchLoopPrompt`, `_sahuV80Extract`, `_sahuV80Run`, `sahuV80EnhanceArtifacts`, `handleFileUpload`, `callModelWithFallback`, `renderModelSelector`, `fallbackBrowserSTT`, `sahuV80Dl`) — the original v8.0/v9.x behavior stays intact underneath.
- One-time migration `state._v916Skills` seeds the 7 library skills + enables the 5 core skills; user deletions of library skills are respected (only the 7 NEW ids are seeded).
- Local verification: 15/15 automated end-to-end tests passed in a real browser (boot, migration, flag parser, 23 vision model checks, prompt wiring, extractor, live SQLite create/insert/select/error, CSV→table GROUP BY, PPTD fence→card→PPTX, pagedpdf fence→2 pages + QA pass, mic gating, 16 badges, wrap safety, IMG download, zero console errors).
- Screenshots: `download/verify-v916/01-skills-panel.png`, `02-model-selector-vision-badges.png`, `03-deck-studio-card.png`.
