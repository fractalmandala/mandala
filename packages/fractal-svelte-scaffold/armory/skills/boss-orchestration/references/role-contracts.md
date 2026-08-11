# Fractal Agentic role contracts

Use these contracts with Fractal Agentic's namespaced, role-pinned native custom agents
(TOML capability pins when the host supports them) or the equivalent contract text on hosts without pins. They are not nested
CLI wrappers and they do not change global default-subagent routing. Load only the
contract needed for the next spawn. Adapt every placeholder; do not remove a required
field.

## Custom-agent preflight (optional pins — preferred when available, never blocking)

**Project work always proceeds.** Canonical policy:
[docs/progression.md](../../../docs/progression.md). Session mode:
[capability-mode.md](capability-mode.md).

Missing install, missing spawn types, or unverifiable pins do **not** stop
implementation. Fall back per SKILL.md (primary / general agents / domain reviewers)
and mark `pins: unverified` / `capability_mode: fallback|pinned_partial`. Never refuse
user work waiting for a fresh task.

When capability pins *are* available:

1. Optionally run `../../scripts/install-agents.sh --check` relative to SKILL.md.
   Non-zero → warn once with the installer path; continue in fallback mode.
2. Prefer native types when exposed:
   `fractal_agentic_routine_implementer`, `fractal_agentic_complex_implementer`,
   `fractal_agentic_fresh_reviewer`.
3. After a pin spawn, prefer public native metadata for model/effort; optional local
   inspector `../../scripts/inspect-agent-runtime.sh <thread-id>`.
4. Report reviewer sandbox/permission profile when observable. TOML requests read-only;
   hosts may broaden it.

When using installed TOML pins, omit per-spawn model/reasoning overrides so the file
pin wins. When pins are absent, use normal host agents without inventing type names.

## Shared implementation contract

Every routine or complex implementer prompt must contain all five sections below.
Give each worker a non-overlapping file set or bounded responsibility. Independent,
non-overlapping work may run in parallel; shared files and dependency chains must run
serially.

Always inject **ACTIVE BOSS** constraints from
[boss-prompts.md](boss-prompts.md) into CONSTRAINTS and default VERIFICATION.

```text
OBJECTIVE
<Observable outcome and why it matters.>

ACTIVE BOSS
<Design | Code | Agent | Svelte | Creator | Workflow | Meta>
STACK DEFAULTS
Svelte 5 + SvelteKit + indented SASS (unless stack detection says otherwise).

FILES AND OWNERSHIP
You own only:
- <exact file or module>

You are not alone in the codebase. Other agents or the user may be editing concurrently.
Preserve their edits, do not revert unrelated work, and adapt to changes already present.
Do not modify files outside your ownership.

INTERFACES
- <Signatures, types, schemas, commands, or behavior that must remain compatible.>

CONSTRAINTS
- <Repository conventions, safety boundaries, excluded scope, and settled decisions.>
- <Paste ACTIVE BOSS bullets from boss-prompts.md>

VERIFICATION
- Run: <exact command>
  Success: <concrete expected result>
- Inspect: <exact file, diff, or generated artifact>
  Success: <concrete expected evidence>
- <Boss default checks from boss-prompts.md when applicable>

RETURN
Return the receipt below. Include exact commands and actual output evidence; a completion
claim without evidence is invalid. A receipt is a handoff claim, not acceptance evidence:
the primary session still inspects the actual diff and reruns the stated verification.

IMPLEMENTATION RECEIPT
STATUS: complete | partial | blocked
OBJECTIVE: <one-line restatement>
ACTIVE BOSS: <name>
OWNED PATHS: <the allowed file or module set from this contract>
CHANGED PATHS: <file-by-file summary from the actual diff, or none>
COMMAND RESULTS: <exact commands plus concrete output evidence, or not run and why>
JUDGMENT CALLS: <decisions the spec left open, or none>
GAPS: <unfinished work, ambiguity, or none>
RESIDUAL RISK: <most important remaining risk, or none>
PROPOSED VERDICT: ship | fix-first | rethink
```

If a field is missing, report `partial` and name it under `GAPS`; do not invent evidence.
The primary session may recover missing evidence directly so an incomplete worker handoff
never becomes a delivery blocker.

## Routine implementer

Spawn a native custom subagent thread with exactly:

```text
agent_type: fractal_agentic_routine_implementer
fork_turns: none
```

When this type is exposed, the installed file pins GPT-5.6 Luna at max reasoning —
omit per-spawn model/reasoning fields. Prefer public-details-first observation when
available.

Prompt:

```text
ROLE
Act as the routine implementation worker for Fractal Agentic. Execute the supplied
specification exactly; surface ambiguity instead of redesigning the architecture.

<paste and complete the Shared implementation contract>
```

If this type is not exposed, implement in primary or any general worker using the same
five-part contract. Note `pins: unverified`.

## Complex implementer

Spawn a native custom subagent thread with exactly:

```text
agent_type: fractal_agentic_complex_implementer
fork_turns: none
```

When this type is exposed, the installed file pins GPT-5.6 Terra at high reasoning —
omit per-spawn model/reasoning fields. Prefer public-details-first observation when
available.

Prompt:

```text
ROLE
Act as the complex implementation worker for Fractal Agentic. Resolve difficult
implementation details within the settled architecture, document material judgment
calls, and preserve every stated interface and constraint.

<paste and complete the Shared implementation contract>
```

If this type is not exposed, implement in primary or the strongest available worker with
the same contract. Note `pins: unverified`.

## Fresh reviewer — final review

Spawn a new native custom review thread after implementation and primary-session
verification, with exactly:

```text
agent_type: fractal_agentic_fresh_reviewer
fork_turns: none
```

When this type is exposed, the installed file pins GPT-5.6 Sol at high reasoning and
requests a read-only sandbox — omit per-spawn model/reasoning fields. Capture sandbox
policy when observable.

If this type is **not** exposed: use a domain specialist, a general read-only review
thread, or primary structured self-review with the same packet. Note `pins: unverified`.
Never block completion on missing pin types.

Prompt:

```text
ROLE
Act as the fresh final reviewer for Fractal Agentic. Remain strictly read-only: do not edit
files, implement fixes, or broaden scope.

STATED GOAL
<The user's requested outcome.>

ACTIVE BOSS
<Design | Code | Agent | Svelte | Creator | Workflow | Meta>

ACCUMULATED CHANGE SET
<Exact allowed files plus the complete working-tree diff, or explicit base/head revisions.>

INTERFACES AND CONSTRAINTS
- <Required compatibility, repository rules, safety boundaries, and excluded scope.>
- <Boss-specific constraints from boss-prompts.md>

VERIFICATION EVIDENCE
- <command> -> <actual primary-session output evidence>
- <Relevant artifact or diff inspection> -> <actual evidence>

IMPLEMENTATION RECEIPT
<Worker receipt, including owned and changed paths, command results, gaps, and residual risk.>

REVIEW
Inspect the actual files and accumulated change set. Judge correctness, completeness,
regressions, scope discipline, interface preservation, test adequacy, monorepo stack
discipline (Svelte 5 runes / indented SASS when applicable), and material risk.
Return exactly one allowed verdict: ship, fix-first, or rethink.

BOSSES-HERE REVIEW
VERDICT: ship | fix-first | rethink
REASON: <decisive evidence-based reason>
FINDINGS: <precise file references and required fixes, or none>
RESIDUAL RISK: <most important remaining risk, or none>
DOMAIN NOTES: <boss-specific residual concerns, or none>
```

Use ship only when the stated goal is met by the inspected change set and evidence.
Use fix-first for bounded required corrections. Use rethink when architecture or scope
must change. If any fix is made after review, re-run review on the newly accumulated
change set and verification evidence.

Do not claim a capability pin was used when it was not. Same-family review is context-clean,
not cross-model-family independence.

When a pinned reviewer's sandbox is observable:

- Read-only policy → note enforced isolation.
- Broader host sandbox → proceed with residual-risk note; parent verifies before/after
  state. Do not claim OS-enforced read-only if it was not observed.

## Commitment-boundary consult

For a pre-implementation consult, use a fresh native custom review thread with a
requested read-only profile, exactly:

```text
agent_type: fractal_agentic_fresh_reviewer
fork_turns: none
```

Give it the proposed decision, stated goal, active boss, constraints, relevant paths,
alternatives, and the one question whose answer changes the plan. Prefer
**proceed | change | stop**, followed by the decisive reason and largest risk. If the
pin type is missing, primary or any reviewer may run the same consult packet.

## Domain specialist consult (first-class when pins absent)

When a domain specialist agent (e.g. `svelte-reviewer`, `security-reviewer`,
`a11y-architect`) is available, prefer it for consult and for completion review when
Capability pin types are not exposed. Specialist or structured primary review using the
ship|fix-first|rethink packet is a valid completion path under progression.
