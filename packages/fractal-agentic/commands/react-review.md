---
description: Comprehensive UI component code review for reactivity correctness, render performance, server/client boundaries, accessibility, and component-specific security. Invokes the react-reviewer agent (and typescript-reviewer alongside on typed changes).
---

# UI Component Code Review

This command invokes the **react-reviewer** agent for UI-component-focused code review. For pull requests touching component files, both `react-reviewer` and `typescript-reviewer` should run — each owns a distinct lane.

## What This Command Does

1. **Identify Component Changes**: Find modified component files (`.svelte`, `.tsx`) and UI-related `.ts` files via `git diff`
2. **Run Lint**: Execute `eslint` with the project's component plugins (e.g. `eslint-plugin-svelte`, a11y rules)
3. **Typecheck**: Run `svelte-check`, `tsc --noEmit`, or the project's canonical typecheck command
4. **Review Component Lanes Only**: Reactivity rules, SSR boundaries, accessibility, render performance, component-specific security
5. **Generate Report**: Categorize issues by severity (CRITICAL / HIGH / MEDIUM)

## When to Use

Use `/react-review` when:

- A PR or commit touches UI component files
- After writing or modifying components, reactive state, or pages
- Before merging frontend code
- Auditing accessibility on UI components
- Reviewing a new reactive primitive for correctness
- Auditing a server/client component boundary

For Svelte projects prefer `/svelte-review` (stack-specific). For pure `.ts`/`.js` changes with no UI, use `/code-review` (general) or invoke `typescript-reviewer` directly.

## Scope vs `/code-review` and TypeScript Review

| Tool | Scope |
|---|---|
| `react-reviewer` (this command) | Reactivity rules, component markup, SSR boundaries, a11y, render perf |
| `typescript-reviewer` | Generic TS/JS — `any` abuse, async correctness, runtime security |
| `security-reviewer` | Project-wide security audit |
| `/code-review` | Generic uncommitted-changes or PR review |

On a component PR, invoke both `react-reviewer` and `typescript-reviewer`. Findings from each are non-overlapping by design.

## Review Categories

### CRITICAL (Must Fix)

- Raw HTML injection (`{@html}` / `innerHTML`) with unsanitized input
- `href`/`src` with unvalidated user URLs (`javascript:`, `data:`)
- Server endpoints/actions without input validation
- Secret in client bundle (public env vars, hardcoded keys)
- `localStorage`/`sessionStorage` for session tokens
- Direct mutation of state that must trigger reactivity
- Reactive primitives called outside their valid context

### HIGH (Should Fix)

- Effect used for derivable values (should be derived/computed)
- Effect/subscription missing cleanup
- Stale closures in handlers/intervals
- Server-only imports in client components
- Sensitive data leaked via props to client components
- Server actions without auth checks
- Accessibility violations (missing labels, non-semantic interactive elements, ARIA misuse)
- Unkeyed dynamic lists
- Duplicated state, chained effects

### MEDIUM (Consider)

- Over-optimization without measured win
- Long lists without virtualization
- High-frequency values through global stores/context
- Roll-your-own validation in non-trivial forms
- Prop drilling beyond 3 levels
- Component over 200 lines
- Legacy component APIs in new code

## Automated Checks Run

```bash
# Lint (required for any meaningful review)
pnpm lint --if-present
npx eslint .

# Typecheck
pnpm check --if-present            # svelte-check
[ -f tsconfig.json ] && tsc --noEmit -p tsconfig.json

# Supply-chain
pnpm audit
```

If the project's a11y lint rules are not configured, the review will flag the gap as a HIGH config issue and continue.

## Example Usage

````text
User: /react-review

Agent:
# UI Component Review Report

## Files Reviewed
- src/lib/components/UserCard.svelte (modified)
- src/lib/state/user.svelte.ts (new)

## Lint Results
PASS: eslint clean
PASS: typecheck clean

## Issues Found

[CRITICAL] Unsanitized HTML injection
File: src/lib/components/UserCard.svelte:42
Issue: User-controlled bio rendered via {@html}.
Why: XSS via stored script tags in user input.
Fix: Sanitize before injection, or render as text.

[HIGH] Effect cleanup missing
File: src/lib/state/user.svelte.ts:18
Issue: fetch without AbortController; state write after unmount possible.
Fix: Add AbortController and return cleanup from $effect.

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
````

## Approval Criteria

| Status | Condition |
|---|---|
| PASS: Approve | No CRITICAL or HIGH issues |
| WARNING: Warning | Only MEDIUM issues (merge with caution) |
| FAIL: Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Run `/react-build` first if the build is broken
- Run `/svelte-test` to ensure component tests pass (Svelte projects)
- Use `/code-review` for non-component-specific concerns on the same PR

## Related

- Agent: `agents/react-reviewer.md`
- Companion agent: `agents/typescript-reviewer.md` (run alongside for component PRs)
- Skills: `skills/frontend-patterns/`, `skills/frontend-a11y/`, `skills/accessibility/`
