---
description: Comprehensive component architecture review for state management patterns, data flow, template security, accessibility, and UI-specific performance. Invokes the vue-reviewer agent (and typescript-reviewer alongside on typed changes).
---

# Component Architecture Review

This command invokes the **vue-reviewer** agent for component-architecture-focused code review. For pull requests touching component files or UI state modules, both `vue-reviewer` and `typescript-reviewer` should run — each owns a distinct lane.

## What This Command Does

1. **Identify UI Changes**: Find modified component files and UI state modules (`.svelte`, `.tsx`, `*.svelte.ts`, `stores/`, `state/`) via `git diff`
2. **Run Lint**: Execute `eslint` with the project's component plugins
3. **Typecheck**: Run `svelte-check`, `tsc --noEmit`, or the project's canonical typecheck command
4. **Review Architecture Lanes Only**: State management, data flow, template security, accessibility, UI performance
5. **Generate Report**: Categorize issues by severity (CRITICAL / HIGH / MEDIUM)

## When to Use

Use `/vue-review` when:

- A PR restructures components, props, or shared state
- Reviewing state management choices (local state vs shared modules vs context)
- Auditing data flow between routes, layouts, and components
- Checking template security (raw HTML, dynamic attributes, bindings)
- Reviewing UI performance regressions (re-render storms, oversized components)

For Svelte projects prefer `/svelte-review` (stack-specific). For reactivity-rule-focused review use `/react-review`; for generic concerns use `/code-review`.

## Review Categories

### CRITICAL (Must Fix)

- Unsanitized raw HTML in templates
- Dynamic `href`/`src`/`style` bindings with unvalidated user input
- Secrets reachable from client state modules
- Auth/session stored in client-side storage

### HIGH (Should Fix)

- State duplication across components that must stay in sync
- Circular props/state dependencies between parent and child
- Server-only data loaded into client state modules
- Missing loading/error states for async data
- Accessibility regressions in shared components
- Components over 200 lines mixing data fetching and presentation

### MEDIUM (Consider)

- Prop drilling beyond 3 levels instead of context/store
- Derived values recomputed imperatively
- Inline styles where design tokens exist
- Unnecessary re-renders from coarse state objects
- Missing component boundaries (logic that belongs in an action/service)

## Automated Checks Run

```bash
pnpm lint --if-present
pnpm check --if-present
[ -f tsconfig.json ] && tsc --noEmit -p tsconfig.json
```

## Approval Criteria

| Status | Condition |
|---|---|
| PASS: Approve | No CRITICAL or HIGH issues |
| WARNING: Warning | Only MEDIUM issues (merge with caution) |
| FAIL: Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Run `/react-build` first if the build is broken
- Run `/svelte-test` to ensure component tests pass (Svelte projects)
- Use `/code-review` for non-UI concerns on the same PR

## Related

- Agent: `agents/vue-reviewer.md`
- Companion agent: `agents/typescript-reviewer.md`
- Skills: `skills/frontend-patterns/`, `skills/design-system/`, `skills/accessibility/`
