# Bug Report — SahuAI-PRO-Lite / Beta/index.html

Reviewed file: `Beta/index.html` (13,865 lines, ~687 KB) at commit `a0974af`.
Line numbers below refer to this file. All JS blocks pass a syntax check (`node --check`), so every bug below is a logic, integration, or design defect — not a parse error.

---

## CRITICAL — broken features & security

### 1. Agent Swarm is completely broken: `setBusy` is out of scope (ReferenceError)
- **Where:** `_sahuRunAgentSwarm()` (line 12708) calls `setBusy(...)` at lines 12717, 12724, 12731 and in the `finally` blocks.
- **Why it's a bug:** `setBusy` is a `const` arrow function declared *inside* `runSearchMode()` (line 11979). `_sahuRunAgentSwarm` is a top-level function — it has no access to that closure variable, and no global `setBusy` or `window.setBusy` exists anywhere in the file.
- **Effect:** every swarm run throws `ReferenceError: setBusy is not defined` immediately, before any worker is spawned. Both call sites (`runSearchMode` lines 12291 and 12324) swallow the error in `try/catch`, so the swarm **silently never runs**. At the second call site the raw `sahu_agents` directive text can remain in the final answer shown to the user.
- **Fix:** pass `setBusy` through the `ctx` object (it already carries `addTrace`) — e.g. `ctx.setBusy('...')` — or hoist a global `setBusy`.

### 2. "Add Custom Provider" crashes: undefined `k` (ReferenceError)
- **Where:** line 6517, inside `addCustomProvider()`:
  `localStorage.setItem(PROVIDERS[k].keyName, key);`
- **Why it's a bug:** there is no `k` in scope in this function (the other `PROVIDERS[k]` usages at 6194/6339 are inside `Object.keys(PROVIDERS).forEach(k => ...)` loops; this one is not).
- **Effect:** clicking **Add Provider** throws `ReferenceError: k is not defined`. The provider was pushed into in-memory `state.customProviders`, but `sahu_custom_providers` is never persisted, the API key is never saved, the provider list is never re-rendered, and the input fields are never cleared. After a page reload the half-added provider vanishes.
- **Fix:** `localStorage.setItem(provider.keyName, key);` (the local `provider` object already has `keyName: sahu_${id}_key`).

### 3. Live NVIDIA API key hardcoded in the source (secret leak)
- **Where:** lines 7346 and 8771–8774:
  `apiKey = 'nvapi-SrudFpxC...M2drZ';`
- **Why it's a bug:** a real API key is committed to a public GitHub repo. It's used as a silent fallback for the "Saksham Intelligence" (nvidia) provider and for Whisper voice transcription, so every user of the deployed page is spending this key's quota.
- **Fix:** remove the key from the code, rotate/revoke it immediately (it must be considered compromised), and require users to enter their own key.

### 4. Deep Research always drops the 6th expert: `stage.id <= 3` compares string to number
- **Where:** lines 9926, 9941, 9976 in `runDeepResearch()`:
  `const numExperts = stage.id <= 3 ? 6 : 5;`
- **Why it's a bug:** `RESEARCH_STAGES` (line 5126) defines `id: 'stage1' … 'stage5'` — **strings**. `'stage1' <= 3` coerces `'stage1'` to `NaN`, so the comparison is always `false`.
- **Effect:**
  - Stages 1–3 are configured with **6 experts** each (line 5126+) but always run with only **5** — the 6th expert (e.g. "Pros Specialist" / "Cons Specialist") is silently dropped.
  - The special role prompt guarded by `stage.id <= 3 && idx === 5` (line 9976) can never fire.
  - The UI label "6 Experts" (line 9926) is never shown; stages 1–3 display "5 Experts".
- **Fix:** use `['stage1','stage2','stage3'].includes(stage.id)` or give stages numeric ids.

### 5. Pin button dies on any answer containing an apostrophe (broken `onclick` injection)
- **Where:** line 9649:
  `<button onclick="togglePin('${escapeHtml(res.content.substring(0, 100))}')">`
- **Why it's a bug:** `escapeHtml` (line 5155) uses the `div.textContent` trick, which escapes `& < >` but **not single quotes or newlines**. Any research answer containing `don't`, `it's`, or a line break inside the first 100 chars produces a JS syntax error inside the `onclick` attribute.
- **Effect:** the pin (thumbtack) button silently does nothing for such messages.
- **Fix:** additionally escape `'` (and `"`), or better, attach the handler via `addEventListener` with the text in a data attribute / closure.

---

## HIGH — significant functional problems

### 6. `init()` is blocked by Pyodide; shared links and shortcuts wait for a ~10 MB download
- **Where:** `init()` (line ~13009): `await initPyodide();` runs **before** `handleSharedConversation()` and `setupKeyboardShortcuts()`.
- **Effect:** opening a shared-conversation link renders nothing until the entire Pyodide WASM runtime has downloaded and booted (Pyodide is only needed for the CALC tool). On slow connections that's tens of seconds of a blank screen for a feature that doesn't need Python at all.
- **Fix:** make `initPyodide()` fire-and-forget (or lazy-load it the first time a CALC runs), and run `handleSharedConversation()` synchronously.

### 7. Export button rows stack up and all export the *last* answer
- **Where:** `.export-buttons` rows are appended after every response in 5 different paths (lines 9665, 10174, 10653, 10758, 12407).
- **Effect:** in a multi-turn chat, a new row of Copy/PDF/DOCX/XLSX/PPTX buttons is appended after every answer, so they accumulate. Because every handler exports `window.lastAnswer` (set at 9627, 10158, 10648, 10722, 12389, 12434), **older rows export the newest answer**, not their own message.
- **Fix:** remove the previous row before appending (or scope the handlers to each message's content).

### 8. Escape key "stops" generation without aborting anything
- **Where:** `handleKeyDown()` (line ~12970): `if (event.key === 'Escape') { state.isProcessing = false; }`
- **Effect:** inconsistent with the Stop button path in `handleDynamicAction()`, which aborts all `AbortController`s. After Escape, streams keep downloading in the background and burn tokens until they finish; the UI just pretends it stopped.
- **Fix:** call the same abort logic, or remove the Escape branch.

### 9. Missing referenced assets (404s)
- `./manifest.json`, `./icon-512.png`, `./icon-192.png` (lines 10–12) — PWA manifest and icons don't exist in the repo → no installability, broken icons.
- `./sahu-moe.apk` (line 3447) — the "Install Android App" settings card is a dead link (404 → downloads GitHub's HTML error page on some hosts).

### 10. Version identity is inconsistent
- `<title>` says **v7.8**, the sidebar shows **"Version 5.0"** (line 2891), the docs modal says **"Version 5.0"** (line 4199), the header comment says **v5.0.0 "index.js ~6,500 lines"** (line 4432), and inline comments reference v6.5 / v7.9.12. Users can't tell what version they run; the docs describe a product several versions old.

---

## MEDIUM — dead code / silent no-ops that look like features

### 11. `checkSafety()` is a placeholder — safety toggles do nothing
- **Where:** lines ~8442+: every branch (`graniteGuard`, `shieldGemma`, `llamaGuard`) is an empty "Would call … Placeholder for implementation" block. The function always returns safe, so any safety-model UI that ever wired into it is decorative.

### 12. 83 empty function stubs ship in production
- **Where:** lines 4306–4421 ("FUNCTION STUBS - IMPLEMENT IN index.js").
- All are overwritten by real implementations in the next script block — except **`loadSettings`**, which exists *only* as a stub and is never implemented or called. The whole block is dead weight and a maintenance trap (a later edit could easily depend on a stub). Delete it.

### 13. Feature flags are permanently false (dead settings)
- `saveSettings()` (lines 6234–6239) reads `neuralConsensusCheck`, `debateModeCheck`, `temporalReasoningCheck`, `adaptiveReasoningCheck`, `uncertaintyBadgeCheck`, `tokenEstimatorCheck`… none of these elements exist in the markup anymore, so every `state.features.*` is always `false` (and line 5255 force-disables them on load anyway). Dead code and misleading persisted state.

### 14. Orphaned settings view: "Response Style" modal view is unreachable
- `#settings-style` (line 4130) exists with five `setResponseStyle` options, but `navigateSettings('style')` is never called from anywhere — no settings card leads to it. (Styles are only reachable via the Tools → "Choose style" popover.)

### 15. Stale `getElementById` references to elements removed in older UIs
- Referenced but non-existent (all guarded with `if`, so no crash, but all dead code): `sendBtn` (10309, 10507, 12976), `deepThinkBtn` (5442), `taskTypeBtn` (5476, 5643), `incognitoBtn` (13131), `thinkingBudget` select (5498, 5698, 6219), `stageSelector` (5677, 6221), `singleModelSelect`/`singleModelSelectContainer` (6107, 6263), `researchStagesConfig` (6122), `selectedModelCount` (7205), `activeModePills` (renderActiveModePills, line 5455+ — deliberate no-op).
- Side effect beyond dead code: `state.stageSelector` is persisted and validated (6227, 8430) but can never be changed from the UI since its control was removed; `saveSettings` reads a `thinkingBudget` select that no longer exists, so the stored budget can silently go stale relative to the pill UI.

### 16. Web Search toggle state is not persisted
- `toggleWebSearchFromMenu()` (line 5465) only shows a toast and calls the no-op `renderActiveModePills()`; the actual state lives only in the `#toolWebSearch` checkbox, read at send time (line 10477). A page reload always resets Web Search to off, unlike DeepThink (persisted via `saveState`). Inconsistent UX rather than broken behavior.

---

## LOW — polish / standards

17. **No `<!DOCTYPE html>`** (line 1 starts directly with `<html>`) — the page renders in quirks mode.
18. **Zoom disabled for accessibility:** `maximum-scale=1.0, user-scalable=no` (line 3) blocks pinch-zoom on mobile.
19. **`openSettings()` on mobile** (line ~5714) calls `toggleSidebar()` unconditionally when width < 768 — if the sidebar was already closed (settings opened some other way), it *opens* it.
20. **formatMarkdown citation rewriting applies inside code blocks** — `[1]`-style text inside fenced code in an answer gets replaced with citation chips, mangling code samples.
21. **Hidden `#modeSelector` select** (line 2947) kept "for compatibility" with `updateMode` — dead markup that still shows up to screen readers unless `hidden` class covers it (it uses Tailwind `hidden`, fine, but it is still dead).
22. **README/repo claims vs. reality:** the file comments say "File: index.js / Lines: ~6,500" — it's a 13.8k-line inline script; comment headers are misleading for future maintainers.

---

## Summary table

| # | Severity | One-liner |
|---|----------|-----------|
| 1 | Critical | Agent Swarm always throws `ReferenceError` (`setBusy` out of scope) and silently never runs |
| 2 | Critical | `addCustomProvider()` uses undefined `k` → ReferenceError, provider never persisted |
| 3 | Critical | Hardcoded live NVIDIA API key committed publicly (2 places) |
| 4 | Critical | `'stage1' <= 3` string-vs-number → Deep Research stages 1–3 always drop their 6th expert |
| 5 | Critical | Pin button `onclick` breaks on apostrophes/newlines (escapeHtml doesn't escape quotes) |
| 6 | High | `await initPyodide()` blocks shared-link rendering and keyboard shortcuts |
| 7 | High | Export button rows accumulate; every row exports the *last* answer |
| 8 | High | Escape key stops UI but never aborts in-flight requests |
| 9 | High | manifest.json / icons / sahu-moe.apk missing → 404s, PWA broken |
| 10 | High | Version shown in three places is inconsistent (7.8 vs 5.0) |
| 11–16 | Medium | Safety check is a no-op; 83 dead stubs; dead feature flags; unreachable settings view; stale element refs; web-search toggle not persisted |
| 17–22 | Low | No doctype; pinch-zoom disabled; sidebar toggle edge case; citation rewrite hits code blocks; dead hidden select; misleading header comments |
