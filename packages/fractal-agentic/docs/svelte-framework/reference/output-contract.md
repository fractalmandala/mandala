---
title: "Output contract reference"
description: "Reference the artifact manifest emitted by React-to-SvelteKit conversions."
type: reference
---

# Output contract reference

The canonical schema lives at [`output-contract.schema.json`](../../../skills/react-to-sveltekit/references/output-contract.schema.json).
The detailed skill reference lives at [`output-contract.md`](../../../skills/react-to-sveltekit/references/output-contract.md).

## Required top-level fields

```json
{
	"contractVersion": "1.0",
	"status": "planned | complete | partial | blocked",
	"source": {},
	"target": {},
	"dependencies": {},
	"dataFlow": {},
	"ssr": {},
	"verification": [],
	"gaps": []
}
```

## Completion rule

`complete` requires concrete verification entries. A missing workspace script is recorded
as `skipped` with a reason; it is never silently omitted. Use `partial` or `blocked` when
behavior cannot be verified or preserved.

## Artifact policy

The manifest is normally returned in the agent response or implementation receipt. Do
not persist it inside the destination project unless the user requests a project-owned
manifest.
