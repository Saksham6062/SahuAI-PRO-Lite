# Research Tier Decisions — Final Spec (Comparison Complete)

Date: 2026-09-26 | Status: **Decided — NOT yet implemented** (user said "No action")

## The 3 Decisions

| Tier | Source | Decision |
|------|--------|----------|
| 1. Normal → MiniMax | **User's file** (MiniMax-Skills.pdf → `deep-research` skill) | User chose their file ✅ |
| 2. Advanced → Kimi | **Internet research** (Kimi-Researcher methodology) | User chose internet version ✅ |
| 3. Ultra → GPT | **My choice: Hybrid — internet engine (o3-deep-research behavior) + user's file QC rules** | I chose; user wanted explanation |

---

## 1. MiniMax vs MiniMax → USER'S FILE WINS

**User's file (Mavis/MiniMax Agent "Skill Atlas" deep-research):**
- Rigid 5-step pipeline: (1) confirm factual background → (2) understand question + judge direction → (3) deep analysis + build research plan → (4) search + verify + form understanding → (5) write final answer file
- Strict step order (skipping/reordering = invalid trace), verification gates, citation + source hierarchy rules
- For: market sizing, industry analysis, multi-source comparison, policy surveys, defensible claims

**Internet (MiniMax M2/M2.5 official + community):**
- M2: interleaved thinking (visible reasoning traces), plan-act-verify loops, born for agents
- M2.5: RL-trained, SOTA agentic search (BrowseComp 76.3%), RISE philosophy (deep exploration of information-dense pages, not just search queries), ~20% fewer search rounds (efficiency)
- Community (dair-ai/m2-deep-research): supervisor + planning + search + synthesis, interleaved thinking

**Verdict:** CONSISTENT. User's file = the actual operational recipe; internet = the model philosophy (efficiency, visible thinking, verification). Keep user's 5 steps + add interleaved-thinking display + small search budget (5-10 searches).

## 2. Kimi vs Kimi → INTERNET VERSION WINS (as user decided)

**Internet (official Kimi-Researcher, Moonshot AI, June 2025):**
- SINGLE autonomous agent, end-to-end agentic RL (not workflow-based)
- Multi-turn think→act loop with context manager
- Avg 23 reasoning steps, 200+ URLs, 70+ queries per task (scale down for app: 10-15 rounds)
- 3 tools: parallel real-time search, text browser, code execution
- Paper explicitly critiques multi-agent workflow systems as brittle

**User's file (skills_full.pdf → deep-research / -swarm / -v2):**
- deep-research: 10+ search loop, per-round Thinking+Summary reflection, report engineering standards (100+ word paragraphs, mandatory tables, citation format, no references section)
- deep-research-swarm: multi-agent 8-phase orchestration (Router → Landscape → Decompose ≥10 dims → ≥10 parallel sub-agents → Cross-Verify → Conflict resolution → Insights → Writing handoff), Routes A-D, 150-250 total search budget
- v2: same as v1 with markdown-link citations

**Verdict:** Swarm is the most powerful methodology on paper but 150-250 searches is infeasible in a browser app (cost/time). The authentic Kimi approach (Kimi-Researcher) = single-agent reflective loop — feasible and true to source. BORROW from user's file: the report-engineering standards (TL;DR rules, table architecture, paragraph depth, citation style) — they are format-agnostic and excellent.

## 3. GPT vs GPT → MY CHOICE: HYBRID (Internet engine + User's QC layer)

**The difference (why user was confused):**
- User's file (deep-research-report.md, ~4,000 words) = a RESEARCHER'S MANUAL for driving ChatGPT Deep Research as a human user: 8-step methodology, decision rules (source credibility, bias detection, PICOS, conservative synthesis), QC checks (citation verification, dual review, PRISMA), reproducibility practices, ethics, templates. Accurate but written for the tool's DRIVER.
- Internet (OpenAI official + API docs) = the ENGINE design: o3-deep-research / o4-mini-deep-research models, RL-trained single agent, tools = web search + browser + Python + file search + MCP, background execution 5-30 min, hundreds of sources, pivots as needed, real-time progress + interrupt & refine (Feb 2026), citations + reasoning summary. This is the tool's BLUEPRINT.

**Choice: Internet version as the BASE (it's what we can actually build), with the user's file's QC rules layered on top (source hierarchy, citation verification, conservative synthesis, report template).**
- Rationale: the app needs to BE the research engine, not drive one. User's file's QC checklists are the strictest of all three files — perfect for Ultra's "analyst-grade" output.

## Resulting 3-Tier Ladder (for future implementation)

| | Normal (MiniMax) | Advanced (Kimi) | Ultra (GPT) |
|---|---|---|---|
| Architecture | 5-step pipeline | Single-agent think→act loop + reflection | Multi-phase engine (plan → search → browse → verify → synthesize) |
| Search budget | 5-10 | 10-15 | 20-30 |
| Verification | Source hierarchy gate | Per-round Thinking/Summary | Cross-verification + conflict resolution + citation check |
| Report | Concise cited answer | Structured report, tables, TL;DR | Analyst-grade report, inline citations, reasoning summary, QC checklist |
| Live UX | Step progress | Round progress + reflections | Real-time progress + interrupt & refine |

## Files Analyzed
- User's: MiniMax-Skills.pdf (8pp), deep-research-report.md (4k words), skills_full.pdf (1,073pp → 3 research skills)
- Internet: moonshotai.github.io/Kimi-Researcher, openai.com/index/introducing-deep-research, platform.openai.com/docs/guides/deep-research, minimax.io/news/minimax-m25, minimax.io/news/MiniMax-M2, dair-ai/m2-deep-research
- Context: repo HEAD now has user's own "v9.13: Research Tiers" index.html (960,885 B) — implementation phase must reconcile with this.

## Next Step (BLOCKED until user approves)
Implement the 3 tiers in app (outside Beta/), guided by this spec.
