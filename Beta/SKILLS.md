# Manthan Agent — Skills Reference

**App:** SahuAI PRO-Lite (Beta) — Manthan Agent v7.9.12
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
