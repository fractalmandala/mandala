<p align="center">
  <img src="./fractal-agentic.png" alt="Fractal Agentic" width="420" />
</p>

# Fractal Agentic

**The coding-agent plugin for serious delivery.**  
An orchestrator prime - charioteer: domain bosses, a single orchestrator, and a vendored armory of skills, agents, and commands.

<p align="center">
  <strong>skills</strong> &nbsp;·&nbsp;
  <strong>agents</strong> &nbsp;·&nbsp;
  <strong>commands</strong> &nbsp;→&nbsp;
  <strong>7</strong> bosses &nbsp;→&nbsp;
  <strong>1</strong> orchestrator
</p>

### Why install this

| Without Fractal Agentic | With Fractal Agentic |
|---|---|
| Ad-hoc process every session | **`/orchestrate`** delivery runtime |
| Unclear who “owns” UI vs security vs scaffold | **7 executive bosses** with missions and handoffs |
| Skills scattered or missing | **Vendored armory** under `skills/` (no runtime symlinks) |
| Users must `@` the plugin | **AGENTS mandate** — detect and use automatically |
| Pin install freezes work | **Non-blocking** pins — product work always proceeds |

**Stack defaults:** Svelte 5 + SvelteKit + indented SASS (Tauri when desktop). Works in any project once the mandate is pasted.

| Pillar | Entry |
|---|---|
| Identity | [`SOUL.md`](./SOUL.md) |
| Startup router + boss playbooks | [`AGENTS.md`](./AGENTS.md) → [Bosses](./docs/bosses/INDEX.md) |
| Orchestrator | [`/orchestrate`](./commands/orchestrate.md) · [`boss-orchestration`](./skills/boss-orchestration/SKILL.md) |
| Armory indexes | [`skills/INDEX.md`](./skills/INDEX.md) · [`agents/INDEX.md`](./agents/INDEX.md) · [`commands/INDEX.md`](./commands/INDEX.md) |
| Hooks (optional) | [`hooks/README.md`](./hooks/README.md) |
| Customize | [`CUSTOMIZE.md`](./CUSTOMIZE.md) |
| Pin policy | [`docs/DEGRADATION.md`](./docs/DEGRADATION.md) |
| Troubleshooting | [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) · [`docs/troubleshooting.md`](./docs/troubleshooting.md) |

**This directory is the plugin root** — marketplace install unit, `FRACTAL_AGENTIC_ROOT`, and all manifests live here.  
**Host-agnostic content** with thin adapters (`CLAUDE.md`, `GEMINI.md`, `KIMI.md`, `OPENCODE.md`, optional hooks).

### What lives where (this package vs the rest of the repo)

| Kind | Location | Audience |
| --- | --- | --- |
| Agent identity and startup | `SOUL.md`, `AGENTS.md`, selected boss playbook, host shims | **Agents must load** |
| Armory | `skills/`, `agents/`, `commands/` | Agents + users |
| Shipped support docs | `docs/` | **Dual** — offline humans and agents (`docs/INDEX.md` labels each page) |
| Website | sibling `../site/` | Humans only; **renders** this package, does not replace it |
| Repo shell | parent root | Clone, credits, marketplace catalog — see [`../LAYOUT.md`](../LAYOUT.md) |
| Doc SSOT rules | [`docs/doc-ownership.md`](./docs/doc-ownership.md) | Router vs nested boss playbooks; agent vs dual vs site |

**Full documentation:** [`docs/INDEX.md`](./docs/INDEX.md).  
Browse online: [fractal-agentic.vercel.app](https://fractal-agentic.vercel.app/) · [Docs hub](https://fractal-agentic.vercel.app/docs/guide)

**Contents:** [Install](#install) · [Auto-use](#auto-use-from-any-project-agentsmd-mandate) · [Quick start](#quick-start) · [Bosses](#domain-bosses) · [Orchestration](#orchestration-runtime-detail) · [Layout](#layout) · [Customize](./CUSTOMIZE.md) · [Docs KB](./docs/INDEX.md)

---

## Install

**Full step-by-step for every host:** [`docs/02-install.md`](./docs/02-install.md)  
(manifest map, failures, update commands).

### Universal NPX Installer (Recommended)

```sh
# Auto-detect all host environments (Antigravity, Claude Code, Codex) and install
npx fractal-agentic install

# Or target a specific host
npx fractal-agentic install --target=antigravity
```

### Claude Code (Marketplace / Git)

```sh
# Add the repository as a plugin marketplace
claude plugin marketplace add fractalmandala/fractal-agentic

# Install the plugin
claude plugin install fractal-agentic@fractal-agentic
```

Or from local checkout:
```sh
cd /path/to/fractal-agentic
claude plugin marketplace add .
claude plugin install fractal-agentic@fractal-agentic
export FRACTAL_AGENTIC_ROOT="$PWD/plugin"
```

One session only: `claude --plugin-dir /path/to/fractal-agentic/plugin`

Then: **new Claude session**. Confirm with `claude plugin list` (`fractal-agentic@fractal-agentic` enabled).

### Codex

```sh
codex plugin marketplace add fractalmandala/fractal-agentic \
  --sparse .agents/plugins \
  --sparse plugin
```

Enable **fractal-agentic** in the Codex plugin UI · **new task**.  
Catalog file: repo `.agents/plugins/marketplace.json` (not the Claude marketplace file).

### Google Antigravity

```sh
npx fractal-agentic install --target=antigravity
```
Or copy/symlink `./plugin` to `~/.gemini/config/plugins/fractal-agentic`.

### Git / any host

```sh
git clone --filter=blob:none --sparse https://github.com/fractalmandala/fractal-agentic.git
cd fractal-agentic && git sparse-checkout set plugin .agents .claude-plugin
export FRACTAL_AGENTIC_ROOT="$PWD/plugin"
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

Then register a marketplace (Claude/Codex above) **or** paste the AGENTS snippet and point the host at `$FRACTAL_AGENTIC_ROOT`.

### Cursor / Gemini / Kimi / OpenCode

See [`docs/02-install.md`](./docs/02-install.md) — AGENTS snippet + `FRACTAL_AGENTIC_ROOT` + host shim (`GEMINI.md` / `KIMI.md` / `OPENCODE.md`).

### After install (all hosts)

1. Paste [`project-integration/AGENTS-SNIPPET.md`](./project-integration/AGENTS-SNIPPET.md) into each project’s `AGENTS.md` (or run `npx fractal-agentic install --project`).
2. Optional: `/hooks-init` · `/improve-init` · `/wiki-init`
3. Optional pins (TOML hosts): `sh scripts/install-agents.sh`
4. Health: `sh scripts/check-armory.sh`

Missing pins → keep shipping with `pins: unverified` ([DEGRADATION.md](./docs/DEGRADATION.md)).

---

## Auto-use from any project (AGENTS.md mandate)

So models **do not need** `@fractal-agentic`, paste the mandate into each project’s `AGENTS.md`.

| File | Purpose |
|---|---|
| [`project-integration/AGENTS-SNIPPET.md`](./project-integration/AGENTS-SNIPPET.md) | **Copy-paste block** |
| [`scripts/resolve-plugin-root.sh`](./scripts/resolve-plugin-root.sh) | Probe: prints a complete router + boss-playbook + runtime root or exits 1 |

### Per-project recipe

1. Paste `project-integration/AGENTS-SNIPPET.md` near the **top** of the project’s `AGENTS.md`.
2. Set env to **this** plugin root:
   ```sh
   export FRACTAL_AGENTIC_ROOT=/Users/you/fractal-agentic/plugin
   ```
3. Confirm:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
   ```
4. Agents: detect → read the `AGENTS.md` router → select and read exactly one nested
   boss `INDEX.md` → stop discovery → load `boss-orchestration` only for delivery work.
   If not found: say so once; continue with project rules. **Never block product work.**

**Conflict rule:** project-local conventions win for *this repo’s* code; the plugin owns process, armory, and delivery *guidance*.

---

## Quick start

### 1. Optional capability agents (one-time, host-dependent)

Plugin install does **not** auto-register custom-agent TOML files. On hosts that use them:

```sh
# from this plugin root (…/fractal-agentic/plugin)
sh scripts/install-agents.sh
# or explicit target (example)
sh scripts/install-agents.sh --target-dir "$HOME/.codex/agents"
```

Then, if you want pins discovered in the spawn catalog, start a **new agent session/task** (optional — work must not wait):

| Lane | `agent_type` | Typical pin (host-specific) |
|---|---|---|
| Routine implementer | `fractal_agentic_routine_implementer` | high-throughput implementer |
| Complex implementer | `fractal_agentic_complex_implementer` | high-reasoning implementer |
| Fresh reviewer | `fractal_agentic_fresh_reviewer` | independent review / read-only when available |

```sh
sh scripts/install-agents.sh --check
```

### 2. Health checks

```sh
sh scripts/check-armory.sh   # orchestration assets + critical skills
sh scripts/verify.sh         # full package: TOML pins, installer, runtime inspector
```

### 3. Use in a session

| You want… | Do this |
|---|---|
| Ship a feature end-to-end | `/orchestrate` (or load `boss-orchestration` skill) |
| Work in a domain | `/activate-boss-svelte` (or design/code/agent/creator/workflow/meta) then `/orchestrate` |
| Browse the one-boss path | Read [`AGENTS.md`](./AGENTS.md) then [Domain bosses](./docs/bosses/INDEX.md) |
| Live inventories | [`skills/INDEX.md`](./skills/INDEX.md) · [`commands/INDEX.md`](./commands/INDEX.md) · [`agents/INDEX.md`](./agents/INDEX.md) |

**Typical flow**

```
1. User request
2. /orchestrate  →  select ACTIVE BOSS (domain)
3. Preflight: install-agents.sh --check + spawn types present
4. Write five-part spec (objective, ownership, interfaces, constraints, verification)
5. Spawn routine OR complex implementer
6. Primary session re-verifies diff + commands (worker reports are claims)
7. Spawn fresh reviewer → ship | fix-first | rethink
8. ship only → report done; fix-first → re-delegate + new review
9. Release-critical → /santa-loop after ship
```

---

## Mental model

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY SESSION (architect)                                 │
│  Intent · boss selection · specs · verify · accept           │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   Domain axis         Capability axis     Ship gate
   (router + boss)     (TOML pins)         (reviewer)
   Design/Code/…       routine/complex     ship|fix-first|rethink
```

- **AGENTS.md** = startup router (what to read first, one-boss selection, and handoffs).
- **Nested boss `INDEX.md`** = mission, mapped skills/agents/commands, phases, and verification defaults.
- **boss-orchestration** = runtime (what happens when, which model lane, when “done” is legal).
- **activate-boss-*** = load the router plus one domain’s authoritative playbook.
- **Domain agents** (`svelte-reviewer`, `security-reviewer`, …) = specialists; optional consults. They do not replace the fresh-reviewer verdict under orchestration.

---

## Domain bosses

| Boss | Activate | Owns |
|---|---|---|
| Design | `/activate-boss-design` | Tokens, UI craft, a11y, motion, visual QA (Svelte-first) |
| Code | `/activate-boss-code` | Security, tests, debt, perf, docs-from-code, santa-loop release |
| Agent | `/activate-boss-agent` | Product agent harness/memory/eval/MCP (not personal OS) |
| Svelte | `/activate-boss-svelte` | Runes, Kit data-flow, SASS, port-component lane |
| Creator | `/activate-boss-creator` | Scaffold → ship; executive armory pull |
| Workflow | `/activate-boss-workflow` | Personal habits, prune, context-save/restore |
| Meta | `/activate-boss-meta` | ECC install, skill stocktake/comply/promote/prune |

**Decision tree (short):**

```
UI craft / a11y / motion?           → Design
Svelte / Kit / port?                → Svelte
Security / tests / debt / docs?     → Code
Product agents / harness / MCP?     → Agent
New app/site/package?               → Creator
Personal loops / cost / instincts?  → Workflow
ECC portfolio / skill health?       → Meta
Unclear?                            → Creator (or Workflow to observe)
```

Full handoffs and boss boundaries: [Domain bosses](./docs/bosses/INDEX.md).

---

## Orchestration runtime (detail)

### Skill package

```
skills/boss-orchestration/
  SKILL.md
  agents/openai.yaml          # Codex skill UI (display + default prompt)
  references/
    role-contracts.md         # spawn shapes, five-part specs, review packets
    routing-matrix.md         # domain × capability × stack
    handoffs.md
    boss-prompts.md           # per-boss CONSTRAINTS injects
```

### Five-part implementation contract

Every worker prompt must include:

1. **OBJECTIVE** — observable outcome  
2. **FILES AND OWNERSHIP** — exact owned paths; concurrent-edit rules  
3. **INTERFACES** — compatibility that must not break  
4. **CONSTRAINTS** — repo rules + ACTIVE BOSS bullets from `boss-prompts.md`  
5. **VERIFICATION** — exact commands + expected evidence  

Workers return an **IMPLEMENTATION REPORT**. Primary re-runs verification; the report alone is not evidence.

### Routing

| Task shape | Lane |
|---|---|
| Spec largely determines the result | `fractal_agentic_routine_implementer` |
| Judgment, security, concurrency, wide blast | `fractal_agentic_complex_implementer` |
| Misclassified after one routine attempt | Correct spec → escalate complex |
| Pre-architecture decision | Fresh reviewer consult |
| After primary verification | Fresh reviewer final → ship \| fix-first \| rethink |

### Preflight rules (Codex)

1. `install-agents.sh --check` exits 0 (byte-exact templates).  
2. Spawn tool exposes all three exact `agent_type` names.  
3. Observed model/effort match pins (public details first; else `inspect-agent-runtime.sh <thread-id>`).  
4. Reviewer: report observed sandbox + permission profile; do not claim read-only unless observed.  

**No silent fallback** to another role, model, or effort.

### Non-Codex hosts

Keep contracts, routing, and ship gate. State that model pins are **unverified**. Use domain agents for specialist review. Completion still requires an explicit ship|fix-first|rethink packet.

---

## Scripts

| Script | Purpose |
|---|---|
| [`scripts/install-agents.sh`](./scripts/install-agents.sh) | Install or `--check` the three TOML custom agents |
| [`scripts/inspect-agent-runtime.sh`](./scripts/inspect-agent-runtime.sh) | Allowlisted routing JSON from a subagent thread id |
| [`scripts/check-armory.sh`](./scripts/check-armory.sh) | Core files + critical skill path health |
| [`scripts/verify.sh`](./scripts/verify.sh) | Full local verification suite |

Installer behavior matches Sol Advisor: never overwrites a differing destination file; never mutates `config.toml`.

---

## Layout

This directory **is** the plugin (marketplace install unit / `FRACTAL_AGENTIC_ROOT`).

```
plugin/                     ← INSTALL / FRACTAL_AGENTIC_ROOT (agents load this tree)
  SOUL.md · AGENTS.md       # identity + startup router (required)
  CLAUDE.md · GEMINI.md …   # host shims
  README.md · TROUBLESHOOTING.md
  plugin.json · .claude-plugin/ · .codex-plugin/
  skills/ · agents/ · commands/
  hooks/ · workflows/ · scripts/
  project-integration/      # AGENTS mandate snippet
  docs/                     # dual support docs (ship with package; site also renders them)
```

Repo siblings: `../site/` (website), `../LAYOUT.md` (root + plugin + site rules).

---

## Vendored skills (no external symlinks)

**All skills live as real directories under `skills/`.** Fractal Agentic does **not** depend
on `agentic/comparisionset`, `agentic/skills`, `curated-curor`, or `component-porter` at
runtime. Those trees were copy sources only.

| Source used at vendor time | Role |
|---|---|
| Outer packs, curated-curor, and port-component | Copy sources for selected skills |
| High-value ECC/comparisionset subset | Copy source for delivery, product, and content skills |
| Native plugin ECC skills | Core armory source |
| **Live inventory** | See [skills/INDEX.md](./skills/INDEX.md); all entries are vendored locally |

### High-value ECC subset **inside** this plugin

| Cluster | Skills | Natural boss |
|---|---|---|
| **Orch family** | `orch-pipeline`, `orch-build-mvp`, `orch-add-feature`, `orch-change-feature`, `orch-fix-defect`, `orch-refine-code`, `plan-orchestrate` | Creator + `/orchestrate` |
| **Decide before build** | `council`, `intent-driven-development`, `product-lens`, `product-capability` | Creator Phase 0 |
| **Agent depth** | `agent-architecture-audit`, `agent-introspection-debugging`, `ai-first-engineering`, `gan-style-harness`, `enterprise-agent-ops`, `iterative-retrieval`, `team-builder`, `parallel-execution-optimizer`, `mcp-server-patterns`, `dynamic-workflow-mode` | Agent |
| **Code / ship** | `api-design`, `backend-patterns`, `hexagonal-architecture`, `git-workflow`, `github-ops`, `deployment-patterns`, `docker-patterns`, `canary-watch`, `code-tour`, `santa-method` | Code |
| **Sites / content** | `content-engine`, `article-writing`, `seo`, `ui-demo`, `deep-research`, `documentation-lookup`, `knowledge-ops` | Design / Creator / Workflow |
| **Misc** | `prompt-optimizer`, `search-first` | Meta / Workflow |

**How these relate to boss-orchestration**

- `boss-orchestration` = capability + domain runtime  
- `orch-*` = operation playbooks that can use the same lanes  
- `plan-orchestrate` = plan → orchestrate prompts  
- `santa-method` = skill form of dual review (`/santa-loop` is the command)


### Adding more skills later

Copy (never symlink) into `skills/<id>/`, then map it in the owning nested boss
playbook — see
[CUSTOMIZE.md](./CUSTOMIZE.md).

---


## Souls - What a soul is

Clawsouls / OpenClaw-style **persona packs**, not domain maps and not orchestration runtimes:

| File | Role |
|---|---|
| `SOUL.md` | Beliefs, how you work, boundaries, personality |
| `IDENTITY.md` | Name, vibe, emoji |
| `STYLE.md` | Voice, rhythm, anti-patterns (especially creative souls) |
| `HEARTBEAT.md` | Periodic self-nudges (“check React/CSS updates”) |
| `AGENTS.md` | One-line default agent prompt |
| `soul.json` | Metadata, tags, recommended skills, tool allowlists |

Example souls in the set: **frontend-dev** (React-centric), **graphic-designer**, **storyteller**, **scifi-writer**.

### How that differs from Fractal Agentic

| Layer | Fractal Agentic | Souls |
|---|---|---|
| Domain / armory | Bosses + nested boss playbooks | Soft “recommended skills” only |
| Runtime / model pins | boss-orchestration + TOML | None |
| Ship gate | Fresh reviewer + santa | None |
| Voice / persona | Thin (`boss-prompts` = constraints) | Thick (beliefs, tone, style) |
| Host | ECC / Codex / multi | OpenClaw / clawsouls ecosystem |

## Shared armory (always available)

- `/orchestrate` + `boss-orchestration`  
- `/quality-gate`  
- `/security-scan` + `security-reviewer`  
- `/code-review` + `code-reviewer`  
- `/santa-loop` (and vendored skill `santa-method`) for release-critical dual review  

---
