# fractal-agentic CLI

Zero-dependency Node.js CLI for the Fractal Agentic plugin. One surface for install, setup, health checks, introspection, and browsing the full inventory of agents, commands, and skills.

```
npm:  npx fractal-agentic <verb>
src:  bin/cli.js
```

## Quick start

```sh
# From inside the package directory:
npx fractal-agentic init          # bootstrap a project
npx fractal-agentic --version     # v2.5.0
npx fractal-agentic --help        # all verbs

# From any project (after init):
npx fractal-agentic fa-check all
npx fractal-agentic fa-agent list --filter review
```

## Root resolution

The CLI must find the Fractal Agentic plugin directory (`plugin.json` + `skills/` + `agents/` + `commands/`). It checks, in order:

1. **Project marker** — `.fractal-agentic/project.json` written by `init` in the current directory; `root` field must point at a valid plugin root.
2. **Walk-up** — climbs from cwd looking for a directory containing `plugin.json` with `name: "fractal-agentic"`.
3. **dirname fallback** — `path.resolve(__dirname, '..')` (CLI lives at `bin/cli.js` inside the package).

If all three fail the CLI prints a hint and exits non-zero.

---

## Verbs

### `init`

Full project bootstrap. One command from zero to ready.

```sh
npx fractal-agentic init
```

What it does:
1. Prepends the AGENTS mandate snippet into `AGENTS.md` (or creates it).
2. Writes `.fractal-agentic/project.json` with the resolved plugin root path.
3. Runs `install-agents.sh` to place the three capability TOML templates.

After `init`, all other CLI verbs work from that project directory without any env var.

---

### `install` / `fa-install`

Install the plugin into AI coding agent host directories.

```sh
fractal-agentic install                           # all hosts
fractal-agentic install --target=antigravity      # specific host
fractal-agentic fa-install --target=codex --project  # + inject snippet
```

**Targets:** `all` (default), `antigravity`, `claude`, `codex`.

`install` is a deprecated alias — prefer `fa-install`.

---

### `verify` / `fa-verify`

Run the full verification suite (`scripts/verify.sh`).

```sh
fractal-agentic fa-verify
```

Exits 0 on pass, 1 on fail. Covers manifest validity, TOML pin exactness, installer idempotency, and runtime inspector safety checks.

---

### `fa-setup <component>`

Materialize optional plugin components onto disk. All setup verbs shell out to the corresponding script — passthrough stdout/stderr, exit with the script's code.

| Command | Script | What it does |
|---|---|---|
| `fa-setup agents [--target-dir <path>]` | `install-agents.sh` | Install capability TOML templates (never overwrites). |
| `fa-setup hooks [--target <host>] [--profile <name>]` | `install-hooks.sh` | Install optional session hooks (Claude, Cursor, project). |
| `fa-setup improve [--profile <name>]` | `install-improve.sh` | Enable self-improvement plane (observe/eval/wiki). |
| `fa-setup project` | — | Inject AGENTS mandate snippet into cwd's `AGENTS.md`. |

```sh
fractal-agentic fa-setup agents --target-dir ~/.codex/agents
fractal-agentic fa-setup hooks --target claude --profile strict
fractal-agentic fa-setup improve --profile observe
```

---

### `fa-check <component>`

Read-only health checks. Exits 0 on pass, 1 on failure. Supports `--json` for machine consumption.

| Command | Script | Checks |
|---|---|---|
| `fa-check armory` | `check-armory.sh` | Core files present, critical skills resolved, openai.yaml shape, broken symlinks. |
| `fa-check agents` | `install-agents.sh --check` | Capability TOML templates match shipped files byte-for-byte. |
| `fa-check hooks` | `install-hooks.sh --check` | Hooks config present for the expected targets. |
| `fa-check improve` | `install-improve.sh --check` | Self-improvement config + data dirs exist. |
| `fa-check policy` | `check-nonblocking-policy.sh` | Non-blocking policy compliance. |
| `fa-check all` | All of the above | Aggregated. |

Script output is captured (not streamed), then printed with a `PASS:` / `FAIL:` prefix.

```sh
fractal-agentic fa-check armory
fractal-agentic fa-check all --json           # CI-friendly: JSON + exit code
```

**`--json` output shape:**

```json
{
  "results": [
    { "check": "armory",  "ok": true,  "error": null },
    { "check": "agents",  "ok": false, "error": "destination differs..." }
  ],
  "all_pass": false
}
```

---

### `fa-info <target>`

Query plugin state.

| Command | What |
|---|---|
| `fa-info root` | Print the resolved absolute plugin root path. |
| `fa-info root --json` | `{ "root": "/path/to/plugin" }` |
| `fa-info runtime <uuid>` | Allowlisted routing metadata from a subagent rollout (runs `inspect-agent-runtime.sh`). |
| `fa-info runtime <uuid> --json` | Same output as the shell script (already JSON). |

```sh
fractal-agentic fa-info root
# /Users/amrit/fractal-agentic

fractal-agentic fa-info runtime 11111111-1111-7111-8111-111111111111
# {"thread_id":"11111111-...","agent_role":"fractal_agentic_routine_implementer",...}
```

---

## Inventory verbs

Three namespaces — `fa-agent`, `fa-command`, `fa-skill` — each with `list` and `show` subcommands. These are pure read operations on the `.md`/`.toml`/`SKILL.md` files shipped with the plugin. No network, no side effects.

### `fa-agent list|show`

Browse the 35+ domain and capability agents.

```sh
fractal-agentic fa-agent list                     # all agent ids, one per line
fractal-agentic fa-agent list --verbose            # id + type + description
fractal-agentic fa-agent list --filter review      # substring match on id, name, description
fractal-agentic fa-agent list --type toml          # capability TOML pins only
fractal-agentic fa-agent list --json               # JSON array of { id }
fractal-agentic fa-agent list --json --verbose     # JSON with description + type

fractal-agentic fa-agent show svelte-reviewer                    # raw .md file to stdout
fractal-agentic fa-agent show svelte-reviewer --frontmatter      # JSON metadata only
fractal-agentic fa-agent show fractal-agentic-routine-implementer  # prefers .toml over .md
```

**Dedup behavior:** When an agent id has both a `.md` and `.toml` file (e.g. the three capability agents), the CLI shows one entry preferring `.toml` and appends ` (md + toml)` to the description.

**Agent types:** `--type toml` lists the 3 Codex capability pins; `--type md` lists domain specialists.

### `fa-command list|show`

Browse the 69 agent commands (slash-command `.md` prompts).

```sh
fractal-agentic fa-command list                    # all command ids
fractal-agentic fa-command list --filter wiki      # wiki-init, wiki-capture, wiki-query, etc.
fractal-agentic fa-command list --verbose          # id + frontmatter description
fractal-agentic fa-command show orchestrate        # full .md body to stdout
fractal-agentic fa-command show orchestrate --frontmatter  # { "description": "..." }
```

### `fa-skill list|show`

Browse the 171 vendored skills.

```sh
fractal-agentic fa-skill list                      # all skill ids
fractal-agentic fa-skill list --filter svelte      # svelte-5-runes, svelte-components, etc.
fractal-agentic fa-skill list --verbose            # id + SKILL.md description
fractal-agentic fa-skill show svelte-5-runes       # full SKILL.md to stdout
fractal-agentic fa-skill show svelte-5-runes --frontmatter  # { name, description, ... }

# Pipe into grep, less, or an LLM:
fractal-agentic fa-skill show boss-orchestration | head -40
```

---

## Flags reference

| Flag | Verbs | Effect |
|---|---|---|
| `--filter <term>` | `fa-agent list`, `fa-command list`, `fa-skill list` | Case-insensitive substring match on id, name, description. |
| `--verbose` | All three `list` | Print id + description (and agent type) instead of bare ids. |
| `--type toml\|md` | `fa-agent list` | Filter capability pins (`toml`) or domain agents (`md`). |
| `--frontmatter` | All three `show` | Print parsed frontmatter as JSON instead of the raw file. |
| `--json` | `list` verbs, `fa-check`, `fa-info` | Machine-readable JSON output. |
| `--target=<host>` | `fa-install` | Host target: `antigravity`, `claude`, `codex`, or `all`. |
| `--project` | `fa-install` | Also inject AGENTS snippet into cwd. |
| `--target-dir <path>` | `fa-setup agents` | Destination for TOML templates. |
| `--target <host>` | `fa-setup hooks` | Host target for hooks. |
| `--profile <name>` | `fa-setup hooks`, `fa-setup improve` | Profile: `minimal`, `standard`, `strict`, `off`, `observe`, `full`. |

---

## Common workflows

### First use on a new machine

```sh
cd ~/fractal-agentic
npx fractal-agentic fa-install          # install to all detected hosts
npx fractal-agentic fa-verify           # confirm everything is healthy
npx fractal-agentic fa-setup agents     # install capability TOMLs
npx fractal-agentic fa-check all        # run all health checks
```

### Bootstrap a project

```sh
cd my-repo
npx fractal-agentic init                # snippet + marker + agents
# All these now work without setting any env var:
npx fractal-agentic fa-agent list | wc -l
npx fractal-agentic fa-check armory
npx fractal-agentic fa-command show orchestrate
```

### CI health gate

```sh
# In CI, fail the build if the plugin is broken:
npx fractal-agentic fa-check all --json || exit 1

# Check capability agent pins only:
npx fractal-agentic fa-check agents --json
```

### Pipe into tooling

```sh
# Count how many review-related skills ship with the plugin:
npx fractal-agentic fa-skill list --filter review | wc -l

# Get a machine-readable catalog of all agents:
npx fractal-agentic fa-agent list --json --verbose > agents.json

# Find commands related to Svelte:
npx fractal-agentic fa-command list --verbose --filter svelte

# Show the orchestrate command definition:
npx fractal-agentic fa-command show orchestrate | less
```

### Inspect runtime state

```sh
# Resolve where the plugin lives from this project:
npx fractal-agentic fa-info root

# Inspect a subagent thread's model/effort/sandbox:
npx fractal-agentic fa-info runtime a1b2c3d4-e5f6-... --json
```

---

## Error codes

| Code | Meaning |
|---|---|
| `0` | Success. |
| `1` | Check failed, script error, unknown command, missing argument, plugin root not found. |
| Script exit | `fa-setup` / `fa-verify` / `fa-install` pass through the underlying script's exit code. |

---

## Differences from shell scripts

| Script | CLI equivalent | Notes |
|---|---|---|
| `install-agents.sh` | `fa-setup agents` | Passes through extra args. |
| `install-agents.sh --check` | `fa-check agents` | Captured output with `PASS:`/`FAIL:` prefix. |
| `install-hooks.sh` | `fa-setup hooks` | Same passthrough. |
| `install-improve.sh` | `fa-setup improve` | Same passthrough. |
| `check-armory.sh` | `fa-check armory` | Captured + prefix. |
| `verify.sh` | `fa-verify` | Passthrough (always verbose). |
| `resolve-plugin-root.sh` | `fa-info root` | Simpler output; JSON flag. |
| `inspect-agent-runtime.sh <uuid>` | `fa-info runtime <uuid>` | Same JSON output. |
| `check-nonblocking-policy.sh` | `fa-check policy` | Captured + prefix. |

The CLI does **not** replace the scripts — they remain the source of truth. The CLI is a thin dispatch layer.

---

## Requirements

- Node.js 18+ (uses `fs.cpSync`, `fs.statSync.recursive`)
- `sh` on PATH (all script verbs shell out)
- Optional: `jq` for runtime inspect verification (script-level dependency)
- Optional: `claude` CLI for Claude Code marketplace install

## file tree

```
bin/
  cli.js       ← the CLI
  README.md    ← this file
```
