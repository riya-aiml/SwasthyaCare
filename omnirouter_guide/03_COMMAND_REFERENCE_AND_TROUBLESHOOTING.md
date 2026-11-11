# 03. Command Reference & Troubleshooting Playbook

This document serves as your day-to-day manual and troubleshooting guide for running, managing, and debugging **OmniRoute** and **Claude Code**.

---

## 1. Quick Command Cheatsheet

### Starting & Managing OmniRoute

| Task | Command |
| :--- | :--- |
| **Start OmniRoute (Foreground)** | `omniroute` |
| **Start OmniRoute in Background** | `nohup omniroute > ~/.omniroute/logs/server.log 2>&1 &` |
| **Check if OmniRoute is Running** | `curl -s http://localhost:20128/api/health` |
| **View Live Background Logs** | `tail -f ~/.omniroute/logs/server.log` |
| **Find OmniRoute Process ID (PID)** | `lsof -ti :20128` |
| **Stop / Kill OmniRoute** | `lsof -ti :20128 \| xargs kill -9` |

### Running Claude Code

| Task | Command |
| :--- | :--- |
| **Launch Claude Code (Default: `Coding-Primary`)** | `claude` |
| **Run One-Shot Prompt** | `claude -p "Explain the SwasthyaCare smart contract architecture"` |
| **Run Fast Mode (Groq sub-second latency)** | `ANTHROPIC_MODEL="Coding-Fast" claude` |
| **Run Max Failover Mode (8-tier redundancy)** | `ANTHROPIC_MODEL="Never-Fail-Free" claude` |
| **Run Reasoning Mode (Deep thinking)** | `ANTHROPIC_MODEL="Reasoning-Max" claude` |
| **Resume Previous Conversation Session** | `claude --resume` |
| **Compact Memory During Long Session** | Type `/compact` inside an active Claude Code chat |

---

## 2. Testing & Health Checking OmniRoute via Terminal

Run these curl commands to instantly verify that OmniRoute is operating correctly:

### 1. Check Server Status
```bash
curl -s http://localhost:20128/api/health
```
*Expected Output:* `{"status":"ok","timestamp":"..."}`

### 2. Verify Available Combos
```bash
curl -s -H "Authorization: Bearer sk-d66e4a98e2ce03f7-6c2c34-0cc0c193" \
  http://localhost:20128/api/combos | grep -o '"name":"[^"]*"'
```
*Expected Output:*
```
"name":"Coding-Primary"
"name":"Coding-Fast"
"name":"Never-Fail-Free"
"name":"Reasoning-Max"
"name":"ComboV1"
"name":"Combo1"
```

### 3. Test Anthropic Messages Protocol
```bash
curl -s -X POST http://localhost:20128/v1/messages \
  -H "x-api-key: sk-d66e4a98e2ce03f7-6c2c34-0cc0c193" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "Coding-Primary", "max_tokens": 10, "messages": [{"role": "user", "content": "ping"}]}'
```
*Expected Output:* A JSON object containing `"type":"message"` and `"role":"assistant"`.

---

## 3. Troubleshooting Playbook

### Issue 1: `Unable to determine provider for model 'XYZ'`
* **Symptom**: Claude Code reports `API Error: 400 Unable to determine provider for model 'XYZ'`.
* **Cause**: Claude Code is trying to use a model name that doesn't match any combo or registered model in OmniRoute (e.g. requesting `ComboV1` when only `Combo1` existed).
* **Fix**:
  1. Open `/Users/riyasharma/Desktop/Blockchain/SwasthyaCare/.claude/settings.local.json` or `~/.claude/settings.json`.
  2. Verify that `ANTHROPIC_MODEL` is set to one of the verified combo names:
     - `Coding-Primary`
     - `Never-Fail-Free`
     - `Coding-Fast`
     - `Reasoning-Max`
     - `ComboV1`

---

### Issue 2: `Failed to connect to localhost port 20128: Connection refused`
* **Symptom**: Claude Code fails with `ECONNREFUSED` or `fetch failed`.
* **Cause**: OmniRoute is not currently running.
* **Fix**:
  Start OmniRoute in your terminal:
  ```bash
  omniroute
  ```
  Or start it persistently in the background:
  ```bash
  nohup omniroute > ~/.omniroute/logs/server.log 2>&1 &
  ```

---

### Issue 3: `EADDRINUSE: address already in use :::20128`
* **Symptom**: Running `omniroute` fails immediately stating port 20128 is already bound.
* **Cause**: An older OmniRoute process or zombie background task is holding the port.
* **Fix**:
  Kill all processes holding port 20128:
  ```bash
  lsof -ti :20128 | xargs kill -9
  omniroute
  ```

---

### Issue 4: Claude Code warning: `Claude Code doesn't recognize the model "XYZ", so it assumes a context window of 200k tokens`
* **Symptom**: A warning prints at startup stating Claude Code doesn't recognize custom model names like `Coding-Primary`.
* **Cause**: Claude Code natively looks for standard Anthropic model IDs (`claude-3-5-sonnet-...`). When it sees a custom gateway ID, it issues an advisory message.
* **Impact**: **Completely harmless**. Claude Code automatically assumes a 200,000 token context window, which matches Claude 3.5 Sonnet's context limit.
* **Optimization**: To force Claude Code to automatically compact context before reaching the limit, you can set the environment variable:
  ```bash
  export CLAUDE_CODE_AUTO_COMPACT_WINDOW=160000
  ```

---

### Issue 5: Upstream Rate Limit `429: Too Many Requests`
* **Symptom**: Requests take a couple of seconds before replying.
* **Behavior**: OmniRoute automatically absorbs the 429 from the first provider and fails over to the next provider in the chain (e.g. failing from Kiro to Google AI Pro).
* **Manual Override**: If you know a specific provider is temporarily exhausted, switch to the maximum failover combo:
  ```bash
  ANTHROPIC_MODEL="Never-Fail-Free" claude
  ```

---

### Issue 6: How to Add More 100% Free API Keys
To ensure you never run out of quota, you can add additional free providers to OmniRoute:

#### 1. Google AI Studio (Free Gemini API Key)
* **Get Key**: Go to [aistudio.google.com](https://aistudio.google.com/) $\to$ "Get API key" (Free tier: 15 RPM / 1,500 RPD).
* **Add to OmniRoute**: Open `http://localhost:20128` in your browser $\to$ Providers $\to$ Add Provider $\to$ **Google AI Studio** $\to$ Paste Key.

#### 2. Cerebras (Ultra-Fast Free Tier)
* **Get Key**: Go to [cloud.cerebras.ai](https://cloud.cerebras.ai/) $\to$ API Keys (Free tier: 1,000,000 tokens/day at 2,000+ tok/s).
* **Add to OmniRoute**: Open `http://localhost:20128` $\to$ Providers $\to$ Add Provider $\to$ **Cerebras** $\to$ Paste Key.

#### 3. Mistral AI (Free Developer Tier)
* **Get Key**: Go to [console.mistral.ai](https://console.mistral.ai/) $\to$ API Keys (Free access to Codestral & Mistral Large).
* **Add to OmniRoute**: Open `http://localhost:20128` $\to$ Providers $\to$ Add Provider $\to$ **Mistral AI** $\to$ Paste Key.

---

### Issue 7: Refreshing Expired OAuth Providers
If a provider that uses OAuth (such as Antigravity Google Pro, Cursor, or Kiro) shows an expired or disconnected token in `http://localhost:20128/api/providers`:
1. Open the OmniRoute dashboard at: `http://localhost:20128`
2. Navigate to **Providers**.
3. Click **Reconnect** or **Re-authenticate** next to the provider.
4. Complete the browser OAuth login. OmniRoute updates `storage.sqlite` automatically.

