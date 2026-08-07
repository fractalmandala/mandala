---
id: sp-spec-2026-07-15-shared-agent-memory-harness-proposal
title: Superpowers Spec: 2026-07-15-shared-agent-memory-harness-proposal
type: archive
tags: [superpowers, spec, history]
updated: 2026-07-15
---

> **Historical superpowers specification — kept as reference.**

# Shared Local Agent Memory and Context Harness

## Proposal status

This document is a revised proposal following critical external review. It is not an accepted architecture decision and does not authorize implementation. It deliberately separates the eventual architecture from the minimum experiment that must prove value before the broader system is built. Accepted decisions should update ADR-011 and its companion design document before production implementation begins.

## Executive proposal

FractalEngine should evolve its existing encrypted, project-scoped chat persistence into a shared local memory and context harness used by:

- FractalEngine's own AI chat surfaces;
- coding agents working inside FractalEngine;
- coding agents opened on the FractalEngine repository by external IDEs or terminal applications;
- future local agent applications capable of reading and writing ordinary project files.

The recommended architecture has two complementary surfaces:

1. **A serverless, repository-native exchange protocol** under the gitignored `.fractal/memory/` directory. Agents participate through normal file reads and atomic file creation. No MCP server, daemon, port, plugin handshake, or tool discovery is required.
2. **An encrypted local SQLite memory kernel** owned by FractalEngine. It stores private evidence, durable memories, feedback, retrieval telemetry, and evaluation results. It ingests the filesystem exchange and generates compact, agent-readable context projections.

The target system uses four applicability scopes—session, module, project, and user-global—plus non-authoritative links such as workstream, file, component, ADR, test, and commit. The minimum experiment uses project memory only, with module represented as a simple applicability tag. User-global memory remains a core local-only objective but its implementation is deferred until project memory proves useful. Inferred user-global memories will eventually enter a review queue; automatic low-risk promotion remains an earned, later capability.

Sanskrit is not part of the technical architecture. The original inquiry helped surface useful questions about evidence, rules and exceptions, temporal validity, reinforcement, and competing claims, but these have standard knowledge-representation equivalents and should be designed and evaluated under those established names. Evidence typing, bitemporal validity, and scoped exceptions belong to sound core schema design; speculative action-role extraction and competing-claim machinery are deferred unless observed failures justify them.

The central success criterion is not “the system stored more.” It is:

> Agents make fewer repeated mistakes, obey current project rules more reliably, recover relevant prior decisions with evidence, handle corrections and obsolete facts correctly, and do so without excessive context, latency, fragility, or user maintenance.

The first question is narrower:

> Does a small, curated, evidence-bearing project-memory projection improve agent behavior beyond FractalEngine's existing `AGENTS.md`, `docs/INDEX.md`, ADR, routing-documentation, and skill system?

No external write protocol, automatic extractor, second database, or memory UI should be built until that question has a positive answer.

---

## Review disposition

The external review's sequencing and safety criticisms are substantially accepted. The following decisions govern this revision.

### Accepted

- Prove read-side value before building external writes.
- Treat the existing instruction/documentation system as the control condition.
- Measure whether real agents actually read and use a projection.
- Make task receipts optional enrichment rather than success criteria.
- Replace generic “validation” with provenance-tier admission rules that prevent inference laundering.
- Specify extraction privacy, model, cost, and approval before automated extraction begins.
- Define worktree, multi-instance, atomic projection, and deletion semantics before external writes.
- Reduce ongoing measurement to a sustainable automated scorecard; use broad ablations only at decision gates.
- Use standard knowledge-representation terminology and remove Sanskrit as a technical layer.

### Accepted with modification

- User-global memory is deferred from the minimum experiment, not removed from the target architecture.
- Module is a tag/filter in the minimum experiment but remains a meaningful applicability boundary in the target architecture.
- Markdown projection is sufficient as the first inspector, but not as the eventual correction, provenance, privacy, and global-review interface.
- Passive project outcomes are a useful floor, but cannot replace cooperative rationale and user-correction capture.

### Not adopted

- The target architecture is not reduced to project/session memory permanently; doing so would discard explicit user objectives.
- Evaluation is not permanently limited to three metrics. A small always-on scorecard is supplemented by richer go/no-go evaluations.
- Stale projections are not treated as authoritative memory. They are evidence-bearing hints; current sources and instructions always win.

---

## 1. Problem statement

FractalEngine currently has durable project chat history, but it does not yet have a shared memory system that compounds knowledge across agents and application surfaces.

The intended outcome is a local memory substrate where:

1. A chat inside FractalEngine and a coding task in an external IDE contribute to the same project understanding.
2. A later agent can recall relevant decisions, procedures, corrections, and known failure modes without loading full transcripts.
3. Memories remain attributable to evidence and can be corrected, superseded, scoped, retired, or deleted.
4. Module-specific knowledge is available without flooding unrelated work with the whole repository's history.
5. Stable user preferences can follow the user locally between projects, but project facts cannot silently become global preferences.
6. Participation does not depend on a network service or fragile tool-discovery mechanism.
7. Progress can be measured through a sustainable automated scorecard and explicit phase-gate comparisons against a recorded baseline.

### 1.1 Non-goals

This proposal does not attempt to:

- make agents speak or reason in Sanskrit;
- replace model tokenizers;
- capture private chain-of-thought;
- record keystrokes, screens, or indiscriminate terminal history;
- synchronize memory through a cloud service;
- share memory between users;
- train or fine-tune an LLM;
- make memory an availability dependency for ordinary development work;
- guarantee participation by an agent that ignores repository instructions and cannot access project files.

---

## 2. Existing FractalEngine baseline

This is an extension of shipped foundations, not a greenfield system.

### 2.1 Implemented today

ADR-011 Phase 1 is present in the repository:

- `src-tauri/src/memory.rs` creates one `.fractal/memory.db` per selected project.
- SQLite tables persist sessions, messages, checkpoints, timestamps, titles, and initial model metadata.
- Chat content is encrypted with AES-256-GCM using a memory-specific key held through the OS keychain.
- Historical plaintext chat rows are migrated during project-memory opening.
- `open_project_memory`, `append_message`, `list_sessions`, `load_session`, `create_checkpoint`, and `restore_checkpoint` are registered Tauri commands.
- All frontend access crosses the single typed gateway in `src/lib/ipc.ts`.
- Browser development has matching localStorage-backed implementations in `src/lib/ipc-mock.ts`.
- `IpcApi` and `tests/unit/ipc-contract.test.ts` enforce gateway/mock parity.
- Workspace generation and project-path checks prevent stale asynchronous results from mutating a newly selected workspace.
- The dedicated AI module embeds the existing AI chat and surfaces persisted project sessions.
- The repository already ignores `.fractal/`, which supports a local-only exchange without committing private memory.

### 2.2 Missing today

The following proposed ADR-011 capabilities are not implemented:

- typed durable memories;
- extraction of candidate memories from chat or agent events;
- evidence/provenance links;
- lexical or semantic retrieval over memories;
- context compilation and injection;
- consolidation, contradiction handling, decay, or retirement;
- a shared participation protocol for external coding agents;
- session/module/project/user-global applicability;
- a user-global proposal queue;
- memory inspection, correction, health, and evaluation surfaces;
- benchmarks proving that memory improves outcomes.

### 2.3 Documentation drift to correct after review

ADR-011 and `docs/design/AI-MEMORY-ARCHITECTURE.md` still describe `rusqlite` and Phase 1 persistence as future work. An accepted revision should distinguish the implemented baseline from the new proposal and replace the earlier assumption that coding-agent workflow memory is separate from end-user chat memory.

---

## 3. Design principles

1. **Local-first and local-only:** no remote memory service or cloud synchronization.
2. **Serverless participation:** the universal path works through ordinary project files with no required running process.
3. **One shared memory, multiple projections:** store each accepted memory once and calculate applicability rather than copying it into independent stores.
4. **Evidence before belief:** durable claims retain provenance and distinguish observation, user instruction, test result, documentation, and agent inference.
5. **Raw evidence is not durable memory:** retain raw events for audit and reprocessing, then extract compact candidates asynchronously.
6. **Explicit authority:** retrieved similarity never overrides current project instructions, security boundaries, or direct user intent.
7. **Graceful progression:** memory failures are visible but do not block the requested task.
8. **No agent silos:** contributing model/application is provenance, not an ownership boundary.
9. **Measure before automating:** user-global automatic promotion must be earned from observed precision.
10. **Rebuildable derived state:** search indexes and context projections can be regenerated from accepted records and retained evidence.
11. **Inspectability:** users can ask what is remembered, why, where it applies, when it was valid, and how it affected a prompt.
12. **Minimal context footprint:** compile task-specific context rather than prepend a growing memory dump.

---

## 4. Proposed architecture

This section describes the target architecture, not the first implementation commitment. The minimum experiment described in §16 uses only a hand-curated read-only projection and a short `AGENTS.md` pointer.

```text
External coding agents                         FractalEngine AI chats
        │                                               │
        │ ordinary file reads/writes                    │ internal typed API
        ▼                                               ▼
.fractal/memory exchange ──────► deterministic ingestion pipeline
        ▲                                               │
        │ generated safe context projections            ▼
        └──────────────────────── encrypted SQLite memory kernel
                                                        │
                                                        ├─ extraction
                                                        ├─ validation
                                                        ├─ consolidation
                                                        ├─ retrieval
                                                        ├─ context compiler
                                                        ├─ feedback policy
                                                        └─ evaluation ledger
```

### 4.1 Why the filesystem is the interoperability boundary

Agents working on a repository already need filesystem access. A project-file protocol avoids common operational failures of server-based integration:

- server not started;
- tool not discovered;
- port or socket failure;
- client/server version mismatch;
- authentication or permission handshake failure;
- editor-specific plugin behavior;
- FractalEngine being closed.

The file protocol is the required compatibility layer. A CLI or MCP adapter may exist later as optional convenience, but neither is part of correctness.

The read side and write side are intentionally decoupled:

- **Read side:** generated, evidence-bearing context projections. This is tested first.
- **Write side:** agent events, receipts, ingestion, extraction, and consolidation. This is built only after the read side demonstrates value and agent compliance is measured.

### 4.2 Why SQLite remains the private kernel

The existing SQLite foundation provides transactions, migrations, indexing, bounded queries, and encrypted sensitive fields. External agents should not write the database directly because that would expose schema migrations, encryption keys, write contention, and validation rules to every client.

The logical memory spans two physical local stores:

- the existing project database at `<project>/.fractal/memory.db` holds session, module, and project evidence/memory;
- an encrypted database in FractalEngine's OS application-data directory holds user-global candidates, approved preferences, cross-project feedback, and sessions that are not attached to an open project.

The context compiler merges them at read time. A safe, approved subset of user-global memory is projected into `.fractal/memory/context/user-approved.md`; the global source record remains stored once in the application-data database.

An unbound chat session is not user-global memory. It remains session-scoped in application data. Linking or moving it to a project is explicit, and any global candidates extracted from it follow the same review policy as project-derived candidates.

The second, user-global physical store is a target-architecture decision, not part of the minimum experiment or first production release.

### 4.3 No mandatory background service

FractalEngine ingests pending events when running, on project open, after internal chats, at safe idle points, and before generating context. If the app is closed, events wait in the filesystem inbox. A bundled reconciliation command may provide immediate indexing, but the protocol remains usable without it.

### 4.4 Worktrees and multiple instances

The minimum experiment keeps a read-only projection inside the worktree being tested. Before any external write path is implemented, the system must adopt explicit canonical semantics:

- Resolve a stable project identity independently from a worktree path.
- For Git repositories, use the shared Git common directory as the canonical-repository anchor; for non-Git folders, use the authorized project root.
- Associate every event with project identity, worktree path, branch, and base commit.
- Keep projections worktree-local because current source and branch state can differ.
- Serialize canonical ingestion and context revisions through a database lease or equivalent single-writer transaction.
- Generate each projection through write-to-temporary-file plus atomic rename so readers never see a partial projection.
- Treat a second FractalEngine instance as another client of the same lease, not another projection owner.

The security design must explicitly authorize the resolved Git common directory before accessing it. Existing project-path authorization cannot be bypassed implicitly.

---

## 5. Memory applicability model

### 5.1 Scopes

| Scope | Purpose | Example | Default lifetime |
|---|---|---|---|
| Session | Active conversational or task working state | “Investigating checkpoint restore ordering” | Session/workstream dependent |
| Module | Knowledge specific to a FractalEngine domain | “Designer mutations use the designcanvas undo boundary” | Until superseded or retired |
| Project | Repository-wide facts, decisions, and rules | “All Tauri calls cross `ipc.ts`” | Until superseded or retired |
| User-global | Stable, approved preferences applicable across local projects | “Prefer local-first storage” | Until edited or retired by user |

Module is a project-bounded applicability scope, not an independent database. A record may apply to multiple modules. Cross-module rules remain project-scoped.

### 5.2 Context links

The following are query and provenance links, not authority scopes:

- workstream/task;
- files and directories;
- components and modules;
- documentation and ADR identifiers;
- tests and commands;
- commits and diffs;
- chat sessions and messages;
- contributing agent/application.

### 5.3 Authority is not proximity

Retrieval should consider applicability, but a nearby session inference must not override an authoritative project rule. Context compilation ranks and filters using:

```text
authority + applicability + evidence quality + current validity
+ task relevance + feedback history + freshness
```

Current user instructions and authoritative repository instructions are assembled separately from memory and always take precedence.

---

## 6. Two-stage capture model

### 6.1 Stage A: raw event ledger

Capture auditable source events before interpreting them. Relevant event types include:

- completed user and assistant chat turns;
- agent task start, continuation, and completion receipts;
- explicit decisions and user corrections;
- file changes associated with a task;
- test/build/lint outcomes;
- selected tool actions with durable significance;
- commits and documentation changes;
- memory approvals, edits, rejections, downgrades, and retirements.

Do not capture keystrokes, screens, unrelated conversations, indiscriminate shell history, verbose tool noise, secrets, or private reasoning traces.

### 6.2 Stage B: candidate extraction and promotion

Automatic extraction is not part of the minimum experiment. The first projection is manually curated. The next step extracts candidates from existing FractalEngine chat history into a mandatory human-approval queue; it does not activate them automatically.

Before an automated extractor is implemented, a separate design gate must specify:

- deterministic parsing versus LLM extraction;
- exact model and invocation path;
- whether processing is local or remote;
- content eligible for remote processing;
- per-event cost and latency budget;
- structured-output validation and retry behavior;
- behavior when no extractor is available;
- measured precision on a held-out candidate set.

Default policy: local/manual processing only. A remote provider may be used only through explicit user opt-in for content the user knowingly allows to leave the machine; storage remains local regardless. Extraction failure never affects chat streaming or primary agent work.

When extraction is enabled, transform raw evidence into zero or more compact candidates. Candidates pass admission before becoming active memories:

1. Validate schema and scope.
2. Scan for secrets and disallowed content.
3. Link evidence.
4. Compare with existing memories.
5. Classify as novel, confirmation, contradiction, exception, duplicate, or correction.
6. Assign confidence and risk.
7. Apply the provenance-tier projection policy in §13.1.
8. Route inferred procedures, fixes, preferences, and rules to review until category precision has been measured.
9. Record the decision so the extractor and promotion policy can be evaluated.

### 6.3 Retention

- Intentional chat transcripts remain until the user deletes them.
- Detailed agent/tool events default to 30-day retention.
- Compact evidence needed by an active memory is retained after routine raw expiry, but not after explicit source deletion when it is the memory's sole evidence.
- Rejected candidates may be retained in compact form to prevent repeated bad proposals.
- Project settings may shorten retention or trigger immediate deletion.
- Deletion must propagate to derived indexes and projections.

Explicit deletion follows an evidence-aware cascade:

1. Remove the source and its evidence links.
2. Delete any memory with no remaining valid evidence.
3. Recompute confidence/status for memories with independent evidence.
4. Remove affected retrieval records where privacy requires it.
5. Rebuild indexes and projections.

The inspector must distinguish routine retention expiry from an explicit “forget/delete” action.

---

## 7. Serverless agent exchange protocol

This is the target write-side protocol. It is not built during the read-only minimum experiment. Its eventual shape is retained so the experiment does not accidentally foreclose cross-agent contribution.

### 7.1 Proposed local directory

```text
.fractal/
  memory/
    manifest.json
    context/
      project.md
      user-approved.md
      modules/
        ai.md
        bookmarks.md
        designer.md
        ide.md
        notes.md
      workstreams/
        <workstream-id>.md
    inbox/
      <event-id>.md
    staging/
      <event-id>.partial
    tasks/
      <task-id>.md
    feedback/
      <feedback-id>.md
    quarantine/
      <invalid-event-id>.md
    diagnostics/
      health.json
      last-ingestion.json
```

All paths are local and gitignored. One-file-per-event avoids concurrent append contention. Writers should create a staging file and rename it into `inbox/` only after completion. Because not every agent host exposes atomic rename cleanly, the ingester must also require a file-stability window and retry incomplete files before quarantine. It must never interpret a file while it is still changing.

### 7.2 Manifest

`manifest.json` defines protocol version, project identity, current context revision, available modules, retention policy, supported event schema versions, and paths. Agents should discover capabilities from the manifest rather than assume directory details.

### 7.3 Generated context projections

Context files are compact, safe, agent-readable Markdown projections containing accepted knowledge appropriate to their scope. They must include freshness metadata:

```yaml
generated_at: 2026-07-15T19:30:00+05:30
source_revision: 1842
pending_events: 3
scope: module
module: ai
```

Agents never directly edit generated projections. Agents must not treat unvalidated inbox events as context or instructions. If projections are stale, an agent may run the optional local reconciliation command when available or proceed using the last validated projection and current repository sources. Staleness is visible, not fatal.

### 7.4 Task receipt

Task receipts are optional enrichment and participation telemetry, not a prerequisite for successful work. At task start, a cooperative agent may create or resume a receipt:

```yaml
task_id: task-20260715-abc123
agent_family: codex
application: codex-desktop
session_id: optional
workstream_id: shared-memory-harness
modules: [ai]
context_revision_read: 1842
status: active
started_at: 2026-07-15T19:10:00+05:30
```

At completion it may record outcome, changed files, verification, decisions, corrections, unresolved risks, and candidate memories. The receipt is an audit record, not the durable memory itself. An agent that reads useful context and completes correct work without a receipt is still a successful memory-assisted task.

### 7.5 Invalid contributions

Invalid or unsafe events move to quarantine with a human-readable diagnostic. They do not block ingestion of other events or the originating development task. The health report exposes unresolved quarantine items. The manifest enforces per-event size limits, total pending-byte limits, file-count limits, and per-source rate limits so quarantine/inbox cannot become a trivial denial-of-service path.

### 7.6 Optional CLI

A repository-local CLI may later provide:

```text
memory recall
memory begin-task
memory finish-task
memory validate
memory status
memory reconcile
```

It is a convenience over the file schema. If it is missing or fails, agents can still read and create protocol files directly.

---

## 8. Agent behavior layer

### 8.1 Root `AGENTS.md`

For the minimum experiment, add only a short read-side clause pointing to the projection and stating that current repository sources win. Measure whether agents demonstrably read and use it.

If the read-side experiment succeeds and the write protocol proceeds, expand it into a participation contract:

1. Read project and relevant module context before acting.
2. Treat memory as sourced evidence, not unquestionable instruction.
3. Optionally register or resume the task/workstream when the host supports contribution.
4. Record durable decisions, discoveries, corrections, verification, and unresolved risks when practical.
5. Never allow memory participation failure to block completion of the primary task.

The root instructions must also prohibit secrets, chain-of-thought capture, direct database/projection edits, unauthorized global promotion, and memory failures blocking the primary task.

### 8.2 Module `AGENTS.md` files

Stable module instructions may live under module roots and point agents to the generated module context. Dynamic memory does not rewrite tracked instruction files.

### 8.3 `memory-participant` skill

Create a concise project skill only after the minimum experiment demonstrates value and the measured compliance base rate justifies a reusable participation workflow:

```text
agents/skills/memory-participant/
  SKILL.md
  references/
    event-schema.md
    memory-types.md
    safety-and-scope.md
    examples.md
  scripts/
    validate-event.*
  evals/
    evals.json
```

The eventual workflow is:

```text
orient → recall → work → optionally contribute → verify when contributed
```

Progressive references explain schema, scoping, evidence, conflicts, safety, and examples without loading all details into every task.

### 8.4 Thin application adapters

For applications that do not honor `AGENTS.md`, mechanically generated adapters may point to the canonical contract, for example:

- `CLAUDE.md`;
- `.github/copilot-instructions.md`;
- `.cursor/rules/fractal-memory.mdc`.

Adapters should be minimal pointers or generated copies with drift tests. No adapter becomes an independent source of truth.

### 8.5 Honest interoperability boundary

No local design can force an arbitrary agent to participate. Rich memory requires an agent that can read/write project files and follows project instructions. Passive observation can still retain objective file/test/commit outcomes, but it cannot infer private reasoning or reliably reconstruct decisions.

---

## 9. Memory kernel data model

The final schema should be produced through migrations and contract tests. Conceptually, extend the existing sessions/messages/checkpoints tables with:

| Entity | Purpose |
|---|---|
| `events` | Immutable or append-only source-event envelope |
| `tasks` | Agent/chat task receipts and lifecycle |
| `memories` | Canonical durable memory records |
| `memory_scopes` | Session/module/project/user applicability |
| `evidence` | Provenance pointers and evidence type |
| `memory_links` | Workstream/file/component/doc/test/commit relationships |
| `candidates` | Extracted proposals awaiting validation or approval |
| `candidate_decisions` | Activation, edit, rejection, downgrade, retirement history |
| `conflicts` | Contradiction and exception relationships |
| `retrieval_log` | Queries, candidates, selected context, token cost, feedback |
| `context_revisions` | Generated projection and prompt-context versions |
| `evaluation_cases` | Canary and benchmark definitions/results |

### 9.1 Canonical memory record

Implementation names remain English and model-neutral:

```json
{
  "id": "mem_...",
  "kind": "project_rule",
  "claim": "All Tauri API commands route through src/lib/ipc.ts.",
  "status": "active",
  "scope": [{ "type": "project", "id": "fractalengine" }],
  "modules": [],
  "authority": "repository_instruction",
  "confidence": 1.0,
  "valid_from": "2026-07-15T00:00:00Z",
  "valid_until": null,
  "observed_at": "2026-07-15T13:40:00Z",
  "evidence": [
    { "type": "file_section", "path": "AGENTS.md", "locator": "rule-7" },
    { "type": "adr", "id": "ADR-004" }
  ],
  "exceptions": [],
  "reinforcement": {
    "confirmations": 4,
    "corrections": 0,
    "last_helpful_at": null
  },
  "created_by": {
    "source": "ingestion_pipeline",
    "agent_family": "codex"
  }
}
```

### 9.2 Memory kinds

Initial kinds should stay small and behaviorally distinct:

- project rule;
- exception;
- architectural decision;
- fact/relationship;
- procedure/runbook;
- failure mode and fix;
- user preference;
- active goal/workstream state;
- unresolved risk/question.

Avoid an elaborate taxonomy before evaluation demonstrates a need.

---

## 10. Core knowledge-representation model

The technical architecture uses standard, descriptive concepts. Sanskrit is retained only in the design history as the inquiry that helped surface these questions; it does not define schema, naming, retrieval, or evaluation.

### 10.1 Core fields

The minimum durable schema should include only distinctions required for correctness:

- **Evidence/provenance typing:** where the claim came from and how authoritative that source can be.
- **Bitemporal state:** when the system observed the claim and when the claim was valid in the project.
- **Rule/exception linkage:** an exception cannot be retrieved without the rule it qualifies, and a rule cannot hide an applicable exception.
- **Status and supersession:** candidate, active, disputed, superseded, retired, or deleted.
- **Applicability:** project plus optional module/workstream/file links; broader scopes are added only when earned.
- **Reinforcement/correction history:** confirmations affect retrieval only when backed by independent evidence; repetition alone does not establish truth.

### 10.2 Deferred structures

- Semantic action-role extraction is excluded from the initial system because its likely coding-task value does not justify extraction complexity.
- General competing-hypothesis/truth-maintenance machinery is deferred until real contradiction cases demonstrate that status, evidence, and supersession are insufficient.
- Vector embeddings are deferred until typed lexical retrieval demonstrates a measurable recall gap.

### 10.3 Evaluation requirement

Compare:

1. existing instructions/documentation without memory;
2. curated flat project projection;
3. core structured projection with evidence, validity, and exceptions.

This evaluates whether structure improves trust and behavior without attributing standard schema hygiene to a language-specific hypothesis.

---

## 11. Retrieval and context compilation

### 11.1 Retrieval stages

1. Determine active project, module candidates, workstream, files, and task intent.
2. Retrieve authoritative rules and applicable exceptions.
3. Retrieve lexical candidates from accepted memory and evidence metadata.
4. Optionally retrieve semantic candidates using a local-only embedding path when available.
5. Apply scope, validity, authority, conflict, and security filters.
6. Rerank using relevance, evidence, feedback, and freshness.
7. Deduplicate and compile within a token budget.
8. Record exactly what was injected and why.

The first useful version should not depend on embeddings. SQLite FTS5 plus typed filters and deterministic ranking provides a testable baseline. Local embeddings can be added only if they demonstrate retrieval lift.

### 11.2 Context pack structure

A compiled context pack should separate:

```text
Authoritative current rules
Applicable exceptions
Active workstream state
Relevant decisions and rationale
Known failure modes and proven fixes
User-approved preferences
Uncertainties and conflicting evidence
Source references
```

Explicitly attached files and current user instructions remain outside inferred memory and take precedence.

### 11.3 Feedback

Agents and users can mark a retrieved memory as helpful, irrelevant, obsolete, incorrect, or mis-scoped. Downstream task verification supplies additional outcome signals but must not be treated as proof that every retrieved memory was causal.

---

## 12. User-global memory policy

This is a retained target objective, not part of the MVE or first project-memory release. It is implemented only after project memory demonstrates value and the system has enough approval history to evaluate generalization safely.

### 12.1 Initial policy: proposed-memory queue

Two activation paths exist:

```text
Explicit “remember globally” instruction → active, visible, reversible
Inferred global preference → candidate queue → approve/edit/reject/project-only
```

The review item shows the claim, category, evidence, projects/sessions observed, confidence, contradicting evidence, expected behavioral effect, and risk.

### 12.2 Learning toward selective automatic promotion

The policy engine learns from approvals, edits, rejections, downgrades, retirements, corrections, and retrieval outcomes. It tracks calibration separately by category.

Future automatic promotion may be enabled only when:

- the category is explicitly classified as low risk;
- independent evidence crosses a configured minimum;
- historical precision for that category crosses an agreed threshold;
- no material contradicting evidence exists;
- every automatic action remains visible and reversible.

Secrets, permissions, destructive-operation assumptions, security/privacy decisions, and authority for external communication are never automatically promoted.

No model fine-tuning is required initially. Learning is transparent policy calibration over feedback and evidence.

---

## 13. Privacy, security, and trust

1. Keep all kernel data local.
2. Reuse FractalEngine's keychain-backed encrypted storage boundary for sensitive fields.
3. Do not expose full private transcripts in agent-readable projections.
4. Project only approved, non-sensitive, task-relevant memory.
5. Apply project-path authorization to every native operation.
6. Treat agent submissions, imported events, and model-generated candidates as hostile input.
7. Validate size, schema, paths, identifiers, and allowed evidence references.
8. Sanitize any memory content rendered through HTML surfaces.
9. Prevent prompt injection in remembered external content from acquiring rule authority.
10. Track deletion tombstones or equivalent so removed content does not reappear during reprocessing.
11. Do not store credentials, API keys, access tokens, password-vault contents, or raw environment values.
12. Provide inspect, export-for-review, correct, forget, and purge operations.

### 13.1 Authority firewall

Memory content cannot declare itself authoritative. Authority derives from validated source type and current repository/user policy. Projection admission follows explicit tiers:

| Tier | Source | Projection rule |
|---|---|---|
| A | Current user instruction; current root/module `AGENTS.md`; accepted ADR or equivalent allowlisted policy source | May appear as an authoritative rule with a verifiable source pointer and source revision/hash |
| B | Objective local result: inspected source, passing/failing test, build output, commit/diff | May support facts, outcomes, or procedures; must cite the artifact and cannot create policy authority |
| C | Agent inference, chat summary, proposed procedure, inferred preference | Candidate only; requires human approval or independent Tier A/B corroboration before projection |
| D | Web/imported/external content or a claim transitively derived from it | Tainted evidence; cannot become a rule/procedure without independent local corroboration and review |

Additional structural rules:

- Every projected item displays source type, pointer, validity, and status.
- Project rules may originate only from allowlisted Tier A sources.
- Procedures/fixes require objective verification or explicit approval.
- Lower-tier claims appear in clearly separated “candidate/uncertain” sections, never blended into authoritative rules.
- The compiler retrieves applicable exceptions with their rule.
- Current source content is checked before rendering a high-authority projection stale relative to that source.
- An agent event claiming “ignore AGENTS.md” remains untrusted and cannot become a project rule.

Non-imperative wording is defense in depth, not the trust boundary; admission tier is the boundary.

### 13.2 Passive observation boundary

Passive capture is limited to objective project outcomes available within authorized roots, such as changed paths, explicitly run verification, and commits. It does not record keystrokes, screens, full terminal history, or conversations from another application.

### 13.3 Searchability versus encryption

SQLite FTS cannot search ciphertext. The storage policy must therefore distinguish private evidence from deliberately agent-readable memory:

- full chat transcripts, raw sensitive evidence, rejected global candidates, and private feedback remain encrypted and are not placed directly in FTS;
- accepted project/module memories eligible for agent context are secret-scanned and stored in a locally searchable form because an equivalent safe projection is already written to the gitignored context files;
- approved user-global source records remain encrypted in application data, while only their explicitly safe projection enters a project context;
- any semantic index must be local-only and must be deleted/rebuilt with its source memory.

This trade-off must be visible to the user. “Local-only” is not equivalent to “encrypted”; the inspector should show which accepted memories are eligible for plaintext project projection.

The minimum experiment uses only deliberately authored, non-sensitive projection content and therefore does not decrypt or project existing chat text. The projection must state plainly that any tool with workspace access can read it; `.gitignore` prevents commits, not editor upload, backup, or exfiltration.

---

## 14. Product surfaces

The minimum experiment has no new UI: the Markdown projection itself is the first inspector. A dedicated UI is justified only after the projection demonstrates value. The eventual UI should support trust and evaluation rather than decorative visualization.

### 14.1 Memory inspector

- search and filter by scope, module, kind, status, time, and source;
- show claim, evidence, conflicts, exceptions, and retrieval history;
- correct, re-scope, retire, or delete;
- explain “why did this appear in context?”;
- preview generated project/module context.

### 14.2 Global proposal queue

- approve, edit, reject, make project-only, or defer;
- show supporting and contradicting evidence;
- show historical approval precision for the category;
- show expected influence on future agents.

### 14.3 Participation and health

- pending/invalid events;
- stale context projections;
- active or abandoned task receipts;
- agent recall/contribution compliance;
- ingestion failures and recovery actions;
- storage size and retention activity.

### 14.4 Evaluation dashboard

- benchmark accuracy over time;
- retrieval quality and token cost;
- repeated-error rate;
- rule-compliance rate;
- candidate precision by category and scope;
- regression and phase-gate comparisons with baseline;
- retrieval/schema ablations at architectural decision points.

Any user-editable memory state must follow the app's undo/redo boundary and native menu behavior.

---

## 15. Measurement and evaluation program

Measurement begins before intelligent retrieval. It is an engineering decision aid and regression alarm, not a claim of scientific causality from one developer's evolving repository.

### 15.1 Minimum viable experiment

Prepare:

- 20–40 real, non-sensitive project memories covering rules, recent decisions, gotchas, verified fixes, and unresolved risks;
- 10 realistic FractalEngine tasks plus 20 gold recall questions;
- at least two agent families when practical;
- two conditions: existing repository instructions/documentation alone, and the same environment plus the curated projection.

Record model identifier/date, tool permissions, repository commit/fixture, prompt, and context revision. Exact provider versions may drift, so comparisons are interpreted within a run and repeated when a model materially changes.

### 15.2 Always-on scorecard

Keep the routine scorecard small and automatable:

1. repeated-error rate;
2. stale-rule violations;
3. context tokens added;
4. unsupported or incorrectly sourced memory use;
5. user corrections caused by retrieved memory;
6. memory-caused task blocking, with a target of zero.

Also measure the participation base rate during the experiment: did the agent demonstrably read or cite the projection, and did it follow the short contract? Receipts are not required to count success.

### 15.3 Decision-gate evaluation

Run richer metrics only when choosing an architectural step:

- rule-compliance and repeated-error comparisons;
- evidence precision and stale-memory injection;
- task success and time/turns to first correct action;
- Recall@k and context latency when retrieval exists;
- candidate approval/edit/rejection precision when extraction exists;
- deletion, contradiction, exception, and worktree adversarial cases.

Relevant research categories—temporal updates, abstention, workflow knowledge, environment gotchas, and premise awareness—may inform cases, but must be translated into concrete FractalEngine fixtures rather than copied as a benchmark label.

References:

- [LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory](https://arxiv.org/abs/2410.10813)
- [LongMemEval-V2: Evaluating Long-Term Agent Memory Toward Experienced Colleagues](https://arxiv.org/abs/2605.12493)
- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)

### 15.4 Operating rhythm

- Run the MVE once to establish the first go/no-go decision.
- Run a small automated regression set after meaningful memory/compiler changes, not daily by default.
- Run broader comparisons only at phase gates or after a real memory failure changes the design.
- Add real failures to a growing suite while retaining held-out cases.
- Review user-global promotion precision only after that scope exists and has accumulated enough decisions.

### 15.5 Go/no-go criteria

Proceed beyond read-only projection only if:

- agents read/use the projection at a practically useful rate;
- projection-assisted tasks show a credible improvement over the existing `AGENTS.md`/documentation incumbent;
- unsupported/stale-memory use does not erase the improvement;
- context cost remains modest;
- no secret or private chat content is exposed;
- memory never blocks primary work.

If the projection does not beat the incumbent, stop and document why. Do not automate extraction or external writes for a context artifact that has not demonstrated value.

---

## 16. Phased implementation proposal

Each phase should have a separate implementation plan, adversarial tests, documentation updates, and explicit go/no-go review.

### Phase 0: minimum viable experiment preparation

- Select 20–40 real, non-sensitive memories from existing project history.
- Create 10 realistic tasks and 20 gold recall questions, including stale-rule, correction, missing-evidence, and module-applicability cases.
- Record the incumbent baseline using current `AGENTS.md`, `docs/INDEX.md`, ADRs, routing docs, and skills.
- Hand-author one read-only `context/project.md` using the proposed evidence-bearing format.
- Add a minimal `AGENTS.md` pointer requiring current sources to win.
- Instrument context-read/citation evidence without requiring receipts.

**Exit condition:** the comparison can be rerun, projection content is non-sensitive, and no application/kernel behavior has changed.

### Phase 1: read-only projection trial

- Run equivalent tasks with and without the projection across actual agent families.
- Measure the small scorecard and inspect qualitative failures.
- Test whether module tags improve relevance without creating separate module stores.
- Revise projection format only to address observed failures.

**Exit condition:** enough evidence exists for an explicit go/no-go decision.

### Phase 2: go/no-go

- If the projection does not credibly beat the incumbent, stop and document the result.
- If it helps, freeze the minimum projection contract, provenance tiers, privacy disclosure, and regression cases.
- Approve only the next chat-extraction phase, not the full target architecture.

**Exit condition:** a recorded decision with evidence, limitations, and a bounded next implementation plan.

### Phase 3: FractalEngine chat candidates with human approval

- Preserve existing encrypted chat/session behavior.
- Specify and approve the extraction engine decision required by §6.2.
- Extract candidates from existing in-app chat history into a mandatory human-review queue.
- Compile approved project candidates into the projection.
- Measure candidate approval/edit/rejection rates and projection benefit.
- Implement evidence-aware deletion cascade for derived memories.

**Exit condition:** in-app chat can improve project memory without automatic promotion, remote leakage by default, or streaming dependency.

### Phase 4: external write path, sized by evidence

- Measure actual read-side compliance and choose the smallest viable write contract.
- Define stable project/worktree identity and single-writer projection semantics.
- Add versioned manifest, inbox/staging, optional receipts, validation, rate limits, and quarantine.
- Create the `memory-participant` skill and thin adapters only if they improve contribution quality in forward tests.
- Treat passive file/test/commit outcomes as objective evidence and cooperative reports as optional rationale enrichment.

**Exit condition:** at least two external agent hosts contribute safely without MCP/daemon dependence, and malformed or malicious events cannot enter authoritative projections.

### Phase 5: kernel retrieval and trust UI

- Add only the schema tables proven necessary by earlier phases.
- Implement idempotent ingestion, FTS5/typed retrieval, validity, exceptions, context revisions, and retrieval logs.
- Add a focused inspector for provenance, correction, re-scoping, deletion, and “why retrieved?” explanation.
- Add health surfaces only for observed operational problems.
- Maintain IPC/mock parity, undo/redo, path authorization, cancellation, and teardown guarantees.

**Exit condition:** retrieval improves over the static projection without unacceptable trust, latency, token, or maintenance cost.

### Phase 6: only-if-earned expansion

- Add user-global local storage and proposal queue while preserving project isolation.
- Calibrate category-specific global promotion from real approval history.
- Add local semantic retrieval only if lexical/typed retrieval has a measured recall gap.
- Add richer contradiction or competing-claim structures only when actual cases exceed core status/evidence/supersession capabilities.

**Exit condition:** each expansion independently demonstrates value and remains visible, reversible, private, and category bounded.

---

## 17. Adversarial and regression testing

In addition to normal unit, Rust, IPC, e2e, and build suites, test:

- malformed, oversized, duplicated, and partially written event files;
- out-of-order task completion and event ingestion;
- two agents completing concurrently;
- app shutdown during ingestion or projection generation;
- workspace switch during extraction/retrieval;
- project deletion or path relocation;
- stale context revision consumption;
- legacy schema migration;
- missing optional fields and unknown future fields;
- prompt injection embedded in remembered external content;
- secret-like material submitted as a candidate;
- contradictory user corrections;
- rule with scoped exception;
- obsolete architecture decision retrieved for a current task;
- agent that reads memory but fails to contribute;
- agent that contributes without reading;
- agent that fabricates test success;
- rejected candidate repeatedly reproposed;
- raw evidence expiry while active memory retains compact provenance;
- deletion followed by full index/projection rebuild;
- browser mock and native behavioral parity;
- extraction/retrieval provider failure, cancellation, and teardown.

---

## 18. Alternatives considered

### 18.1 Required MCP server

Rejected as the primary protocol because correctness would depend on server availability, discovery, configuration, and editor compatibility. An adapter may be added later but cannot be required.

### 18.2 Always-running local daemon or socket service

Rejected as the universal boundary because it recreates service lifecycle and versioning failures. It may offer optional acceleration later.

### 18.3 Direct SQLite access by every agent

Rejected because it exposes schema migrations, encryption, write contention, and trust validation to external clients.

### 18.4 Raw transcript search only

Rejected because it produces context growth, weak provenance semantics, poor contradiction handling, and limited procedural memory.

### 18.5 Vector-only memory

Rejected as the initial design because similarity alone does not express authority, scope, validity, exceptions, or evidence. It also introduces local model/runtime requirements before a lexical baseline is measured.

### 18.6 Tracked repository memory

Rejected for this proposal. Memory remains local-only and gitignored. Stable participation instructions and schemas may be tracked; memory content is not.

### 18.7 Sanskrit-language agents or Sanskrit prose storage

Rejected. Sanskrit is not part of the technical architecture. Useful concepts identified during the inquiry are represented through standard provenance, bitemporal, rule/exception, and reinforcement terminology.

---

## 19. Principal risks

| Risk | Consequence | Mitigation |
|---|---|---|
| Memory poisoning | False agent claims influence future work | Authority firewall, evidence validation, review, provenance |
| Stale rules | Agents follow obsolete decisions | Validity intervals, supersession, current-source precedence |
| Context bloat | Higher cost and worse model focus | Typed retrieval, token budgets, deduplication, telemetry |
| Over-generalization | Project preference becomes global behavior | Proposal queue, category calibration, manual approval |
| Participation drift | Agents ignore context or optional contribution | Minimal AGENTS pointer, measured read rate, thin adapters only if effective |
| Operational fragility | Memory blocks normal development | File fallback, quarantine, graceful progression, zero-blocking gate |
| Privacy leakage | Sensitive chat appears in project context | Encrypted private kernel, projection filtering, secret scanning |
| Schema overdesign | Structure adds cost without value | Minimal core, feature flags, phase-gate comparison, remove weak fields |
| Misleading feedback | Successful task incorrectly credits memory | Controlled experiments and cautious causal interpretation |
| Local storage growth | Large database and slow retrieval | Retention, compaction, bounded indexes, health metrics |

---

## 20. Acceptance criteria for the complete system

The proposal is fulfilled when:

1. FractalEngine chat and at least two external agent applications contribute through one semantic event contract.
2. External agents can participate with FractalEngine closed and without MCP or a daemon.
3. Session, module, project, and approved local user-global memories retrieve according to applicability and authority.
4. Every injected memory is explainable through evidence and context-revision logs.
5. Corrections, supersession, exceptions, retirement, and deletion behave predictably.
6. User-global inferred memories remain review-gated until a later explicit policy change.
7. Raw detailed events follow the bounded retention policy.
8. Memory failure does not block primary agent work.
9. Automated regression and phase-gate evaluations compare behavior against a recorded incumbent baseline while accounting for model/repository drift.
10. Evaluations show credible improvement in recall or task outcomes without unacceptable regressions in latency, token usage, privacy, unsupported-memory use, or stale-rule compliance.
11. Only standard structured-memory features with demonstrated correctness or outcome value remain in the system.

---

## 21. Remaining decision gates

The external review has been incorporated, but these decisions intentionally remain open until their prerequisite evidence exists:

1. What projection-read/compliance rate is practically sufficient to justify further integration?
2. What minimum improvement over the existing instruction/documentation system constitutes a positive MVE result?
3. Which extraction method meets privacy, precision, latency, and maintenance requirements after manual curation proves useful?
4. Should the canonical project database migrate to Git-common storage for worktree sharing, or should an application-data registry own canonical project identity?
5. Which accepted project memories may be plaintext-projected, and what user control is required before first projection?
6. Is workstream adequately modeled as a link, or do observed continuation/handoff failures justify stronger lifecycle semantics?
7. Which passive outcomes can be captured reliably without surveillance or fabricated-verification risk?
8. When project memory succeeds, what evidence threshold justifies implementing local user-global memory?

---

## 22. Recommended immediate decision

Approve only Phase 0 and Phase 1 as the next planning scope:

1. establish the incumbent baseline;
2. create one hand-curated, read-only, non-sensitive project projection;
3. measure whether actual agents read it and whether it improves outcomes;
4. make an explicit stop/proceed decision.

Do not yet implement inboxes, receipts, extraction, new memory tables, FTS, user-global storage, or UI. ADR-011 and the AI memory design document should be revised to distinguish target architecture from the MVE only after this revised proposal is approved.