<!--
  Fractal Agentic project mandate — paste into any project's AGENTS.md (near the top).

  Canonical source: fractal-agentic/plugin/project-integration/AGENTS-SNIPPET.md
  Keep this block in sync when the plugin path or entrypoints change.

  Optional: set absolute root once per machine (must point at the *plugin* directory):
    export FRACTAL_AGENTIC_ROOT=/path/to/fractal-agentic/plugin
-->

## Fractal Agentic plugin mandate (session bootstrap)

**On non-trivial tasks** (implementation, review, refactor, scaffold, multi-step plan),
**try** to detect the **Fractal Agentic** plugin and use its startup router +
orchestration guidance. Detection and pins are **best-effort** — they must **never** block the
user’s project work.

**Project work always proceeds.** Missing plugin, missing `install-agents` files, or
missing spawn types → continue with `capability_mode: plugin_missing|degraded` and
`pins: unverified`. Never freeze for a “fresh task” or refuse to implement.
Policy: `<root>/docs/DEGRADATION.md` when the plugin is present.

### Detection (run first, soft)

1. If env `FRACTAL_AGENTIC_ROOT` is set and `$FRACTAL_AGENTIC_ROOT/plugin.json` exists, use that root.
   (If the env points at the monorepo checkout and `$FRACTAL_AGENTIC_ROOT/plugin/plugin.json`
   exists, use `$FRACTAL_AGENTIC_ROOT/plugin` instead.)
2. Otherwise search upward from the project / workspace root for the first directory that
   contains **all** of:
   - `plugin.json` with `"name": "fractal-agentic"` (or equivalent name field)
   - `AGENTS.md`
   - `docs/bosses/INDEX.md` and the seven `docs/bosses/<boss>/INDEX.md` playbooks
   - `skills/boss-orchestration/SKILL.md`
   - `commands/orchestrate.md`
3. Prefer monorepo-relative candidates (stop at the first hit):
   - `<workspace>/fractal-agentic/plugin`
   - `<workspace>/agentic/fractal-agentic/plugin`
   - `<workspace>/../fractal-agentic/plugin`
   - `<repo-root>/fractal-agentic/plugin` (walk up from cwd until `.git` or filesystem root)
   - marketplace / clone installs where the checkout root **is** the plugin (has `plugin.json` at root)
4. Optional shell probe (if the script is reachable):
   ```sh
   sh <FRACTAL_AGENTIC_ROOT>/scripts/resolve-plugin-root.sh
   ```
   Exit 0 + printed path ⇒ accessible. Non-zero ⇒ treat as missing.
5. **Accessible** means you can read `AGENTS.md`, `docs/bosses/INDEX.md`, the
   selected `docs/bosses/<boss>/INDEX.md`, and
   `skills/boss-orchestration/SKILL.md` from that root.
6. Prefer also reading `SOUL.md` when present (portable identity). Optional hooks under
   `hooks/` are **never** required for delivery.

If detection fails: state once *“Fractal Agentic not found; proceeding with project AGENTS only”*
and continue under this project’s rules. Do not invent a fake plugin path. **Never refuse
the task** because the plugin is missing.

### When found — preferred use (non-blocking)

1. **Read** in progressive order:
   - `<root>/AGENTS.md` — startup router, precedence, trivial exemption, and one-boss selection
   - the selected `<root>/docs/bosses/<boss>/INDEX.md` — read exactly one in full; stop before loading other boss playbooks
   - `<root>/skills/boss-orchestration/SKILL.md` — only for non-trivial delivery and non-blocking preflight
   - `<root>/skills/boss-orchestration/references/capability-mode.md` — set mode once when runtime work needs it
   - `<root>/docs/DEGRADATION.md` — three layers (content / install / session)
2. **Set `capability_mode` once** (`pinned` | `pinned_partial` | `degraded` | `plugin_missing`)
   from the **session spawn catalog**, not from disk alone. Prefer any exposed
   `fractal_agentic_*` types; never require all three.
3. **Prefer** the plugin process:
   - Select exactly one domain boss via the router (Design / Code / Agent / Svelte /
     Creator / Workflow / Meta), then read only that nested playbook until a handoff.
   - For deliverables that change the repo: follow **boss-orchestration** contracts when
     practical (specs, verify evidence, ship|fix-first|rethink review).
   - Prefer plugin commands/skills when a mapped asset exists (`/orchestrate`,
     `/activate-boss-*`, `/quality-gate`, `/svelte-review`, …).
4. **Do not require** the user to tag `@fractal-agentic` after a successful detection.
5. **Stack defaults** from the router and selected boss playbook apply unless this
   project AGENTS.md overrides them.
6. **Project-local rules win** on conflicts for *this repo’s* conventions; the plugin
   supplies process, armory, and delivery *guidance*.

### Codex capability pins (optional quality, never a gate)

If the host exposes custom agent types, **prefer**:

- `fractal_agentic_routine_implementer`
- `fractal_agentic_complex_implementer`
- `fractal_agentic_fresh_reviewer`

To improve pin quality later (user’s choice, not a prerequisite for coding):

```sh
sh <root>/scripts/install-agents.sh
# optional: start a new agent session/task so types are re-discovered
```

If types or templates are missing, **degrade immediately**:

1. Implement in the primary session and/or any available general / stack agents.
2. Review with domain agents (`svelte-reviewer`, `code-reviewer`, …) or structured
   primary self-review using ship|fix-first|rethink.
3. State once: *pins unverified* — then continue the user’s work without asking them to
   open a new task first.

**Forbidden behaviors:** stopping the session, refusing implementation, or requiring
`install-agents.sh` / a fresh agent session/task before writing or reviewing project code.

### Continuous LLM wiki (optional, non-blocking)

If `FRACTAL_WIKI_ROOT` or fractal wiki config resolves, prefer `/wiki-query` for
prior decisions and domain knowledge. After `/orchestrate` completes, soft-capture an
episode under `raw/fractal/` (required frontmatter includes **description**). Setup:
`/wiki-init`. Missing wiki must never block product work.

### Trivial exemption

Single-sentence answers, pure explanation with no repo change, or “what is X?” questions
may skip orchestration entirely.
