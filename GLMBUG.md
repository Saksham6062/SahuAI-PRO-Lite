# 🐛 Bug Report — Manthan Agent · SahuAI-PRO-Lite / Beta

> **Target file:** [`Beta/index.html`](https://github.com/Saksham6062/SahuAI-PRO-Lite/blob/main/Beta/index.html)
> **Repository:** [`Saksham6062/SahuAI-PRO-Lite`](https://github.com/Saksham6062/SahuAI-PRO-Lite)
> **App identity:** Manthan Agent (SahuAI engine — UI branded "v7.8", engine carries v7.9.12 changes)
> **File stats:** 686,772 bytes · 13,865 lines · MD5 `a0c1ba8b31adbd874bc618bdcd44804a`
> **Analysis date:** 2026-09-23 — analyzed copy verified byte-identical to the live GitHub file at analysis time

---

## 1. Executive Summary

The Beta build is in solid overall shape for a ground-up rewrite. The page boots with **zero JavaScript console errors**, the Pyodide sandbox and speech-input subsystems initialize cleanly, and every major user flow tested — chat, model selection (57+ models, 18+ providers), provider management, DeepThink, search mode with discovery feed, tools menu, docs modal, chat history save/load, theme switching, and mobile layout at 375 px — behaves correctly. The professional design system (Inter/JetBrains Mono, indigo accent, refined surfaces) is intact and renders consistently in both light and dark themes.

That said, the investigation confirmed **7 genuine issues**: one critical crash bug inherited from the original codebase, one high-visibility broken-feature cluster (missing assets), two medium correctness issues, one accessibility violation, and two informational findings. One additional `TypeError` was captured live during testing, but it was traced to the test harness's own malformed model injection and is **not user-reachable** — it is documented under "False alarms" and excluded from the confirmed count.

### Issue overview

| # | Severity | Issue | Primary locations | User-facing impact |
|---|----------|-------|-------------------|--------------------|
| 1 | 🔴 **Critical** | `toggleResearchStage()` is called but never defined | L9714 · L9823 · L9920 | Clicking any Deep Research phase header throws `ReferenceError`; collapse/expand is dead |
| 2 | 🟠 **High** | All 4 locally-referenced assets are missing from `Beta/` (live-verified 404) | L10–L12 · L3447 | PWA install broken, no favicon / apple-touch icon, "Install Android App" card downloads nothing |
| 3 | 🟡 **Medium** | Version mismatch — UI says v7.8, engine contains v7.9.12 changes | L5 · L7 · L13030 vs L727+ | Misleading version in tab title, meta description, toast and logs |
| 4 | 🟡 **Medium** | 5 feature toggles are dead — checkboxes removed, logic kept | L6234–L6247 | Agent Swarm, Neural Consensus, Debate Mode, Adaptive Reasoning, Constitutional Safety can never be enabled |
| 5 | 🟢 **Low** | Dark-mode placeholder contrast 3.24:1 (WCAG AA requires 4.5:1) | L142 + L437/L1212/L1792 | Composer placeholder text hard to read in dark mode |
| 6 | ℹ️ Info | Hardcoded API keys in a public repo (inherited from original) | L6365 · L7346 · L8773 | Free-pool keys exposed to public scraping / quota drain |
| 7 | ℹ️ Info | Legacy `sahu_`/`sahu2_` localStorage keys (28 keys) | throughout JS | None — actually aids migration; documented for completeness |

**Origin classification:** Bugs **#1** and **#6** are **pre-existing** — they exist verbatim in the original `indexv0.1.html` (`toggleResearchStage` is referenced 3× with no definition there too, and the same keys are hardcoded). Bugs **#2–#5** are **introduced by the Beta rewrite** (asset folder layout, version bump, settings-UI trim, new dark palette). This distinction matters: fixing #1 in Beta only would leave the original broken too.

---

## 2. Detailed Findings

### BUG 1 — 🔴 CRITICAL · `toggleResearchStage` is not defined (Deep Research crash)

| Attribute | Detail |
|---|---|
| **Type** | Runtime crash — `ReferenceError` on user click |
| **Origin** | ⚠️ Pre-existing (inherited from original `indexv0.1.html`, same 3 call sites pattern) |
| **Locations** | L9714 (Phase 0 header), L9823 (web-research header), L9920 (generic stage header) |
| **Reachable via** | Chat → Deep Research mode → run a research query → click any phase header |

**Description.** Every Deep Research phase header renders with an inline `onclick="toggleResearchStage('...')"` handler, but a full scan of the file finds **zero definitions** of `toggleResearchStage` — no `function` declaration, no `window.toggleResearchStage =`, no property assignment anywhere. The function was evidently lost during an earlier rewrite of the research pipeline and never restored. Static analysis flags it as the file's only undefined handler among all `onclick`/`onchange` references.

**Code evidence** (L9713–L9721):

```html
<div class="research-stage active" id="${phase0Id}">
    <div class="research-header" onclick="toggleResearchStage('${phase0Id}')">
        <span class="flex items-center gap-2">
            <i class="fas fa-users text-blue-500"></i>
            Phase 0: Initial Consensus (${activeModels.length} Models)
        </span>
        <span class="text-[10px] bg-[var(--bg-tertiary)] px-2 py-1 rounded">Mass Generation</span>
    </div>
    <div class="research-content" id="content-${phase0Id}" style="display:block;">
```

**Impact.** The moment a user clicks a phase header to collapse or expand a stage (a natural action — research runs are long and scrolling past 6 model panels is common), the click throws `ReferenceError: toggleResearchStage is not defined` in the console. The stage never collapses, so the UI silently "ignores" the click. Because the throw happens inside an inline handler, it does **not** abort the running research stream — but the collapse/expand affordance is completely dead, and console noise accumulates with every click.

**Recommended fix** (drop-in, ~7 lines — the DOM structure at all 3 call sites pairs each stage with a `content-${id}` sibling):

```javascript
function toggleResearchStage(stageId) {
    const content = document.getElementById('content-' + stageId);
    if (!content) return;
    const stage = document.getElementById(stageId);
    const willCollapse = content.style.display !== 'none';
    content.style.display = willCollapse ? 'none' : 'block';
    if (stage) stage.classList.toggle('collapsed', willCollapse);
}
```

Place it anywhere in the global scope (e.g., near the other research helpers). Optionally add a `.research-stage.collapsed .research-header { opacity: .7 }` rule for visual feedback. **Also apply the same fix to the original repo's `indexv0.1.html`**, where the bug originated.

---

### BUG 2 — 🟠 HIGH · All 4 locally-referenced assets are missing from `Beta/` (404)

| Attribute | Detail |
|---|---|
| **Type** | Broken references — resource 404s (live-verified over HTTP) |
| **Origin** | Introduced by Beta (Beta folder contains only `index.html`; the original SahuAI repo root has `manifest.json` + `icon-512.png`) |
| **Locations** | L10 (`manifest.json`), L11 (`icon-512.png`), L12 (`icon-192.png`), L3447 (`sahu-moe.apk`) |

**Description.** The `<head>` references three local assets with relative paths, and the Settings → Install section links a fourth. The `Beta/` directory contains **only** `index.html`, so every one of these resolves to a GitHub 404 page. This was verified live with direct HTTP checks — all four URLs return 404.

```html
<link rel="manifest" href="./manifest.json">                          <!-- L10 → 404 -->
<link rel="icon" type="image/png" href="./icon-512.png">              <!-- L11 → 404 -->
<link rel="apple-touch-icon" href="./icon-192.png">                   <!-- L12 → 404 -->
...
<a href="./sahu-moe.apk" download="" class="settings-card">…          <!-- L3447 → 404 -->
```

**Impact — four separate symptoms from one root cause:**

1. **No favicon** — the browser tab shows a blank/generic icon instead of the brand mark.
2. **PWA install broken** — Chrome requires a fetchable, valid `manifest.json` (with icons) before it offers "Install app". With a 404 manifest, the app can never be installed as a PWA and `beforeinstallprompt` will not fire.
3. **Add-to-home-screen / iOS bookmark icon broken** — `apple-touch-icon` 404 means iOS saves a screenshot tile instead of the brand icon.
4. **"Install Android App" card downloads nothing** — the green Android card in Settings links `./sahu-moe.apk` with the `download` attribute. Tapping it "downloads" GitHub's 404 HTML page saved as `sahu-moe.apk` — a corrupt file that cannot be installed. This is a visible, trust-damaging failure on a prominent settings card.

**Recommended fix — pick one:**

- **Option A (best):** Copy `manifest.json`, `icon-512.png`, `icon-192.png` and `sahu-moe.apk` into `Beta/` (the original SahuAI repo root already has `manifest.json` and `icon-512.png`; they can be reused directly).
- **Option B:** Rewire the three `<head>` refs to the repo root (`../manifest.json`, `../icon-512.png`, `../icon-192.png`) if you add the assets there.
- **Option C:** If the APK is not ready to ship, remove or hide the "Install Android App" card (L3447) rather than shipping a dead download.

---

### BUG 3 — 🟡 MEDIUM · Version mismatch — UI says "v7.8", engine contains v7.9.12 changes

| Attribute | Detail |
|---|---|
| **Type** | Correctness / release hygiene |
| **Origin** | Introduced by Beta (incomplete version bump) |
| **Locations** | v7.8: L5, L7, L12986, L13029, L13030, L13148 · v7.9.12: L727, L746, L2595, L5480, L5620, L13699 |

**Description.** The user-facing identity strings all say **v7.8** — the meta description (L5), the `<title>` (L7), the boot console logs (L12986 `🚀 Manthan Agent v7.8 Initializing...`, L13029 `✅ Manthan Agent v7.8 Ready`), the on-load toast (L13030 `Manthan Agent v7.8 Loaded`), and the `document.title` reset (L13148). Meanwhile the code itself contains **43 references to v7.9.x**, including six substantive `v7.9.12` change markers (e.g., L5480 *"v7.9.12: a user-set OFF is authoritative — mode switches and app…"*, L5620 *"v7.9.12: the pill must truly disable thinking"*, L13699 *"v7.9 CONTEXTUAL HEADER ACTION"*). The Beta is therefore running v7.9.12 behavior behind a v7.8 nameplate.

**Impact.** Anyone debugging a user report ("what version are you on?"), filing issues, or diffing releases will get the wrong answer from the title bar and toast. It also makes changelogs ambiguous — behavior introduced in v7.9.12 (e.g., the authoritative thinking-OFF semantics) is attributed to v7.8.

**Recommended fix.** Introduce a single source of truth and template every surface from it:

```javascript
const APP_NAME = 'Manthan Agent';
const APP_VERSION = '7.9.12';
const APP_TITLE = `${APP_NAME} v${APP_VERSION} - Official Saksham Intelligence AI Models Chat`;
// then use APP_TITLE in <title>, meta description, toast, console logs, document.title
```

That prevents the next bump from re-introducing the same drift (v7.8 already appears in 8 places — this is the second time the version has forked inside one file).

---

### BUG 4 — 🟡 MEDIUM · Five feature toggles are dead — checkboxes removed, state logic kept

| Attribute | Detail |
|---|---|
| **Type** | Silent feature loss (no crash — optional chaining masks it) |
| **Origin** | Introduced by Beta (settings UI was trimmed; JS not updated) |
| **Locations** | Reads at L6234, L6235, L6237, L6244, L6247 (inside the settings-save routine) |

**Description.** The settings-save routine still reads five feature checkboxes that **no longer exist in the HTML**. An ID scan of the document confirms `neuralConsensusCheck`, `debateModeCheck`, `adaptiveReasoningCheck`, `agentSwarmCheck` and `constitutionalSafetyCheck` are all absent. Because each read uses optional chaining with a false fallback, nothing crashes — the flags are simply persisted as `false` forever:

```javascript
state.features.neuralConsensus   = document.getElementById('neuralConsensusCheck')?.checked   ?? false;  // L6234
state.features.debateMode        = document.getElementById('debateModeCheck')?.checked        ?? false;  // L6235
state.features.adaptiveReasoning = document.getElementById('adaptiveReasoningCheck')?.checked ?? false;  // L6237
state.features.agentSwarm        = document.getElementById('agentSwarmCheck')?.checked        ?? false;  // L6244
state.features.constitutionalSafety = document.getElementById('constitutionalSafetyCheck')?.checked ?? false; // L6247
localStorage.setItem('sahu2_features', JSON.stringify(state.features));
```

Note that the *other* toggles in the same block (`temporalReasoningCheck`, `uncertaintyBadgeCheck`, `tokenEstimatorCheck`, `responseRatingCheck`, `threeTierMemoryCheck`, `selfCorrectingCodeCheck`, `usageAnalyticsCheck`, `rapidLearningCheck`, `physicalIntegrationCheck`) **do** have checkboxes — only these five were cut from the settings view, which suggests an accidental trim rather than a deliberate deprecation.

**Impact.** Five advertised capabilities — **Agent Swarm, Neural Consensus, Debate Mode, Adaptive Reasoning, Constitutional Safety** — can never be enabled by a user. The meta description (L5) still promotes the app with *"unlimited agent-swarm skill"*, making this a flagship feature that is unreachable through the UI. The only workaround is manually editing `sahu2_features` in localStorage via DevTools, which no ordinary user will discover. The silent `?? false` pattern is the worst part: there is no error, no warning, just a permanently missing feature.

**Recommended fix — pick one:**

- **Restore the five checkbox rows** in the Settings → Features view (copy the markup pattern from the original `indexv0.1.html`, which has all of them), or
- **Delete the five dead reads** (and their consumers in the pipeline) if the features are intentionally retired — and remove "agent-swarm" from the meta description.

---

### BUG 5 — 🟢 LOW · Dark-mode placeholder contrast is 3.24:1 (WCAG AA requires 4.5:1)

| Attribute | Detail |
|---|---|
| **Type** | Accessibility — contrast violation |
| **Origin** | Introduced by Beta (new dark palette sets `--text-muted` darker) |
| **Locations** | `--text-muted: #5d6879` at L142 (dark theme); applied to placeholders at L437, L1212, L1792 |

**Description.** All placeholder pseudo-elements use the muted text token:

```css
.input::placeholder          { color: var(--text-muted); }   /* L437  */
.input-textarea::placeholder { color: var(--text-muted); }   /* L1212 */
.history-search-input::placeholder { color: var(--text-muted); } /* L1792 */
```

In dark mode `--text-muted` is `#5d6879` (L142). Measured against the composer surface `#11151d` (L137), the contrast ratio is **3.24:1**; against the page background `#0b0e13` it is 3.43:1. WCAG 2.1 AA requires **4.5:1** for normal-size text, and placeholder text is small. (The light theme passes comfortably — this is dark-mode only.)

**Impact.** The composer hint ("Ask anything…", "Message Manthan…") and the history-search placeholder are noticeably faint in dark mode — measurable, not just aesthetic. Users with low vision or on dim screens may miss the prompt entirely.

**Recommended fix.** Either introduce a dedicated placeholder token or nudge the dark muted value. Measured candidates against `#11151d`:

| Candidate | Contrast | Verdict |
|---|---|---|
| `#74808f` | 4.55:1 | Minimum pass |
| `#7c8899` | 5.08:1 | ✅ Recommended — comfortable pass, still visually muted |
| `#8494a6` | 5.89:1 | Extra headroom, slightly brighter feel |

```css
body.dark-mode { --text-muted: #7c8899; }   /* or add --placeholder used only by ::placeholder */
```

---

### BUG 6 — ℹ️ INFO · Hardcoded API keys in a public repository (inherited)

| Attribute | Detail |
|---|---|
| **Type** | Security exposure — intentional free-pool keys, but public |
| **Origin** | Pre-existing (identical in original `indexv0.1.html`) |
| **Locations** | L6365 (`sk-tinyfish-…`), L7346 and L8773 (same `nvapi-…` NVIDIA key twice) |

**Description.** Two provider keys ship inside the client-side source: a TinyFish key (L6365) and an NVIDIA `nvapi-` key used as the fallback when the user has not saved their own (`localStorage.getItem('sahu_nvidia_key') || 'nvapi-Srud…'`, L7346; hardcoded again at L8773). Since the repository is public, anyone can extract these keys with a single GitHub search, and they are also visible in DevTools to every visitor at runtime.

**Impact.** These appear to be deliberately shared free-pool keys (the app is designed to work out-of-the-box), so this is informational rather than a critical leak. The real risks are quota exhaustion by third parties, provider ToS exposure, and the inability to rotate without shipping a new commit. If either key ever gets rate-limited or revoked, every fresh visitor of the app degrades simultaneously.

**Recommended mitigation (optional, in order of strength):** route model calls through a tiny proxy that holds the keys server-side; or keep the free pool but accept rotation churn; or at minimum document in the README that these are shared community keys with no uptime guarantee.

---

### BUG 7 — ℹ️ INFO · Legacy `sahu_` / `sahu2_` localStorage keys (28 keys)

| Attribute | Detail |
|---|---|
| **Type** | Cosmetic / naming consistency — **not a defect** |
| **Origin** | Inherited by design (Manthan reuses the SahuAI storage schema) |
| **Locations** | 28 keys throughout the JS (14 `sahu2_*`, 14 `sahu_*`) |

**Description.** The full storage inventory: `sahu2_aggregation_style`, `sahu2_custom_instructions`, `sahu2_features`, `sahu2_max_tokens`, `sahu2_pinned`, `sahu2_research_config`, `sahu2_temp`, `sahu2_thinking_budget`, `sahu_active_providers`, `sahu_auto_fallback`, `sahu_chat_history`, `sahu_custom_engines`, `sahu_custom_providers`, `sahu_language`, `sahu_model_response_counts`, `sahu_nvidia_key`, `sahu_prompt_refiner`, `sahu_safety_models`, `sahu_search_engines`, `sahu_selected_models` (plus a few singletons like `sahu_stage_selector`).

**Impact: none — this is actually beneficial.** Keeping the old schema means a user who previously ran SahuAI opens Manthan and *all their chats, providers, custom engines and settings carry over automatically*. The 9 remaining `SahuAI` string references in the code are the Android WebView JS bridge (`window.SahuAI` / SahusIntelligence integration) — those **must** stay for the APK shell to keep working. No action needed; documented only so a future rename effort knows the storage layer is load-bearing for migration.

---

## 3. Verified Working (Coverage)

To bound the report: everything below was exercised in a real browser session and passed. The Beta's problems are the seven listed above — not a general instability.

| Area | Result |
|---|---|
| Boot / initialization | ✅ Zero console errors; Pyodide sandbox and speech-input init succeed |
| Chat send/receive, streaming, abort | ✅ Works (tested against live providers) |
| Model selector (57+ models, 18+ providers) | ✅ Opens, filters, selects, persists |
| Provider management view | ✅ Add/enable/disable, custom providers |
| DeepThink toggle + thinking-budget pill | ✅ Toggles correctly, budget persists |
| Tools menu (MCP) | ✅ Opens, real-click verified (document-level closer behaves) |
| Search mode + discovery feed | ✅ Search view + engines settings render and function |
| Settings modal — all 7 views | ✅ General, Models, Providers, Search, Features, Docs, About |
| Docs modal | ✅ Renders |
| Style popover (aggregation) | ✅ Opens, no transparency/clipping issues |
| New chat, history save/load, pinned chats | ✅ Round-trips through localStorage |
| Header contextual action button | ✅ Visible and functional |
| Theme toggle (light ↔ dark) | ✅ Smooth, no unreadable regions |
| Mobile viewport 375 px | ✅ Sidebar drawers, composer, settings all usable |
| Welcome screen / hero | ✅ The v0.1 black-on-black brand bug is **not** present in Beta (already fixed) |

---

## 4. False Alarms Investigated and Dismissed

These findings from static analysis were **deliberately investigated and ruled out**, so nobody re-litigates them later:

1. **7 "duplicate IDs"** (`conf_${configKey}`, `${previewId}`, `${divId}`, `status-${divId}`, `stream-${divId}`, `content-${divId}`, `root`) — all are template-literal *strings* inside generated markup, not literal HTML attributes. No real duplication.
2. **48 "CSS classes used but undefined"** — Tailwind utility classes (`text-red-500`, `check-circle`…) inside JS template literals. The Tailwind v3.4.17 runtime stylesheet is embedded at L2874 and covers them.
3. **10 dangling JS→ID references** (`deepThinkBtn`, `incognitoBtn`, `clearHistoryConfirm`, `connectorsPopover`, `btn-install`, `btn-config-models`, `autoFallback`, `asrModelSelect`, `activeModePills`, `aggregationStyle`) — dead code in guarded (`if (el)`) or unreachable branches. Full runtime walkthrough confirms no crash; DeepThink works via its actual wired handler.
4. **Six visual suspicions from screenshot review** (popover transparency, modal clipping, missing placeholder, mobile layout, settings overflow, Pollinations card rendering) — each cross-checked with DOM geometry measurements and cleared.
5. **A live `…includes is not a function` TypeError** captured during model-call testing — traced to the *test harness's own* malformed model injection, not user-reachable code.
6. **A 404 on a model API endpoint** during testing — expected: a fake model ID was used; the error path handles it gracefully with a fallback message.

---

## 5. Recommended Fix Order

Prioritized by user impact ÷ effort:

| Priority | Fix | Effort | Unblocks |
|---|---|---|---|
| 1 | Add `toggleResearchStage()` (BUG 1) — and port to the original repo | ~10 min | Deep Research collapse/expand; removes console errors |
| 2 | Ship the 4 assets into `Beta/` or rewire paths (BUG 2) | ~15 min | Favicon, PWA install, Android APK download |
| 3 | Restore the 5 feature checkboxes (BUG 4) | ~30 min | Agent Swarm & four other advertised features |
| 4 | Single-source `APP_VERSION` (BUG 3) | ~15 min | Correct version everywhere, future-proof |
| 5 | Dark `--text-muted` → `#7c8899` (BUG 5) | ~5 min | WCAG AA pass |
| 6 | (Optional) Key handling policy (BUG 6) | varies | Long-term quota/ToS safety |

Items 1, 2 and 5 are all under 15 minutes each — a single "bugfix" commit could clear every crash, every 404, and the a11y violation in one pass.

---

## 6. Methodology

- **Static analysis** — custom scanner (`analyze_beta.py`): element-ID cross-reference (HTML ↔ JS), `onclick`/`onchange` handler resolution, duplicate-ID detection, version/branding string inventory, CSS class definition check, localStorage key inventory, and local-asset reference extraction.
- **Runtime testing** — headless Chromium (agent-browser): boot with console capture, then 20+ scripted interactions spanning chat, settings (all 7 views), tools, search mode, history, theming; repeated at desktop and 375 px mobile widths; light and dark.
- **Visual review** — 16 screenshots reviewed by VLM, with every suspicion re-verified against measured DOM geometry before being accepted or dismissed.
- **Network verification** — direct HTTP status checks on every referenced local asset; error-stack capture via monkey-patched `callModelWithFallback`.
- **Differential analysis** — 7,959-line diff against the original `indexv0.1.html` to classify each bug as pre-existing vs. introduced by the Beta rewrite.

## 7. Appendix — Evidence Artifacts

The following artifacts were produced in the analysis environment during this audit (not committed to this repo; screenshots and the scanner script can be shared on request):

| Artifact | Contents |
|---|---|
| `scripts/analyze_beta.py` | The static-analysis scanner (re-runnable) |
| `scripts/beta-index.html` | Byte-identical analyzed copy (MD5 `a0c1ba…04a`) |
| `scripts/beta-diff.txt` | Full diff vs. original `indexv0.1.html` |
| `scripts/beta-light.png` / `beta-dark.png` | Boot states, both themes |
| `scripts/beta-chat.png`, `beta-chat2.png` | Chat flows incl. streaming |
| `scripts/beta-settings.png`, `beta-providers.png`, `beta-models.png`, `beta-skills.png` | Settings views |
| `scripts/beta-search.png`, `beta-searchview.png` | Search mode + discovery feed |
| `scripts/beta-tools.png`, `beta-style.png`, `beta-docs.png`, `beta-sidebar.png` | Tools menu, style popover, docs, sidebar |
| `scripts/beta-mobile.png`, `beta-mobile2.png` | 375 px mobile layouts |
| `scripts/beta-dark-toggle.png`, `beta-keys.png` | Theme toggle; key locations in source |
