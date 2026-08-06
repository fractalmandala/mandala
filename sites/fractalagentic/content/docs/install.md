# Install

Fractal Agentic is distributed as a multi-host plugin and an npm CLI package. The **`plugin/`** folder is the self-contained operational unit and the value of `FRACTAL_AGENTIC_ROOT`.

Use the [Getting started](https://fractal-agentic.vercel.app/docs/01-getting-started) page for the short path. This page covers the package layout, host-specific commands, project integration, and post-install checks.

| Install method | Destination / command |
| --- | --- |
| **`npx` One-Liner (All Hosts)** | `npx fractal-agentic install` |
| **Claude Code** | `claude plugin marketplace add fractalmandala/fractal-agentic`  
`claude plugin install fractal-agentic@fractal-agentic` |
| **OpenAI Codex** | `codex plugin marketplace add fractalmandala/fractal-agentic --sparse .agents/plugins --sparse plugin` |
| **Google Antigravity** | `npx fractal-agentic --target=antigravity` or copy `plugin/` to `~/.gemini/config/plugins/fractal-agentic` |
| **Manual Git Clone** | `git clone https://github.com/fractalmandala/fractal-agentic.git` |

Everything optional (capability pins, safety hooks, LLM wiki, self-improvement plane) degrades cleanly — see [progression.md](https://fractal-agentic.vercel.app/docs/progression).

## Choose Install Path

-   Use the **NPX installer** when you want host detection and a guided setup.
-   Use a **marketplace command** when your host manages plugins directly.
-   Use a **manual checkout** when you are developing the package or need a host-neutral install.

___

### Directory & Manifest Architecture

The package maintains a unified directory structure supporting multi-host marketplaces, npm distribution, and direct git clones:

```text
fractal-agentic/
├── package.json                          # NPM package config & bin mapping
├── bin/
│   └── cli.js                            # Executable script for `npx fractal-agentic`
├── .claude-plugin/
│   └── marketplace.json                  # Root marketplace catalog for Claude Code
├── .agents/plugins/
│   └── marketplace.json                  # Root marketplace catalog for Codex
└── plugin/                               # The core plugin package
    ├── plugin.json                       # Antigravity / Gemini / Generic plugin manifest
    ├── .claude-plugin/
    │   └── plugin.json                   # Claude Code plugin identity
    ├── .codex-plugin/
    │   └── plugin.json                   # Codex plugin identity
    ├── AGENTS.md / SOUL.md               # Startup router & core identity
    ├── docs/bosses/<boss>/INDEX.md       # Authoritative per-boss playbooks
    ├── GEMINI.md / CLAUDE.md / OPENCODE.md # Host-specific shim loaders
    ├── agents/                            # Specialist agent prompts
    ├── commands/                          # Slash commands (/orchestrate, /quality-gate, etc.)
    ├── hooks/                             # Optional safety & lifecycle hooks
    └── skills/                            # Vendored skills index
```

### Manifest Map

| File Path | Target Host | Role |
| --- | --- | --- |
| **[`package.json`](https://fractal-agentic.vercel.app/package.json)** | **npm / npx** | Package metadata, executable bin definition (`npx fractal-agentic`) |
| **[`.claude-plugin/marketplace.json`](https://fractal-agentic.vercel.app/.claude-plugin/marketplace.json)** | **Claude Code** | Root catalog pointing to `"source": "./plugin"` |
| **[`.agents/plugins/marketplace.json`](https://fractal-agentic.vercel.app/.agents/plugins/marketplace.json)** | **Codex** | Root catalog pointing to `"source": "./plugin"` |
| **[`plugin/plugin.json`](https://fractal-agentic.vercel.app/plugin.json)** | **Antigravity / Generic** | Core plugin metadata & `"skills": "./skills/"` binding |
| **[`plugin/.claude-plugin/plugin.json`](https://fractal-agentic.vercel.app/.claude-plugin/plugin.json)** | **Claude Code** | Plugin identity & keywords |
| **[`plugin/.codex-plugin/plugin.json`](https://fractal-agentic.vercel.app/.codex-plugin/plugin.json)** | **Codex** | Plugin identity & UI interfaces |

___

### Installation Methods

#### Method A — NPX Installer (`npx fractal-agentic`)

The fastest way to install across all detected AI tools on your machine:

```sh
# Auto-detect all host environments and install
npx fractal-agentic install

# Target a specific host (antigravity, claude, or codex)
npx fractal-agentic install --target=antigravity

# Install and automatically configure current project AGENTS.md
npx fractal-agentic install --project
```

#### Method B — Claude Code (Git / Marketplace)

Claude Code supports installing directly from GitHub marketplaces or local checkouts.

### Remote (GitHub Marketplace):

```sh
# Add the repository as a marketplace catalog
claude plugin marketplace add fractalmandala/fractal-agentic

# Install the plugin
claude plugin install fractal-agentic@fractal-agentic
```

### Local Checkout (Development):

```sh
git clone https://github.com/fractalmandala/fractal-agentic.git
cd fractal-agentic

# Register local repo as marketplace
claude plugin marketplace add .

# Install plugin
claude plugin install fractal-agentic@fractal-agentic
```

### Verification:

```sh
claude plugin list
claude plugin enable fractal-agentic
```

_Note: Restart Claude Code after enabling plugins._

___

### Method C — OpenAI Codex

Codex uses the `.agents/plugins/marketplace.json` manifest.

```sh
# Sparse checkout or catalog addition
codex plugin marketplace add fractalmandala/fractal-agentic \
  --sparse .agents/plugins \
  --sparse plugin

# Upgrade existing install
codex plugin marketplace upgrade fractal-agentic
```

Installed files land under `~/.codex/plugins/cache/fractal-agentic/`.

___

### Method D — Google Antigravity & Gemini CLI

Antigravity uses the `plugin/` directory directly as its plugin unit.

#### Automated Install:

```sh
npx fractal-agentic install --target=antigravity
```

#### Manual Copy / Symlink:

```sh
# Copy plugin folder to Antigravity global plugins directory
mkdir -p ~/.gemini/config/plugins
cp -r /path/to/fractal-agentic/plugin ~/.gemini/config/plugins/fractal-agentic
```

Antigravity autodetects skills under `skills/*/SKILL.md` and loads `GEMINI.md` / `AGENTS.md`.

___

### Method E — Manual Git Clone (All Hosts)

```sh
git clone https://github.com/fractalmandala/fractal-agentic.git
export FRACTAL_AGENTIC_ROOT="$PWD/fractal-agentic/plugin"

# Run setup validation
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-armory.sh"
```

___

### Project-Level Auto-Use Integration

To enable domain bosses and `/orchestrate` behavior in any project:

1.  Open your project's `AGENTS.md` (or `CLAUDE.md`).
2.  Paste the contents of [`project-integration/AGENTS-SNIPPET.md`](https://fractal-agentic.vercel.app/docs/integration-snippet) into the header.
3.  Ensure `FRACTAL_AGENTIC_ROOT` environment variable is set in your shell (e.g. in `~/.zshrc`):
    
    ```sh
    export FRACTAL_AGENTIC_ROOT="/path/to/fractal-agentic/plugin"
    ```
    

___

### Post-Installation Verification

Run the verification suite to confirm progressive discovery, skills, commands, and non-blocking progression policies pass:

```sh
export FRACTAL_AGENTIC_ROOT=/path/to/fractal-agentic/plugin
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-armory.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-nonblocking-policy.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/verify.sh"
```