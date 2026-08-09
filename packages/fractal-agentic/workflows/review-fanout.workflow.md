# Review fan-out workflow (Fractal contract)

Portable specification for a **background multi-reviewer + adversarial verify** segment.  
Implement with the host’s Workflow / parallel Task API when available. Does **not** replace boss selection or human ship gates.

## Purpose

Autonomous middle segment of delivery:

1. **Review** (parallel dimensions)  
2. **Dedup** findings by evidence snippet  
3. **Verify** CRITICAL/HIGH adversarially (fail closed)

Outer gates (plan approval, final commit, boss constraints) remain in the primary session.

## Inputs

| Field | Required | Description |
|---|---|---|
| `diff` | yes | Unified git diff text |
| `language` | no | Selects language/stack reviewer |
| `changedFiles` | no | Paths for security trigger |

Invalid/empty `diff` → **fail closed** (throw / reject). Do not approve unreviewed payloads.

## Dimensions

| Dimension | Agent / role | When |
|---|---|---|
| Quality | `code-reviewer` | always |
| Stack | `svelte-reviewer` / `rust-reviewer` / `react-reviewer` / … | when `language` maps |
| Security | `security-reviewer` | when security trigger matches |

**Security trigger** (diff + paths), case-insensitive keywords such as:  
auth, password, token, secret, credential, api_key, jwt, oauth, sql, exec, eval, crypto, readFile, writeFile, fetch, subprocess.

Prefer plugin agent names from `agents/`. Never invent pin types not in the session catalog.

## Finding schema

Each reviewer returns:

```json
{
  "verdict": "APPROVE" | "CHANGES_REQUESTED",
  "findings": [
    {
      "title": "string",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "file": "string",
      "line": null,
      "evidence": "offending snippet — required",
      "proof": "required for HIGH/CRITICAL",
      "fix": "suggested remediation"
    }
  ]
}
```

## Dedup

Key = `file + normalize(evidence)` (fallback title+line).  
Merge dimensions; keep strictest severity.

## Verify stage

For each unique CRITICAL/HIGH:

- Independent skeptic returns `{ isReal, confidence, reasoning }`
- Refute to advisory only if `isReal === false` and `confidence >= 0.8`
- Null/error/unverified → **stay in blocking**

MEDIUM/LOW pass through as advisory without verify.

## Output

```json
{
  "verdict": "APPROVE" | "CHANGES_REQUESTED",
  "incomplete": false,
  "failedDimensions": [],
  "blocking": [],
  "advisory": [],
  "stats": {
    "dimensions": 0,
    "failed": 0,
    "raw": 0,
    "unique": 0,
    "confirmed": 0,
    "unverified": 0,
    "refuted": 0
  }
}
```

`APPROVE` only if every dimension ran and `blocking` is empty.  
Map host output into Fractal completion language: **ship | fix-first | rethink** in the primary session (APPROVE ≈ ship candidate; CHANGES_REQUESTED ≈ fix-first).

## Relation to Fractal armory

| Asset | Role |
|---|---|
| `boss-orchestration` | Outer loop, boss, capability mode |
| `fractal_agentic_fresh_reviewer` | Preferred single-thread fresh review when pin exists |
| `/santa-loop` | Dual adversarial review for release-critical |
| This workflow | Optional parallel multi-dimension review engine |

## Non-blocking

If the host cannot run workflows: skip this file; use fallback review path. Never refuse product work.
