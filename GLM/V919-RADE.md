# v9.19 — Reasoning Auto-Detect Engine (RADE)

**Problem (user report):** the effort setting was the same mechanism Manthan always had —
hardcoded rules (v9.18: GLM=max locked, "plain" models=off locked). "It's the problem,
not a solution. Set it in a way that it DETECTS the reasoning/thinking/effort of every model."

**Solution (v9.19):** a 4-layer detection engine. Nothing is hardcoded per user anymore —
the app *discovers* each model's capability and speaks the endpoint's native dialect.

## The 4 detection layers

| Layer | What it does | Source |
|---|---|---|
| 1. CATALOG | Live probe of OpenRouter's public `/api/v1/models`: every model's `supported_parameters` (`reasoning` / `reasoning_effort`) — cached 24 h in localStorage, matched by full id **and** last path segment so twin ids on other providers match too | Live network (748 models learned in verification) |
| 2. BUILTIN | Curated per-family knowledge: GLM → Z.ai `thinking` switch (default **Max**); always-on reasoners (R1, chimera, QwQ, `*-thinking`, MiniMax-M, Kimi-K2-Thinking…) → no switch, effort rides the prompt ladder; effort-ladder models (o1/o3/o4-mini, GPT-5/6, GPT-OSS, Gemini 2.5+/3, Grok 3/4, Claude 4/5+) → `reasoning_effort`; hybrid-switch models (Qwen3, Nemotron, Kimi-K2.5) → `chat_template_kwargs.enable_thinking`; **Kimi K3 / DeepSeek V3/V4 / Llama / Gemma / Mistral… → no reasoning switch → Thinking Off** (user directive, confirmed: these expose no switch at their hosts) | App code |
| 3. LIVE | Every real response is observed: `reasoning_content`/`reasoning` deltas (or `…` blocks) → the model is confirmed thinking ("confirmed live" badge); 3 consecutive silent runs on a hybrid switch → the param is downgraded as wrong for that model | Every request |
| 4. PROBE (self-heal) | If a thinking param is rejected (400/422 "unknown/unsupported parameter"), the request is retried ONCE without it and the rejection is **remembered per model+provider** — the app learns each endpoint's real dialect by experiment | On failure |

## What changed for the user

- **No more locks.** v9.18 pinned GLM pills to Max and plain models to Off. v9.19: detection
  sets each model's *default* (GLM → Max, effort models → High, hybrid → Medium, non-reasoners → Off),
  and the pills stay **free** for capable models.
- **Explicit picks are remembered PER MODEL** (not one global budget bleeding across models).
  Switch away and back — your pick is restored.
- **Non-reasoners politely refuse** ("Kimi K3 has no reasoning switch — Thinking stays Off"),
  pills dimmed, instead of silently pretending.
- **The Thinking menu shows the detected state** of the current model:
  `✔ glm-4.6 — reasoning detected: GLM hybrid thinking (Z.ai switch) · confirmed live · Effort MAX`
  or `✘ kimi-k3 — instruct model - no reasoning switch · Thinking stays OFF`.
- **Bug fix:** Gemini with Thinking Off no longer sends the invalid `reasoning_effort: "none"`
  (v9.18 regression); it now sends nothing + the THINKING: OFF prompt line.
- Correct native dialect per provider: Z.ai `thinking.type` / vLLM hosts
  `chat_template_kwargs.enable_thinking` / OpenRouter unified `reasoning` / OpenAI-standard
  `reasoning_effort` / Groq qwen3 `reasoning_effort:"none"` for off.

## Verification (14/14 pass, 0 console errors)

- 23-model detection table (GLM=max, Kimi K3 & DeepSeek V4=off, R1=always, Qwen3=hybrid, o3/GPT-5/Gemini/GPT-OSS=effort, unknown→no signal, name-hint custom)
- 12 live request bodies through the real `callModelWithFallback` (stubbed network): all dialects verified
- Self-heal: 400 rejection → stripped → healed retry → remembered → next request clean on first try
- Catalog probe: stubbed + REAL network probe (748 models, correct verdicts)
- Live sensing: reasoning_content observed → "confirmed live" status
- UI: autoDetect per model, status line, dimmed pills, no-lock, per-model pick restore, guards, mode-switch guard
- v9.18 regressions intact: image fence recovery, flag parsing, sana teaching, one mic, 65 skills

## Files

- App: `index.html` (v9.19)
- Reproducible: `scripts/v919/{block_v919.js, patch_v919.py, check_scripts.py, build_test_page.py, push_v919.py}` from the pristine v9.18 base
- Test harness: `download/v9.19-fixes/test.html`
