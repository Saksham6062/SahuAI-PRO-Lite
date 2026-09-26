# Skills Usable Without a Backend — Full Repository Audit

**Repo:** `Saksham6062/SahuAI-PRO-Lite` · **App:** Manthan Agent **v9.15** · **Audited:** 26 September 2026
**Question:** Across **all files available at GitHub**, which skills from every AI-assistant catalog can run **without a backend** in the Manthan app?

---

## 0. What "without a backend" means here

Manthan Agent is a single HTML file served from GitHub Pages. A skill is **backend-less** if it can run using only:

| Layer | Available to the app |
|---|---|
| Browser APIs | Web Speech (TTS/ASR), Notification, Canvas, Blob downloads, localStorage, File reader |
| WASM sandboxes via CDN | **Pyodide** (Python 3 + numpy/pandas/matplotlib), pdf-lib, SheetJS, pptxgenjs, mammoth, JSZip, gif.js, ECharts, mermaid, DOMPurify |
| Keyless CORS-open APIs | Open-Meteo (weather), Nominatim + Overpass (places), frankfurter.dev / open.er-api.com (FX), Pollinations (image gen), Openverse (image search), SearXNG public instances (23 search engines), Piped (YouTube) |
| User-keyed provider APIs | The app's 18+ provider / 57+ model system (browser calls the provider directly) |

**NOT backend-less:** server-side runtimes (on-demand pandas/Tushare, ffmpeg binary, pandoc, LibreOffice, tesseract OCR), OAuth flows that need a registered backend app, platform-locked surfaces (Meta Ads, DingTalk/Feishu/QQ), headless-browser automation, local CLI harnesses, and anything that must run while the tab is closed.

Verdict legend: ✅ usable without backend · 🟡 usable with real limits · ❌ not usable without a backend.

---

## 1. Every file audited (complete repo inventory)

| File(s) | What it is | Skills documented |
|---|---|---|
| `Indus:sarvam_skills.pdf` | Sarvam AI skills reference | 6 |
| `ChatGPT_Skills.pdf` | ChatGPT environment inventory | 13 families (~50 skills) |
| `Grok_skills.pdf` | Grok sandbox catalog | 9 |
| `GLM-Skills.pdf` = `AI_Assistant_Capabilities_Overview.pdf` = `GLM-Skills.html` (3 copies of one Z.ai handbook) | GLM capability areas | 10 areas |
| `Mimo_skills.pdf` = `skills-catalog.pdf` | Mimo / OpenClaw environment catalog | 110 (64 active) |
| `Mimo_skills_soul.md` = `SOUL.md`, `Mimo-agentsskill.md` = `AGENTS.md` | Mimo persona + agent guide | persona (not skills) |
| `MiniMax-Skills.pdf` | MiniMax (MAVIS) Skill Atlas | 17 |
| `skills_full.pdf` | Kimi complete SKILL.md collection | 271 |
| `deep-research-report.md` | GPT deep-research methodology | 1 (research QC) |
| `Claude_skills.pdf` = `available_skills.pdf` | Claude available-skills reference | 11 |
| `GeminiSkills.md` | Gemini capability matrix | capabilities (not a skill list) |
| `Unified_Skill_Report_Full.pdf` | Master compilation: all of the above (784 pp, 13 assistants) | everything |
| `Manthan_NoBackend_Skill_Pack.pdf/.md` | The no-backend pack spec (implemented as v8.0.0) | 23 core + 20 library |
| `Manthanskill.md` | Manthan's own skills reference (v7.9.12) | 11 |
| `Manthan_Skill_Gap_Analysis.md` | Gap analysis vs the unified report (v7.9.12 baseline) | analysis |
| `Manthan_Skill_Expansion_Plan.pdf` | Sprint plan (16 quick-wins + 12 heavier) | plan |
| `Manthan_Skills_Assessment.pdf` | Add/don't-add assessment (7 + 3) | analysis |
| `Manthan_Agent_Feature_Suggestions.pdf` | 8 original feature designs | designs |
| `paste-1.md`, `paste-2.md` | Source docs embedded in the unified report | — |
| `GLMBUG.md`, `GPTBUG.md/.pdf`, `GemBug.md`, `GrokBug.pdf`, `IndusBug.md`, `SonnetBug.md`, `Unified_Bug_Report.md/.pdf`, `KimiBug.pages`, `Qwen bug.pages`, `DSHBUG.pages`, `MetaBUG.PNG` | Bug reports across assistants — **not skill sources**; useful as a QA "do-not-break" checklist | — |
| `Beta/` | v8.0.0 skill-pack build + SKILLS.md + no-backend spec + proxy worker | shipped |
| `index.html` (root) | **The app itself — v9.15** | 11 base + 43 pack skills |

Duplicate files identified by checksum: 5 pairs are byte-identical copies (listed with `=` above), so **~20 unique skill sources** cover the whole repo.

---

## 2. Verdict map — assistant by assistant

### 2.1 Sarvam AI — `Indus:sarvam_skills.pdf` (6 skills)

| Skill | Verdict | How it runs backend-less in Manthan |
|---|---|---|
| sarvam-doc-coauthoring | ✅ | Pure prompt workflow (clarify → plan → write). Ports as a library skill; overlaps the new **Plan Mode** |
| sarvam-docx | ✅ | `FILE[docx]` creation + mammoth reading. No tracked-changes editing (🟡 sub-feature) |
| sarvam-pdf | ✅ | `FILE[pdf]` creation + **PDFEDIT** (merge/split/rotate/watermark/metadata via pdf-lib). OCR part ❌ |
| sarvam-html-skill | ✅ | **PREVIEW** live preview + single-file HTML artifacts |
| sarvam-xlsx | ✅ | SheetJS read (file-reader) + `FILE[xlsx]` write, multi-sheet |
| sarvam-slides | ✅ | pptxgenjs `FILE[pptx]` + HTML decks via PREVIEW |

**Result: 6/6 usable** (with two partial sub-features).

### 2.2 ChatGPT — `ChatGPT_Skills.pdf` (13 families)

| Family | Verdict | Notes |
|---|---|---|
| Web & internet research | ✅ | 23 engines, READ/FETCH/BROWSE. Link-click navigation 🟡 (no headless browser) |
| Images search | ✅ | Openverse image search (v8.0) |
| Local businesses / places | ✅ | Nominatim + Overpass **places** skill |
| Restaurant reservations | ❌ | Needs booking-platform APIs |
| Products / shopping compare | 🟡 | General search only, no structured shopping feed |
| Files & documents | ✅ | File-reader pool + `READ_FILE` / `FIND_IN_FILES`; no cloud Library ❌ |
| Python & computation | ✅ | Pyodide `runpython` (numpy/pandas/matplotlib auto-load) |
| File generation | ✅ | `FILE` blocks: pdf, docx, xlsx, pptx, csv, json, md, txt, zip |
| Container / shell / filesystem | ❌ | No server runtime |
| GitHub integration | 🟡 | REST API works from browser with a user PAT — **not yet built** (top addable item) |
| Image generation & editing | ✅ | `IMG:` via Pollinations (regeneration-based editing, seed control) |
| Widgets (weather, currency, units, time) | ✅ | WEATHER, CONVERT (FX + units + TZ), DATE skills |
| Sports widgets | ❌/🟡 | No keyless stable free source; would need a key |
| Connected apps & plugins | ❌ | OAuth + registered apps |
| OpenAI Platform support | ❌ | N/A for Manthan |
| Automations & reminders | 🟡 | **reminders** skill: Notification API, while-open only; scheduled searches / conditional triggers ❌ |
| Personal context & memory | ✅ | **memory** skill (profile + panel + export/import) + chat history |
| Writing, editing, translation | ✅ | Chat + translate + humanize skills |
| Safety / parental controls | ❌ | Platform-level |
| Entities, citations, video | 🟡 | Inline [n] citations ✅; entity chips / video players ❌; YouTube transcripts ✅ (Piped) |

**Result: ~28 ✅ / ~8 🟡 / ~10 ❌** per individual skill.

### 2.3 Grok — `Grok_skills.pdf` (9 skills)

| Skill | Verdict | Notes |
|---|---|---|
| docx | ✅ | FILE[docx] + mammoth |
| ffmpeg | 🟡 | Full ffmpeg ❌; **GIF maker** ✅ (gif.js). ffmpeg.wasm (~25–30 MB lazy CDN) is a possible Tier-C add |
| pdf | ✅ | PDFEDIT + creation; OCR ❌ |
| pptx | ✅ | pptxgenjs |
| xlsx | ✅ | SheetJS |
| skill-creator | ✅ | MAKESKILL |
| coding-agents-harness | ❌ | Local CLIs (Codex/Claude Code) |
| live-preview | ✅ | PREVIEW (sandboxed, console, phone/desktop) |
| nvidia-llm | ✅ | NVIDIA provider already built in (with fallback key) |

**Result: 7 ✅ / 1 🟡 / 1 ❌.**

### 2.4 GLM (Z.ai) — `GLM-Skills.pdf` (10 capability areas)

| Area | Verdict | Manthan equivalent |
|---|---|---|
| Documents & reports | ✅ | FILE docx/pdf |
| Spreadsheets & data | ✅ | FILE xlsx + SheetJS |
| Presentations | ✅ | FILE pptx |
| Charts, diagrams & visualizations | ✅ | **chart-studio** (mermaid, ECharts, infographics, PNG export) |
| Data processing & analysis | ✅ | Pyodide + audit[dataset] |
| Interactive web applications | ✅ | PREVIEW + task/appdev modes |
| AI media — images / voice / transcripts | ✅ | IMG: / speak (TTS) / summarize (YouTube via Piped) |
| AI media — video analysis | ❌ | Needs server-side vision models |
| Research & information retrieval | ✅ | 3-tier Deep Research (MiniMax/Kimi/GPT engines) |
| File & document processing | ✅ | file-reader + PDFEDIT |

**Result: 9 ✅ / 1 ❌.**

### 2.5 Mimo (Xiaomi, OpenClaw) — `Mimo_skills.pdf` + `SOUL.md` + `AGENTS.md` (110 skills, 64 active)

| Cluster (active skills) | Verdict | Notes |
|---|---|---|
| Design craft suite — adapt, animate, arrange, audit, bolder, clarify, colorize, critique, delight, distill, extract, frontend-design, harden, normalize, onboard, optimize, overdrive, polish, quieter, teach-impeccable, typeset (21) | ✅ | **All prompt-only** — they guide design output; port directly as library skills over PREVIEW/task mode |
| Office — Word/DOCX, Excel/XLSX, Powerpoint/PPTX, pdf (4) | ✅ | Same as Grok verdicts |
| Media — mimo-tts-wav (1) | ✅ | speak skill (Web Speech) |
| Media — mimo-omni (image/video/audio analysis), mimo-tts-voice-clone, mimo-tts-voice-design (3) | ❌ | Server-side Xiaomi models |
| Writing — humanizer (1) | ✅ | humanize skill (shipped) |
| Data — Data Analysis methodology (1) | ✅ | Prompt skill + Pyodide for execution |
| Data — akshare (Chinese finance), healthcheck (JSON file + Node) (2) | ❌ | Server Python runtime / Node CLI |
| Agents & tools — agent-browser, github, code-generator, skill-creator, skill-vetter, clawhub-cli, find-skills, skillhub-preference, self-improvement (9) | 🟡 | skill-creator ✅ (MAKESKILL), self-improvement ✅ (NOTED log), code-generator ✅ (chat/task). github 🟡 (PAT REST — addable). agent-browser ❌ (no headless browser), clawhub/find-skills/skillhub ❌ (CLI installs) |
| Plugin skills — dingtalk×3, feishu×4, qqbot×3 (10) | ❌ | Platform connectors, registered apps |
| Built-ins — canvas, diagram-maker, meme-maker, weather, spike, taskflow, notion, video-frames, node-*, python-debugpy… (57 total; many inactive) | 🟡 | diagram-maker ✅ (chart-studio), weather ✅, meme-maker ✅ (IMG: + templates as prompts). notion ❌ (OAuth + ntn CLI), node-debug ❌, video-frames ❌ (ffmpeg), taskflow 🟡 (swarm covers parallel work, not detached persistence) |

**Result (of the 64 active): ~30 ✅ / ~8 🟡 / ~26 ❌** (the ❌ bulk is the 10 platform plugins + CLI-bound tools).

### 2.6 MiniMax — `MiniMax-Skills.pdf` (MAVIS Skill Atlas, 17 skills)

| Skill | Verdict | Notes |
|---|---|---|
| deep-research | ✅ | **Implemented** — Research mode Normal tier (rigid 5-step pipeline + interleaved THINK) |
| plan-mode | ✅ | **Implemented in v9.15** — Travel Planner was renamed and refunctioned into Plan Mode |
| docx, pdf, pptx, xlsx, visual-page | ✅ | FILE formats + PREVIEW; visual-page = infographic/HTML pages (chart-studio + PREVIEW) |
| senior-fullstack-developer ×3 (engineering-workflow, frontend-dev, fullstack-dev) | ✅ | Prompt skills over task/appdev modes |
| mcode-tools-master | ✅ | Tool orchestration = the directive loop (SEARCH/READ/CALC/…) |
| team | ✅ | Agent Swarm (2–10 parallel workers) |
| skill-creator | ✅ | MAKESKILL |

**Result: 17/17 usable** (MiniMax's atlas is the most browser-compatible catalog — it is prompt-first by design).

### 2.7 Kimi — `skills_full.pdf` (271 skills)

| Cluster | Count (approx.) | Verdict |
|---|---|---|
| Office documents (docx/pdf/xlsx/pptx/slides variants, CN+EN) | ~25 | ✅ FILE formats |
| Research (deep-research, deep-research-v2, deep-research-swarm, cross-examine, deep-probe) | ~8 | ✅ Deep Research tiers (swarm ❌ — 150–250 searches infeasible, rejected) |
| Writing & marketing (copywriting, copy-editor, humanizer, brand-naming ×2, CV-tailor, stakeholder-comms, audience-adaptive-comms…) | ~30 | ✅ Prompt-only — port as library skills |
| Education (bloom-quiz-maker, exam generators, code-mentor, anki-card-maker) | ~15 | ✅ Prompt-only + FILE csv (Anki) |
| Charts & viz (chart-gen, data-viz-gen, chrono-flow, baoyu-infographic) | ~10 | ✅ chart-studio + Pyodide matplotlib |
| Academic (paper reviewer, cite-style-converter, latex families) | ~20 | ✅ Prompt-only |
| Code & agents (backend/frontend swarms, browser automation, code tools) | ~35 | 🟡 Prompt guidance ✅; the execution parts that need shells ❌ |
| Data & finance (Tushare, cn-finance-data, dataset tools, stat tests) | ~20 | 🟡 stat tests ✅ (Pyodide); Chinese finance data feeds ❌ |
| Media (edge-tts, image gen, video/Remotion, chart image generator) | ~15 | ✅ speak + IMG:; Remotion/video ❌ |
| Email / calendar / integrations | ~10 | ❌ OAuth |
| Chinese-specific workflows (platform ops, compliance checklists CN) | ~80 | ✅ mostly prompt-only |
| Everything else (product, ops, HR, legal templates) | ~53 | ✅ prompt-only |

**Result: ~200 ✅ (mostly prompt-only ports) / ~30 🟡 / ~40 ❌.** The v8.0 pack already ported 20 of the highest-value ones.

### 2.8 Claude — `Claude_skills.pdf` (11 skills)

| Skill | Verdict | Notes |
|---|---|---|
| docx, pdf, pptx, xlsx | ✅ | Category covered (richer sub-features 🟡) |
| file-reading | ✅ | file-reader pool (routing by type) |
| pdf-reading | ✅ | pdf.js extraction |
| frontend-design | ✅ | Prompt skill over task mode |
| import-memory | ✅ | memory skill has export/import (profile markdown) |
| morning | ✅ | **heartbeat** skill (BRIEF: daily briefs, while-open) |
| skill-creator | ✅ | MAKESKILL |
| product-self-knowledge | 🟡 | Could ship an app-knowledge doc as a built-in skill — trivial to add |

**Result: 10 ✅ / 1 🟡.**

### 2.9 Gemini — `GeminiSkills.md` (capability matrix, not a skill list)

All capabilities (polyglot coding, math, data, architecture, NLP, translation) run through chat + code interpreter + FILE/PREVIEW: **✅ usable as capabilities**; the DevOps/container parts ❌.

### 2.10 Meta AI (26 skills — from the gap analysis §7)

3 clean ✅ (health prompt-skill, deep-research-report → done, slides → covered) · 3 feasible 🟡 (transparent-background-image via Pollinations, gif-generation → done, local places → done) · 6 OAuth-only 🟡 (Gmail/Outlook, schedule, daily-brief while-open) · **14 ❌ (the whole Meta Ads suite is platform-locked)**.

### 2.11 Manthan's own — `Manthanskill.md` + v8.0 No-Backend Skill Pack + v9.x

All 11 base skills + 23 core + 20 library skills are **backend-less by design** — this is the app's architecture. The pack already covers: weather, convert (units/FX/TZ), speak, image-gen, GIF maker, image-search, places, stock quotes, file-reader pool, PDFEDIT, translate, humanize, summarize, audit[dataset], memory, self-improvement, reminders, heartbeat, chart-studio + 20 library prompt skills.

---

## 3. Consolidated verdict

| Source | Total skills | ✅ without backend | 🟡 partial | ❌ needs backend |
|---|---|---|---|---|
| Sarvam | 6 | 6 | (2 sub-features) | 0 |
| ChatGPT | ~46 | ~28 | ~8 | ~10 |
| Grok | 9 | 7 | 1 | 1 |
| GLM handbook | 10 areas | 9 | 0 | 1 |
| Mimo (active 64) | 64 | ~30 | ~8 | ~26 |
| MiniMax | 17 | 17 | 0 | 0 |
| Kimi | 271 | ~200 | ~30 | ~40 |
| Claude | 11 | 10 | 1 | 0 |
| Meta AI | 26 | 3 | 9 | 14 |
| **All sources (deduped)** | **~460 unique** | **~310** | **~57** | **~93** |

**Bottom line: roughly two-thirds of every skill documented across all 13 assistants in this repo can run without a backend** — because the dominant pattern in modern skill catalogs is the *prompt-only SKILL.md* (instructions with zero runtime), which ports into Manthan's library-skill system for free.

### The 4 hard blockers (everything ❌ falls into these)

1. **Server runtimes** — pandas-on-demand, Tushare/akshare feeds, ffmpeg, pandoc, LibreOffice, tesseract OCR, headless browsers, local CLIs.
2. **OAuth with registered apps** — Gmail, Outlook, Notion, Feishu, DingTalk, QQ, connected plugins.
3. **Platform-locked surfaces** — the 14-skill Meta Ads suite, post-coach, rival-watch.
4. **Background execution** — anything that must fire while the tab is closed (push reminders, scheduled searches, recurring deliveries); Manthan's Notification API only works while the app is open.

---

## 4. Top skills still addable without a backend (ranked)

1. **GitHub integration** (Mimo `github`, Grok harness) — browser + user PAT against `api.github.com` (CORS-enabled): repo/issue/PR queries, file commits. Highest-value remaining gap.
2. **Transparent-background image generation** (Meta) — a flag on the existing `IMG:` Pollinations skill.
3. **Sports data** (ChatGPT) — keyless/limited free tiers exist (TheSportsDB); needs fallback chains like the stock skill.
4. **ffmpeg.wasm media tools** (Grok) — trim/convert/extract-audio as a lazy-loaded ~28 MB advanced skill.
5. **Kimi library wave 2** — ~180 more prompt-only skills (cite-style-converter, academic reviewer, stakeholder-comms, compliance checklists…) are one-line ports into the library system.
6. **App self-knowledge skill** (Claude pattern) — bundle the app's own SKILLS.md as a built-in so the model knows its exact toolset.
7. **Meme maker** (Mimo built-in) — template search + IMG: generation.

---

*Audit compiled from all 40+ files in the repository (5 duplicate pairs identified by checksum). Sources: the 9 assistant catalogs + unified report + 4 Manthan planning docs + bug reports (reviewed, not skill sources). Companion document: `PLAN-MODE.md` (v9.15 implementation) and `TIER-DECISIONS.md` (research engines).*
