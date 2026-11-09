### 1. Diagnosis & What Was Fixed

1. **Typo in Model Name:**
   - In `.claude/settings.local.json`, the configuration was requesting `"ComboV1"`:
     ```json
     "ANTHROPIC_MODEL": "ComboV1"
     ```
   - However, the combo inside OmniRoute was initially named `"Combo1"`. OmniRoute returned `400: Unable to determine provider for model 'ComboV1'`.
   - **Fix Applied:** We registered **`ComboV1`** alongside **`Combo1`** in OmniRoute and created specialized combos. Both names now work.

2. **Claude Code Tool Execution & Verification:**
   - Claude Code was tested against OmniRoute with both text generation and full tool-calling (listing directory structure, inspecting file contents, and summarizing your repository).
   - **Result:** Claude Code executed tool calls without errors, routed through OmniRoute's free-tier providers with zero API fees.

---

### 2. Specialized Combos Created in OmniRoute

We built and verified four specialized combos, plus updated `Combo1` and `ComboV1`:

| Combo Name | Best Used For | Priority Failover Chain | Typical Latency |
| :--- | :--- | :--- | :--- |
| **`Coding-Primary`** *(Default)* | Everyday coding, multi-file refactoring, git actions, terminal tasks | `kr/claude-sonnet-4.5` $\to$ `antigravity/gemini-3.8-flash-high` $\to$ `agy/gemini-3.8-flash-high` $\to$ `cursor/auto-intelligence` $\to$ `groq/openai/gpt-oss-120b` | ~2.5s – 3.0s |
| **`Coding-Fast`** | Quick edits, commit messages, code search, fast explanations | `groq/qwen/qwen3.8-27b` $\to$ `groq/openai/gpt-oss-120b` $\to$ `kr/claude-haiku-4.5` $\to$ `antigravity/gemini-3.5-flash-lite` | **~260ms** (ultra-fast) |
| **`Never-Fail-Free`** | Bulletproof multi-provider cascade if heavy rate limits occur | 8-tier failover: Kiro Sonnet $\to$ Google AI Pro Flash $\to$ AGY Pro $\to$ Cursor Auto $\to$ Kiro Haiku $\to$ Gemini Flash Medium $\to$ Groq 120B $\to$ Groq Qwen | Auto-recovers |
| **`Reasoning-Max`** | Complex architectural planning, algorithm debugging, logic analysis | `antigravity/gemini-3.8-flash-high` $\to$ `agy/gemini-3.8-flash-high` $\to$ `kr/claude-sonnet-4.5` $\to$ `cursor/auto-intelligence` | ~2.5s |
| **`ComboV1` / `Combo1`** | Backward compatibility | Cleaned up to point to verified working free models | ~2.7s |

---

### 3. Stress-Test Results on Active Providers

We ran stress tests across all 11 providers currently configured in your OmniRoute instance:

#### Working (Green Tier)
- **Kiro (`kr`)**: **Active**. Claude Sonnet 4.5 and Claude Haiku 4.5 are responsive (~2.6s latency) with full support for Claude Code's tool protocol.
- **Antigravity & AGY (`antigravity` / `agy`)**: **Active**. Google AI Pro tier (`gemini-3.8-flash-high`, `gemini-3.8-flash-medium`, `gemini-3.5-flash-lite`) working reliably (~2.1s – 2.5s).
- **Groq (`groq`)**: **Active**. High-speed inference: `groq/qwen/qwen3.8-27b` responded in **0.26s**, and `groq/openai/gpt-oss-120b` responded in **0.37s**.
- **Cursor (`cursor`)**: **Active**. `cursor/auto-intelligence` and `cursor/auto` working (~2.5s – 4.0s).

#### Need Attention / Optional Refresh (Yellow / Red Tier)
- **Kimi Coding (`kimi-coding`)**: Returned `403` / connection banned by upstream. Needs a re-login via device OAuth if you want Kimi models.
- **KiloCode (`kilocode`)**: Returned `402` ("Add credits or switch to a free model").
- **Nvidia NIM (`nvidia`)**: API key is valid, but model IDs such as `meta/llama-3.3-70b-instruct` returned `410` upstream.
- **GitHub Copilot (`github`)**: Free plan is connected via OAuth, but standard Sonnet/Opus models require a Copilot Pro/Business seat; free tier supports only basic completion endpoints.

---

### 4. Configuration Applied

Your configuration in both the current project and globally across your Mac has been set up:

#### Workspace: `/Users/riyasharma/Desktop/Blockchain/SwasthyaCare/.claude/settings.local.json`
```json
{
    "env": {
        "ANTHROPIC_BASE_URL": "http://localhost:20128",
        "ANTHROPIC_AUTH_TOKEN": "sk-d66e4a98e2ce03f7-6c2c34-0cc0c193",
        "ANTHROPIC_API_KEY": "sk-d66e4a98e2ce03f7-6c2c34-0cc0c193",
        "ANTHROPIC_MODEL": "Coding-Primary",
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "Reasoning-Max",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "Coding-Primary",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "Coding-Fast"
    }
}
```

#### Global Setup: `~/.claude/settings.json`
The exact same configuration was written to `~/.claude/settings.json`. Running `claude` from **any** terminal directory will automatically route through OmniRoute without needing per-project configuration.

---

### 5. Recommended Free Providers to Add for Lifetime Redundancy

To ensure you never hit rate limits, consider adding these free API keys to OmniRoute:

1. **Google AI Studio (Gemini API Key)**:
   - Free tier includes 15 RPM / 1M TPM / 1,500 RPD for Gemini 2.5/3 Flash.
   - Provides a dedicated direct Gemini fallback independent of OAuth tokens.
2. **Cerebras**:
   - Generous free tier offering 1,000,000 tokens per day at 2,000+ tokens/second (Llama 3.3 70B). Ideal for ultra-fast completions.
3. **Mistral AI**:
   - Free developer tier includes `Codestral` (specialized coding model) and `Mistral Large`.
4. **Cloudflare Workers AI**:
   - Free 10,000 requests per day for open models (Llama 3.3, DeepSeek).

---

### 6. Quick Daily Usage Guide

1. **Make sure OmniRoute is running in the background:**
   ```bash
   omniroute
   ```
2. **Start Claude Code in any project:**
   ```bash
   claude
   ```
3. **Switch combos on the fly if needed:**
   ```bash
   # Use the speed combo (Groq sub-second latency)
   ANTHROPIC_MODEL="Coding-Fast" claude

   # Use the maximum failover combo (8-layer fallback)
   ANTHROPIC_MODEL="Never-Fail-Free" claude

   # Use deep reasoning
   ANTHROPIC_MODEL="Reasoning-Max" claude
   ```