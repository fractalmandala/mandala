---
title: "Troubleshoot fix-first results"
description: "Turn a failed Svelte framework review into a focused repair loop."
type: how-to
---

# Troubleshoot fix-first results

`fix-first` means the result has a concrete issue that should be corrected before ship.
It is not a dead end.

## 1. Locate the first failed claim

Read the receipt's first failed command or gap, then inspect the actual changed file.
Common examples:

- Svelte compile fails because a rune is in the wrong location.
- SASS fails because SCSS braces or semicolons remain.
- A report claims ARIA or keyboard behavior that is absent from the file.
- A route receipt typechecks only a stub, not the page component.
- The output uses a dependency that the target package does not contain.

## 2. Give a bounded repair request

```text
Fix the first failed verification in the current component. Preserve the public API,
change only the owned files, rerun the actual Svelte and SASS checks, and resubmit the
receipt with concrete evidence.
```

## 3. Re-review

Do not accept a changed receipt without rerunning the command yourself when possible.
The final review must return exactly one of `ship`, `fix-first`, or `rethink`.

## 4. Escalate architecture when needed

Use `rethink` when the recipe cannot satisfy the requested behavior, the route boundary
is wrong, or a missing dependency changes the architecture. Return to the prompt and
choose a smaller or more honest scope.
