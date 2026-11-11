# 01. System Architecture & Global System Changes

This document provides a complete audit of the architecture and every change made globally and locally on your macOS system to enable **OmniRoute + Claude Code** as a lifetime-free, stable AI coding environment.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Terminal / Mac                      │
│                                                             │
│   ┌────────────────┐          ┌─────────────────────────┐   │
│   │   Claude Code  │─────────▶│    OmniRoute Gateway    │   │
│   │     (CLI)      │ /v1/msg  │   (http://127.0.0.1)    │   │
│   └────────────────┘          │       Port: 20128       │   │
│                               └────────────┬────────────┘   │
└────────────────────────────────────────────┼────────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
       ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
       │     Kiro      │             │  Google AI    │             │     Groq      │
       │ (Claude 3.5/  │             │   (Pro Tier   │             │ (Qwen 3.8 /   │
       │  Sonnet 4.5)  │             │  Gemini 3.8)  │             │  GPT-OSS 120B)│
       │  Zero Cost    │             │  Zero Cost    │             │  ~260ms Free  │
       └───────────────┘             └───────────────┘             └───────────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │       Failover Mesh       │
                               │  Cursor / NIM / OpenRouter│
                               └───────────────────────────┘
```

### How It Works
1. When you run `claude`, it reads your Anthropic API configuration (`ANTHROPIC_BASE_URL="http://localhost:20128"`).
2. Claude Code forwards all requests (messages, prompts, file inspection tools, bash commands) to OmniRoute.
3. OmniRoute inspects the requested model combo (`Coding-Primary`, `Never-Fail-Free`, `Coding-Fast`, etc.).
4. OmniRoute intelligently dispatches the inference request to the highest-priority active free provider (Kiro AWS, Google AI Pro, Groq, Cursor).
5. If any single provider hits a rate limit (`429`), network blip, or temporary outage, OmniRoute **automatically fails over to the next tier within milliseconds** without terminating your Claude Code session.

---

## 2. Global Changes Made to Your System

Here is the exact record of files, directories, and PATH settings configured on your Mac (`riyas-MacBook-Air`):

### 1. PATH Configuration (`~/.zshrc`)
The following exports were added to your `~/.zshrc` so you can run `claude` and `omniroute` from any terminal:
```bash
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.npm-global/bin:$PATH"
```
* **`~/.local/bin`**: Stores the native Claude Code executable (`claude`).
* **`~/.npm-global/bin`**: Stores global Node/npm packages installed without `sudo` (including `omniroute`).

### 2. Global npm Prefix Configuration (`~/.npmrc`)
To prevent `EACCES: permission denied` errors during global package installations, npm's global prefix was directed to your user directory:
* **Configured Prefix**: `/Users/riyasharma/.npm-global`
* All global npm modules are located in: `/Users/riyasharma/.npm-global/lib/node_modules/`

### 3. Global Claude Code Configuration (`~/.claude/settings.json`)
Allows Claude Code to run anywhere on your machine without requiring a `.claude` folder in every single project:
* **File Location**: `/Users/riyasharma/.claude/settings.json`
* **Configuration**:
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

### 4. Project-Specific Configuration (`.claude/settings.local.json`)
* **File Location**: `/Users/riyasharma/Desktop/Blockchain/SwasthyaCare/.claude/settings.local.json`
* **Contents**: Matches the global config, ensuring that inside `SwasthyaCare`, Claude Code defaults to `Coding-Primary` with `Reasoning-Max` for deep tasks and `Coding-Fast` for lightweight tasks.

### 5. OmniRoute Local State (`~/.omniroute/`)
OmniRoute maintains its persistent SQLite database, encryption keys, and session cache here:
* `~/.omniroute/.env`: Stores your `STORAGE_ENCRYPTION_KEY`.
* `~/.omniroute/storage.sqlite`: Stores provider connections, OAuth refresh tokens, and combo definitions.
* `~/.omniroute/cache/`: Local cache for model manifests and prompt caches.
* `~/.omniroute/call_logs/`: Request and latency logs.

---

## 3. Security & Port Details

| Component | Default Host / Port | Notes |
| :--- | :--- | :--- |
| **OmniRoute Dashboard** | `http://localhost:20128` | Web UI to monitor models, providers, and request metrics. |
| **Inference API Base** | `http://localhost:20128/v1` | OpenAI & Anthropic compatible API base. |
| **Anthropic Endpoint** | `http://localhost:20128/v1/messages` | Used natively by Claude Code. |
| **Auth Bearer Token** | `sk-d66e4a98e2ce03f7-6c2c34-0cc0c193` | Master local API key configured for your instance. |

