# SahuAI-PRO-Lite Beta — Bug Audit Report

**Repository:** `Saksham6062/SahuAI-PRO-Lite`  
**File audited:** `Beta/index.html`  
**Scope:** Static code/configuration audit of the current Beta build.

## Executive Summary

The Beta build contains several concrete bugs and configuration problems. The JavaScript has no syntax errors, so the main issues are runtime handlers, missing assets, stale UI/state references, provider configuration, and exposed credentials.

### Priority Summary

| Priority | Issue | Impact |
|---|---|---|
| 🔴 Critical | Exposed API credentials | Security / quota abuse |
| 🔴 Critical | `toggleResearchStage()` missing | Deep Research UI errors |
| 🔴 Critical | Z.ai endpoint typo | Provider requests fail |
| 🟠 High | Ollama Devstral model ID malformed | Model selection/request failure |
| 🟠 High | Missing PWA/APK assets | PWA/install/download features broken |
| 🟠 High | Hidden feature settings still referenced | Settings/state inconsistencies |
| 🟡 Medium | Version mismatch | Debugging/release confusion |
| 🟡 Medium | Hidden settings can reset on save | State corruption |
| 🟡 Medium | `max_tokens` not model/provider-aware | Request failures |
| 🟢 Low | Dark-mode placeholder contrast | Accessibility |

---

## 1. 🔴 Missing `toggleResearchStage()`

Deep Research markup generates calls to:

```js
toggleResearchStage(...)
```

but there is no corresponding function definition.

### Effect

Clicking a Deep Research stage/phase header can produce:

```text
ReferenceError: toggleResearchStage is not defined
```

### Suggested fix

```js
function toggleResearchStage(stageId) {
    const content = document.getElementById('content-' + stageId);
    if (!content) return;

    const collapsed = content.style.display !== 'none';
    content.style.display = collapsed ? 'none' : 'block';

    const stage = document.getElementById(stageId);
    if (stage) stage.classList.toggle('collapsed', collapsed);
}
```

---

## 2. 🔐 Exposed API Credentials

The frontend contains hardcoded provider credentials, including NVIDIA and TinyFish credentials.

### Why this is dangerous

Anything embedded in public client-side HTML/JavaScript can be extracted by anyone.

Potential consequences:

- Unauthorized API usage
- Quota exhaustion
- Unexpected billing
- Credential abuse
- Need to rotate compromised keys

### Required action

1. Revoke/rotate the exposed keys immediately.
2. Remove them from the repository.
3. Do not put replacement secrets in `index.html`.
4. Put privileged API calls behind a server/worker.
5. Use frontend-safe credentials only where the provider explicitly supports them.

---

## 3. 🔴 Z.ai Endpoint Typo

The provider configuration contains:

```js
https://api.z.ai/api/pass/v4/chat/completions
```

The expected path is:

```js
https://api.z.ai/api/paas/v4/chat/completions
```

### Effect

Requests to the current endpoint can return 404/fail before reaching the intended API.

---

## 4. 🟠 Malformed Ollama Devstral Model ID

Current configuration contains:

```text
devstral-small-2::24b-cloud
```

There are two colons.

Expected model identifier:

```text
devstral-small-2:24b-cloud
```

### Effect

Ollama may report that the model does not exist or fail to resolve it.

---

## 5. 🟠 Missing Beta Assets

The `Beta/` directory currently does not contain the local assets referenced by the HTML.

Referenced functionality includes:

- `manifest.json`
- PWA icons
- Android APK download asset
- favicon/touch-icon resources

### Effects

- 404 requests
- Broken favicon
- PWA installation unavailable/broken
- APK download/install card broken

### Fix

Either:

1. Add the referenced files to `Beta/`, or
2. Change the paths to valid hosted assets.

---

## 6. 🟠 Five Feature Controls Are Missing

JavaScript still references feature controls such as:

```text
neuralConsensusCheck
debateModeCheck
adaptiveReasoningCheck
agentSwarmCheck
constitutionalSafetyCheck
```

but those controls are absent from the current HTML.

### Effect

The UI cannot enable/configure these features even though related code remains.

Some settings may silently resolve to `false`.

### Fix

Choose one:

- Restore the missing UI controls, or
- Remove the obsolete JavaScript/state handling.

---

## 7. 🟡 Version Mismatch

The UI contains v7.8 branding while source code contains v7.9.x / v7.9.12 references.

### Effect

Users and developers cannot reliably identify the running build.

This complicates:

- Bug reports
- Debugging
- Release tracking
- Cache/version diagnosis

### Recommended architecture

```js
const APP_VERSION = '7.9.12';
```

Use that single value everywhere.

---

## 8. 🟡 Hidden Settings Can Be Reset

Several settings are read using patterns equivalent to:

```js
document.getElementById('someSetting')?.checked ?? false
```

If the UI control has been removed, saving settings can overwrite the existing state with the fallback value.

### Effect

A user can open/save settings and unintentionally change settings that are no longer represented in the UI.

### Fix

Only update state when the corresponding control actually exists:

```js
const el = document.getElementById('someSetting');

if (el) {
    state.features.someSetting = el.checked;
}
```

---

## 9. 🟡 `max_tokens` Is Not Provider/Model Aware

The application can request very large output limits, potentially up to:

```text
64,000 tokens
```

The same general setting can then be passed to different providers/models.

### Effect

Some providers/models may reject the request because the requested output limit exceeds their capabilities.

### Fix

Store model-specific limits:

```js
const maxTokens = Math.min(
    requestedMaxTokens,
    modelConfig.maxOutputTokens
);
```

Also account for provider-specific API constraints.

---

## 10. 🟢 Dark Mode Placeholder Contrast

Dark mode uses a relatively dim muted-text color for placeholders.

Current value is approximately:

```css
--text-muted: #5d6879;
```

This can fall below the recommended WCAG AA contrast target for normal text.

### Suggested improvement

Use a lighter muted color in dark mode, for example:

```css
.dark-mode {
    --text-muted: #7c8899;
}
```

---

# Recommended Fix Order

## Immediate

1. Rotate exposed API keys.
2. Remove all secrets from the public frontend.
3. Add `toggleResearchStage()`.
4. Correct the Z.ai endpoint.
5. Correct the Devstral Ollama model ID.

## Next

6. Restore or remove missing PWA/APK assets.
7. Restore/remove the five missing feature controls.
8. Prevent nonexistent settings controls from overwriting state.
9. Add provider/model-specific token limits.
10. Centralize application versioning.

## Polish

11. Improve dark-mode placeholder contrast.
12. Remove obsolete/dead settings code.
13. Add automated static checks to CI.
14. Add browser smoke tests for major UI workflows.

---

# Validation Performed

The audit included:

- HTML/JavaScript source inspection
- JavaScript syntax validation
- DOM ID/reference analysis
- Function-definition checks
- Provider endpoint inspection
- Model identifier inspection
- Local asset reference inspection
- Storage/state handling inspection
- Existing Beta bug report review

### Important Result

The inline JavaScript **parses successfully**. The primary problems are therefore not general syntax corruption but concrete runtime/configuration/security issues.

---

# Final Assessment

The Beta build is structurally functional but should not be considered release-ready until the security and provider configuration issues are fixed.

### Highest-impact fixes

**Security:** remove/rotate exposed credentials  
**Runtime:** implement `toggleResearchStage()`  
**Provider:** fix Z.ai endpoint  
**Model:** fix Devstral model ID  
**Distribution:** restore missing PWA/APK assets  
**State:** clean up removed feature controls and settings persistence

