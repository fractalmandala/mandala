# MemClaw — OpenClaw Plugin Installation

## 3. OpenClaw Plugin Installation

The plugin is a TypeScript package in the `plugin/` directory of this repo. It claims the exclusive `memory` slot on an OpenClaw gateway, replacing the built-in `memory-core`, and provides 11 agent-facing tools (the 12-tool MCP surface minus `memclaw_keystones_set`, which is MCP-only), a ContextEngine with auto-read/write lifecycle, a heartbeat loop, and agent auto-education.

### Compatibility

| Component                                | Minimum          | Notes                                                                                                                                                               |
| ---------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenClaw runtime                         | **`v2026.3.22`** | First release with `registerContextEngine` + `assemble({prompt, …})`. Older runtimes fall back to the legacy `before_prompt_build` path with reduced functionality. |
| Node.js                                  | `v18+`           | Required to build and run the plugin.                                                                                                                               |
| MemClaw backend (this repo's `core-api`) | `v2.4.0`         | Backend exposes `/plugin-manifest` for upgrade-path resilience. Plugins on `< v2.4.0` fall back to a hardcoded file list (still works against current backends).    |

The plugin's install script does a soft preflight on `openclaw --version` and prints a warning when the local runtime is older than the recommended minimum. It does NOT hard-fail — operators sometimes run patched older builds, and the plugin still loads partially below the minimum. Upgrade OpenClaw when convenient.

### Build from source

On a machine with `node` (v18+) and `npm`:

```bash
git clone https://github.com/caura-ai/caura-memclaw.git
cd caura-memclaw/plugin
npm install
npm run build            # emits plugin/dist/
```

### Install on an OpenClaw gateway

```bash
# On the gateway machine
mkdir -p ~/.openclaw/plugins/memclaw
# Copy the built plugin from your build machine (or rebuild here):
scp -r plugin/dist plugin/package.json plugin/openclaw.plugin.json \
    user@gateway:~/.openclaw/plugins/memclaw/
```

### Environment variables

Add to `~/.openclaw/plugins/memclaw/.env`:

```bash
MEMCLAW_API_URL=https://your-memclaw-instance.example.com   # your MemClaw API
MEMCLAW_API_KEY=mc_your_key_here                             # tenant-scoped API key
MEMCLAW_FLEET_ID=fleet-001                                   # identifies this fleet
MEMCLAW_NODE_NAME=my-gateway                                 # friendly name shown in Fleet page
# MEMCLAW_TENANT_ID=                                         # auto-resolved from API key
# MEMCLAW_AUTO_WRITE_TURNS=true                              # default; set false to disable auto-write
# MEMCLAW_AUTO_FIX_CONFIG=false                              # set true to auto-fix openclaw.json on startup
```

The plugin loads this `.env` file automatically (only `MEMCLAW_*` keys are read). If you use systemd, also add the vars to a drop-in file (`.env` values don't override existing process env).

**Configure OpenClaw** — edit `~/.openclaw/openclaw.json`:

```json
{
	"plugins": {
		"allow": ["memclaw"],
		"entries": {
			"memclaw": { "enabled": true, "config": {} },
			"memory-core": { "enabled": false }
		},
		"slots": {
			"memory": "memclaw"
		},
		"load": { "paths": ["/home/openclaw/.openclaw/plugins/memclaw"] }
	},
	"tools": {
		"alsoAllow": [
			"memclaw_write",
			"memclaw_recall",
			"memclaw_manage",
			"memclaw_list",
			"memclaw_doc",
			"memclaw_entity_get",
			"memclaw_tune",
			"memclaw_insights",
			"memclaw_evolve",
			"memclaw_stats",
			"memclaw_keystones"
		]
	}
}
```

**Critical:** The `plugins.slots.memory` and `memory-core` disablement are required. OpenClaw only loads one `kind: "memory"` plugin at a time — without switching the slot, the gateway sees memclaw but never calls `register()`. The automated installer handles this automatically.

> Alternatively, use the Plugin Manager's **Fix Configuration** button or the OpenClaw CLI:
>
> ```bash
> openclaw plugins disable memory-core
> openclaw plugins enable memclaw
> ```

**Optional — enable ContextEngine (Tier 2):** For full auto read/write loop, also set the contextEngine slot:

```json
{
	"plugins": {
		"slots": {
			"memory": "memclaw",
			"contextEngine": "memclaw"
		}
	}
}
```

Without the `contextEngine` slot, you still get all 11 agent-facing tools, prompt education, flush plan, and memory runtime — but no automatic read/write loop.

**Verify** — restart OpenClaw and check startup logs:

```
[memclaw] Auto-educated 20 workspace(s), SKILL.md in 20, TOOLS.md in 20, AGENTS.md in 20
[memclaw] ContextEngine 'memclaw' registered
[memclaw] Smoke test passed (score: 0.953)
```

The node will appear in the Fleet page (`/ui/fleet.html`) within 60 seconds.

### Plugin internals

The plugin registers 11 tools (the MCP surface minus the MCP-only `memclaw_keystones_set`) and runs several lifecycle systems:

- **ContextEngine** — 7 lifecycle hooks: `bootstrap` (smoke test), `ingest` (message buffering + persistence), `assemble` (token-budget-aware recall injection), `compact` (persist summaries), `afterTurn` (auto-write turn summaries), `prepareSubagentSpawn`, `onSubagentEnded`
- **Memory runtime** — API-backed `search()` and `get()` replacing file-based `memory-core`
- **Heartbeat** — every 60 seconds, POSTs node status (agents, tools, OS, IP, plugin version, setup_status) to `/api/v1/fleet/heartbeat`. MemClaw responds with any pending commands
- **Commands** — the plugin processes HMAC-verified commands from the heartbeat response:
  - `deploy` — fetch all source files to memory, backup originals, write + build, rollback on failure
  - `educate` — write prompts to agent HEARTBEAT.md files + write SKILL.md, TOOLS.md, AGENTS.md to workspaces
  - `ping` — health check round-trip
  - `restart` — gateway restart
- **Auto-education** — on first load, writes SKILL.md, TOOLS.md, AGENTS.md to all agent workspaces. New workspaces are auto-educated on heartbeat
- **Auto-resolve** — `tenant_id` is resolved from the API key at startup, so agents never need to specify it
- **Gateway RPC** — exposes `memclaw.status`, `memclaw.deploy`, `memclaw.deploy.status`, `memclaw.educate`, `memclaw.allowlist.check`, `memclaw.allowlist.fix` methods

### Educating agents

On first plugin load, agents are **auto-educated** — the plugin writes SKILL.md, TOOLS.md, and AGENTS.md to all agent workspaces automatically. The `.educated` flag at `~/.openclaw/plugins/memclaw/.educated` prevents re-running on subsequent restarts.

For manual or targeted education via the Fleet page:

1. Click a node → expand an agent → **Educate** (targets one agent) or use the **Educate Agents** button (targets all or selected)
2. Review/edit the education prompt (pre-filled with default instructions)
3. Click **Queue Educate Command** — delivered on the next heartbeat (≤60 seconds)
4. The plugin writes the prompt to each agent's `HEARTBEAT.md` and updates SKILL.md, TOOLS.md, AGENTS.md in their workspace
5. Each write is verified by read-back — the command result reports `verified` count and any per-workspace failures
6. Agents process the prompt on their next heartbeat and update their own TOOLS.md, AGENTS.md, SOUL.md, IDENTITY.md

The **Agent Education Status** section in Plugin Manager shows green checkmarks for agents that have been educated.

