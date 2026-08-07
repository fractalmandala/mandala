---
id: memory-and-harness-module
title: Memory and Harness Module Plan
type: plan
tags: [memory, plan]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Shared Memory MVE — Two-Agent Execution Manual

- **Repo:** `apps/fractalengine` in the Fractals monorepo
- **Coordination branch:** `memory-mve-coordination`
- **Agent A branch:** `memory-mve-evaluation`
- **Agent B branch:** `memory-mve-projection`
- **Fixture reference:** `agents/memory-mve/BASE_COMMIT`, created in Phase 0
- **Current operator mode:** single shared `master` branch. The branch/worktree names above describe the original isolated plan; in single-branch mode, file ownership and blindness rules replace branch isolation.

## 1. Read this first

This document is the complete working brief for two agents operating in parallel. No separate role prompt is required.

If the user tells you **“You are Agent A, complete your tasks,”** execute only the sections marked **Agent A**. If the user tells you **“You are Agent B, complete your tasks,”** execute only the sections marked **Agent B**.

Regardless of role, read this entire document before editing. The shared contracts, experiment boundaries, file ownership, blindness rules, and handoff requirements apply to both agents. Do not interpret knowledge of the other role's responsibilities as permission to inspect or alter that role's artifacts.

Work independently. Do not wait for the other agent unless this document identifies a genuine dependency. When your role is complete, provide the required handoff and stop. Do not perform integration or run the final paired experiment unless the user gives you that responsibility separately.

The operator must complete **Phase 0** once before launching either role. In the current single-branch setup, Phase 0 means the shared fixture reference exists on `master`; do not create extra implementation worktrees unless the operator explicitly asks for that isolation again. After Phase 0, the operator's only agent instructions are:

- “You are Agent A, complete your tasks.”
- “You are Agent B, complete your tasks.”

## 2. What this work must prove

Implement and run the smallest credible experiment that answers:

> Does a compact, curated, evidence-bearing project-memory projection improve agent behavior beyond FractalEngine's existing `AGENTS.md`, `docs/INDEX.md`, ADRs, routing documentation, and skills?

The work is divided deliberately:

- **Agent A — Evaluation and Baseline:** builds the blind task corpus, deterministic scoring tools, run-record format, control-condition procedure, and baseline report.
- **Agent B — Projection and Participation:** curates the experimental memory projection, builds its validator/installer, and adds the minimal read-side `AGENTS.md` contract.

The agents must not edit the same files or inspect each other's experimental material before both handoffs are complete. In single-branch mode, this is enforced by the file ownership lists in Section 5, not by Git branch separation. A later integration pass combines their work, runs the paired experiment in disposable worktrees, and applies the go/no-go rules.

This plan does not authorize the broader memory system.

## 3. Authorized scope

### 3.1 Included

- A hand-curated, read-only project-memory projection.
- Twenty to forty non-sensitive, evidence-bearing memory items.
- A minimal `AGENTS.md` instruction to read the projection when present.
- Ten realistic evaluation tasks and twenty gold recall questions.
- Control and treatment runs across two agent families when available.
- Deterministic scoring, result aggregation, and a go/no-go report.
- Validation that the projection is bounded, sourced, safe, and current for the frozen experiment commit.

### 3.2 Explicitly excluded

Neither agent may implement:

- inbox, staging, receipts, quarantine, or external write ingestion;
- new SQLite tables or migrations;
- chat extraction or LLM-based candidate extraction;
- FTS, embeddings, reranking, or prompt injection into FractalEngine chat;
- memory inspector, settings, dashboard, commands, or UI;
- module-specific generated projections;
- user-global memory or a second database;
- MCP, daemon, socket, or background service;
- `memory-participant` skill;
- automatic promotion, consolidation, decay, or contradiction engine;
- Sanskrit terminology or Sanskrit-specific schema.

If an excluded capability appears necessary, report it as a blocker in the handoff. Do not expand the implementation.

## Phase 0 — Operator setup before either agent starts

This operator-only phase is mandatory. Agent A and Agent B read it for context but do not execute it. The original isolated version creates one coordination branch, one clean experiment fixture, and two isolated implementation worktrees. The current simplified version keeps the implementation on `master` and relies on strict file ownership instead of branch isolation. In both modes, `agents/memory-mve/BASE_COMMIT` records the fixture hash so neither agent needs to receive it separately.

### Current single-master setup

The current repository is intentionally using one shared branch:

```text
Branch: master
Working directory: apps/fractalengine
Manual: docs/other/memory-and-harness-module.md
Fixture reference: agents/memory-mve/BASE_COMMIT
```

For this mode, do not create `memory-mve-evaluation`, `memory-mve-projection`, or additional implementation worktrees. Launch both agents from `apps/fractalengine` on `master` and rely on Sections 4 and 5 as hard boundaries.

Before launching either agent in single-master mode:

```sh
cd "$(git rev-parse --show-toplevel)"
git branch --show-current
git status --short
test -f apps/fractalengine/agents/memory-mve/BASE_COMMIT
```

Expected result: branch is `master`, the fixture reference exists, and the status contains no unrelated changes that would confuse role ownership. If the operator is actively editing unrelated files, especially SASS files, agents must preserve those changes and must not stage, commit, or rewrite them.

Use these prompts:

```text
Read docs/other/memory-and-harness-module.md in full.

You are Agent A, complete your tasks.
```

```text
Read docs/other/memory-and-harness-module.md in full.

You are Agent B, complete your tasks.
```

The remaining Phase 0 commands below are retained for the original isolated-branch experiment mode only. Do not run them in the current single-master setup unless the operator explicitly switches back to isolated worktrees.

Run these commands from the monorepo root returned by `git rev-parse --show-toplevel`, not from an agent worktree. Complete Phase 0 in one shell so `REPO_ROOT`, `BASE_COMMIT`, and the worktree-path variables remain available; if the shell is restarted, recompute them from the named branches before continuing.

### 0.1 Resolve the current working tree intentionally

Before creating branches:

1. Run `git status --short`.
2. Preserve every unrelated modification and untracked file. Commit it separately, move it outside the repository, or stash it with an identifying message. Do not delete or absorb unrelated work into the MVE.
3. Leave only the intended proposal/manual changes, then create the coordination branch and commit them:

At the time this manual was finalized, `docs/other/memory-and-harness-module.md` was an untracked, older duplicate of this plan. It is not canonical and must not be committed into the coordination or fixture branches. Preserve it outside the repository or remove it only after confirming that no separate work depends on it.

```sh
cd "$(git rev-parse --show-toplevel)"
git switch -c memory-mve-coordination
git add apps/fractalengine/docs/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md
git add apps/fractalengine/docs/superpowers/plans/2026-07-15-shared-memory-mve-two-stream-implementation.md
git commit -m "docs: finalize shared memory MVE execution manual"
git status --short
```

The final command must return no output. If the coordination branch already exists, switch to it instead of recreating it and verify that it contains the final proposal/manual.

### 0.2 Create the contamination-free experiment fixture

The implementation agents need the proposal/manual; the later control and treatment trial agents must not see them. Therefore, create a dedicated fixture commit that retains the current project state but removes only the experiment documents.

```sh
REPO_ROOT="$(git rev-parse --show-toplevel)"
COORDINATION_COMMIT="$(git rev-parse memory-mve-coordination)"
FIXTURE_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-fixture"

git worktree add "$FIXTURE_WORKTREE" -b memory-mve-fixture "$COORDINATION_COMMIT"
cd "$FIXTURE_WORKTREE"
git rm apps/fractalengine/docs/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md
git rm apps/fractalengine/docs/superpowers/plans/2026-07-15-shared-memory-mve-two-stream-implementation.md
git commit -m "test: freeze memory MVE trial fixture"
BASE_COMMIT="$(git rev-parse HEAD)"
```

Verify the fixture before recording it:

```sh
git status --short
git ls-tree -r --name-only "$BASE_COMMIT" | rg 'memory-mve|shared-agent-memory|shared-memory-mve' || true
git show "${BASE_COMMIT}:apps/fractalengine/AGENTS.md" | rg 'Experimental Local Project Memory' && exit 1 || true
```

Expected result: clean status, no MVE artifact paths, and no experimental memory section in `AGENTS.md`.

Do not use the parent of the proposal/manual commit as the fixture. The documents entered history in a commit that also contained legitimate project changes; going back to its parent would test an older application state.

### 0.3 Record the fixture hash for both agents

Return to the coordination worktree, create the shared reference file, and commit it:

```sh
cd "$REPO_ROOT"
git switch memory-mve-coordination
mkdir -p apps/fractalengine/agents/memory-mve
printf '%s\n' "$BASE_COMMIT" > apps/fractalengine/agents/memory-mve/BASE_COMMIT
git add apps/fractalengine/agents/memory-mve/BASE_COMMIT
git commit -m "test: record shared memory MVE fixture"
git status --short
```

`agents/memory-mve/BASE_COMMIT` must contain exactly one full 40-character commit hash followed by a newline. It is setup-owned and neither implementation agent may edit it.

Confirm that the recorded commit exists and remains clean:

```sh
RECORDED_BASE="$(tr -d '[:space:]' < apps/fractalengine/agents/memory-mve/BASE_COMMIT)"
git cat-file -e "$RECORDED_BASE^{commit}"
test "$RECORDED_BASE" = "$(git rev-parse memory-mve-fixture)"
```

### 0.4 Create the two implementation worktrees, isolated mode only

Skip this section in the current single-master setup. In isolated mode only, both worktrees branch from the same final coordination commit, which contains this manual and the recorded fixture hash.

```sh
COORDINATION_COMMIT="$(git rev-parse memory-mve-coordination)"
AGENT_A_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-agent-a"
AGENT_B_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-agent-b"

git worktree add "$AGENT_A_WORKTREE" -b memory-mve-evaluation "$COORDINATION_COMMIT"
git worktree add "$AGENT_B_WORKTREE" -b memory-mve-projection "$COORDINATION_COMMIT"
git worktree list
```

Required mapping:

| Role | Branch | Worktree |
|---|---|---|
| Agent A | `memory-mve-evaluation` | `fractals-memory-mve-agent-a` |
| Agent B | `memory-mve-projection` | `fractals-memory-mve-agent-b` |

In isolated mode, open one agent task in each corresponding worktree. Do not open both tasks against the coordination worktree or the original monorepo worktree.

Before launch, verify from each worktree:

```sh
git status --short
test -f apps/fractalengine/agents/memory-mve/BASE_COMMIT
```

Both statuses must be clean in isolated mode. Only then give the two one-line role assignments.

### 0.5 Setup failure conditions

In single-master mode, do not launch either agent if `agents/memory-mve/BASE_COMMIT` is absent or malformed, if the current branch is not `master`, or if unrelated dirty files make role ownership ambiguous.

In isolated mode, do not launch either agent if any of these is true:

- either implementation worktree is dirty before work begins;
- the two implementation branches do not share the same coordination commit;
- `agents/memory-mve/BASE_COMMIT` is absent, malformed, or names a different commit from `memory-mve-fixture`;
- the fixture contains the proposal, this manual, evaluation artifacts, a projection, or the experimental `AGENTS.md` section;
- both agent tasks would operate in the same worktree.

## 4. Rules both agents follow

### 4.1 Start procedure

Complete these steps before making changes:

1. Confirm whether you are Agent A or Agent B from the user's assignment.
2. Read root `AGENTS.md`, the revised proposal linked in this document's frontmatter, and this document in full.
3. Read `agents/memory-mve/BASE_COMMIT`, validate that it contains one full commit hash, and confirm the commit exists with `git cat-file -e "<hash>^{commit}"`. This recorded value is `BASE_COMMIT`; do not derive or replace it.
4. Run `git status --short`. Preserve every pre-existing modification and untracked file that is unrelated to your role.
5. Confirm the operating mode:
	- If on `master`, continue in single-branch mode and obey Section 5 exactly.
	- If on an isolated role branch/worktree, continue in isolated mode.
	- If on any other branch, report `setup-incomplete` and stop unless the operator explicitly authorizes that branch.
6. In single-branch mode, do not use broad searches, diffs, file opens, staging commands, formatting commands, or cleanup commands that touch the other agent's owned paths. If `git status --short` shows files owned by the other role, treat their filenames as enough information; do not inspect their contents.
7. Do not open, search, diff, or inspect the other agent's branch, worktree, owned files, messages, handoff, or generated artifacts.

If the reference file is missing, malformed, or points to a commit containing MVE artifacts, report `setup-incomplete` and stop without editing. Phase 0—not either implementation role—owns the fixture choice.

### 4.2 Repository discipline

Both agents must:

- read root `AGENTS.md` before acting;
- grep `docs/INDEX.md` before opening any file under `docs/adr`, `docs/design`, or `docs/routing`;
- use Svelte 5 runes, indented SASS, IPC/mock parity, undo boundaries, and hostile-HTML rules if any relevant source is touched;
- use patch-based, reviewable edits rather than destructive whole-file rewrites (`apply_patch` when running under Codex);
- preserve unrelated dirty-worktree changes;
- avoid commits that mix unrelated work or the other agent's owned files;
- stage and commit only the exact files owned by the current role;
- run targeted verification before handoff;
- report exact files changed, commands run, results, limitations, and unresolved risks;
- stop after completing their own handoff rather than taking over integration or the other role.

### 4.3 Blindness rule

Blindness is part of the experiment, not an optional courtesy:

- Agent A freezes prompts, gold rubrics, and semantic expected-memory concepts without seeing Agent B's projection.
- Agent B freezes the projection without seeing Agent A's cases, prompts, rubrics, evaluator, or baseline.
- Before both agents have handed off, neither agent may ask the other for case content, projection content, memory IDs, rubric details, or expected outcomes.
- If accidental exposure occurs, stop inspecting immediately and disclose exactly what was seen. Do not claim the affected artifact remained blind.

Questions about repository state, tool availability, the shared schema, or file ownership may be resolved without sharing experimental content.

### 4.3.1 Single-branch blindness guardrails

When both agents run on `master`, blindness is procedural:

- Agent A must not inspect files under `agents/memory-mve/projection/`, `scripts/memory-mve/install-projection.mjs`, `scripts/memory-mve/validate-projection.mjs`, `tests/unit/memory-projection-contract.test.ts`, `docs/harnessing/memory-mve-projection-guide.md`, or Agent B's `AGENTS.md` diff until both handoffs are complete.
- Agent B must not inspect files under `tests/memory-mve/`, `scripts/memory-mve/evaluate-runs.mjs`, `scripts/memory-mve/summarize-results.mjs`, `tests/unit/memory-mve-evaluator.test.ts`, `docs/harnessing/memory-mve-evaluation-guide.md`, or `docs/harnessing/memory-mve-baseline-report.md` until both handoffs are complete.
- Neither agent may run repo-wide formatters, fixers, or cleanup scripts that rewrite files outside its owned paths.
- Neither agent may stage all changes with `git add .`, `git add -A`, or equivalent. Stage explicit owned paths only.
- If a command accidentally reveals other-role content, stop reading that output immediately, disclose what was seen in the handoff, and continue only if the exposed content does not compromise the role's blind freeze.

### 4.4 Frozen experiment facts

These decisions are fixed for both agents:

- Schema version: `memory-mve/v1`.
- Projection revision: `mve-001`.
- Projection target: `.fractal/memory/context/project.md`.
- Projection source is tracked; installed projection is local and gitignored.
- Projection word budget: at most 1,500 words, excluding YAML frontmatter.
- Memory item count: 20–40.
- Allowed memory authority tiers: A and B only.
- The projection is evidence, not authority; current source and current instructions win.
- Every materially used memory must be cited by memory ID in the treatment run's final response.
- No task receipt is required.
- Evaluation corpus: 10 tasks, split into 6 development cases and 4 held-out cases.
- Trial matrix target: 2 agent families × 10 cases × 2 conditions = 40 independent runs.
- Each run uses a fresh thread/session and a disposable worktree pinned to `BASE_COMMIT` or its treatment overlay.

---

## 5. File ownership

Only edit the files assigned to your role. Reading this ownership list does not waive the blindness rule.

### 5.1 Agent A owns exclusively

```text
tests/memory-mve/
scripts/memory-mve/evaluate-runs.mjs
scripts/memory-mve/summarize-results.mjs
tests/unit/memory-mve-evaluator.test.ts
docs/harnessing/memory-mve-evaluation-guide.md
docs/harnessing/memory-mve-baseline-report.md
```

Agent A creates `tests/memory-mve/results/.gitignore` that ignores all raw run artifacts. Raw responses, diffs, token metadata, adjudication drafts, and the later integration pass's temporary memory-ID map remain local; only aggregate reports intended for review are committed. The reserved `tests/memory-mve/results/memory-map.json` file in Section 5.3 is the sole exception to Agent A's directory ownership.

Agent A must not modify:

- root `AGENTS.md`;
- `agents/memory-mve/`;
- projection installer/validator scripts;
- projection contract tests;
- the revised proposal or this plan.

### 5.2 Agent B owns exclusively

```text
AGENTS.md
agents/memory-mve/projection/project.md
agents/memory-mve/projection/projection.schema.json
scripts/memory-mve/install-projection.mjs
scripts/memory-mve/validate-projection.mjs
tests/unit/memory-projection-contract.test.ts
docs/harnessing/memory-mve-projection-guide.md
```

Agent B must not modify or inspect:

- `tests/memory-mve/cases/`;
- `tests/memory-mve/gold/`;
- Agent A's branch/worktree;
- evaluator or result aggregation scripts;
- baseline report;
- Agent A's messages or handoff while Agent B's projection is still being built.

Agent B may and must read the revised proposal and this document. Those documents define the assignment; they are not evaluation artifacts.

### 5.3 Reserved for the later integration pass

Neither agent may modify these unless the user separately assigns integration responsibility:

```text
package.json
pnpm-lock.yaml
docs/adr/ADR-011-local-first-ai-memory-and-context-harness.md
docs/design/AI-MEMORY-ARCHITECTURE.md
docs/INDEX.md
tests/memory-mve/results/memory-map.json
agents/memory-mve/BASE_COMMIT
```

No package script is required for the MVE. Commands run directly with `node` and `pnpm vitest`.

---

## 6. Shared data contracts

These contracts are frozen before parallel work begins. Either agent may implement validation for its owned side but may not change the contract unilaterally.

### 6.1 Projection frontmatter

The tracked and installed projection begins with:

```yaml
---
schema: memory-mve/v1
project: fractalengine
revision: mve-001
status: experimental-read-only
source_commit: <BASE_COMMIT>
generated_at: <ISO-8601 timestamp>
privacy: workspace-readable-local-file
word_budget: 1500
---
```

### 6.2 Projection item format

Every memory item uses this exact Markdown shape:

```markdown
### MVE-001 — Short descriptive title

- Kind: rule | decision | verified-fact | verified-gotcha | verified-procedure | unresolved-risk
- Authority: A | B
- Applicability: project
- Modules: ai, ide
- Observed: 2026-07-15
- Valid: current | superseded | uncertain
- Source: `relative/path` — heading, symbol, test, or stable locator
- Claim: One compact factual claim.
- Relevance: When this claim may help; never phrased as authority beyond its source.
```

Rules:

- For this MVE, Authority A requires root/module `AGENTS.md` or an accepted ADR/policy source present at `BASE_COMMIT`.
- Authority B requires inspected local source, test, build result, or verified commit/diff.
- Agent inference, external/web content, inferred preference, and unverified procedure are prohibited.
- A rule must cite its authoritative source.
- A procedure/fix must cite objective local verification.
- One item contains one claim.
- Source paths are repository-relative and must exist at `BASE_COMMIT`.
- Do not use line numbers as the sole locator; use a heading, symbol, test name, or rule identifier.
- Do not include credentials, environment values, URLs containing secrets, private chat excerpts, personal facts, or chain-of-thought.

### 6.3 Evaluation case contract

`tests/memory-mve/cases/index.json`:

```json
{
  "schemaVersion": 1,
  "baseCommit": "<BASE_COMMIT>",
  "cases": [
    {
      "id": "CASE-01",
      "title": "Short title",
      "split": "development",
      "category": "rule-compliance",
      "moduleTags": ["ai"],
      "promptPath": "cases/prompts/CASE-01.md",
      "goldPath": "gold/CASE-01.json"
    }
  ]
}
```

Gold rubric files are never copied into trial worktrees:

```json
{
  "caseId": "CASE-01",
  "expectedMemoryConcepts": ["single IPC gateway and mock parity"],
  "rubric": [
    { "id": "correctness", "maxPoints": 4, "description": "..." },
    { "id": "ruleCompliance", "maxPoints": 3, "description": "..." },
    { "id": "evidence", "maxPoints": 2, "description": "..." },
    { "id": "scope", "maxPoints": 1, "description": "..." }
  ],
  "criticalFailures": [
    { "id": "security-boundary", "description": "..." }
  ]
}
```

Each case totals 10 points. A critical failure is recorded separately and may reduce the score to zero when the rubric says so.

Agent A freezes semantic `expectedMemoryConcepts`, not Agent B memory IDs. After both agents hand off, the integration pass creates `tests/memory-mve/results/memory-map.json` mapping concepts/cases to actual `MVE-*` IDs. A missing match is recorded as a coverage gap; Agent B is not asked to add an answer for a held-out case.

### 6.4 Run record contract

Run records live outside trial worktrees under `tests/memory-mve/results/<run-id>/run.json`:

```json
{
  "schemaVersion": 1,
  "runId": "...",
  "caseId": "CASE-01",
  "condition": "control",
  "agentFamily": "codex",
  "modelId": "...",
  "startedAt": "...",
  "completedAt": "...",
  "baseCommit": "...",
  "projectionRevision": null,
  "contextTokensAdded": 0,
  "memoryIdsCited": [],
  "finalResponsePath": "final.md",
  "diffPath": "changes.diff",
  "verificationPath": "verification.txt",
  "blockedByMemory": false
}
```

Treatment records use `condition: "projection"` and `projectionRevision: "mve-001"`.

---

## 7. Agent A — Evaluation and Baseline

If you are Agent B, read this section for context but do not execute it and do not inspect the files it names.

**Branch:** `master` in current single-branch mode; `memory-mve-evaluation` only if the operator explicitly restores isolated worktrees.

**Required worktree:** `apps/fractalengine` in current single-branch mode; `fractals-memory-mve-agent-a` only in isolated mode.

### Agent A outcome

Deliver a blind, reproducible evaluation system that measures the projection against the actual incumbent. Your prompts, rubrics, and semantic expectations must be frozen without seeing Agent B's projection.

### A0. Orient and record the freeze point

1. Confirm `git branch --show-current` returns `master` in single-branch mode or `memory-mve-evaluation` in isolated mode. Run `git status --short`; unrelated user changes may exist, but no Agent B-owned path may be inspected, staged, or modified.
2. Read the revised proposal, this plan, root `AGENTS.md`, `package.json`, Vitest configuration, and relevant test conventions.
3. Read and validate `agents/memory-mve/BASE_COMMIT`; record that exact value in `tests/memory-mve/cases/index.json`.
4. Confirm Agent B's worktree/branch is not opened or searched. In single-branch mode, confirm Agent B-owned paths are not opened, searched, diffed, staged, or modified.
5. Record the initial branch, fixture hash, and worktree status in the handoff notes.

**Output:** initial case index with schema/base commit but no cases yet.

**Verification:** JSON parses successfully.

### A1. Design ten realistic cases and twenty recall questions

Create 10 cases:

- 6 development cases used to validate the harness;
- 4 held-out cases not used to tune projection content or scoring code.

Cover these FractalEngine failure classes without duplicating a single rule across every case:

1. IPC gateway and browser-mock parity.
2. Svelte 5 runes and direct `$derived` use.
3. External indented SASS, tokens, and no component `<style>`.
4. Undo/redo boundary for user-editable state.
5. Hostile HTML sanitization boundary.
6. Asynchronous workspace-generation/stale-result protection.
7. Module versus project applicability.
8. Current implemented AI memory Phase 1 versus proposed future work.
9. Contribution registry requirements for commands/keybindings/actions.
10. Documentation index discovery/update behavior.

Cases should be small diagnosis, review, planning, or disposable implementation tasks. They must be realistic enough that memory could change behavior, but safe to run in throwaway worktrees.

For every case:

- write a user-facing prompt with no expected answer leakage;
- write a private gold rubric;
- identify expected memory concepts without knowing or predicting Agent B's final IDs;
- define objective expected behaviors and prohibited behaviors;
- define a critical failure only for security, destructive behavior, or a fundamental project-boundary violation;
- define commands an evaluator may run against the disposable diff.

Create 20 separate gold recall questions spanning:

- direct fact recall;
- “where is the evidence?”;
- current versus proposed behavior;
- exception/staleness awareness;
- abstention when the projection has no answer.

**Files:**

```text
tests/memory-mve/cases/index.json
tests/memory-mve/cases/prompts/CASE-01.md ... CASE-10.md
tests/memory-mve/gold/CASE-01.json ... CASE-10.json
tests/memory-mve/gold/recall-questions.json
```

**Do not:** read Agent B output or encode projected-memory wording into prompts.

### A2. Build the evaluator test-first

Create failing unit tests before the evaluator implementation.

`tests/unit/memory-mve-evaluator.test.ts` must cover:

- valid and malformed run records;
- missing gold files;
- 10-point rubric calculation;
- critical-failure override;
- memory citation/read-rate calculation;
- paired control/treatment delta calculation;
- repeated-error and stale-rule counts;
- context-token aggregation;
- anonymized condition labels for human review;
- deterministic output ordering;
- rejection of a result whose commit/case/revision does not match the index.

Implement:

```text
scripts/memory-mve/evaluate-runs.mjs
scripts/memory-mve/summarize-results.mjs
tests/memory-mve/results/.gitignore
```

`evaluate-runs.mjs` validates inputs and emits machine-readable scored results. `summarize-results.mjs` emits Markdown and JSON summaries without changing gold data.

The scripts must not invoke an AI model, edit trial worktrees, or infer missing evidence. Human rubric judgments are supplied as explicit adjudication fields and then aggregated deterministically.

**Targeted verification:**

```sh
pnpm vitest run tests/unit/memory-mve-evaluator.test.ts
node scripts/memory-mve/evaluate-runs.mjs --help
node scripts/memory-mve/summarize-results.mjs --help
```

### A3. Write the blind-run operator guide

Create `docs/harnessing/memory-mve-evaluation-guide.md` explaining exactly how the later experiment operator will:

- create disposable trial worktrees from `BASE_COMMIT`;
- keep gold/rubric files outside those worktrees;
- create fresh sessions for every run;
- randomize control/treatment order within each agent family;
- prevent cross-run memory or thread reuse;
- record model ID/date/tool permissions;
- save final response, diff, verification, timing, and token metadata;
- anonymize conditions before human adjudication;
- avoid tuning held-out cases after results are visible.

Include commands with placeholders, not machine-specific hardcoded paths.

### A4. Produce the control baseline when execution access permits

Control runs use `BASE_COMMIT` with no `.fractal/memory/context/project.md` and no new memory pointer in `AGENTS.md`.

Run each case once per available agent family in a fresh session and disposable worktree. Capture the run contract exactly.

If Agent A cannot launch two independent agent families, do not fabricate results and do not wait indefinitely. Deliver a ready-to-run harness and mark the baseline report `blocked-awaiting-agent-runs`, listing the exact missing runs.

Create `docs/harnessing/memory-mve-baseline-report.md` containing:

- frozen commit and environment;
- completed/missing run matrix;
- baseline scores and critical failures;
- repeated-error and current-rule violation counts;
- limitations and anything that threatens comparability.

### A5. Verify and hand off

Run:

```sh
pnpm vitest run tests/unit/memory-mve-evaluator.test.ts
pnpm check
git diff --check
```

Inspect the final diff by explicit Agent A-owned paths only and confirm no Agent B-owned file changed. In single-branch mode, do not run a broad diff that prints Agent B-owned content.

Commit only Agent A-owned files:

```sh
git add tests/memory-mve scripts/memory-mve/evaluate-runs.mjs scripts/memory-mve/summarize-results.mjs
git add tests/unit/memory-mve-evaluator.test.ts docs/harnessing/memory-mve-evaluation-guide.md docs/harnessing/memory-mve-baseline-report.md
git commit -m "test: add blind shared memory MVE evaluation harness"
git status --short
```

The final status may still show unrelated user work or Agent B-owned work in single-branch mode. Agent A must leave those files untouched and must not inspect their contents. Do not stage or commit a reserved integration file.

Your final handoff must state:

- branch and commit hashes;
- files changed;
- case count/split;
- whether gold remained blind;
- completed and missing control runs;
- commands/results;
- known evaluator limitations;
- explicit declaration: “I did not inspect Agent B's projection, owned files, branch, worktree, messages, or handoff.”

After sending this handoff, stop. Do not inspect Agent B's work or begin integration unless the user assigns that responsibility separately.

## 8. Agent B — Projection and Participation

If you are Agent A, read this section for context but do not execute it and do not inspect the files it names.

**Branch:** `master` in current single-branch mode; `memory-mve-projection` only if the operator explicitly restores isolated worktrees.

**Required worktree:** `apps/fractalengine` in current single-branch mode; `fractals-memory-mve-agent-b` only in isolated mode.

### Agent B outcome

Deliver a safe, compact project-memory projection based on current repository evidence, together with a minimal read contract and deterministic validation and installation. The projection must be frozen without seeing the evaluation corpus.

### B0. Orient without test leakage

1. Confirm `git branch --show-current` returns `master` in single-branch mode or `memory-mve-projection` in isolated mode. Run `git status --short`; unrelated user changes may exist, but no Agent A-owned path may be inspected, staged, or modified.
2. Read the revised proposal, this plan, root `AGENTS.md`, `package.json`, and current memory implementation.
3. Read and validate `agents/memory-mve/BASE_COMMIT`; use that exact value for projection source validation.
4. Grep `docs/INDEX.md` to identify relevant authoritative docs before opening them.
5. Confirm Agent A's branch/worktree and evaluation files will not be opened or searched. In single-branch mode, confirm Agent A-owned paths are not opened, searched, diffed, staged, or modified.
6. Record the initial branch, fixture hash, and worktree status in the handoff notes.

### B1. Curate 20–40 evidence-bearing memories

Create `agents/memory-mve/projection/project.md` using the frozen projection contract.

Selection rules:

- Use only authority A or B.
- Prefer high-value, easy-to-miss, dynamic, cross-session knowledge over obvious restatements of root `AGENTS.md`.
- At least 60% of items must add navigation, current-state, rationale, exception, gotcha, or verified-boundary value not already stated plainly in root `AGENTS.md`.
- Include a balanced set of rules, current decisions, verified facts, verified gotchas/procedures, and unresolved risks.
- Cover the AI, IDE/core, Designer, Notes, Bookmarks/data, security, documentation, and test boundaries only where repository evidence supports them.
- Distinguish implemented behavior from proposed ADR/design behavior.
- Include current source/ADR status and observation date.
- Keep total projection length at or below 1,500 words.

Prohibited content:

- secrets or environment values;
- raw chat excerpts;
- inferred user preferences;
- external/web claims;
- speculative fixes;
- imperative instructions unsupported by authority A;
- stale assertions contradicted by current source;
- language chosen to anticipate or answer unseen evaluation cases.

Before finalizing each item, inspect its cited source at `BASE_COMMIT`. Do not rely on recollection.

### B2. Define and validate the projection contract

Create `agents/memory-mve/projection/projection.schema.json` for frontmatter/item metadata represented by the validator.

Create failing tests first in `tests/unit/memory-projection-contract.test.ts`. Cover:

- exact schema/revision/status values;
- 20–40 unique IDs;
- allowed kinds, authority tiers, validity, and module tags;
- one claim per item;
- required source/relevance fields;
- existing repository-relative source paths;
- forbidden line-number-only locators;
- word budget;
- secret-like patterns and private-key markers;
- prohibition of external URLs and Tier C/D content;
- duplicate IDs and exact/normalized duplicate claims; semantic near-duplicates remain a required manual review;
- `source_commit` matching the provided base commit;
- required privacy disclosure;
- installed and tracked projection byte-for-byte equivalence.

Implement:

```text
scripts/memory-mve/validate-projection.mjs
scripts/memory-mve/install-projection.mjs
```

Validator requirements:

- exit non-zero with actionable errors;
- never rewrite the projection;
- accept `--base-commit` and `--projection`;
- check sources against the specified Git revision, not only the current working tree;
- output JSON with `valid`, `errors`, `warnings`, word count, item count, and source count.

Installer requirements:

- validate first;
- accept `--projection <path>` and `--workspace-root <path>` so integration can install the tracked projection from the tooling worktree into a disposable trial worktree without copying the tooling itself;
- default `--projection` to `agents/memory-mve/projection/project.md` and `--workspace-root` to the current FractalEngine project root;
- create `.fractal/memory/context/` if absent;
- write to a temporary sibling file;
- atomically rename to `project.md`;
- support `--uninstall` that removes only the installed MVE projection and empty directories it created;
- never touch `memory.db`;
- never modify the tracked source projection;
- print installed revision and target path.

**Targeted verification:**

```sh
BASE_COMMIT="$(tr -d '[:space:]' < agents/memory-mve/BASE_COMMIT)"
pnpm vitest run tests/unit/memory-projection-contract.test.ts
node scripts/memory-mve/validate-projection.mjs --projection agents/memory-mve/projection/project.md --base-commit "$BASE_COMMIT"
node scripts/memory-mve/install-projection.mjs --base-commit "$BASE_COMMIT" --projection agents/memory-mve/projection/project.md --workspace-root .
test -f .fractal/memory/context/project.md
node scripts/memory-mve/install-projection.mjs --uninstall --workspace-root .
```

### B3. Add the minimal `AGENTS.md` read contract

Add one concise section to root `AGENTS.md`. Do not add write participation, receipts, inbox instructions, or deferred architecture.

Required meaning:

```markdown
## Experimental Local Project Memory

If `.fractal/memory/context/project.md` exists:

1. Read it before starting substantive work.
2. Treat it as sourced, possibly stale evidence; current user instructions, current `AGENTS.md`, current source, and current tests take precedence.
3. Verify consequential claims using the cited repository source.
4. In the final response, list the `MVE-*` IDs that materially influenced the work, or state that none did.
5. If the file is absent, invalid, or unreadable, continue the task without it.
```

The exact prose may be tightened, but none of these semantics may be removed.

Keep this `AGENTS.md` change in a standalone commit so the later integration pass can apply it to treatment worktrees without exposing Agent B's tooling or tracked source projection.

Create that commit immediately after the section is final, staging no other file:

```sh
git add AGENTS.md
git commit -m "test: add experimental local memory read contract"
AGENTS_COMMIT="$(git rev-parse HEAD)"
git show --name-only --format= "$AGENTS_COMMIT"
```

The final command must list only `AGENTS.md`.

### B4. Write the projection operator guide

Create `docs/harnessing/memory-mve-projection-guide.md` documenting:

- tracked source versus gitignored installed projection;
- privacy warning: any workspace-capable tool can read the installed projection;
- validate/install/uninstall commands;
- how `BASE_COMMIT`, revision, and source pointers work;
- why current sources override memory;
- how to update an item without changing IDs casually;
- how to report a stale or incorrect memory during the experiment;
- explicit statement that this MVE does not collect agent contributions.

### B5. Verify and hand off

Run:

```sh
pnpm vitest run tests/unit/memory-projection-contract.test.ts
pnpm check
git diff --check
```

Install and uninstall once, verifying no database or unrelated `.fractal` content is touched.

Inspect the final diff by explicit Agent B-owned paths only and confirm no Agent A-owned file changed. In single-branch mode, do not run a broad diff that prints Agent A-owned content.

Commit the remaining Agent B-owned files without amending or squashing the standalone `AGENTS.md` commit:

```sh
git add agents/memory-mve/projection scripts/memory-mve/install-projection.mjs scripts/memory-mve/validate-projection.mjs
git add tests/unit/memory-projection-contract.test.ts docs/harnessing/memory-mve-projection-guide.md
git commit -m "test: add experimental project memory projection"
git status --short
```

The final status may still show unrelated user work or Agent A-owned work in single-branch mode. Agent B must leave those files untouched and must not inspect their contents. `agents/memory-mve/BASE_COMMIT` must remain unchanged.

Your final handoff must state:

- branch and commit hashes;
- the standalone `AGENTS.md` commit hash;
- files changed;
- projection item/word/source counts;
- authority A/B distribution;
- validator/install results;
- privacy or staleness limitations;
- explicit declaration: “I did not inspect Agent A's cases, prompts, gold rubrics, evaluator, baseline, owned files, branch, worktree, messages, or handoff.”

After sending this handoff, stop. Do not inspect Agent A's work or begin integration unless the user assigns that responsibility separately.

---

## 9. How the two roles run in parallel

In the current single-master setup, both agents start from `apps/fractalengine` on `master`. Each reads the same recorded `BASE_COMMIT` and proceeds only within its owned files. The timeline is still parallel, but branch isolation is replaced by strict path isolation.

In isolated mode, the agents may instead start from the two Phase 0 worktrees. Do not mix the modes for the same run.

```text
Time ─────────────────────────────────────────────────────────────►

Agent A:   A0 → A1 corpus freeze → A2 evaluator → A3 guide → A4 control runs → A5 handoff

Agent B:   B0 → B1 projection ───→ B2 validator → B3 AGENTS → B4 guide ─────→ B5 handoff

Gate 1:                         both freeze corpus/projection independently
Gate 2:                                                                    integration
```

### Gate 1 — Blind freeze

Gate 1 is reached when:

- Agent A commits all 10 prompts and gold rubrics and declares them frozen.
- Agent B commits the 20–40 memory projection and declares it frozen.
- Neither has inspected the other's artifacts.

After both handoffs, the integration pass may map Agent A's semantic memory placeholders to actual `MVE-*` IDs without changing prompts or scoring expectations. If an expected memory does not exist, record the gap; do not ask Agent B to add an answer for a held-out case.

### Communication before both handoffs

The agents may receive clarification about:

- whether Phase 0 completed successfully, without changing the recorded base commit;
- file ownership questions;
- schema interpretation;
- repository/tool availability;
- blocking ambiguity in this plan.

The agents must not exchange case content, projection content, rubrics, memory IDs, or expected outcomes. Neither agent needs a progress update from the other in order to finish its own role.

## 10. Integration procedure — not part of Agent A or Agent B's assignment

This section defines what happens after both handoffs. It is included so both agents understand the downstream contract. Neither Agent A nor Agent B executes it under the one-line role assignment.

The operator or one separately assigned integration agent performs this section once. Neither implementation agent merges, cherry-picks, or edits the other's work as part of its role.

In single-master mode, there may be no implementation branches to merge. The integration agent reviews the Agent A-owned and Agent B-owned commits already on `master`, verifies that file ownership was respected, and then proceeds from that combined state. If either agent left uncommitted files, integration stops until the owner commits or explicitly abandons them.

### I0. Create the integration worktree

In isolated mode, create the integration branch from the untouched coordination branch, not from either implementation branch:

```sh
REPO_ROOT="$(git rev-parse --show-toplevel)"
INTEGRATION_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-integration"
git worktree add "$INTEGRATION_WORKTREE" -b memory-mve-integration memory-mve-coordination
cd "$INTEGRATION_WORKTREE/apps/fractalengine"
BASE_COMMIT="$(tr -d '[:space:]' < agents/memory-mve/BASE_COMMIT)"
git cat-file -e "$BASE_COMMIT^{commit}"
```

### I1. Review both handoffs

1. Confirm blind-freeze declarations.
2. Confirm file ownership was respected.
3. Review commits individually. In single-master mode, use the commit list and path ownership rather than branch names.
4. Reject mixed-scope or unrelated changes.
5. Resolve no conflicts by silently choosing one side; conflicts indicate the ownership plan was violated.

### I2. Verify Agent A independently

In single-master mode, run these from `apps/fractalengine` after Agent A's owned commits are present. In isolated mode, use the worktree path shown below.

```sh
cd "$(dirname "$REPO_ROOT")/fractals-memory-mve-agent-a/apps/fractalengine"
pnpm vitest run tests/unit/memory-mve-evaluator.test.ts
node scripts/memory-mve/evaluate-runs.mjs --help
node scripts/memory-mve/summarize-results.mjs --help
```

Inspect development and held-out case counts, rubric totals, and leakage controls.

### I3. Verify Agent B independently

In single-master mode, run these from `apps/fractalengine` after Agent B's owned commits are present. In isolated mode, use the worktree path shown below.

```sh
cd "$(dirname "$REPO_ROOT")/fractals-memory-mve-agent-b/apps/fractalengine"
pnpm vitest run tests/unit/memory-projection-contract.test.ts
node scripts/memory-mve/validate-projection.mjs --projection agents/memory-mve/projection/project.md --base-commit "$BASE_COMMIT"
```

Manually inspect every authority A item and a sample of authority B sources. Reject any item that overstates its source.

### I4. Combine implementation work

In single-master mode, do not merge implementation branches. Confirm both role-owned commits are already on `master`, then create the local `tests/memory-mve/results/memory-map.json` after both handoffs.

In isolated mode, merge from the integration worktree:

```sh
cd "$INTEGRATION_WORKTREE/apps/fractalengine"
git merge --no-ff memory-mve-evaluation -m "merge: memory MVE evaluation harness"
git merge --no-ff memory-mve-projection -m "merge: memory MVE projection harness"
git status --short
```

Any merge conflict in isolated mode means file ownership was violated or the coordination base drifted. Investigate the branch histories; do not force a resolution merely to continue.

After the work is combined, create the local `tests/memory-mve/results/memory-map.json` by mapping Agent A's frozen semantic concepts to Agent B's frozen `MVE-*` IDs. Do not edit prompts, rubrics, projection items, or expected outcomes. Record missing mappings as coverage gaps.

### I5. Create the treatment commit

Read the standalone `AGENTS.md` commit hash from Agent B's handoff. Create a treatment worktree directly from the recorded fixture and cherry-pick only that commit:

```sh
TREATMENT_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-treatment"
git worktree add "$TREATMENT_WORKTREE" -b memory-mve-treatment "$BASE_COMMIT"
git -C "$TREATMENT_WORKTREE" cherry-pick <AGENT_B_AGENTS_COMMIT>
TREATMENT_COMMIT="$(git -C "$TREATMENT_WORKTREE" rev-parse HEAD)"
```

Verify the treatment commit:

```sh
git -C "$TREATMENT_WORKTREE" diff --name-only "$BASE_COMMIT..$TREATMENT_COMMIT"
git -C "$TREATMENT_WORKTREE" diff "$BASE_COMMIT..$TREATMENT_COMMIT" -- apps/fractalengine/AGENTS.md
test ! -e "$TREATMENT_WORKTREE/apps/fractalengine/tests/memory-mve"
test ! -e "$TREATMENT_WORKTREE/apps/fractalengine/agents/memory-mve/projection"
```

The only tracked difference must be the minimal `apps/fractalengine/AGENTS.md` section. The treatment branch deliberately contains no projection source, installer, evaluator, cases, or gold data.

Do not install the projection only in this template worktree and assume later worktrees inherit it: `.fractal/` is gitignored. Install the projection separately into every disposable treatment worktree as described in Section 11.1.

Control commit: `BASE_COMMIT`. Treatment commit: `TREATMENT_COMMIT`.

### I6. Run combined repository verification

After merging both implementation branches:

```sh
pnpm check
pnpm test:unit
git diff --check
```

Rust, Playwright, and production build are not required solely for documentation/Node evaluation tooling unless an agent touched production or Rust code. Any unauthorized production-code change expands verification to the complete quality suite and should normally be rejected instead.

---

## 11. Paired experiment execution — integration responsibility

### 11.1 Trial isolation

For each agent-family/case/condition combination, create a new run ID and a new detached disposable worktree. Set `TRIAL_COMMIT` to `BASE_COMMIT` for control and `TREATMENT_COMMIT` for projection:

```sh
RUN_ID="<agent-family>-<case-id>-<control-or-projection>"
TRIAL_COMMIT="<BASE_COMMIT-or-TREATMENT_COMMIT>"
TRIAL_WORKTREE="$(dirname "$REPO_ROOT")/fractals-memory-mve-run-$RUN_ID"
git worktree add --detach "$TRIAL_WORKTREE" "$TRIAL_COMMIT"
```

For a control run, assert that neither the pointer nor projection exists:

```sh
test ! -e "$TRIAL_WORKTREE/apps/fractalengine/.fractal/memory/context/project.md"
git -C "$TRIAL_WORKTREE" show HEAD:apps/fractalengine/AGENTS.md | rg 'Experimental Local Project Memory' && exit 1 || true
```

For a treatment run, install from the integration worktree into the disposable trial worktree:

```sh
node "$INTEGRATION_WORKTREE/apps/fractalengine/scripts/memory-mve/install-projection.mjs" \
  --base-commit "$BASE_COMMIT" \
  --projection "$INTEGRATION_WORKTREE/apps/fractalengine/agents/memory-mve/projection/project.md" \
  --workspace-root "$TRIAL_WORKTREE/apps/fractalengine"

test -f "$TRIAL_WORKTREE/apps/fractalengine/.fractal/memory/context/project.md"
rg '^revision: mve-001$' "$TRIAL_WORKTREE/apps/fractalengine/.fractal/memory/context/project.md"
git -C "$TRIAL_WORKTREE" show HEAD:apps/fractalengine/AGENTS.md | rg 'Experimental Local Project Memory'
```

Then:

1. Start a fresh agent thread/session with no prior trial context.
2. Give it only the selected case prompt. Never expose the case index, gold file, rubric, projection source, implementation manual, or condition label.
3. Let the agent work normally within the case's stated scope.
4. Save its final response, diff, verification output, start/end times, model identifier, tool permissions, and token metadata when available under the ignored result directory in the integration worktree.
5. Confirm the run record matches the contract in Section 6.4.
6. After every artifact is captured, remove the disposable worktree:

```sh
git worktree remove --force "$TRIAL_WORKTREE"
```

Do not reuse an agent session between control and treatment. Do not tell the agent it is expected to improve under one condition.

### 11.2 Order randomization

For each agent family:

- Randomize whether control or treatment runs first per case.
- Interleave cases; do not run all controls followed by all treatments.
- Keep model/tool permissions constant within a paired comparison.
- If the model materially changes mid-experiment, mark affected pairs incomparable and rerun both sides.

### 11.3 Human adjudication

The evaluator anonymizes condition labels. A reviewer scores outputs against gold rubrics without knowing control/treatment. Deterministic scripts aggregate the supplied scores.

The reviewer must not change a gold rubric after viewing a treatment output. Ambiguous rubric defects are recorded and the affected pair excluded rather than retrofitted.

### 11.4 Recall questions

Run the 20 recall questions separately from coding tasks under both conditions. Use one fresh recall session per agent-family/condition combination (four sessions at the target matrix), present questions in a recorded randomized order, and do not reuse a coding-task session. Score:

- correct answer;
- correct source/evidence;
- correct abstention;
- stale/current distinction;
- relevant memory ID citation in treatment.

Recall results are supporting evidence; coding-task behavior remains the primary outcome.

---

## 12. Go/no-go rules

The decision uses all completed comparable pairs. The target matrix is 20 pairs (2 agent families × 10 cases).

### 12.1 Mandatory safety gates

All must pass:

- No secret/private content appears in the tracked or installed projection.
- No treatment run is blocked because memory is absent, invalid, or unreadable.
- No treatment run treats a Tier B memory as authority over current source/instructions.
- No unsupported or stale projected claim causes a new critical failure.
- Treatment critical-failure count is not greater than control.
- Installed projection remains at or below 1,500 words and estimated added context at or below 2,500 tokens.

Failure of any safety gate is **STOP**, not “average it against other improvements.”

### 12.2 Read/compliance gate

At least 80% of treatment runs must demonstrate projection use by citing the relevant `MVE-*` ID or accurately reporting that none applied. With 20 treatment runs, at least 16 must satisfy this gate.

If the gate fails, the result is **INCONCLUSIVE**. Do not build the write pipeline. Diagnose instruction discovery separately with new cases.

### 12.3 Outcome gate

All must hold:

- Mean treatment score improves by at least 1.0 point on the 10-point rubric.
- At least 10 of 20 paired tasks improve and no more than 4 regress.
- Combined repeated-error/current-rule violation count drops by at least 25%; if the control count is below 4, require an absolute reduction of at least 1 with no new critical violation.
- Held-out results have a positive mean delta; development-only improvement is insufficient.
- User-correction-caused-by-memory count is zero during the MVE.

### 12.4 Decision

- **GO:** all safety, read, and outcome gates pass. Authorize planning for Phase 3: human-approved extraction from existing FractalEngine chats.
- **STOP:** any safety gate fails, mean outcome delta is zero/negative, or treatment creates material new errors. Remove the experimental `AGENTS.md` section and uninstall the projection.
- **INCONCLUSIVE:** missing runs, insufficient read rate, incomparable model changes, or outcome improvement below threshold without material harm. Do not proceed automatically. Write a new bounded experiment with fresh held-out cases.

There is no silent threshold adjustment after results are known.

---

## 13. Documentation and cleanup

### 13.1 During the MVE

- Do not update ADR-011 as if the broader architecture were accepted.
- Do not update `docs/design/AI-MEMORY-ARCHITECTURE.md` with unproven behavior.
- The plan, projection/evaluation guides, and result reports must describe the system as experimental.
- No component/routing/style documentation changes are required because this scope adds no UI or production component.

### 13.2 After decision

On **GO**:

- record the MVE result in a new decision note or proposed ADR-011 revision;
- use `adr-writing` and `doc-frontmatter` before changing authoritative ADR/index entries;
- create a separate implementation plan for human-approved chat extraction;
- keep the projection installed only if the user approves continued experimental use.

On **STOP**:

- uninstall `.fractal/memory/context/project.md`;
- remove or disable the experimental `AGENTS.md` section;
- retain evaluation artifacts and a concise failure report;
- do not implement extraction, external writes, retrieval, or user-global memory.

On **INCONCLUSIVE**:

- leave broader phases blocked;
- decide explicitly whether to uninstall the projection while a follow-up experiment is designed;
- do not reuse exposed held-out cases as held-out evidence.

### 13.3 Worktree and branch cleanup

Do not remove any worktree until its commits, handoff, and required run artifacts have been verified. After the decision report is safely committed, run cleanup from the original monorepo worktree—not from a worktree being removed:

```sh
git worktree remove "$(dirname "$(git rev-parse --show-toplevel)")/fractals-memory-mve-agent-a"
git worktree remove "$(dirname "$(git rev-parse --show-toplevel)")/fractals-memory-mve-agent-b"
git worktree remove "$(dirname "$(git rev-parse --show-toplevel)")/fractals-memory-mve-fixture"
git worktree remove "$(dirname "$(git rev-parse --show-toplevel)")/fractals-memory-mve-treatment"
git worktree remove "$(dirname "$(git rev-parse --show-toplevel)")/fractals-memory-mve-integration"
git worktree prune
```

If a worktree is dirty, stop and inspect it; do not add `--force` to this final cleanup. Retain the branches until the result and any desired implementation commits have been integrated or archived. Branch deletion is a separate operator decision.

---

## 14. Completion checklists

### 14.1 Agent A is finished when

- [ ] The 10 cases and 20 recall questions exist and the 6/4 split is recorded.
- [ ] Prompts, rubrics, and semantic expectations were frozen without projection exposure.
- [ ] Evaluator and summarizer behavior is covered by targeted tests.
- [ ] The operator guide is sufficient for a person unfamiliar with the implementation to run the experiment.
- [ ] The baseline report contains real results or names every unavailable run explicitly.
- [ ] No Agent B-owned or reserved integration file changed.
- [ ] Required verification was run and reported.
- [ ] The A5 handoff includes the full blindness declaration.

### 14.2 Agent B is finished when

- [ ] The projection contains 20–40 evidence-bearing A/B-tier items and stays within budget.
- [ ] Every item was checked against its cited source at `BASE_COMMIT`.
- [ ] Validator, atomic install, and uninstall behavior are covered by targeted tests.
- [ ] Root `AGENTS.md` contains only the minimal experimental read contract.
- [ ] The `AGENTS.md` change is available as a standalone commit.
- [ ] The operator guide explains privacy, precedence, maintenance, and removal.
- [ ] No Agent A-owned or reserved integration file changed.
- [ ] Required verification was run and reported.
- [ ] The B5 handoff includes the full blindness declaration.

### 14.3 The complete MVE is finished after integration when

The MVE implementation is complete only when:

- [ ] Phase 0 produced clean coordination, fixture, Agent A, and Agent B branches/worktrees.
- [ ] Both agents consumed the same hash from `agents/memory-mve/BASE_COMMIT`.
- [ ] The fixture retained current project state while excluding all MVE documents and artifacts.
- [ ] Both agents respected file ownership.
- [ ] Blind freeze occurred before cross-role mapping.
- [ ] Ten cases and twenty recall questions exist.
- [ ] Projection contains 20–40 A/B-tier items and is within budget.
- [ ] Projection validator and installer pass targeted tests.
- [ ] Evaluator and summarizer pass targeted tests.
- [ ] Control and treatment worktrees contain no gold files.
- [ ] Trial sessions are independent and model/tool metadata is recorded.
- [ ] Human adjudication is condition-blind.
- [ ] All comparable runs are aggregated without changing thresholds.
- [ ] Safety, read, and outcome gates are evaluated explicitly.
- [ ] A GO, STOP, or INCONCLUSIVE report is written.
- [ ] Projection/AGENTS cleanup or continuation matches that decision.
- [ ] `pnpm check`, `pnpm test:unit`, and relevant targeted tests pass.
- [ ] `git diff --check` is inspected with unrelated pre-existing failures identified separately.
- [ ] No deferred memory feature was implemented accidentally.