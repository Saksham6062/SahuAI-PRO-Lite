# Manthan Agent — Skills Reference

**App:** SahuAI PRO-Lite (Beta) — Manthan Agent v8.0.0
**Scope:** Every skill available in `Settings → Skills`, what it does, and how the agent uses it.

---

## How Skills Work

Manthan is an **agentic** assistant: your request goes to the model *first*, and the model decides on its own whether it needs tools to answer. When a skill is useful it emits a short directive line (like `SEARCH[wikipedia]: ...` or `CALC: 19% of 2450`), the app executes it, and the result is fed back. The model then **rethinks** — it may run more skills, dig deeper, correct itself, or chain several skills in a row — and only when it is satisfied does it write the final answer (marked `ANSWER:`). There is no fixed limit: the agent can loop *think → act → observe → think* as many times as the task needs.

Every skill has an **on/off toggle** in `Settings → Skills`. Disabled skills are removed from the model's instruction set entirely — the agent will not attempt to use what it cannot run. The current toggle order matches the list below.

| # | Skill | Type | Directive the model emits |
|---|-------|------|---------------------------|
| 1 | Web Search | Agentic | `SEARCH[key]: <query>` |
| 2 | Web Scraping | Agentic | `READ: <url>` |
| 3 | Web Fetching | Agentic | `FETCH: <url>` |
| 4 | Code Interpreter | Agentic | ```` ```runpython ```` / ```` ```runjs ```` blocks |
| 5 | File Creation | Agentic | `FILE[ext]: name.ext` blocks |
| 6 | Live Preview | Agentic | `PREVIEW: <title>` + ```` ```html ```` / ```` ```react ```` block |
| 7 | Skill Creator | Meta | `MAKESKILL:` block |
| 8 | MCP: Current Date & Time | MCP tool | `DATE:` or `DATE: <timezone>` |
| 9 | MCP: Calculator | MCP tool | `CALC: <expression>` |
| 10 | Agent Swarm | MCP tool | ```` ```sahu_agents ```` JSON block |
| 11 | Web Browsing | Agentic | `BROWSE: <url>` |
| 12 | Chart Studio | v8.0 core | ```` ```echarts ```` / ```` ```mermaid ```` / ```` ```infographic ```` blocks |
| 13 | Speak (TTS) | v8.0 core | `SPEAK: [rate=] [lang=] <text>` |
| 14 | Converter | v8.0 core | `CONVERT: 180 lb to kg` / `25000 INR to JPY` / `14:30 IST to PST` |
| 15 | Live Weather | v8.0 core | `WEATHER: <place>` |
| 16 | Image Generation | v8.0 core | `IMG: [transparent] [w=] [h=] <prompt>` |
| 17 | GIF Maker | v8.0 core | ```` ```gifplan ```` JSON block |
| 18 | Image Search | v8.0 core | `IMGSEARCH: <query>` |
| 19 | Nearby Places | v8.0 core | `PLACES: <what> near <where>` |
| 20 | Stock Snapshot | v8.0 core | `STOCK: <symbols>` |
| 21 | File Reader | v8.0 core | `READ_FILE: <name>` / `FIND_IN_FILES: <phrase>` |
| 22 | PDF Editing | v8.0 core | `PDFEDIT: {json}` |
| 23 | Translate | v8.0 core | `TRANSLATE[en>hi]: <text>` |
| 24 | Humanizer | v8.0 core | `HUMANIZE: <text>` |
| 25 | Auditor | v8.0 core | `AUDIT[type=dataset|schema|code|tos]:` |
| 26 | Citation Styles | v8.0 core | `CITE[apa|mla|chicago|ieee|harvard]:` |
| 27 | Persistent Memory | v8.0 core | `MEMORY:+ / MEMORY:- / MEMORY:` |
| 28 | Reminders | v8.0 core | `REMIND: [in 45m | at 18:30 | every 30m] <text>` |
| 29 | Summarizer | v8.0 core | `SUMMARIZE: <url | video | file | text>` |
| 30 | TDD Mentor | v8.0 core | `TDD: <task>` / `MENTOR: <topic>` |
| 31 | Design Polish | v8.0 core | `DESIGN[theme=]:` (prompt layer) |
| 32 | Self-Improvement | v8.0 core | `NOTED: <wrong> -> <right>` |
| 33 | Heartbeat | v8.0 core | `BRIEF:+ / BRIEF:- <topic>` |
| 34–53 | **Skill Library (20 skills)** | v8.0 library | prompt-only instruction packs |

---

## 1. Web Search

> **What it does:** Searches the web with your enabled search engines and collects the results.

The model emits one search per line, and each line names **exactly one key** — either a single engine or a whole category. Multiple `SEARCH` lines in the same turn all run **in parallel**:

```
SEARCH[social]: community opinions on the Steam Deck OLED
SEARCH[wikipedia]: Steam Deck hardware specifications
SEARCH[privacy]: steam deck oled battery life review
```

**Important rules**

- There are **no default engines**: a bare `SEARCH:` line without a `[key]` is never executed.
- Engines that are disabled in `Settings → Search Engines` never run — the model only ever sees the engines you enabled.
- If a search round returns weak or empty results, the next round automatically fans out wider (4–6 reworded queries mixing categories and single engines). The same query + engine pair is never repeated.
- If **no** engines are enabled, the model is told to answer directly without searching.

**Available engines (23)**

| Engine | Notes |
|--------|-------|
| TinyFish (free AI search) | Structured AI web search; free API key |
| Wikipedia / Wikidata / Grokipedia | Reference & facts |
| Reddit | Community discussions |
| Google, Bing, DuckDuckGo, DuckDuckGo Lite, Yahoo, Yandex, Brave, Startpage, Baidu (English) | General web (SearXNG-backed) |
| YouTube | Direct Piped API — not SearXNG, not a proxy |
| X (Twitter), Facebook, Instagram, LinkedIn, GitHub, ERNIE | Site-targeted |
| Crossref, arXiv, Open Library, Dictionary | Papers, books, definitions |

**Categories** — a category key runs *every* enabled engine inside it at once:

| Category key | Contains |
|--------------|----------|
| `best` | ⭐ Best (no SearXNG — direct): TinyFish, DDG Lite, Wikipedia, Facebook, YouTube, Instagram |
| `social` | Reddit, Facebook, Instagram, X, YouTube |
| `privacy` | DuckDuckGo Lite, DuckDuckGo, Brave, Startpage |
| `standard` | TinyFish, Google, Bing, Yahoo, Baidu, Yandex |
| `productivity` | Wikipedia, Grokipedia, ERNIE, GitHub, LinkedIn |
| `other` | Open Library, Crossref, Wikidata, arXiv, Dictionary |

SearXNG-backed engines are queried through public instances (searx.be, priv.au, searx.tiekoetter.com, baresearch.org, search.inetol.net, paulgo.io) with automatic failover. **Custom search engines** you add in `Settings → Search Engines` appear in the model's menu too and can be targeted as `SEARCH[<your-engine-id>]`.

---

## 2. Web Scraping

> **What it does:** Opens any web page and extracts its full readable text for deep reading.

Directive: `READ: <url>`

The model uses this to *dig into* a promising search result — the whole readable text of the page comes back, so it can extract precise facts, numbers, quotes or steps that a short search snippet cannot show. Example flow: search for a topic → pick the two best links → `READ` both → answer with details.

---

## 3. Web Fetching

> **What it does:** Fetches the raw content of any URL (page text, markdown or JSON).

Directive: `FETCH: <url>`

Unlike scraping (which extracts readable text), fetching returns the **raw payload** — ideal for API endpoints, JSON feeds, markdown documents, CSV/data files and article sources where the exact content matters. Useful when the model needs to consume an API or read a document behind a URL.

---

## 4. Code Interpreter

> **What it does:** Gives the model a real sandboxed code interpreter: Python 3 (Pyodide) and JavaScript with npm packages (esm.sh). It can run code, see the output and iterate.

The model writes fenced code blocks with the special language tags `runpython` or `runjs`. The code executes in a sandbox, the **full output is returned to the model**, and it can run more code in later turns to verify, iterate or fix errors.

**Python 3** (```` ```runpython ````)

- `print()` to show output; top-level `await` works
- `numpy`, `pandas`, `matplotlib` auto-load on import
- Pure-Python packages on demand: `import micropip` → `await micropip.install("pkg")`
- The last matplotlib figure is auto-captured and **shown to you** as an image

**JavaScript** (```` ```runjs ````)

- `console.log()` to show output; top-level `await` works
- Import any npm package straight from the browser: `import _ from "https://esm.sh/lodash"`

Typical uses: data analysis, exact computations, chart generation, text processing, verifying a formula before answering.

---

## 5. File Creation

> **What it does:** The model can create downloadable files: pdf, pptx, xlsx, docx, md, txt, csv and json — with fonts, tables and emojis.

In its final answer the model emits `FILE` blocks, which the app turns into **download cards** you can click to save:

```
FILE[xlsx]: budget.xlsx
Item | Cost | Qty
Laptop | 55000 | 1
Mouse | 800 | 2
/FILE
```

**Format rules per extension**

| Format | Content rules |
|--------|---------------|
| `txt` / `md` | Raw text / markdown |
| `csv` | Raw CSV |
| `json` | Raw JSON |
| `xlsx` | Rows with cells separated by `\|`; first row = headers; start a new sheet with a `## SheetName` line |
| `docx` / `pdf` | Markdown-ish: `# H1`, `## H2`, `-` bullets, `1.` numbered, `>` quote, `**bold**`, `\| a \| b \|` tables; optional first line `FONT: Georgia` (pdf built-ins: helvetica, times, courier; emojis are stripped from pdf) |
| `pptx` | Slides separated by `---` lines; first line of a slide = title, then `-` bullets or `\| a \| b \|` tables; optional first line `FONT: Arial` |

If a file fails to build, the model sees the error, fixes the content and emits the block again.

---

## 6. Live Preview

> **What it does:** HTML and React apps the model writes open in a real live preview window — sandboxed, with console output, phone/desktop width, refresh and open-in-tab.

Whenever you ask for an app, website, page, UI, game or anything visual/interactive, the model writes **one complete single-file app** and puts `PREVIEW: <short title>` on the line right before the code fence. The app opens automatically in the live preview window (you can also click **Preview** on any html/react block).

- ```` ```html ```` — plain HTML/CSS/JS, CDN links allowed
- ```` ```react ```` — React 18 + JSX; CDN libraries and Tailwind are available; must end with `ReactDOM.createRoot(document.getElementById("root")).render(<App />)`

Everything lives in that single file — the preview is fully sandboxed, shows `console` output, can be toggled between phone and desktop width, refreshed, or popped out into a new browser tab.

---

## 7. Skill Creator

> **What it does:** Ask the model to create a new skill (MAKESKILL block) — it is saved with its own on/off toggle in Settings → Skills and taught to every model.

A *skill* here is a reusable behaviour, persona or workflow written in plain instructions. When you say things like *"create a skill that always answers in bullet points"* or *"make me a travel-planner skill"*, the model outputs:

```
MAKESKILL: Bullet Answers
DESC: Always answer with concise bullet points
Whenever you answer, use markdown bullet lists only. Keep each bullet under 20 words.
/MAKESKILL
```

The skill is **saved instantly**, appears under *Custom skills* in `Settings → Skills` with its own on/off toggle (and a Delete button), and its instructions are injected into every model conversation where relevant. Custom skills survive reloads and are taught to every model/provider you use.

---

## 8. MCP: Current Date & Time

> **What it does:** MCP tool — gives the model the REAL current date & time on demand (local + UTC, weekday, timezone, Unix stamp). Time-sensitive answers are always correct — no more guessed dates.

Directive: `DATE:` (bare — your local time) or `DATE: <IANA timezone>`, e.g. `DATE: UTC`, `DATE: Asia/Kolkata`, `DATE: America/New_York`.

The model receives the local date-time, UTC date-time, weekday and Unix timestamp, and is instructed to use this **every time** an answer depends on today's date, the weekday, clocks, ages, deadlines, or "days until/between" questions (computing the differences with the Calculator). It never guesses or hardcodes the current date.

---

## 9. MCP: Calculator

> **What it does:** MCP tool — an exact math engine the model can call: arithmetic, powers, roots, trig, logs, factorials, constants (pi, e). It computes instead of guessing.

Directive: `CALC: <expression>` — one expression per line; several `CALC` lines run in parallel.

Supported syntax:

- Operators: `+ - * / % ^ !` and parentheses (`**` is accepted as power too)
- Functions: `sqrt cbrt abs round floor ceil sign`, `min max pow root(x,n) atan2`, `sin cos tan asin acos atan sinh cosh tanh` (radians), `log ln log2 log10 exp`
- Constants: `pi e tau phi`
- Scientific notation (`1.2e9`) and implicit multiplication (`2pi`, `3(4+1)`)

The evaluator is a real tokenizer + parser that runs 100 % locally in the page — **no `eval`**, so no code can be smuggled through an expression. The model is told to use it for any arithmetic beyond trivial single-digit sums and always when precision matters.

---

## 10. Agent Swarm

> **What it does:** MCP tool — the model can spawn 2-10 parallel worker agents (NEVER exactly 1) AS MANY TIMES as it wants during a task: each spawn is one fenced sahu_agents block, workers run at the same time (each may request one web search), and every report comes back merged. Built for big research, multi-part jobs and large comparisons.

For genuinely complex, parallelizable requests the orchestrator model emits one fenced block:

````
```sahu_agents
{"plan":"compare the three clouds on price, regions and free tier",
 "tasks":[{"id":"w1","objective":"pricing of AWS vs Azure vs GCP","output_format":"table + 3 takeaways","boundaries":"do not cover regions or free tier"},
          {"id":"w2","objective":"region availability","output_format":"bullets","boundaries":"pricing is w1's job"}]}
```
````

**Rules the model follows**

- **2–10 tasks per spawn, never exactly 1** — a single sub-task means the model does it itself; simple requests spawn nothing
- Tasks are independent, self-contained and non-overlapping (each gets *boundaries* to avoid duplicating siblings)
- Workers run **in parallel**; each may request **one** web search (`NEED_SEARCH`) if its sub-task truly needs current data
- Every report comes back merged; the orchestrator synthesizes the final answer, resolving contradictions explicitly
- Swarms can be spawned **again in later turns** — to split remaining work deeper, verify conflicting claims or cover new angles

---

## 11. Web Browsing

> **What it does:** Browses a page like a person: skims the content and picks up links to follow next.

Directive: `BROWSE: <url>`

This is the "window-shopping" counterpart of the reading skills: instead of the full text, the model gets a quick **content summary plus the links** the page contains, so it can decide what to follow next. Ideal for exploring a documentation site, a directory page or a hub where the interesting detail is one click deeper.

---

## Custom Skills (created by you / the model)

Custom skills created through the **Skill Creator** are listed under a separate *Custom skills* group in `Settings → Skills`, each with:

- an **on/off toggle** — enabled skills' instructions are injected into every conversation as `CUSTOM SKILLS` directives the model follows whenever they are relevant
- a **Delete** button to remove the skill permanently

They behave like first-class citizens: they persist across reloads, apply to every provider/model you switch to, and can be combined with the built-in skills in the same answer.

---

## The Agentic Loop in One Picture

```
            ┌──────────────────────────────────────────┐
            │  1. THINK — does this need tools at all? │
            └───────────────┬──────────────────────────┘
                     no │                │ yes
                        ▼                ▼
                  ANSWER directly   emit skill lines (SEARCH / READ /
                        ▲           FETCH / BROWSE / RUN CODE / CALC /
                        │           DATE / sahu_agents / MAKESKILL)
                        │                       │
                        │                       ▼
                        │            results come back to the model
                        │                       │
                        └──────── RETHINK — enough? ── no ──► run more
                                   skills (unlimited rounds)
                                   │ yes
                                   ▼
                                ANSWER
```

**Styling powers the model may use in answers and files:** emojis, markdown tables (`| A | B |`) for comparisons, `**bold**`, headings, and font spans (e.g. `<font face="Georgia" color="#c026d3" size="4">`) for different fonts and colors.

---

*Document generated from the Beta build (`Beta/index.html`, Manthan Agent v7.9.12 — all 18 Unified Bug Report fixes applied). Skill availability is controlled entirely by the toggles in `Settings → Skills`.*

---

# v8.0.0 — The No-Backend Skill Pack

**23 core skills + 20 library skills, implemented from `Beta/Manthan_NoBackend_Skill_Pack.pdf`.** Three hard constraints, all honored: **no backend server, no OAuth, no API keys** (and no OCR — deliberately out of scope per the spec). Everything runs on the browser's own APIs, the existing Pyodide/esm.sh sandbox, lazy-loaded CDN libraries, and free keyless endpoints (Open-Meteo, frankfurter.dev + open.er-api.com, Pollinations, Openverse, Nominatim/Overpass, Yahoo Finance via keyless proxies, Piped).

Deep Research is **not** re-implemented — the Deep Research Pipeline (mode `research`) already ships in the app and covers core skill #17 of the pack.

## Core skills (directives)

### Weather — `WEATHER: <place>`
Open-Meteo geocoding + forecast, 15-minute cache. Returns exact current conditions (temp, feels-like, humidity, wind, precipitation) plus a 3-day forecast as **real numbers** to the model and a weather card to the user.

### Converter — `CONVERT: <expr>`
Deterministic, never guessed. Three forms: units (`180 lb to kg` — length/mass/volume/area/speed/data/time/temperature, word forms accepted), currency (`25000 INR to JPY` — live ECB rates via frankfurter.dev with open.er-api.com fallback, 1-hour cache), timezones (`14:30 IST to PST` — IANA-aware via Intl).

### Speak — `SPEAK: [rate=] [pitch=] [lang=] <text>`
Browser speechSynthesis — offline, no key, ~30 lines of code. Adds a **Speak button** to every answer bubble automatically.

### Chart Studio — fenced blocks
The model emits ```` ```echarts ```` (JSON option — full ECharts power), ```` ```mermaid ```` (flowcharts, sequence, ER, gantt, mind maps) or ```` ```infographic ```` (JSON spec: kpi / big-number / grid / timeline / progress / compare layouts). Renders inline as interactive cards with **PNG export, Copy spec, and Edit-this-spec** buttons. Works in every mode and in restored history.

### Image Generation — `IMG: [transparent] [w=] [h=] [model=] [seed=] <prompt>`
image.pollinations.ai — free, keyless, CORS-open. Deterministic seeds (same prompt + seed = same image), transparent-PNG flag, inline card with PNG download and a **Regenerate** button.

### GIF Maker — ```` ```gifplan ```` block
`{"fps":10,"frames":["frame 1 prompt","frame 2 prompt",...]}` (2–10 frames). Frames come from the keyless image provider (with per-frame retry), assembled client-side with gif.js (same-origin blob worker) into a real animated GIF with download.

### Image Search — `IMGSEARCH: <query>`
Openverse API — openly-licensed (CC/BY) images with attribution metadata, as a thumbnail carousel with license labels and source links.

### Nearby Places — `PLACES: <what> near <where>`
OpenStreetMap stack: Nominatim geocoding + Overpass POI queries (~25 amenity types mapped). Results ranked by distance with opening hours where tagged, plus an OSM map card. Also accepts JSON: `PLACES: {"what":"cafe","near":"MG Road, Pune","radius":2000}`.

### Stock Snapshot — `STOCK: <symbols>`
Yahoo Finance chart API through a keyless CORS chain (r.jina.ai → allorigins → corsproxy → codetabs). Stocks, indices (`^NSEI`, `^BSESN`, `^GSPC`), FX (`USDINR`). Price, change, day range, volume, 52-week range; 5-minute cache; card always says *delayed, not investment advice*.

### File Reader — uploads + `READ_FILE: / FIND_IN_FILES:`
The upload button now routes documents to real parsers: **pdf.js** for PDFs (per-page text), **SheetJS** for XLSX (per-sheet tables), **mammoth.js** for DOCX, **JSZip** for archives (listing + text previews), native parsing for CSV/JSON/text. Every upload joins a session document pool; `READ_FILE: report.pdf pages 3-5` / `READ_FILE: budget.xlsx sheet Summary` pulls any part back into the conversation; `FIND_IN_FILES: refund policy` searches every attached document with excerpts. Images/audio keep their existing vision/Whisper paths.

### PDF Editing — `PDFEDIT: {json}`
Real PDF surgery on attached files via pdf-lib: `info`, `merge`, `extract`/`remove` pages, `rotate`, `watermark` (text + opacity), `metadata`. Every result lands as a download card.

### Translate — `TRANSLATE[from>to]: <text>`
A pinned translator shim over the active model: output ONLY the translation, formatting preserved, shown as a two-pane copy card. Auto-detect when the source is omitted.

### Humanizer — `HUMANIZE: <text>`
Two-pass: diagnosis of AI-writing patterns (em-dash pileups, "delve", rule-of-three, hedging), then a human-voiced rewrite that keeps every fact.

### Auditor — `AUDIT[type=...]:`
The dataset variant runs **real deterministic checks in the Pyodide sandbox first** (missing values, duplicate rows, type inference, IQR outliers, ranges), then the model writes the report card: Findings / Severity (P0/P1/P2) / Suggested fixes / which checks were deterministic. schema, code and tos variants are prompt-driven with the same card.

### Citation Styles — `CITE[apa|mla|chicago|ieee|harvard]:`
Format-exact citations in a fenced code block (one-tap Copy), plus a validation note for missing fields. Batch mode: one reference per line.

### Persistent Memory — `MEMORY:+ / MEMORY:- / MEMORY:`
A bounded (2 KB) markdown profile in localStorage with headings (Profile / Preferences / Projects), auto-classified on save. Injected into every session as a context block. **Settings → Skills** shows a full viewer/editor with Save, Clear, Export JSON, Import JSON, plus the self-improvement log and heartbeat topics. Never stores passwords, IDs, payment or health specifics. Skipped entirely in Incognito mode.

### Reminders — `REMIND: [in 45m | at 18:30 | at 09:00 daily | every 30m] <text>`
Browser notifications + in-chat banners while the app is open. The card states the honest limit up front: nothing fires while the tab is closed (no server). Missed one-shots surface on next open; recurring items reschedule while open.

### Summarizer — `SUMMARIZE: <url | YouTube link | attached file | text>`
Chains the existing fetch layer: web pages via READ, YouTube transcripts via the Piped API, attached documents via the pool. Fixed digest format: one-line TL;DR, 3–7 key points, notable quotes, sources.

### TDD Mentor — `TDD: / MENTOR:`
The red-green-refactor loop pinned as instructions, executing in the existing runpython/runjs sandbox: failing test first → implement → green → refactor. MENTOR is the Socratic teaching variant (one concept per turn).

### Design Polish — `DESIGN[theme=minimal|editorial|brutalist|glass|retro]:`
A prompt layer over Live Preview: deliberate type scale, 4/8px rhythm, intentional palette, accessible contrast, restrained motion, real states — plus a self-critique pass before delivery and a "design notes" line.

### Self-Improvement — `NOTED: <wrong> -> <right>`
When you correct the model it logs the correction (max 50, last 5 ride along every session), shows a small "noted" toast, and the raw line is stripped from the display.

### Heartbeat — `BRIEF:+ / BRIEF:- <topic>`
While the app is open, a periodic check-in (hourly + on open) composes subscribed briefs and surfaces due reminders — and stays **SILENT** when there is nothing worth saying.

## Skill Library (20 prompt-only skills)

Seeded as built-in custom skills (toggleable + deletable, shown under **Skill Library** in Settings → Skills):

| Skill | Source | One-liner |
|-------|--------|-----------|
| Copywriting | Kimi | Landing-page / ad copy with A/B alternates |
| Copy Editor | Kimi | Seven-pass editing with per-pass change summary |
| Brand Naming Lab | Kimi | Name generation + cross-language risk screening |
| CV Tailor | Kimi | Resume + cover letter tailored to a JD |
| Academic Paper Reviewer | Kimi | Referee-style review with verdict |
| Bloom Quiz Maker | Kimi | Bloom-taxonomy quizzes + marking schemes |
| Code Mentor | Kimi | Socratic programming tutor |
| Plan Mode | MiniMax | Plan first, get approval, then execute |
| Cross-Examine | Kimi | Skeptic pass on plans and specs |
| Deep Probe | Kimi | ≤5 clarifying questions with defaults |
| UI Critique | Mimo | UX review incl. AI-slop detection |
| Typeset | Mimo | Typography repair |
| Arrange | Mimo | Layout + spacing rhythm repair |
| Polish | Mimo | Pre-ship checklist sweep |
| Harden | Mimo | Edge cases, i18n, Indic scripts, touch |
| Delight | Mimo | Micro-interactions that serve usability |
| Onboard | Mimo | First-run flows + empty states |
| Dataset Quality Audit | Kimi | 12-dimension data quality report card |
| Auto Stat Test | Kimi | Picks + runs the right statistical test |
| Health Guard | Meta AI | Evidence-based health answers + safety flags |

## Migration & compatibility

One-time v8.0 migration switches all 22 new core skills **on** for existing users and seeds the 20 library skills (deleting a library skill is respected). Existing chats, custom skills, providers and settings are untouched. Heavy libraries (pdf.js, mammoth, ECharts, Mermaid, pdf-lib, gif.js) are **lazy-loaded on first use** — startup cost is unchanged, and every skill degrades gracefully offline with an honest message.
