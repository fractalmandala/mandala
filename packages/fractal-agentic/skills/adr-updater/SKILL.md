---
name: adr-updater
description: Detect all file changes since a known state, present them to the user for selection, and create or update Architecture Decision Records matching the confirmed changes. Invoke when user says "update ADRs", "sync ADRs with changes", or after significant code modifications.
metadata:
  origin: ECC
---

# ADR Updater

Synchronize Architecture Decision Records with the actual state of the codebase after significant changes. This skill detects what files have been modified, lets the user select which changes to document, and updates or creates ADRs so they remain truthful representations of the codebase.

---

## When to Invoke

- User says "update the ADRs", "sync ADRs", "bring ADRs up to date"
- User says "detect changes and update ADRs"
- After merging a significant PR or feature branch
- After a refactoring session that touched architectural boundaries
- Before a release or audit to verify ADR coverage
- User opens the ADR directory and asks about stale records

Do **not** auto-invoke during normal coding — this is a user-triggered maintenance skill.

---

## Workflow

### Step 1: Detect File Changes

Run `git diff` to detect all changes since the last commit, or accept a user-specified ref range:

```bash
git diff --stat HEAD~1..HEAD
```

If the user wants a broader range (e.g., since a specific commit or branch), ask them to specify:

```bash
git diff --stat <from-ref>..<to-ref>
```

Capture the full diff paths:

```bash
git diff --name-status HEAD~1..HEAD
```

Collect the list of changed files (added, modified, deleted, renamed). Store this as the **candidate list**.

**Important**: If there are no changes, inform the user and exit.

### Step 2: Read Existing ADRs

Read the ADR registry at the project root:

- [AGENTS.md Section 3](file:///Users/amrit/fractals/apps/fractalengine/AGENTS.md) — the ADR registry table
- [docs/adr/](file:///Users/amrit/fractals/apps/fractalengine/docs/adr) — all existing ADR files

Read every ADR file. Build a mental map of which codebase areas each ADR covers. The current registry:

| ADR     | Covers                                                 |
| ------- | ------------------------------------------------------ |
| ADR-001 | Framework choice: Tauri 2 + SvelteKit + Svelte 5 runes |
| ADR-002 | State management: runes-only, no svelte/store          |
| ADR-003 | Styling: two-layer CSS tokens + indented SASS          |
| ADR-004 | IPC: single gateway module, browser mock               |
| ADR-005 | Layout: spatial canvas board with draggable tiles      |
| ADR-006 | Undo/Redo: snapshot/restore for user-editable state    |
| ADR-007 | Browser panel + password vault + 2FA                   |

### Step 3: Map Changes to ADRs

For each changed file, determine:

1. **Does this change affect an area covered by an existing ADR?** If yes, the ADR may need updating (e.g., new files added that follow the pattern, or the pattern changed).
2. **Does this change introduce something architecturally new?** If yes, a new ADR may be needed.
3. **Is this a cosmetic/non-architectural change?** If yes, skip it.

Group related changes. For example, if the user added a new IPC command, that touches ADR-004. If they added a new state store file, that touches ADR-002. If they added a completely new module (e.g., a Database inspector), that may warrant a new ADR.

Categorize each changed file into one of:

- **Covered by existing ADR (no update needed)** — the change follows the established pattern
- **Covered by existing ADR (update needed)** — the change modifies or extends the pattern, so the ADR's Consequences or Decision sections need revision
- **New architectural decision needed** — the change introduces something not addressed by any ADR
- **Non-architectural / skip** — docs, comments, trivial refactors, config changes that don't affect architecture

### Step 4: Present Changes to the User

Show the user a categorized summary:

```
## Candidate Changes for ADR Review

### Changes covered by existing ADRs (no update needed)
- src/lib/state/newFeature.svelte.ts (follows ADR-002 runes pattern)
- src/lib/styles/components/_newfeature.sass (follows ADR-003 tokens pattern)

### Changes that may need ADR updates
- src/lib/components/DatabaseInspector.svelte (new module — may need new ADR)
- src-tauri/src/commands.rs (new Tauri commands — may extend ADR-004 scope)

### Non-architectural (skipped)
- README.md
- tests/e2e/spec.ts
```

Ask the user:

> "Which of these change groups would you like to document in ADRs? Please confirm the groups to proceed, or specify which to skip."

Wait for explicit confirmation. Do not proceed until the user has confirmed the scope.

### Step 5: Update or Create ADRs

For each confirmed change group, do one of:

#### A) Update an existing ADR

If the change extends or modifies the scope of an existing ADR:

1. Re-read the full ADR file.
2. Determine what sections need updating — typically:
   - **Context**: add new forces or constraints that emerged
   - **Consequences**: add new Positive/Negative/Neutral consequences reflecting the change
   - **Alternatives Considered**: if the change diverged from what the ADR originally decided, explain why
3. Make the edits to the ADR file.
4. **Do not** change the original decision — an ADR records the decision as it was made. If the decision has effectively changed, the old ADR should be marked as **Superseded** and a new ADR created.

#### B) Create a new ADR

If the change introduces something architecturally new:

1. Scan `docs/adr/` for the highest ADR number. Increment by one.
2. Write using the format below. All sections are required.
3. Create the file as `ADR-NNN-kebab-case-description.md`.

**New ADR format:**

```markdown
# ADR-NNN: Title

**Status:** Accepted
**Date:** YYYY-MM-DD
**Decision makers:** [role(s) — e.g., "Backend Lead, Frontend Lead"]

---

## Context

[2-4 paragraphs describing the problem, forces, and constraints that led to this decision. Include specific numbers where available. Must be solution-neutral — do not argue for the decision here.]

---

## Decision

We will [specific choice in one sentence].

[2-4 sentences of rationale connecting the decision to the forces in Context. Name alternatives that were rejected and why.]

---

## Consequences

### Positive

- [capability gained or problem solved, with numbers]
- [operational benefit]

### Negative

- [cost or risk accepted, with magnitude]
- [new dependency and failure impact]

### Neutral

- [change that is neither clearly beneficial nor harmful]

---

## Alternatives Considered

### [Alternative 1]

[1-2 sentences describing it and why it was rejected, tied to a specific force from Context.]

### [Alternative 2]

[1-2 sentences describing it and why it was rejected.]

---

## Related Decisions

| ADR     | Title   | Relationship                        |
| ------- | ------- | ----------------------------------- |
| ADR-NNN | [Title] | [depends on / supersedes / enables] |

---

## Notes

_(Optional)_
```

#### C) Supersede an existing ADR

If the codebase has moved away from a decision recorded in an ADR:

1. Update the old ADR's status line: `**Status:** Superseded by ADR-NNN`
2. Add a note at the top: "This decision has been superseded by [ADR-NNN](link)."
3. Create the new ADR with a reference in its Related Decisions section.

### Step 6: Update the ADR Registry in AGENTS.md

After any ADR file is created, renamed, or deleted, update the registry table in [AGENTS.md Section 3](file:///Users/amrit/fractals/apps/fractalengine/AGENTS.md):

- **New ADR**: add a new row with the sequential number, filename link, and one-line decision summary.
- **Deleted ADR**: remove the corresponding row.
- **Renamed ADR**: update the file path link in the existing row.
- **Superseded ADR**: the row stays, but link to the superseding ADR in the decision column text.

The table format is:

```markdown
| NNN | [ADR-NNN-kebab-case.md](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-NNN-kebab-case.md) | One-line decision summary |
```

### Step 7: Summary

Present the user with a summary of what was done:

```
## ADR Update Complete

### Created
- ADR-008-database-inspector-module.md — Database Inspector module architecture

### Updated
- ADR-004-single-ipc-gateway-module.md — added new Database IPC commands to the gateway

### Registry
- AGENTS.md Section 3 — updated with new row for ADR-008

No changes were discarded. Run `git diff` to review the file changes.
```

---

## Decision Heuristics

When deciding whether a change warrants ADR attention, use these guidelines:

| Change type                                       | ADR action                                         |
| ------------------------------------------------- | -------------------------------------------------- |
| New component following existing patterns         | No ADR needed (covered by existing ADRs)           |
| New module with its own architecture              | New ADR                                            |
| Adding a command to the IPC gateway               | Update ADR-004 (add entry to Consequences)         |
| Adding a new state store file                     | No ADR update needed (follows ADR-002)             |
| Changing the token system or adding tokens        | Update ADR-003 if the token architecture changes   |
| Changing the canvas/tile behavior                 | Update ADR-005                                     |
| Adding undo support to a new state domain         | Update ADR-006                                     |
| Changing the styling approach                     | Update ADR-003 or create new ADR                   |
| Replacing a technology (e.g., different database) | Supersede relevant ADR, create new one             |
| Upgrading a dependency version                    | No ADR needed                                      |
| Adding E2E tests                                  | No ADR needed                                      |
| Adding a developer tool (linter, formatter)       | No ADR needed unless it changes the build pipeline |
| Adding or removing a bundler plugin               | Update ADR-001 if it changes the build system      |

---

## Important Rules

1. **Never write an ADR without user confirmation** — always present the candidate list and wait for explicit approval before creating or modifying files.
2. **Never delete an ADR without providing a migration path** — if an ADR is truly obsolete, mark it as "Deprecated" with a note explaining why, rather than deleting the file. The only exception is if the user explicitly says "delete this ADR file."
3. **Read before writing** — always read the full content of any ADR file you intend to modify before making edits. Never edit an ADR based on memory or the registry table alone.
4. **One change per ADR** — if a group of changes touches multiple architectural domains (e.g., both IPC and state management), they may need separate ADRs. Split them.
5. **Registry must be 1:1 with files** — after any create/rename/delete operation on ADR files, update AGENTS.md Section 3 in the same step. A mismatch between the registry table and the filesystem is a bug.
6. **Preserve existing ADR language** — when updating an ADR, preserve the original voice, date, and decision makers. Only add content. If the original decision has been reversed, supersede the ADR rather than editing its Decision section.
7. **Use absolute file paths** — all links in AGENTS.md and ADR files must use `file:///` absolute paths.
