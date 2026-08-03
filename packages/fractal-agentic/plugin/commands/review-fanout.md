---
description: Run Fractal multi-dimension review on a diff (quality + stack + security) with adversarial verify of CRITICAL/HIGH. Host-agnostic playbook — no native Workflow API required.
---

# /review-fanout

User-facing review playbook implementing [`workflows/review-fanout.workflow.md`](../workflows/review-fanout.workflow.md).

Works on **any host** that can run subagents or sequential specialist passes.  
If the host has a native Workflow engine later, the same contract applies.

## When to use

- After implementation, before ship  
- When `/santa-loop` is heavy but you want multi-dimension review  
- PR or local uncommitted diff review  

## When not to use

- One-line fixes (use primary review)  
- Full delivery from scratch → `/orchestrate`  

## Instructions

1. Obtain a **unified diff**:
   - Default: `git diff HEAD` and/or `git diff --cached`  
   - Or user-provided PR / range  
   - Empty diff → stop with “nothing to review”

2. Detect language/stack from changed files (svelte, typescript, rust, …).

3. Load the contract: [`workflows/review-fanout.workflow.md`](../workflows/review-fanout.workflow.md).

4. **Stage Review** (parallel if the host allows, else sequential):
   - Always: `code-reviewer` (or structured self-review as that role)  
   - Stack reviewer when mapped (`svelte-reviewer`, `rust-reviewer`, …)  
   - `security-reviewer` when security trigger matches paths/diff  

   Each returns findings in the schema from the contract (severity, evidence, proof for HIGH/CRITICAL).

5. **Dedup** by `file + normalize(evidence)`; keep strictest severity; record dimensions.

6. **Verify** each unique CRITICAL/HIGH with an independent skeptic pass  
   (`isReal` + `confidence`; refute only if `isReal=false` and confidence ≥ 0.8).  
   Unverifiable → stay **blocking**.

7. Emit:
   - `verdict`: APPROVE | CHANGES_REQUESTED  
   - `blocking` / `advisory` lists  
   - Map to Fractal: APPROVE → **ship** candidate; CHANGES_REQUESTED → **fix-first**  
   - Incomplete dimensions → never claim clean ship  

8. Do **not** commit or push unless the user asks after seeing blocking items.

## Setup

No install required beyond the plugin.  
Optional: `/hooks-init` for session safety hooks (independent of this command).

## Related

- `/santa-loop` — dual adversarial review for release-critical  
- `/orchestrate` — full delivery loop  
- `workflows/README.md` — when a native Workflow engine exists  
