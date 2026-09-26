# Manthan Agent v9.18 — Fix Wave 2

User-reported fixes on top of v9.17, all verified end-to-end (14/14 harness tests, live network E2E, VLM visual QA, zero console errors).

## 1. Image generation hardened (the "stuck at seed 123456" bug)

**Root cause** (reproduced live): the free Pollinations tier now randomly fails with HTTP 500 (upstream `429 Per-user limit of 300 RPM exceeded`), and the old model roster is retired — `GET /models` returns only `["sana"]`; `model=flux/turbo/...` are silently remapped server-side. The old image loader tried **exactly once** with **no timeout**, so any transient 500 left a dead card showing only the prompt and "seed 123456". A 5-request probe failed 1 in 5 times — this was a guaranteed failure mode, not a fluke.

**Fixes:**
- New hardened loader (`window.__V918.loadImgCard`): **4 attempts** with 2s/4s/8s backoff, fresh seed per retry, per-attempt timeouts (50–75s), the `model` param dropped from attempt 3 so the provider default serves it, and a final plain-`<img>` fallback.
- The image **blob is cached** on the card → "Download PNG" is instant (no re-fetch).
- Final failure now shows an honest error **plus a Retry button** (the old UI just said "ask the model to regenerate").
- A **2-slot global queue** serializes parallel image fetches so multi-image replies don't trip the anonymous per-IP concurrency limits.
- Default `model` → `sana` (the only live backend); GIF frame retries raised 3 → 4 with growing backoff.

**Directive tolerance** (why some replies showed raw `seed:123456` text and no image):
- Models sometimes wrap `IMG:` inside \`\`\` fences — the base extractor strips fences *before* line-matching, so the directive vanished. Fence contents are now re-scanned and fire-and-forget directives (IMG / IMGSEARCH / SPEAK / gifplan) recovered; SQL stays fence-inert.
- Models also write flags unbracketed (`a fox | seed:123456`). The flag parser now accepts `key: value` / `key=value` for known keys with validated values (seed/w/h/fps/rate/pitch numbers, an allowlisted model set, true/false booleans) and strips the junk from the image prompt.
- The prompt now teaches the directive as "a PLAIN TEXT LINE, never inside a code fence".

## 2. Model-aware effort (user directive: any GLM → max; Kimi K3 / DeepSeek V4.x → off)

**Root cause:** effort was one *global* `state.thinkingBudget` — the auto-detector only knew `glm-4.5|glm-5` (so GLM 4.6/4.7 and `zai-org/GLM-*` ids resolved to **off**), the v9.17 `budgetUserSet` lock meant switching models never re-synced the pills, and every request in a multi-model run inherited the same stale budget.

**Fixes:**
- New per-request resolver `window._sahuResolveEffort(modelId, userPick)` wired into `callModelWithFallback` (prompt effort line, payload params, thinking passthrough, token floor):
  - **ANY GLM model → max** (effort prompt line + raised token ceiling; `thinking.type=enabled` on Z.ai; `enable_thinking=true` on NVIDIA/HF/SambaNova — matcher broadened to any `glm` id).
  - **Plain instruct models (Kimi K3, DeepSeek V4.x, Llama, Gemma, Nemotron, Sarvam, ...) → off** — no reasoning params, prompt says THINKING: OFF.
  - Reasoning families keep the ladder (R1/QwQ/Kimi-K2-Thinking/Qwen3-Thinking → max; o1/o3/GPT-5/GPT-oss/Gemini 2.5+/Grok-3/4/Claude-4/5 → high; *thinking/reasoner* hints → medium), and an explicit pill pick still wins for those.
- The effort token floor is now capped at the model's configured `max_tokens` (no more silently requesting 64k from a 30k model).
- `autoDetectThinkingBudget` delegates to the resolver → the pills/toggle re-sync on **every model pick** (GLM → Max shown, Kimi K3 → Off shown).
- Boot syncs the effort UI to the primary model.
- Lock UX: for GLM models the pills/toggle are pinned to Max and for plain models to Off, with an explanatory toast ("GLM models always think at Max effort" / "... has no reasoning effort — Thinking stays Off").

## 3. "DeepThink" renamed to "Thinking"

Tools-menu label, comment, and all toasts. Internal ids (`toolDeepThinkNew`, `deepthinkBudgetRow`, `toggleDeepThink*`) unchanged — zero breakage.

## Verification (14/14 PASS, 0 console errors)

| Test | Result |
|---|---|
| boot.v918 (version, wraps active) | PASS |
| labels.thinking (menu shows Thinking, no DeepThink) | PASS |
| effort.resolver — 20-model table (glm*=max, kimi-k3/ds-v4*=off, ladder intact) | PASS |
| effort.autodetect (pills/toggle follow each model pick) | PASS |
| effort.lock (GLM pinned max, plain pinned off, effort-class adjustable) | PASS |
| effort.payload — **6 live request bodies** via stubbed fetch: GLM `enable_thinking=true` + MAX prompt, Kimi K3/DeepSeek V4 THINKING: OFF with no kwargs, GLM max overrides a low pick, gpt-oss honors the pick, zai GLM `thinking.type=enabled` | PASS |
| img.parse-flags (unbracketed seed/model forms, no prose false-positives) | PASS |
| img.fence-recovery (fenced IMG recovered, dedupe, SQL stays inert) | PASS |
| img.teaching (sana + fence warning in prompts) | PASS |
| **img.live-render — real Pollinations image through the hardened loader** (24KB blob cached, buttons, seed footer) | PASS |
| img.retry-path (unreachable URL → exactly 4 attempts → Retry button, gate released) | PASS |
| gif.retries (4x) | PASS |
| effort.boot-sync | PASS |
| console.errors | PASS (none) |

Live endpoint evidence during diagnosis: `model=flux` → HTTP 500 (upstream 429, remapped to `sana` internally); same prompt seconds later → 200; 5-request probe → 1×500. `GET /models` → `["sana"]`.

## Rollback

`git revert` the v9.18 commit (index.html + this file). v9.17 preserved in history.
