# Fractal workflows (optional)

Host-native multi-agent scripts for the **autonomous fan-out** segments of delivery.  
The gated outer loop (boss selection, human approval, commit) stays in the main conversation and in [`boss-orchestration`](../skills/boss-orchestration/SKILL.md).

## User-facing entry

| Command | Role |
|---|---|
| **`/review-fanout`** | Run the multi-dimension review playbook (any host) |
| `/hooks-init` | Optional session hooks (separate concern) |

No maintainer one-off setup. Users invoke the command after plugin install; the agent executes the contract with subagents or sequential specialist passes.

## Status

| Asset | Role | Host |
|---|---|---|
| `review-fanout.workflow.md` | Contract for parallel review + adversarial verify | Portable; optional native Workflow engines can implement the same JSON I/O later |
| `commands/review-fanout.md` | Slash / agent playbook | All hosts |

These are **not** required for `/orchestrate`. Prefer:

1. Capability pin `fractal_agentic_fresh_reviewer` when exposed  
2. Domain specialists (`code-reviewer`, `svelte-reviewer`, `security-reviewer`, …)  
3. `/santa-loop` for release-critical dual review  
4. Primary structured self-review (`ship | fix-first | rethink`) when nothing else is available  

## When a host Workflow engine exists

Pass:

```jsonc
{
  "diff": "<unified git diff>",
  "language": "svelte|typescript|rust|…",  // optional
  "changedFiles": ["path/…"]               // optional — security trigger
}
```

Expect fail-closed behavior: missing diff → reject; reviewer failure → incomplete, not clean APPROVE; unverifiable CRITICAL/HIGH stays blocking.

See `review-fanout.workflow.md` for the Fractal-shaped contract (agents and severity model aligned to this plugin).
