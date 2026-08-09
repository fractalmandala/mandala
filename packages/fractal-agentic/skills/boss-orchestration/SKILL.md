---
name: boss-orchestration
description: 'Fractal Agentic delivery runtime: domain boss selection, best-effort capability lanes (pinned when session-exposed, else fall back), primary verification, and ship|fix-first|rethink review. Non-blocking: missing install or spawn types never stop product work. Use for multi-step features, fixes, ports, refactors, lane selection, five-part specs, and completion review.'
---

# Fractal Agentic Orchestration

Act as the **executive architect**. Own user intent, domain routing, architecture,
decomposition, capability-lane selection, verification, and final acceptance.
Delegate implementation volume when lanes exist; otherwise implement in primary.
Inject the active boss's constraints into worker contracts, then obtain a **best-available
review** (pin / domain / self) before claiming non-trivial completion.

This skill is the **runtime kernel**. The startup router is
[AGENTS.md](../../AGENTS.md); the selected nested playbook under
[docs/bosses/](../../docs/bosses/INDEX.md) supplies domain knowledge. Non-blocking
policy lives in [docs/progression.md](../../docs/progression.md). Do not replace the
router or selected boss playbook — load them, then execute this loop.

Read before the first delegation in a session:

1. [references/capability-mode.md](references/capability-mode.md) — session mode (set once)
2. [references/role-contracts.md](references/role-contracts.md) — spawn shapes, five-part specs, review packets
3. [references/routing-matrix.md](references/routing-matrix.md) — domain × capability × stack
4. [references/handoffs.md](references/handoffs.md) — boss handoff protocol
5. [references/boss-prompts.md](references/boss-prompts.md) — per-boss mission snippets to inject
6. [references/graph-topologies.md](references/graph-topologies.md) — graph topologies, model tiering, deterministic reduce


## Non-blocking rule (highest priority)

**Project work always proceeds.** Harness upgrades quality; it never owns permission
to ship product work. Missing TOML files, missing spawn types, failed `--check`, hosts
that cannot pin models, or a task that has not been restarted after install are
**warnings and progression** — never refuse implementation, freeze the session, or
demand a “fresh task” before coding.

## Three layers (never conflate)

| Layer | Meaning | Proves |
|---|---|---|
| **A Content** | Router + boss playbooks + runtime readable | Progressive process guidance available |
| **B Install** | TOML under `~/.codex/agents` (or CODEX_HOME) | Disk templates present |
| **C Session** | Spawn catalog lists `fractal_agentic_*` **in this task** | Pins actually usable |

Layer B ≠ layer C. Install success does not mean types are exposed mid-session.
Only the session spawn catalog is evidence for pins. Full matrix:
[docs/progression.md](../../docs/progression.md).

## Session capability mode (set once)

After detection, set `capability_mode` per
[references/capability-mode.md](references/capability-mode.md):

| Mode | Meaning |
|---|---|
| `plugin_missing` | No readable plugin — project AGENTS only |
| `fallback` | Plugin OK; no pin types in this session (or install incomplete) |
| `pinned_partial` | Some pin types exposed — use those; fall back the rest |
| `pinned` | All three pin types exposed in this session |

State once when not fully `pinned`. Prefer any exposed pin; never require all three.

## Confirm the primary session

Prefer a high-reasoning primary model for orchestration. If the host cannot pin it,
**continue** — optionally note a stronger model is preferred. Never block on model
confirmation.

Primary session **keeps**:

- Requirements and material ambiguity resolution
- Domain boss selection (decision tree)
- Architecture, interfaces, decomposition
- Capability mode + lane selection when lanes exist
- Five-part specs with boss constraints when delegating
- Diff inspection and re-verification
- Review judgment and deliverable acceptance

Primary **implements directly** (or uses any available subagent) when pin lanes are
unavailable — delivery outranks pin purity.

## Domain selection (Axis A)

Use the decision table in the [startup router](../../AGENTS.md) or
[handoffs.md](references/handoffs.md):

| Signal                                    | Active boss                           |
| ----------------------------------------- | ------------------------------------- |
| UI craft / tokens / a11y / motion         | Design                                |
| Svelte / SvelteKit implementation         | Svelte                                |
| shadcn / fractalsvelte port               | Svelte (port lane)                    |
| Security / audit / tests / docs-from-code | Code                                  |
| Product agent harness / memory / MCP      | Agent                                 |
| Scaffold → ship new app/site/package      | Creator (executive default)           |
| Personal habits / prune / session         | Workflow                              |
| ECC install / skill inventory / comply    | Meta                                  |
| Unclear                                   | Creator or observe via Workflow first |

Read the matching nested boss `INDEX.md` (mission, out-of-scope, phases) and stop
reading other boss playbooks until a handoff. Inject that boss's **constraints and
verification defaults** into every worker contract via
[boss-prompts.md](references/boss-prompts.md).

Creator may commandeer any boss armory mid-build. Other bosses hand back to Creator
or Code for final ship.

## Preflight companion custom agents (optional capability pins — best effort only)

Three **capability** roles ship as TOML templates under `agents/`. Plugin install does
**not** register them; `scripts/install-agents.sh` copies them to the host agents dir
(layer B). Session spawn catalog (layer C) is separate.

### Optional disk check (layer B — never a work gate)

```sh
skill_dir=<directory-containing-this-SKILL.md>
installer="$skill_dir/../../scripts/install-agents.sh"
sh "$installer" --check
```

- Exit 0 → disk templates match (layer B ok).
- Non-zero → warn once with installer path. **Do not stop.** User may install later.

### Session exposure (layer C — only proof of pin usability)

Prefer these types **only if listed in this task’s spawn catalog**:

- `fractal_agentic_routine_implementer`
- `fractal_agentic_complex_implementer`
- `fractal_agentic_fresh_reviewer`

Use **whichever exist** (`pinned_partial` is valid). Empty list → `fallback`.

When a pin spawn runs, optional model/effort note (not a gate):

```sh
skill_dir=<directory-containing-this-SKILL.md>
sh "$skill_dir/../../scripts/inspect-agent-runtime.sh" <native-subagent-thread-id>
```

| agent_type                          | model         | effort | sandbox             |
| ----------------------------------- | ------------- | ------ | ------------------- |
| fractal_agentic_routine_implementer | gpt-5.6-luna  | max    | (host default)      |
| fractal_agentic_complex_implementer | gpt-5.6-terra | high   | (host default)      |
| fractal_agentic_fresh_reviewer      | gpt-5.6-sol   | high   | requested read-only |

When using installed TOML pins, omit per-spawn model/reasoning overrides. Report
reviewer sandbox when observable; never claim OS read-only unless observed.

### progression path (first-class)

Default when mode is `fallback` or a given pin is not exposed:

1. **Implement** in primary and/or general / stack subagents (no invented type names).
2. Keep the **five-part contract** + boss constraints for non-trivial work.
3. **Verify** in primary: real diff + real commands.
4. **Review** in order: exposed fresh-reviewer pin → domain specialist → general
   read-only thread → primary structured self-review (`ship|fix-first|rethink`).
5. Report `capability_mode` + `pins: unverified|partial` per capability-mode.md.

Optional armory health (non-blocking):

```sh
skill_dir=<directory-containing-this-SKILL.md>
sh "$skill_dir/../../scripts/check-armory.sh"
```

## Route implementation (Axis B — capability)

### Routine lane (default when pin exists)

Use when the five-part spec largely determines the result: boilerplate, wiring, CRUD,
mechanical edits, straightforward features, routine tests, bounded bug fixes.

```text
agent_type: fractal_agentic_routine_implementer
fork_turns: none
```

If that type is not exposed → primary or general implementer (progression path).

### Complex lane (when pin exists)

Use when correctness depends on judgment the spec cannot fully encode: concurrency,
non-trivial algorithms, security-sensitive paths, hard debugging, broad refactors,
wide blast radius — or after one routine attempt proves misclassification (correct the
spec, then escalate).

```text
agent_type: fractal_agentic_complex_implementer
fork_turns: none
```

If that type is not exposed → primary or strongest available implementer.

### Routing rules

- Route by **task shape**, not prestige.
- Prefer pins when present; otherwise fall back without ceremony.
- One worker per owned file set or bounded responsibility when delegating.
- Workers are not alone: preserve concurrent edits; do not revert unrelated work.
- Independent non-overlapping work may run in parallel; shared files and dependency
  chains run serially.
- Do not **silently** claim a pin was used when it was not — say `pins: unverified`.
- Failed lane → corrected spec; do not repeat an unchanged prompt.
- Always paste the active boss constraints from [boss-prompts.md](references/boss-prompts.md)
  into CONSTRAINTS and default VERIFICATION when using the five-part contract.

## Verify every implementation

Treat worker reports as claims. Before accepting work:

1. Require an **implementation receipt** with owned paths, changed paths, command
   results, gaps, residual risk, and a proposed `ship | fix-first | rethink` verdict.
   Missing fields make the worker handoff partial; they never block the primary session
   from gathering the evidence directly.
2. Inspect the working tree and actual diff.
3. Confirm only in-scope files changed.
4. Rerun the spec's verification commands in the primary session.
5. Compare evidence with the objective and interfaces.
6. Re-delegate corrections when evidence fails.

Do not call a task complete because a worker says it is complete.

## Consult at commitment boundaries

Before consequential architecture, migration, public API, or wide refactor, prefer a
fresh reviewer with the commitment-boundary packet from role-contracts. Keep the
consult bounded; primary still decides. If no reviewer agent exists, primary may run
the same packet as a short consult note and proceed.

## Require a final review (best available)

After implementation and primary verification, obtain a completion review. Prefer a
**new** thread:

```text
agent_type: fractal_agentic_fresh_reviewer
fork_turns: none
```

If that type is missing, use domain specialists or a general read-only review, or a
primary structured self-review — same packet shape. Verdict should be exactly one of:
**ship | fix-first | rethink**.

| Verdict   | Primary action                                        |
| --------- | ----------------------------------------------------- |
| ship      | Report completion with verification evidence          |
| fix-first | Apply or delegate named fixes, re-verify, re-review   |
| rethink   | Return to architecture; do not claim completion       |

Prefer not to waive review on non-trivial change sets. Reviewers should not implement
fixes. If any fix is made after review, re-run review on the new change set.

For release-critical monorepo ship (security, public packages, production paths), also
prefer [`/santa-loop`](../../commands/santa-loop.md) after a ship verdict when Code Boss
or Creator release phase applies.

When a pinned reviewer's sandbox is observable: note policy type; do not claim
OS-enforced read-only unless observed. Broader sandboxes are fine with residual-risk
notes and primary before/after verification.

## Domain specialists (optional parallel)

Capability lanes do volume when available. Domain agents from `agents/*.md` are first-class
for specialist review or consult — e.g. `svelte-reviewer`, `security-reviewer`,
`a11y-architect` — and are the **preferred** review path when capability pins are absent.

## Shared armory

Always available through the [startup router](../../AGENTS.md) and
[armory hub](../../docs/armory/INDEX.md): `/quality-gate`, `/security-scan`,
`code-reviewer`, `/santa-loop`.

## Continuous LLM wiki (optional capture)

After a delivery unit completes (this loop’s ship | fix-first | rethink), optionally
append a **fractal episode** to the user’s continuous wiki:

1. Soft-resolve vault (`skills/llm-wiki/scripts/wiki-resolve-root.sh` or
   `FRACTAL_WIKI_ROOT`). If missing → skip (no setup demand mid-ship).
2. If config `capture.orchestrate` is not `false`, write
   `raw/fractal/<date>-<slug>.md` with required frontmatter including **`description`**
   (≤120 chars). See [llm-wiki](../llm-wiki/SKILL.md) and
   [wiki-schema](../llm-wiki/references/wiki-schema.md).
3. Append `wiki/log.md` capture line.
4. Do **not** run full multi-page ingest unless the user asks (`/wiki-ingest`).
5. Capture failure → one warning; **never fail the delivery**.

Manual: `/wiki-capture`. Setup: `/wiki-init`. Search: `/wiki-query`.

## Self-improvement plane (optional, never a gate)

After ship | fix-first | rethink on **non-trivial** work, soft-check the install
learning profile (do not demand setup mid-delivery):

1. If `~/.config/fractal-agentic/self-improvement.json` is missing → skip silently
   (user can run `/improve-init` later).
2. Read `profile` (or env `FRACTAL_IMPROVE_PROFILE`):
   - **`off`** or missing → skip
   - **`observe`** → optional short note that `/learn` can harvest this session; no block
   - **`full`** → when verdict is **ship** (or after major fix-first re-verify):
     - Soft-run [agent-self-evaluation](../agent-self-evaluation/SKILL.md) (scorecard only;
       not a pass/fail gate). Prefer writing a line under
       `$FRACTAL_IMPROVE_DATA/evals/` or the data_root from config when easy.
     - Wiki capture still as above when vault exists and capture not disabled
3. Never refuse completion, re-open architecture, or delay the user’s ship report
   because improve/wiki/eval failed.

Setup: `/improve-init`. Status: `/improve-status`. Design: [docs/self-improvement.md](../../docs/self-improvement.md).
