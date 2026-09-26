✅ Recommended additions (browser-feasible, high value)
Tier 1 — cheap, keyless, big UX wins
1. Text-to-Speech (read answers aloud) — from Kimi's sag / Mimo sherpa-onnx-tts / GLM AI Media. Use the built-in Web Speech API (speechSynthesis) — zero dependencies, zero keys, ~30 lines. Manthan has STT (Whisper) but no TTS, so this completes the voice loop.
2. Chart & diagram generation — from GLM "Charts, Diagrams & Visualizations" and Mimo diagram-maker. A CHART:/DIAGRAM: directive where the model emits chart config/SVG and Manthan renders it inline (Chart.js via esm.sh already works in your sandbox, or pure SVG like diagram-maker's clean-svg mode).
3. Weather skill — Mimo weather (wttr.in). One WEATHER: <city> MCP tool; wttr.in needs your existing proxy chain for CORS, which the file already has.
4. Unit/currency conversion — ChatGPT widget family. Extend mcp_calc into an mcp_convert using keyless CORS-open frankfurter.app (currency) + built-in math (units). Trivial.
5. Image generation — ChatGPT/GLM/Meta media skills. Feasible free via image.pollinations.ai (keyless, CORS-open — same provider Manthan already uses for text). Add an IMAGE: <prompt> directive. (Image editing is not feasible keyless — skip that half.)
Tier 2 — prompt-methodology skills (no new infra, just SKILL.md-style instructions injected like your existing skills)
6. Academic paper reviewer (Kimi) — simulated peer review with Major/Minor revision verdicts.
7. Data-analysis methodology (Mimo data-analysis) — metric contracts, chart-selection rules, decision-brief output format.
8. Humanizer (Mimo) — strips AI-writing patterns per Wikipedia's signs-of-AI-writing guide.
9. Plan-mode (MiniMax) — "talk before you build" behavior for task/artifacts mode.
10. Design-quality suite (Mimo frontend-design, polish, audit, typeset) — as one bundled skill that upgrades anything the model renders in live_preview.
Tier 3 — moderate effort
11. Import memory/custom instructions (Claude import-memory) — parse a ChatGPT/other-AI export (JSON/zip) into Manthon's custom instructions + history.
12. Local PDF text extraction (Sarvam pdf / Claude pdf-reading) — add pdf.js from CDN so PDFs can be read as text locally instead of only sent to vision models as base64.
13. Meme maker (Mimo) — local SVG memes; fun but low priority.
14. Semantic file search across attachments (ChatGPT/Meta file_search) — you already bundle Fuse.js; index uploaded files and expose a FIND_IN_FILES: tool.