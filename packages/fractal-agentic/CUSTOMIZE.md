# Editing and Customizing this Plugin

> **Repo layout:** the Mandala monorepo contains **`packages/fractal-agentic/`** (the
> installable plugin) and **`sites/fractalagentic/`** (the website that renders plugin
> content). See [`./LAYOUT.md`](./LAYOUT.md) and
> [**docs/doc-ownership.md**](./docs/doc-ownership.md). Set `FRACTAL_AGENTIC_ROOT` to
> this package path. Nothing agents need may live only under the website.
>
> **Non-blocking policy:** [docs/progression.md](./docs/progression.md) — pins are optional
> quality. Never reintroduce hard-stop preflight in orchestration docs. Guard:
> `sh scripts/check-nonblocking-policy.sh` (also via `verify.sh` / `check-armory.sh`).

This section is for **marketplace users and fork maintainers** who want to reshape
Fractal Agentic: add or remove skills, agents, and commands; retarget bosses for another
stack; keep the router, owning boss playbooks, scripts, and indexes consistent.

Fork the plugin (or edit your local install). Treat the install as **your** armory —
upstream may overwrite unmanaged copies if you reinstall without a fork.

## Mental model: three layers

| Layer              | What it is                                                           | Edit when you…                                              |
| ------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Domain discovery** | `AGENTS.md` + `docs/bosses/<boss>/INDEX.md` + `/activate-boss-*` | Change routing, a boss's armory, stack defaults, or handoffs |
| **Armory**         | `skills/`, `agents/*.md`, `commands/*.md`                            | Add/remove capabilities available to bosses                 |
| **Runtime kernel** | `skills/boss-orchestration/`, capability `agents/*.toml`, `scripts/` | Change lanes, pins, contracts, ship gate, install/verify    |

**Rule of thumb:** armory changes are common; kernel changes are rare and must stay
internally consistent (TOML pins ↔ role-contracts ↔ installer ↔ verify).

## Golden rules

1. **Never hardcode inventory counts** in the startup router or narrative docs (“73 skills”). Point at live
   indexes instead.
2. **Every mapped asset should be reachable** from at least one owning nested boss
   playbook, an activate command, or `boss-orchestration` references.
3. **Orphans rot.** If you add a skill/agent/command, map it. If you remove one, unmap it
   everywhere (grep the id).
4. **Copy, never symlink, into `skills/`.** This plugin vendors all skills as real
   directories so marketplace zips and deletes of source trees stay safe.
5. **After structural edits, run health checks** (see [Verify after every edit](#verify-after-every-edit)).
6. **Bump `plugin.json` / `.codex-plugin/plugin.json` / `.claude-plugin/plugin.json`
   version** when you publish a customized fork so users can tell builds apart.
7. **Project AGENTS snippets** (`project-integration/AGENTS-SNIPPET.md`) only need an
   update if you rename the plugin, move the root, or change entry files the probe
   requires (`plugin.json`, `AGENTS.md`, `skills/boss-orchestration/SKILL.md`,
   `commands/orchestrate.md`).

## File map (what depends on what)

```
SOUL.md                            ← portable identity (keep in sync with doctrine)
AGENTS.md                          ← startup router: precedence, one-boss selection, handoffs
docs/bosses/INDEX.md               ← boss-selection hub and discovery rules
docs/bosses/<boss>/INDEX.md        ← authoritative boss mission, armory, phases, verification
commands/activate-boss-*.md        ← load router + one nested boss playbook
commands/orchestrate.md            ← entry to boss-orchestration
commands/INDEX.md                  ← live command catalog
skills/<id>/SKILL.md               ← skill body (+ optional references/, scripts/)
skills/boss-orchestration/         ← runtime skill + role-contracts + boss-prompts
skills/INDEX.md                    ← live skill catalog
agents/<name>.md                   ← domain specialists
agents/fractal-agentic-*.toml      ← optional capability pins (installer source of truth)
agents/INDEX.md                    ← live agent catalog
hooks/                             ← optional profile-gated session automation
workflows/                         ← optional review fan-out contract
scripts/install-agents.sh          ← lists TOML filenames to install
scripts/verify.sh                  ← expected pins + agent_type names
scripts/check-armory.sh            ← critical skill names + required core files
scripts/resolve-plugin-root.sh     ← probe for project AGENTS mandate
project-integration/AGENTS-SNIPPET.md
docs/02-install.md                 ← multi-host install matrix
plugin.json (+ host plugin manifests)
```

---

## Adding a skill

### A. Place the skill on disk

```text
skills/<skill-id>/
  SKILL.md                 # required — YAML frontmatter name + description recommended
  references/…             # optional
  scripts/…                # optional
```

Minimum `SKILL.md` shape:

```markdown
---
name: my-skill-id
description: 'One line — when to use this skill.'
---

# My Skill

## When to use

…

## Instructions

…
```

- **Local path skill:** copy or author under `skills/<skill-id>/`.
- **Symlink (monorepo only):**
  ```sh
  cd skills
  ln -s ../../path/to/other-pack/my-skill my-skill
  ```
- **Skill id** = directory name. Keep it stable; nested boss playbook links use that path.

### B. Map it into a boss (required for discovery)

Edit the owning `docs/bosses/<boss>/INDEX.md` (e.g. Design, Code, Svelte):

1. Add a bullet under **Mapped Skills** with a relative link:
   ```markdown
   - [My Skill](../../../skills/my-skill/SKILL.md) — short role blurb
   ```
2. If the skill belongs in a **playbook phase**, mention it there too.
3. If it is stack-specific, note `stack: svelte|react|agnostic` in the blurb.

Activation commands load the selected boss playbook, so do not duplicate an armory list
in `/activate-boss-*.md`.

### C. Orchestration integration (when relevant)

| Situation                                            | Also update                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| Skill should appear in worker CONSTRAINTS for a boss | `skills/boss-orchestration/references/boss-prompts.md`          |
| Skill changes routing (when to use which boss/lane)  | `skills/boss-orchestration/references/routing-matrix.md`        |
| Skill is part of the ship gate or preflight          | `skills/boss-orchestration/SKILL.md` and/or `role-contracts.md` |
| Skill is “critical” for monorepo health              | `scripts/check-armory.sh` `critical=…` list                     |

### D. Index

Regenerate or append `skills/INDEX.md` (see [Regenerating indexes](#regenerating-indexes)).
Do **not** paste a new total count into the router or narrative docs.

### E. Smoke test

```sh
test -f skills/my-skill/SKILL.md
sh scripts/check-armory.sh
```

---

## Removing a skill

1. **Grep** the plugin for the skill id and path:
   ```sh
   rg -n "my-skill" AGENTS.md docs/bosses commands skills/boss-orchestration scripts
   ```
2. Remove or rewrite every link/bullet in the owning nested boss playbook, activate commands, boss-prompts,
   routing-matrix, README tables, Appendix A, etc.
3. Delete the directory or symlink: `rm -rf skills/my-skill` (or `rm skills/my-skill` for a link).
4. If it was in `check-armory.sh` critical list, remove it there.
5. Refresh `skills/INDEX.md`.
6. Run `sh scripts/check-armory.sh` (and `verify.sh` if you touched the kernel).

**Do not remove** without a replacement plan:

- `skills/boss-orchestration/` (runtime kernel)
- Skills required by `check-armory.sh` critical list until you update that list
  intentionally for your stack

---

## Adding a domain agent (`.md`)

Domain agents are host-portable specialists (reviewers, explorers, packagers). They are
**not** the three Codex capability pins.

1. Create `agents/<agent-id>.md`:

```markdown
---
name: my-agent-id
description: One line — when to spawn this agent.
tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash']
model: sonnet
---

# My Agent

You are …

## Rules

…

## Output format

…
```

2. Map it under the owning nested boss playbook (**Mapped Agents** / Primary agents).
3. Activation commands need no duplicate list; they load that playbook.
4. Add a row to `agents/INDEX.md`.
5. If orchestration should prefer it as a specialist consult, mention it in
   `role-contracts.md` § Domain specialist consult (optional).

---

## Removing a domain agent

1. Grep for the agent id / filename across `AGENTS.md`, `docs/bosses/`, activate commands, orchestration
   refs, commands that invoke it.
2. Delete `agents/<agent-id>.md`.
3. Update `agents/INDEX.md`.
4. Do **not** delete the capability TOML trio unless you are redesigning the runtime
   (next section).

---

## Adding or changing a Codex capability agent (`.toml`)

These are the **role-pinned** lanes used by `boss-orchestration`. Shipping a fourth lane
or renaming a pin is a **kernel change**.

### Shipped defaults

| File                                              | `name` (agent_type)                   | Typical pin                     |
| ------------------------------------------------- | ------------------------------------- | ------------------------------- |
| `agents/fractal-agentic-routine-implementer.toml` | `fractal_agentic_routine_implementer` | model + effort                  |
| `agents/fractal-agentic-complex-implementer.toml` | `fractal_agentic_complex_implementer` | model + effort                  |
| `agents/fractal-agentic-fresh-reviewer.toml`      | `fractal_agentic_fresh_reviewer`      | model + effort + `sandbox_mode` |

TOML fields used by this plugin:

```toml
name = "fractal_agentic_my_lane"
description = "…"
model = "gpt-5.6-luna"              # host model id
model_reasoning_effort = "max"      # or high / …
sandbox_mode = "read-only"          # reviewer only, if supported

developer_instructions = """
…
"""
```

### Checklist when adding/renaming a capability lane

1. Add/edit `agents/<file>.toml` with a unique `name` (spawn `agent_type`).
2. Optional companion `agents/<file>.md` for non-Codex hosts (same logical role).
3. Update **all** of these to the new exact names/pins:
   - `skills/boss-orchestration/SKILL.md` (preflight table + spawn blocks)
   - `skills/boss-orchestration/references/role-contracts.md`
   - `skills/boss-orchestration/references/routing-matrix.md` (if routing changes)
   - `commands/orchestrate.md`
   - `scripts/install-agents.sh` → `agent_files='…'` list
   - `scripts/verify.sh` → `expected = { … }` pin map + install loops + fixture `agent_role`
   - `scripts/check-armory.sh` if it requires the new filename
   - `README.md` lane tables
4. Re-install for every developer machine:
   ```sh
   sh scripts/install-agents.sh          # fails if an old differing file exists
   # if conflict: remove or reconcile $CODEX_HOME/agents/<file>.toml deliberately
   sh scripts/install-agents.sh --check
   ```
5. Start a **fresh** Codex task so spawn types refresh.
6. `sh scripts/verify.sh` must pass.

### Changing only the model pin (same lane)

1. Edit the TOML `model` / `model_reasoning_effort` / `sandbox_mode`.
2. Update the pin table in `SKILL.md`, `role-contracts.md`, `verify.sh` expected pins,
   and README.
3. Users with an old install: installer **will not overwrite** a differing file — they
   must delete or manually sync `$CODEX_HOME/agents/<file>.toml`, then re-run install.

---

## Adding a command

1. Create `commands/<command-id>.md`:

```markdown
---
description: Short description for the command palette / index.
---

# My Command
```

/my-command

```

## Instructions

When this command runs, …
```

2. Wire discovery:
   - Add a row to `commands/INDEX.md`
   - Link from the owning nested boss playbook (**Mapped Commands**)
   - Keep `/activate-boss-*.md` as router + playbook loaders, not duplicate inventories
3. If the command is a new **entry point** to orchestration or install, also mention it in
   `README.md` Quick start and in `project-integration/AGENTS-SNIPPET.md` only if the
   project mandate should name it.
4. Prefer kebab-case ids matching the slash name (`my-command` → `/my-command`).

### Activate-boss commands

If you add a **new domain boss**:

1. Add `docs/bosses/my/INDEX.md` (mission, exclusions, agents, skills, commands, phases, verification, handoffs).
2. Add `commands/activate-boss-my.md` as a router + nested-playbook loader.
3. Update the `AGENTS.md` decision table, `docs/bosses/INDEX.md`, and handoff table.
4. Update `commands/INDEX.md` and README boss table.
5. Add a snippet block to `skills/boss-orchestration/references/boss-prompts.md`.
6. Optionally extend `routing-matrix.md`.

If you **remove a boss**, reverse all of the above and point the decision tree at a
fallback (usually Creator).

---

## Removing a command

1. Grep for `/command-id` and `command-id.md` across the plugin.
2. Delete `commands/<command-id>.md`.
3. Update `commands/INDEX.md`, boss maps, activate playbooks, README, snippet if needed.

**Do not remove without replacement:**

- `commands/orchestrate.md` (delivery entry)
- All `/activate-boss-*` for bosses you still document
- Shared armory commands you still reference (`quality-gate`, `security-scan`, …) unless
  you rewrite those references

---

## Editing discovery docs

`AGENTS.md` is the **startup router**, not a boss inventory. Edit it only for
cross-domain discovery; edit the selected nested boss `INDEX.md` for domain content.

| Surface | Edit guidance |
| --- | --- |
| `AGENTS.md` decision table | Keep mutually exclusive, short signals → one boss |
| `AGENTS.md` handoffs / stop-reading | Keep switch triggers aligned with real activation commands |
| `docs/bosses/<boss>/INDEX.md` | Mission, exclusions, agents, mapped skills/commands, stack/surface gate, phases, verification, handoffs |
| `docs/bosses/INDEX.md` | Cross-domain boundaries, canonical terms, and discovery hub only |
| `skills/boss-orchestration/` | Capability types, contracts, and runtime semantics |

**Retargeting for another stack (example: React monorepo fork)**

1. Change router stack defaults and each affected boss's stack/surface gate.
2. Swap Svelte Boss primary skills/agents in its nested playbook for React equivalents (or rename the boss).
3. Demote Svelte reviewers to secondary; promote `react-reviewer` / `/react-build`.
4. Rewrite `boss-prompts.md` Svelte block → React/Next constraints.
5. Update `check-armory.sh` critical list (`svelte-5-runes` → your stack skills).
6. Adjust capability TOML `developer_instructions` monorepo sentences.
7. Update README intro and project snippet stack lines.
8. Run full `verify.sh` + `check-armory.sh`.

---

## Editing the orchestration kernel

Files:

```
skills/boss-orchestration/SKILL.md
skills/boss-orchestration/agents/openai.yaml    # marketplace skill UI strings
skills/boss-orchestration/references/role-contracts.md
skills/boss-orchestration/references/routing-matrix.md
skills/boss-orchestration/references/handoffs.md
skills/boss-orchestration/references/boss-prompts.md
```

| Edit                                            | Also touch                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Verdict vocabulary (`ship\|fix-first\|rethink`) | role-contracts, SKILL, orchestrate.md, README                                  |
| Five-part contract fields                       | role-contracts only (keep all five; do not drop ownership/verification)        |
| Preflight steps                                 | SKILL + install/inspect script paths (relative to SKILL.md: `../../scripts/…`) |
| `openai.yaml` copy                              | display_name, short_description, default_prompt (`$boss-orchestration`)        |
| Boss constraint bullets                         | boss-prompts.md only (keep in sync with the nested boss playbook)              |

**Path rule:** scripts in the skill are resolved **relative to the SKILL.md directory**,
not the user’s cwd:

```sh
skill_dir=<directory-containing-SKILL.md>
sh "$skill_dir/../../scripts/install-agents.sh" --check
```

Do not change that contract unless you move `scripts/` and update every reference.

---

## Editing scripts

| Script                     | When you must edit it                                           |
| -------------------------- | --------------------------------------------------------------- |
| `install-agents.sh`        | Add/remove/rename capability TOML files (`agent_files=…`)       |
| `verify.sh`                | Same + pin field expectations + fixture `agent_role` strings    |
| `check-armory.sh`          | Required core files; `critical='…'` skill list for your stack   |
| `inspect-agent-runtime.sh` | Rarely — only if host rollout format changes                    |
| `resolve-plugin-root.sh`   | Plugin rename, different required entry files, new search paths |

After script edits:

```sh
sh scripts/check-armory.sh
sh scripts/verify.sh
```

`install-agents.sh` **never overwrites** a destination that differs from the template.
Document that for your users when you change pins.

---

## Regenerating indexes

Indexes are human/agent catalogs. Keep them honest; **do not** invent counts in prose.

**Skills** (example regenerator):

```sh
# from plugin root
python3 <<'PY'
from pathlib import Path
skills = Path("skills")
entries = []
for p in sorted(skills.iterdir()):
	if p.name.startswith(".") or p.name == "INDEX.md":
		continue
	if not (p.is_dir() or p.is_symlink()):
		continue
	skill_md = p / "SKILL.md"
	desc = ""
	if skill_md.exists():
		for line in skill_md.read_text(errors="ignore").splitlines():
			if line.startswith("description:"):
				desc = line.split(":", 1)[1].strip().strip('"').strip("'")
				break
			if line.startswith("# ") and not desc:
				desc = line[2:].strip()
	kind = "symlink" if p.is_symlink() else "local"
	entries.append((p.name, (desc or "(no description)")[:140].replace("|", "/"), kind))
lines = [
	"# Skills Index", "",
	"Live inventory of `skills/`. **Do not hardcode counts in startup or narrative docs.**", "",
	f"**Current entries:** {len(entries)}", "",
	"| Skill ID | Description | Source |", "|---|---|---|",
]
for name, desc, kind in entries:
	lines.append(f"| [`{name}`](./{name}/) | {desc} | {kind} |")
(skills / "INDEX.md").write_text("\n".join(lines) + "\n")
print(f"Wrote skills/INDEX.md ({len(entries)} entries)")
PY
```

**Commands / agents:** edit `commands/INDEX.md` and `agents/INDEX.md` by hand (or similar
generator). Add a row per new file; remove rows for deleted files. Keep descriptions
aligned with the file’s frontmatter `description:`.

---

## Plugin manifests and packaging

Update when you publish:

| File                         | Notes                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| `plugin.json`                | `name`, `version`, `description`, `interface`, `skills` path |
| `.codex-plugin/plugin.json`  | Codex marketplace fields if used                             |
| `.claude-plugin/plugin.json` | Claude Code plugin fields if used                            |
| `CLAUDE.md` / `GEMINI.md`    | Keep as `@AGENTS.md` shims unless you intentionally diverge  |

**Marketplace packaging tips**

1. Prefer **vendored** skill trees over broken relative symlinks.
2. Include `scripts/`, `project-integration/`, and capability TOMLs in the published
   artifact.
3. Document that users must run `sh scripts/install-agents.sh` once for Codex pins.
4. Do not commit machine-specific `FRACTAL_AGENTIC_ROOT` into the plugin; that belongs in the
   **consumer project** environment.
5. Optional: ship zipped armory mirrors (`skills.zip`, …) only if your release process
   regenerates them from the live dirs.

---

## Project integration after you customize

If consumers paste `project-integration/AGENTS-SNIPPET.md` into their repos:

1. Keep detection entry files stable **or** update the snippet + `resolve-plugin-root.sh`
   together.
2. If you rename the plugin (`plugin.json` `name`), update:
   - `resolve-plugin-root.sh` name check
   - snippet text
   - README
3. Tell users to re-copy the snippet (or re-link) after a breaking rename.

---

## Verify after every edit

```sh
# from plugin root
sh scripts/check-armory.sh
sh scripts/verify.sh

# optional: confirm probe still works from a consumer-style path
sh scripts/resolve-plugin-root.sh --from-cwd
```

Manual grep hygiene after removals:

```sh
rg -n "old-skill-id|old-agent-id|old-command" AGENTS.md docs/bosses commands skills agents scripts README.md
```

Manual map hygiene after additions:

- [ ] Asset exists on disk
- [ ] Linked from at least one boss (or shared armory / runtime)
- [ ] Index row present
- [ ] Activate playbook mentions it if it is primary for that boss
- [ ] Orchestration/boss-prompts updated if it affects delivery constraints
- [ ] Scripts/verify updated if it is a capability pin or critical skill

---

## Recommended customization recipes

| Goal                                        | Minimal edit set                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Drop unused framework skills (e.g. Flutter) | Remove skill dirs + owning boss/activate links + INDEX; demote agents            |
| Add company-internal skill                  | Copy into `skills/`, map under Code or Creator, INDEX                            |
| New “Mobile Boss”                           | New nested boss INDEX + activate command + boss-prompts + router decision table  |
| Different LLM pins                          | Edit three TOMLs + SKILL/contracts/verify pin tables + reinstall                 |
| Smaller public edition                      | Keep kernel + 1–2 bosses; strip armory; slim critical list; rewrite README intro |
| React-first fork                            | Router + Svelte→React boss maps + boss-prompts + critical skills + agent primaries |

---

## What not to break

| Asset                                                    | Why                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| `skills/boss-orchestration/` + `commands/orchestrate.md` | Delivery runtime entry                                            |
| Exact `agent_type` string consistency                    | Spawn preflight fails closed                                      |
| Byte-exact installer discipline                          | Silent pin drift is the failure mode the kernel exists to prevent |
| Five-part contract (ownership + verification)            | Without them, workers and reviewers cannot be audited             |
| Live indexes vs hardcoded counts                         | Stale counts destroy trust in the map                             |
| Project probe entry files                                | Auto-use mandate cannot find the plugin                           |

---

## Troubleshooting

| Symptom                   | Action                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Spawn types missing       | `install-agents.sh`, then **new** Codex task                                               |
| `--check` fails (differs) | Diff destination vs `agents/*.toml`; resolve deliberately; installer will not overwrite    |
| Model/effort unknown      | `inspect-agent-runtime.sh <thread-id>` if rollout exists; otherwise continue with available evidence |
| Reviewer mutated files    | Stop; do not claim read-only; capture residual risk                                        |
| Missing skill             | Confirm `skills/<id>/SKILL.md` exists (all skills are vendored locally; no external links) |
| Wrong stack defaults      | Re-read the router and active boss stack gate; monorepo default is Svelte, not React       |

---

## Version

See `plugin.json` (`2.1.0+`). Capability pins and the orchestration skill are the
Sol-parity kernel; the startup router selects one nested boss playbook for domain
knowledge.
