# 02. OmniRoute Advanced Features, Unified Memory & Combos

This document explains the advanced features configured inside OmniRoute to give you an enterprise-grade, zero-cost, high-reliability AI development workflow.

---

## 1. Unified Memory & Session Stickiness

A common issue when using multiple free LLM providers is **context fragmentation**: if the router randomly rotates providers between turns, you lose the provider's prompt cache, latency spikes, and the model may lose conversational context.

To solve this, OmniRoute has been configured with **Unified Memory & Session Stickiness**:

### 1. Per-Conversation Session Pinning (`disableSessionStickiness: false`)
* During an ongoing multi-turn coding session, OmniRoute hashes your conversation ID / session identifier.
* All consecutive turns in that session stay pinned to the same provider (e.g. Kiro Claude Sonnet 4.5).
* **Benefit**: 100% prompt cache affinity. The model remembers previous turns instantly without re-processing the entire codebase context from scratch.

### 2. Auto-Handoff Engine (`handoffThreshold: 0.85`)
* Standard models have fixed context windows (e.g., 128k to 200k tokens).
* If your conversation with Claude Code grows very large (e.g. running multiple large file diffs, inspecting deep stack traces), OmniRoute's **Auto-Handoff** activates once the token count reaches **85%** of the model's limit.
* **Handoff Target**: Automatically transitions the session to `antigravity/gemini-3.8-flash-high` (which features an enormous **1,000,000+ token context window**).
* **Benefit**: Your session never crashes with a `context_length_exceeded` error.

### 3. Cross-Combo Switching Without Context Loss
* Claude Code maintains the client-side conversation transcript in its local session store.
* On every interaction, Claude Code passes the complete structured history (`messages: [...]`) to OmniRoute.
* If you switch combos mid-flight (e.g. changing from `Coding-Primary` to `Never-Fail-Free`), OmniRoute ingests the complete history and immediately resumes the session with the new provider without amnesia.

---

## 2. Complete Combos Breakdown

All combos are configured with retry delays, failover thresholds, and metric tracking:

### 1. `Coding-Primary` *(Default for Sonnet / General Work)*
* **Purpose**: Everyday coding, architectural planning, multi-file code generation, and complex terminal tasks.
* **Failover Priority**:
  1. `kr/claude-sonnet-4.5` (Kiro AWS - Native Claude Sonnet 4.5)
  2. `antigravity/gemini-3.8-flash-high` (Google AI Pro Tier)
  3. `agy/gemini-3.8-flash-high` (AGY CLI Pro Tier)
  4. `cursor/auto-intelligence` (Cursor OAuth)
  5. `groq/openai/gpt-oss-120b` (Groq Fast Inference)
* **Average Latency**: 2.5s – 3.0s

### 2. `Coding-Fast` *(Default for Haiku / Sub-Second Tasks)*
* **Purpose**: Quick edits, git commit messages, symbol search, shell commands, and syntax checks.
* **Failover Priority**:
  1. `groq/qwen/qwen3.8-27b` (Groq ultra-fast engine)
  2. `groq/openai/gpt-oss-120b` (Groq 120B model)
  3. `kr/claude-haiku-4.5` (Kiro Claude Haiku 4.5)
  4. `antigravity/gemini-3.5-flash-lite` (Google Flash Lite)
* **Average Latency**: **~260ms** (sub-second)

### 3. `Never-Fail-Free` *(Maximum Redundancy)*
* **Purpose**: Use when other services are experiencing global outages or heavy rate-limiting. This combo cascades through 8 distinct tiers before failing.
* **Failover Priority**:
  1. `kr/claude-sonnet-4.5`
  2. `antigravity/gemini-3.8-flash-high`
  3. `agy/gemini-3.8-flash-high`
  4. `cursor/auto-intelligence`
  5. `kr/claude-haiku-4.5`
  6. `antigravity/gemini-3.8-flash-medium`
  7. `groq/openai/gpt-oss-120b`
  8. `groq/qwen/qwen3.8-27b`

### 4. `Reasoning-Max` *(Default for Opus / Complex Logic)*
* **Purpose**: Complex algorithmic problems, math, smart contract auditing, and security reviews.
* **Failover Priority**:
  1. `antigravity/gemini-3.8-flash-high` (Deep reasoning & thinking enabled)
  2. `agy/gemini-3.8-flash-high`
  3. `kr/claude-sonnet-4.5`
  4. `cursor/auto-intelligence`

### 5. `ComboV1` & `Combo1` *(Compatibility Aliases)*
* Maintained so any script or previous configuration expecting `ComboV1` or `Combo1` continues to function.

---

## 3. Active Provider Stress-Test Matrix

| Provider | Auth Type | Status | Verified Latency | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Kiro (`kr`)** | AWS Profile OAuth | 🟢 **Active** | 2.59s – 2.84s | Native Claude Sonnet 4.5 / Haiku 4.5. High tool-calling precision. |
| **Antigravity (`antigravity`)** | Google OAuth (Pro) | 🟢 **Active** | 2.17s – 2.52s | Gemini 3.8 Flash High / Medium. 1M token context. |
| **AGY (`agy`)** | Google OAuth (CLI) | 🟢 **Active** | 2.17s – 3.03s | Redundant Google AI Pro pipeline. |
| **Groq (`groq`)** | API Key (`gsk_...`) | 🟢 **Active** | **0.26s – 0.37s** | Blazing fast response time. Perfect for Haiku replacement. |
| **Cursor (`cursor`)** | Google OAuth | 🟢 **Active** | 2.59s – 4.04s | Auto-intelligence fallback. |
| **OpenRouter (`openrouter`)** | API Key (`sk-or-...`) | 🟡 Standby | ~0.8s | Active for free models with `:free` tag. |
| **Nvidia NIM (`nvidia`)** | API Key (`nvapi-...`) | 🟡 Standby | ~0.9s | Needs model ID sync to current NIM catalog. |
| **KiloCode (`kilocode`)** | OAuth | 🔴 Quota | N/A | Returned 402; credits required for paid tiers. |
| **Kimi Coding (`kimi-coding`)** | Device OAuth | 🔴 403 | N/A | Returned 403; requires device OAuth re-login. |
| **GitHub Copilot (`github`)** | OAuth | 🟡 Free Tier | 1.0s – 1.2s | Free plan limits standard Sonnet model requests. |

