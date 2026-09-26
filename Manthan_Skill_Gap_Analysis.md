# Manthan Agent — Skill Gap Analysis
### Which skills from the Unified Skill Report (13 AI assistants) could be added to index_2.txt (Manthan Agent v7.9.12)

**Sources:** Unified_Skill_Report_Full.pdf (786 pages, 13 assistants: Sarvam, ChatGPT, Grok, GLM, Mimo, MiniMax, DeepSeek, hy, Claude, Gemini, Meta AI, Kimi, Manthan Agent) and the Manthan Agent source (index_2.txt, v7.9.12).

**Constraint that decides everything:** Manthan is a single-file browser PWA with a directive-based agentic loop (SEARCH / READ / FETCH / BROWSE / RUN CODE / FILE / PREVIEW / CALC / DATE / sahu_agents / MAKESKILL). A skill is "addable" only if it can run client-side (browser APIs, Pyodide, CDN libraries, free or user-keyed APIs) without a backend server. Skills below are grouped by fit.

---

## 1. What Manthan already has (do not re-add)

| Manthan skill | Already covered by equivalents in the report |
|---|---|
| Web Search (23 engines) | ChatGPT web search; hy hy_search; Meta browser.search; Kimi deep-research tooling |
| Web Scraping / Fetching / Browsing | hy hy_visit; Grok/others page reading |
| Code Interpreter (Pyodide + JS/npm) | ChatGPT Python; Meta container.python_execution; GLM data processing |
| File Creation (pdf, docx, xlsx, pptx, md, csv, json) | Grok/Claude/Mimo/Sarvam docx, pdf, pptx, xlsx skills (they are richer, but the category is covered — see §2 for upgrades) |
| Live Preview (html/react sandbox) | Grok live-preview; Mimo frontend-design; GLM interactive web apps |
| Skill Creator (MAKESKILL) | Grok/Claude/Mimo skill-creator |
| MCP Date, MCP Calculator | ChatGPT local-time widget, Meta datetime; calculators |
| Agent Swarm (2–10 parallel workers) | Kimi Agent Swarm; MiniMax team; Mimo sub-agents |
| Consensus mode / MP Board examiner | No direct equivalent in the report — unique to Manthan |

---

## 2. Tier A — High fit: pure client-side, drops into the existing directive architecture

These need no backend, no API key, and follow the same "directive line → app executes → result fed back" pattern.

1. **Chart / diagram / infographic generation** — from Kimi (`chart-gen`, `data-viz-gen`, `chrono-flow` interactive timelines, `baoyu-infographic` with 21 layouts), GLM (Charts, Diagrams & Visualizations) and MiniMax (`visual-page`). Implement as a `CHART:` directive: model emits JSON, app renders ECharts/Chart.js (CDN, like the existing pptxgenjs/jszip imports) as an inline rendered artifact. This is the single biggest visible gap — every other document-capable assistant in the report renders charts, Manthan only embeds matplotlib images via the code sandbox.

2. **Text-to-speech** — from Kimi (`edge-tts`) and Mimo (`mimo-tts-wav`). The browser's Web Speech API (speechSynthesis) gives this free, offline, no key. A `SPEAK:` directive or a speaker button on any answer.

3. **Unit / currency conversion widgets** — from ChatGPT. Unit conversion is fully static (same place as the CALC evaluator). Currency needs one fetch to a free keyless API (e.g. open.er-api.com) — the app already fetches from public instances for SearXNG, so this fits the existing pattern.

4. **Weather widget** — from ChatGPT. Open-Meteo is free, keyless and CORS-enabled; pair with the geocoding API it ships. `WEATHER: <city>` directive.

5. **Persistent memory / user profile** — from ChatGPT (memory, personal context), Meta (p13n get_user_context), Claude (import-memory), Mimo (self-improvement logging). Manthan already persists custom skills in localStorage — the same store can hold a `USER_PROFILE` the model reads/updates via a directive (e.g. `MEMORY:` block), injected into every conversation. Claude's import-memory idea (import a memory export from another assistant) is a nice differentiator.

6. **File upload + reading / semantic search over attachments** — from ChatGPT (file search, read file content), Claude (file-reading router), Meta (file_search). A file-upload button + Pyodide (pandas, pypdf) to parse docx/xlsx/csv/pdf, with results fed back into the conversation. Complements File Creation, which is output-only today.

7. **Built-in prompt-only skill library** — the largest free win. Kimi's 271-skill collection and Mimo's design suite are mostly pure-instruction SKILL.md files with zero runtime. Dozens port directly as built-in custom skills in the existing MAKESKILL format with a toggle in Settings > Skills, e.g.:
   - Writing: `copywriting` / `copy-editor` (7-pass editing), `humanizer` (remove AI-writing patterns), `brand-naming-lab`, `cv-tailor`, `academic-paper-reviewer`, `cite-style-converter` (APA/MLA/IEEE/Harvard)
   - Education: `bloom-quiz-maker` / mock-exam generation (pairs naturally with the MP Board examiner), `code-mentor` (interactive tutoring)
   - Planning: MiniMax `plan-mode` ("talk before you build"), Kimi `cross-examine` / `deep-probe` (interrogate the user's plan)
   - Design (Mimo): `critique`, `typeset`, `arrange`, `polish`, `harden`, `delight`, `onboard` — these work as prompt guidance for the existing Live Preview skill
   - Data: `dataset-quality-audit`, `auto-hypothesis-test` / `auto-stat-test` (they execute inside the existing Pyodide sandbox)

8. **Deep Research mode** — from Kimi (`deep-research`, `deep-research-v2`), MiniMax (`deep-research`), GLM (Research & Information Retrieval). Not a new capability but an orchestration pattern over what Manthan already has: multi-round SEARCH + READ + swarm synthesis with citations. Shippable as a mode toggle.

9. **Reminders / scheduled notifications** — from ChatGPT (reminders, recurring tasks, scheduled searches). The Notification API + setInterval works while the PWA tab/service worker is alive; state the honest limitation (no push when closed, no server).

10. **Image search** — from ChatGPT. Add an image results panel to existing engines (SearXNG instances serve image results; YouTube engine already uses Piped directly).

---

## 3. Tier B — Possible, but needs an external API or user-supplied key

11. **Image generation / editing** — from ChatGPT, Meta (`container.image.gen` with character consistency), GLM (AI Media Services). Pollinations.ai is free/keyless; OpenRouter (already integrated) serves image models. An `IMG:` directive fits the architecture; the app already has a multi-provider key system.
12. **GitHub integration** — from Mimo (`github` via gh CLI) and Grok (`coding-agents-harness`). The GitHub REST API is CORS-friendly with a user token (PAT); PR/issue/repo queries work from the browser. (The agent-CLI part is not feasible — see Tier D.)
13. **Sports data / scores widget** — from ChatGPT. Free tiers exist (e.g. TheSportsDB, cricketdata for the Indian audience); needs a key or rate-limited free access.
14. **Local business / restaurant availability search** — from ChatGPT. Requires Google Places or similar with a key; lowest priority of this tier.

---

## 4. Tier C — Partially feasible with real trade-offs

15. **Media processing (ffmpeg)** — Grok's ffmpeg skill (trim, convert, GIF, subtitles, merge). ffmpeg.wasm exists (~25–30 MB, will bloat the single-file app or lazy-load from CDN); WebCodecs covers only modern-codec re-encodes. Feasible as a lazy-loaded advanced skill, not a default.
16. **PDF editing of uploaded files** (merge/split/rotate/watermark — Grok, Claude, Mimo): pypdf runs under Pyodide, so Tier A once file upload (item 6) exists; OCR (pytesseract) is not practical in-browser.
17. **Voice cloning** (Mimo `mimo-tts-voice-clone`/`voice-design`) — server-side models; Web Speech has no cloning. Skip or gate behind an API.

---

## 5. Tier D — Not addable within the single-file, no-backend model

- **Email / calendar integration** (Kimi `email-manager`, `email-to-calendar`) — OAuth redirect flows need a registered backend.
- **Headless browser automation** (Mimo `agent-browser`, Kimi `browse`) — no headless browser in a page; CORS blocks most scripted navigation.
- **Video generation** (Meta `container.video.gen`) — paid server models.
- **Server-side financial data libraries** (Mimo `akshare`, Kimi `cn-finance-data`/Tushare) — need a Python server runtime.
- **Coding-agent harnesses** (Grok `coding-agents-harness` — Codex/Claude Code CLIs) — local CLIs, no browser equivalent.
- **DingTalk / Feishu / QQ plugin channels** (Mimo) — platform-specific connectors requiring registered apps.

---

## 6. Recommended order of implementation

1. Chart/diagram directive (biggest visible gap, all client-side) — §2.1
2. Built-in prompt-skill library (port from Kimi/Mimo, near-zero runtime cost) — §2.7
3. Memory / persistent profile (differentiator, reuses existing localStorage pattern) — §2.5
4. Deep Research mode (orchestration only) — §2.8
5. TTS, unit/currency, weather, image search (quick directive wins) — §2.2–2.4, 2.10
6. File upload + reading (prerequisite for full document-skill parity with Sarvam/Grok/Claude/Mimo) — §2.6
7. Image generation via existing providers — §3.11

*Compiled 25 September 2026. Skill names quoted as they appear in the Unified Skill Report (Full Edition).*

---

# 7. Update — Meta AI 26-skill list (Meta_AI_Skills_List.pdf, 25 September 2026)

Meta's active skill set is dominated by two clusters: connected-account tools (Gmail/Outlook, Meta Ads) and a few generation/research skills. Verdict per skill against Manthan's no-backend, single-file model:

## Addable now (Tier A — fits the existing architecture)

| # | Meta skill | Verdict & implementation |
|---|---|---|
| 26 | **health** | Pure prompt skill: "always load before answering health/wellness/medical questions, evidence-based answers, safety flags, crisis resources." Ports directly as a built-in custom skill in MAKESKILL format — zero runtime. |
| 5 | **deep-research-report** | Orchestration over existing SEARCH + READ + Agent Swarm with a formal cited-report output format. Shippable as a Deep Research mode (already recommended in §6). |
| 4 | **slides** | Already covered by File Creation (pptx). Worth upgrading (layouts, visuals) but not a new skill category. |

## Addable with an external API / key (Tier B)

| # | Meta skill | Verdict & implementation |
|---|---|---|
| 1 | **transparent-background-image** | Needs an image-generation backend. Pollinations.ai is free/keyless and some models emit transparent PNGs; or OpenRouter image models (app already has providers). Frame as an `IMG:` directive with a "transparent asset" flag. |
| 25 | **gif-generation** | Frame-by-frame image generation + client-side GIF assembly (gif.js or ffmpeg-free wasm encoder from CDN). Depends on image generation landing first. |
| 7 | **local** (local_search places) | Keyless option exists: OpenStreetMap Nominatim (geocoding) + Overpass API (restaurants, parks, cafes, services) — both free and CORS-friendly. Google Places is the higher-quality paid alternative. Pairs well with a map embed. |

## Possible only with heavy OAuth setup (Tier C — user must register their own OAuth clients)

| # | Meta skill | Verdict |
|---|---|---|
| 2 / 17 | **gmail-search / gmail-write** | Gmail API works from the browser (Google Identity Services token client + CORS), but the user must register a Google OAuth client ID with Gmail scopes. Big friction, no backend strictly required. |
| 18 / 19 | **outlook-search / outlook-write** | Same via Microsoft Graph SPA OAuth (PKCE, CORS-enabled). Same friction. |
| 3 | **schedule_tasks** | Two flavors: reminders work via Notification API while the PWA is open; a "task that runs later and sends the result" (daily quote, weekly roundup) cannot run when the tab is closed — no background execution without a push server. Honest half-implementation only. |
| 6 | **daily-brief** | Same limitation: a recurring news digest can be composed on next open (check localStorage for due briefs), but not delivered in the background. |

## Not addable (Tier D — Meta-account-bound or platform-specific)

- **analyze-ad-performance, find-ad-opportunities, ads-help, ads-catalog, ads-experiments, ads-creatives, ads-datasets-signals, ads-audiences-pages, deep-insights, ads-discovery** (10 skills) — all require the user's connected Meta ad accounts via Meta OAuth with business permissions. Not reachable from a third-party client-side app.
- **ads-library-research** — public data in principle, but Meta's Ad Library API still needs an access token; the practical fallback is the existing web-search/social engines (Facebook, Instagram engines are already in the SEARCH menu).
- **post-coach, rival-watch** — need the user's own IG/FB analytics via Graph API (post-coach); rival-watch is partially approximable through existing public social search engines, but real benchmarking needs account access.
- **business-data-consent** — Meta-platform-specific consent revocation; meaningless outside Meta.

## Bottom line for the Meta list

Of Meta's 26 skills, only 3 are a clean fit (health, deep-research-report, slides-upgrade), 3 more are feasible with an image-gen or keyless map API (transparent-background-image, gif-generation, local), 6 are possible only with user-registered OAuth clients or accept degraded background behavior (Gmail/Outlook read-write, schedule_tasks, daily-brief), and the remaining 14 (the entire Meta Ads suite plus post-coach, rival-watch, business-data-consent) are locked to Meta's own platform and cannot be added to a standalone app.

*Updated 25 September 2026 with the Meta AI active skills list (26 skills).*
