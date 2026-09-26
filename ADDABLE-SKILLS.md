# Addable Skills — Backend-Less, Not Yet in Manthan

**Repo:** `Saksham6062/SahuAI-PRO-Lite` · **App:** Manthan Agent **v9.15** · **Compiled:** 26 September 2026
**Question:** Across all files at GitHub (Sarvam · ChatGPT · Grok · GLM · Mimo/OpenClaw · MiniMax · Kimi · Claude · Gemini · Meta AI), which skills are (1) usable WITHOUT a backend, (2) NOT already present in Manthan's 53 skills, and (3) can be added to the existing `index.html`?

**Answer: ~150 unique skill concepts are addable.** Tier A (~133) are prompt-only or run on runtimes Manthan already has (Pyodide, FILE, PREVIEW, Swarm, search) — each is a direct `SAHU_V80_LIB_SKILLS`-style port. Tier B (~17) need a thin new runtime layer (user-key API, WASM lib, or browser API). Kimi's catalog alone contributes ~110 (many ship as EN + CN twin pairs — counted once).

---

## TIER A — Add now, zero new runtime

### A1. Writing & content (25)

| Skill (source) | What it adds | Port path |
|---|---|---|
| ad-creative + ad-copywriter (Kimi) | Ad copy for Google/Meta/LinkedIn/TikTok: headlines, primary text, full campaigns | Library skill |
| campaign-plan (Kimi) | Full campaign brief: objectives, audience, messaging, channels, calendar, KPIs | Library skill |
| seo-content-writer (Kimi) | Keyword-optimized articles, meta descriptions, FAQ schema, EEAT checklist | Library skill |
| content-research-writer (Kimi) | Research-backed writing with live citations, hooks, structure iteration | Library skill + search |
| creative-writing (Kimi) | Storyboards, audio-drama scripts, stage drama, poetry, lyrics | Library skill |
| general-writing (Kimi) | Genre router: screenplays, essays, game writing, murder mystery, TRPG scenarios | Library skill |
| longread (Kimi) | Multi-pass protocol for sources too large to read at once | Library skill + file-reader |
| report-writing (Kimi) | Industry research, policy briefs, consulting deliverables assembly | Library skill |
| paper-writing (Kimi) | Survey papers, empirical research, literature reviews | Library skill |
| wechat-post-craft (Kimi) | WeChat official-account articles: titles, layout, CTA | Library skill |
| xhs-note-creator (Kimi) | Xiaohongshu notes + 3:4 image rendering | Library skill + IMG |
| zhihu-viral-answer (Kimi) | Zhihu answer structures: story + substance + quotable lines | Library skill |
| x-thread-crafter (Kimi) | Twitter/X threads ≤280 chars with hook + payoff | Library skill |
| short-video-script (Kimi) | TikTok/Reels scripts: 3-sec hook → conflict → twist → CTA + shot list | Library skill |
| podcast-episode-writer (Kimi) | Timestamped podcast scripts: intro, segments, transitions, outro | Library skill |
| video-outline-planner (Kimi) | Bilibili knowledge-video topic analysis + pacing structure | Library skill |
| professional-email-composer (Kimi) | Business emails: reminders, follow-ups, declines, apologies, thank-yous | Library skill |
| ecom-listing-copywriter (Kimi) | Product listings: titles, selling points, specs, FAQs for Taobao/JD/Amazon | Library skill |
| support-response-writer (Kimi) | Customer-support replies with 5-level emotion de-escalation | Library skill |
| cross-platform-adapter (Kimi) | Repurpose one piece of content per platform (LinkedIn/X/WeChat) | Library skill |
| humanizer-zh (Kimi) | Chinese-language AI-text removal (Manthan humanizer is EN-only) | Library skill |
| translation-craft (Kimi) | 4-domain translation (academic/business/technical/legal) with back-translation QC — upgrades existing translate | Library skill |
| scholarly-writing-refiner (Kimi) | Academic English polishing, paragraph by paragraph | Library skill |
| obsidian-markdown (Kimi) | Obsidian-flavored markdown: wikilinks, embeds, callouts, properties | Library skill |
| email-newsletter-builder (Kimi ×4 variants) | Gmail/Outlook-compatible HTML emails: table layout, inline CSS, responsive | Library skill + FILE html |

### A2. Business, PM & operations (29)

| Skill (source) | What it adds | Port path |
|---|---|---|
| idea-to-prd / product-spec-writer (Kimi) | One-line idea → full PRD: user stories, features, MoSCoW, acceptance criteria | Library skill |
| okr-strategist (Kimi) | OKR drafting, breakdown, alignment, retrospective coaching | Library skill |
| sprint-plan-builder (Kimi) | Capacity + velocity-based sprint planning with load balancing | Library skill |
| project-sizing-guide (Kimi) | Effort estimation: 3-point PERT, T-shirt sizing, function-point analysis | Library skill |
| structured-minutes (Kimi) | Transcripts/notes/chats → minutes with owners + deadlines | Library skill |
| work-report-writer (Kimi) | Scattered notes + git logs → weekly/monthly reports (3 styles) | Library skill |
| process-doc / sop-writer (Kimi) | Business process → flowcharts + RACI matrix + SOP + exceptions | Library skill + chart-studio |
| risk-heatmap (Kimi) | Interactive 5×5 probability-impact HTML risk heatmap | Library skill + PREVIEW |
| weighted-scorer (Kimi) | Weighted decision matrices for tech selection / vendor evaluation | Library skill |
| story-map-builder (Kimi) | Epic → Feature → Story interactive HTML map with MoSCoW colors | Library skill + PREVIEW |
| gantt-planner (Kimi) | Interactive HTML Gantt with Critical Path Method analysis | Library skill + PREVIEW |
| incident-review-guide (Kimi) | Blameless SRE postmortems via 6-step SOP | Library skill |
| fundraising-bp-planner (Kimi) | Fundraising BP outline, 6 modules with data-presentation guidance | Library skill |
| investor-pitch-planner (Kimi) | Pitch deck outline: Problem → Solution → Market → Team → Ask | Library skill |
| pitch-deck-creator (Kimi) | 18-page investor roadshow PPTX (startup style) | Library skill + FILE pptx |
| investment-memo (Kimi) | VC deal memos / investor letters as DOCX/PDF | Library skill + FILE |
| retention-manager (Kimi) | Churn defense: cancel flows, win-back, dunning emails | Library skill |
| pricing-advisor (Kimi) | SaaS pricing architecture: tiers, value metric, price page, increases | Library skill |
| mock-interview-drill (Kimi) | 3–5-round interviews (behavioral/technical/case) with STAR scoring | Library skill |
| legal-contract-gen (Kimi) | Interactive Q&A drafts: NDA, service agreement, privacy policy | Library skill |
| legal-risk-assessment (Kimi) | Severity × likelihood legal risk scoring with escalation criteria | Library skill |
| regulatory-audit-generator (Kimi) | GDPR / PIPL / ad-law compliance checklists with risk levels | Library skill |
| domain-glossary (Kimi) | DDD ubiquitous-language glossary from conversation, flags ambiguity | Library skill |
| saas-metrics-coach (Kimi) | ARR/MRR/LTV/CAC/NRR health check vs industry benchmarks | Library skill |
| audience-adaptive-comms (Kimi) | Same message tuned for CEO / VP / Tech Lead / Operations | Library skill |
| sarvam-doc-coauthoring (Sarvam) | Clarify → plan todo → draft → review co-authoring workflow | Library skill |
| product-self-knowledge (Claude) | The app's own docs as a built-in skill — model knows its exact toolset | Library skill (bundle SKILLS.md) |
| morning-brief artifact (Claude) | Morning brief as styled HTML artifact (heartbeat does text; this adds the artifact form) | Library skill + heartbeat |
| nuwa-by-huashu (Kimi) | Auto-research a person/topic → distill into a runnable persona skill | Library skill + search + MAKESKILL |

### A3. Engineering & dev guidance (22)

| Skill (source) | What it adds | Port path |
|---|---|---|
| dev-guide-writer (Kimi) | Any technical topic → complete tutorial + cheatsheet | Library skill |
| route-to-openapi (Kimi) | Framework code → OpenAPI 3.0 / Swagger docs | Library skill |
| conventional-commit-gen (Kimi) | git diff → Conventional Commits messages with scope detection | Library skill (works on pasted diffs) |
| cronjob_guidebook (Kimi) | Scheduled-task conventions: type decision, creation, maintenance | Library skill |
| pipeline-blueprint (Kimi) | CI/CD best practices + GitHub Actions / GitLab CI templates | Library skill |
| test-suite-architect (Kimi) | Full QA process: strategy, AAA test cases, P0–P4 defect tracking, metrics | Library skill |
| web-security-audit (Kimi ×3 variants) | OWASP Top 10 review of pasted code: injection, XSS, SSRF, crypto | Library skill |
| deep-module-refactor (Kimi) | Find architecture friction, deepen shallow modules, RFC output | Library skill |
| api-shape-explorer (Kimi) | Multiple radically different interface designs, compared (parallel sub-agents) | Library skill + Agent Swarm |
| code-to-diagram (Kimi) | Code/dependency analysis → architecture + flowchart diagrams (mermaid renders in chart-studio) | Library skill + chart-studio |
| terraform-deploy-pitfalls (Kimi) | Terraform ops trap knowledge (guidance-only) | Library skill |
| gitlab-cli-guide (Kimi) | GitLab CLI operations reference (guidance-only in browser) | Library skill |
| backend-building (Kimi) | tRPC + Drizzle + Hono grafting for App Dev mode | Library skill + PREVIEW |
| webapp-building (Kimi) | React + TS + Tailwind + shadcn/ui build discipline (CDNs already wired) | Library skill + PREVIEW |
| vibecoding-webapp-swarm (Kimi) | Swarm-parallel app building workflow | Library skill + Agent Swarm |
| swarm-workspace (Kimi) | Swarm coordination conventions | Library skill + Agent Swarm |
| skill-creator-swarm (Kimi) | Skill creation with parallel sub-agents + evals | Library skill + Swarm + MAKESKILL |
| kimi-find-skills (Kimi) | Skill discovery over the app's own 53-skill catalog | Library skill |
| spike (Mimo) | Throwaway prototype validation → evidence-backed recommendation | Library skill + PREVIEW |
| code-generator (Mimo) | Multi-language scaffolding: functions, classes, endpoints, CRUD, tests | Library skill |
| sql-tutor (Kimi) | Natural language → SQL, optimization advice, EXPLAIN interpretation | Library skill (execution via sql.js = Tier B) |
| git-repo-audit (Kimi) | Hotspot files, ownership, secret-leak scanning (pasted git log, or GitHub PAT = Tier B) | Library skill |

### A4. Design & visual craft (32)

Mimo design-craft suite — 13 new prompt-only skills (7 of the 21 are already in Manthan's library):

| Skill (Mimo) | What it adds |
|---|---|
| adapt | Adapt designs across screens, devices, platforms while staying native |
| animate | Purposeful motion + micro-interactions that aid usability |
| ui-audit | Interface QA: accessibility, performance, theming, responsiveness, anti-patterns |
| bolder | Amplify safe/boring designs: type, color, spatial drama |
| clarify | Fix unclear UX copy, error messages, microcopy, labels |
| colorize | Strategic color: semantic, accent, decorative layers |
| distill | Strip designs to essence — remove complexity |
| extract | Pull reusable components + design tokens into a design system |
| normalize | Redesign a feature to match project design-system standards |
| optimize | Frontend performance: loading, rendering, images, bundles |
| overdrive | Ambitious techniques: shaders, virtual scrolling, physics |
| quieter | Reduce visual intensity of over-bold designs |
| teach-impeccable | One-time project design-context gathering |

Kimi visual systems:

| Skill (Kimi) | What it adds | Port path |
|---|---|---|
| baoyu-infographic | 21 layouts × 21 visual styles infographic system | Library skill + infographic fence |
| timeline-builder | Interactive timeline HTML (vertical/horizontal/dual) | Library skill + PREVIEW |
| data-viz-renderer | Self-contained HTML/SVG infographics: stat cards, bars, flows, dashboards | Library skill + PREVIEW |
| kimi-design | Design assets: posters, social media, resumes | Library skill + IMG/PREVIEW |
| theme-factory | 10 preset themes (palette + fonts) for any artifact | Library skill |
| retro-tech-illustration | Synthwave / Vaporwave / Cyberpunk art direction | Library skill + IMG |
| fashion-sketch-cn | Garment Tech Packs: specs, BOM, size charts, quality standards | Library skill + FILE |
| geo-magazine-slides | Editorial geographic-magazine PPTX with hero images | Library skill + FILE pptx |
| guizang-ppt-skill | Horizontal-scroll single-HTML WebGL decks, 2 styles | Library skill + PREVIEW/FILE html |
| photo-magazine | Magazine-grade landscape documents: bold type, full-bleed photos, data cards | Library skill + FILE/PREVIEW |
| journalistic-portrait | Southern People Weekly-style feature pages | Library skill + PREVIEW |
| interactive-research-report | McKinsey/GS-grade interactive research websites — pairs perfectly with the 3 research tiers | Library skill + PREVIEW |
| landing-page-scaffold | Hero → Social Proof → Features → Pricing → CTA self-contained landing page | Library skill + PREVIEW |
| kimi-widget | Inline widget design system guidance | Library skill |
| ui-blueprint | Extract design system from reference UI → implementation-ready prompts (vision-input dependent) | Library skill |
| musepool | Escape "average-LLM design" via diverse design-pool operations | Library skill |
| sarvam-slides (Sarvam) | 1920×1080 HTML decks from 5 design systems (Professional, Tatva, Meridian, Indigo, plain-work) | Library skill + PREVIEW |
| sarvam-html-skill (Sarvam) | Self-contained visual HTML explainers for systems, code, plans, data | Library skill + PREVIEW |
| meme-maker (Mimo) | Meme template search + generation (SVG/PNG client-side, Imgflip-style) | Library skill + IMG |

### A5. Finance & data analysis — prompt + Pyodide execution (26)

| Skill (Kimi) | What it adds | Port path |
|---|---|---|
| financial-ratio-toolkit | 20+ ratios (profitability, solvency, liquidity, efficiency) from statements | Library skill + Pyodide |
| financial-statement-analyzer | Income/balance/cashflow: YoY/QoQ trends + anomaly detection | Library skill + Pyodide |
| value-investing-scorecard | Buffett/Graham 20-criteria scorecard across 4 dimensions | Library skill |
| cashflow-valuation | DCF: FCF forecast, terminal value, sensitivity matrix | Library skill + Pyodide |
| quick-event-etf-study | Event → related stocks → cap-weighted index → HTML dashboard | Library skill + Pyodide + PREVIEW |
| trading-strategy-backtest | Strategy description → runnable backtest code + results + charts | Library skill + Pyodide + chart-studio |
| stock-tech-analysis | 15+ indicators from OHLCV: MA, MACD, RSI, Bollinger, KDJ, ATR | Library skill + Pyodide |
| fund-risk-compare | ETF compare from NAV CSVs: annualized return, max drawdown, Sharpe, correlation | Library skill + Pyodide |
| outlier-scan | Z-score / IQR / moving-average anomaly detection + triage | Library skill + Pyodide |
| correlation-auditor | Pearson/Spearman + partial correlations, confounder detection | Library skill + Pyodide |
| regression-modeler | OLS / logistic: coefficients, R², p-values, VIF, plain-language readout | Library skill + Pyodide |
| split-test-evaluator | A/B tests: significance (Z/chi-square), confidence intervals, power | Library skill + Pyodide |
| equity-research-report | Institutional equity research: 3–5p flash or full sell-side report | Library skill + FILE |
| stock-research-report | Guotai Haitong-style securities research (CN market conventions) | Library skill + FILE |
| earnings-review-note | Quarterly earnings reviews: EPS surprise, guidance, estimate changes | Library skill + FILE |
| commodities-outlook | Institutional commodity outlooks: energy, metals, agriculture | Library skill |
| market-research-brief | Consulting-style market insight reports (PDF/DOCX/PPTX) | Library skill + FILE |
| vc-industry-research | PE/VC primary-market deep-dives (15–25 pages) | Library skill + FILE |
| competitor-analysis | Competitor SEO/GEO intel: keywords, content, backlinks, AI citations | Library skill + search |
| seo-audit | Technical + content SEO audits with actionable fixes | Library skill + scrape |
| log-error-digest | Pasted log files → error clustering, frequency, time distribution | Library skill + Pyodide |
| sun-path | Sun-path diagrams, solar position, shadow analysis, daylight hours (pure math) | Library skill + Pyodide |
| research-advisor | Research topic selection, project planning, risk matrices, decision trees | Library skill |
| sci-paper | CVPR/ICCV/NeurIPS/ICML/ACL/ICLR paper composition + presentation | Library skill |
| astro-observation-report | Gravitational-wave observational papers (LIGO/Virgo/KAGRA) | Library skill (niche) |
| adhd-assistant | ADHD-friendly planning: task breakdown, time awareness, body doubling | Library skill |

### A6. Education & personal (3)

| Skill (source) | What it adds | Port path |
|---|---|---|
| anki-card-maker (Kimi) | Study material → spaced-repetition flashcards → Anki-importable CSV | Library skill + FILE csv |
| about-me-avatar (Kimi) | 1-bit pixel-art portrait from your profile ("the Agent's view of you") | Library skill + IMG |
| mock-interview… (in A2) | — | — |

**Tier A total: ~137 unique skill concepts — every one is a library-skill entry in the existing `index.html` (the `SAHU_V80_LIB_SKILLS` + prompt-branch pattern), no architecture change.**

---

## TIER B — Addable with a thin new runtime layer (17)

| Skill (source) | What it adds | What's needed |
|---|---|---|
| GitHub integration (Mimo/ChatGPT) | Repo/issue/PR queries, file commits, issue→PR automation — **ranked #1 addable** | User PAT + `api.github.com` calls (CORS-open) |
| Transparent-background image gen (Meta) | `IMG transparent:` flag | Pollinations `transparent=true` param — one-line change |
| Sports data (ChatGPT) | Live scores/fixtures/finishes cards | TheSportsDB keyless free tier + fallback chain (stock-skill pattern) |
| Speech-to-text (voice input) | Mic button → transcription (ASR) | Web Speech Recognition API — keyless, browser-native |
| SQLite sandbox | Real SQL execution: `database-scout` + `sql-tutor` run for real | sql.js WASM via CDN (~1 MB) |
| OCR (scanned PDFs + images) | Text extraction from images/scans (completes sarvam-pdf's missing piece) | tesseract.js (~10–15 MB lazy CDN) |
| ffmpeg.wasm media lab (Grok/Mimo) | Trim/convert/extract-audio/video-frames, GIF-from-video | ffmpeg.wasm (~28 MB lazy CDN) — heavier |
| Video embed cards (ChatGPT) | YouTube player cards inside answers | iframe embed — trivial |
| .ics calendar export | Reminders + email events → downloadable calendar files | FILE `.ics` text format — trivial |
| Trello integration (Mimo) | Boards/lists/cards management | User token + Trello REST (CORS-open) |
| R2/S3 artifact upload (Kimi) | Upload generated files to your own cloud storage | User keys + S3 POST (the flow is proven — this app ships via it) |
| TTS audio-file export (Kimi speech-synthesis) | Speak any text → downloadable MP3/WAV | Provider audio API with user key (Web Speech can't export) |
| Vision-input skills (GLM/Mimo-omni-lite) | Attach images → analysis, ui-blueprint full fidelity, image QA | Multimodal provider pass-through (app already has 57+ models incl. vision ones) |
| kimi-slides .pptd pipeline | Higher-fidelity PPTX via intermediate deck format | New FILE[pptx] build stage |
| sarvam-pdf Paged.js engine | Academic-grade PDFs (running heads, TOC, figure numbering) with layout QA gate | Paged.js CDN + print-to-PDF pipeline — medium effort |
| batch-download (Kimi) | Discover + validate + download file sets | Browser fetch — CORS-limited (works for open sources) |
| While-open scheduled tasks | Scheduled searches + conditional triggers while the tab is open | Timer upgrade to reminders/heartbeat — no server, honest limits |

---

## NOT ADDABLE — the 4 hard blockers (for completeness)

1. **Server runtimes** — headless browsers (browse, playwright-scraper, agent-browser, rust-browser-pilot), k8s/kubectl, ab/wrk load tests, cProfile/line_profiler, akshare/Tushare, storage analyzer, local Whisper, sherpa-onnx, video binary decode (video-compare-tool), mimo-omni/voice-clone/voice-design (Xiaomi server models), all Apple/Bear/Things/Obsidian/Notion/tmux/sonos/hue CLIs.
2. **OAuth with registered apps** — Gmail/Outlook/IMAP inboxes, Feishu×4, DingTalk×3, QQ×3, WhatsApp, Slack, Discord, voice calls, X API.
3. **Platform-locked surfaces** — the 14-skill Meta Ads suite, restaurant reservations, structured shopping feeds, cloud file Library.
4. **Background execution** — anything that must fire while the tab is closed: push reminders, detached TaskFlow jobs, cron-delivered reports.

---

## Bottom line

- **~150 addable skills** exist across the repo's catalogs: **~133 Tier-A** (drop-in library skills, most from Kimi's 267-skill collection — ~110 unique concepts after merging EN/CN twins and removing what Manthan already has) + **~17 Tier-B** thin-runtime additions.
- **The single file `index.html` can absorb all of Tier A today** via the existing library-skill system (`SAHU_V80_LIB_SKILLS` array + prompt branches, or MAKESKILL custom skills) — the user's own Manthan_Skills_Assessment.pdf prescribes exactly this path.
- Highest-leverage Tier-B adds in order: **GitHub PAT integration → STT voice input → sql.js sandbox → sports data → transparent images → .ics export → video embeds**.
