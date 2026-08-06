# Routing matrix — domain × capability × stack

## Stack detection (gate)

1. Read package manifests and file extensions.
2. Default monorepo stack: **Svelte 5 + SvelteKit + indented SASS**; Tauri 2 when desktop.
3. Load primary reviewers for the detected stack; keep foreign stack reviewers secondary.

| Stack detected       | Primary domain reviewers        | Secondary           |
| -------------------- | ------------------------------- | ------------------- |
| Svelte 5 / SvelteKit | svelte-reviewer, a11y-architect | code-reviewer       |
| React / Next         | react-reviewer                  | code-reviewer       |
| Vue / Nuxt           | vue-reviewer                    | code-reviewer       |
| Flutter              | flutter-reviewer                | a11y-architect      |
| Rust / Tauri         | rust-reviewer                   | rust-build-resolver |
| Polyglot / unknown   | code-reviewer                   | as files appear     |

## Domain selection (Axis A)

| Request shape                                         | Active boss   | Default verification flavor                 |
| ----------------------------------------------------- | ------------- | ------------------------------------------- |
| Tokens, visual craft, a11y, motion, browser visual QA | Design        | contrast/a11y checks, visual QA             |
| Runes, routes, SASS components, data flow             | Svelte        | svelte-check, vite build, unit/e2e          |
| shadcn / fractalsvelte port                           | Svelte (port) | port-component checklist + build            |
| Security, debt, tests, perf, docs-from-code           | Code          | security-scan, tests, quality-gate          |
| Product agent harness, memory, MCP, eval              | Agent         | harness-audit, safety boundaries            |
| New app/site/package scaffold → ship                  | Creator       | project-init path + quality-gate            |
| Personal loops, prune, cost, session handoff          | Workflow      | no product ship gate unless automating code |
| ECC install, skill stocktake/comply/promote           | Meta          | skill-health / live indexes                 |
| Unclear multi-domain product work                     | Creator       | executive lean-on matrix                    |

## Capability selection (Axis B)

| Task shape                                           | Lane               | agent_type                                   |
| ---------------------------------------------------- | ------------------ | -------------------------------------------- |
| Spec largely determines result; mechanical / bounded | Routine            | `fractal_agentic_routine_implementer`        |
| Judgment, context, security, concurrency, wide blast | Complex            | `fractal_agentic_complex_implementer`        |
| Misclassified routine failure after one attempt      | Escalate complex   | after corrected spec                         |
| Pre-architecture decision                            | Fresh consult      | `fractal_agentic_fresh_reviewer`             |
| Post-implementation completion gate                  | Fresh final review | `fractal_agentic_fresh_reviewer`             |
| Release-critical dual adversarial review             | santa-loop         | after ship verdict when Code/Creator release |

## Combined examples

| Work                                  | Domain                      | Capability                                      |
| ------------------------------------- | --------------------------- | ----------------------------------------------- |
| Add Svelte button bound to tokens     | Svelte + Design constraints | Routine                                         |
| Port shadcn Dialog into fractalsvelte | Svelte port                 | Complex                                         |
| Fix SSR hydration race                | Svelte                      | Complex                                         |
| Token rename across design system     | Design                      | Routine or Complex by blast radius              |
| OWASP pass on API routes              | Code                        | Complex + security-reviewer consult             |
| Scaffold fractalengine feature        | Creator → Svelte            | Complex then routine slices                     |
| Install ECC skill and promote         | Meta                        | Routine (docs) / no product reviewer if no code |
| Personal instinct prune               | Workflow                    | Often no implementer lane                       |

## Parallelism

- Parallel: non-overlapping file ownership, no shared dependency.
- Serial: shared files, schema migrations, lockfiles, design tokens consumed by open PRs.

## Cost discipline

Route by shape, not prestige. Prefer routine. Escalate to complex only when justified.
Never burn complex on pure mechanical work.
