# ADR-0001: CLI-first guided Acrolls onboarding

**Date**: 2026-08-11  
**Status**: accepted  
**Deciders**: Amrit, Codex

## Context

Dropping Acrolls into an existing SvelteKit host requires several ordered checkpoints across
package installation, Svelte configuration, styles, content, generated source, routes,
validation, local checks, and deployment verification. Printing all instructions at once creates
high cognitive load in a terminal and makes users scroll back to recover the current step.
Agents and future UI clients still need a complete, structured representation of the same flow.
Acrolls must not silently edit host files or take ownership of deployment decisions.

## Decision

Acrolls uses a CLI-first onboarding contract. In an interactive TTY, `acrolls onboard` renders one
pending checkpoint at a time and waits for Enter, `next`, or `move to next`; `q` pauses the flow
and `--check` resumes from the remaining checkpoints. `--non-interactive` prints the complete
plan for CI and agents, while `--json` exposes the versioned plan for a future modal client.
Onboarding remains guidance-only; host configuration, credentials, adapters, and deployment stay
under host ownership.

## Alternatives Considered

### Alternative 1: Print the complete plan in every terminal session

- **Pros**: Simple implementation; easy to pipe into logs.
- **Cons**: Creates scroll-heavy output and makes the active checkpoint difficult to track.
- **Why not**: It does not fit a human first-run workflow, especially when each step requires
  opening a different file and making a deliberate change.

### Alternative 2: Automatically edit the host during onboarding

- **Pros**: Fewer manual edits; potentially faster for a known host shape.
- **Cons**: Risks overwriting existing adapters, preprocessors, layouts, and deployment settings.
- **Why not**: Host ownership and explicit review are more important than silent convenience.

### Alternative 3: Build a modal onboarding UI first

- **Pros**: Better visual progress and navigation controls.
- **Cons**: Duplicates the onboarding logic and introduces a second source of truth before the
  terminal workflow is proven.
- **Why not**: The CLI plan and `--json` contract can power a modal later without duplicating
  checkpoint content.

## Consequences

### Positive

- Human users process one integration decision at a time.
- Agents and CI can consume the complete plan without terminal interaction.
- `--check` provides a resumable workflow after interruptions.
- The same versioned plan can later drive a modal or other UI.
- Acrolls avoids taking ownership of host-specific deployment behavior.

### Negative

- Interactive onboarding takes more round trips than printing the entire plan.
- The current walkthrough does not apply edits automatically; users must perform and verify each
  checkpoint.
- A later UI must preserve the CLI plan contract to avoid divergent instructions.

### Risks

- A checkpoint may be marked complete in the filesystem while its wiring is semantically wrong;
  mitigate this with `acrolls validate`, host `pnpm check`, `pnpm build`, and browser verification.
- Local `file:` package changes can remain stale in the host; mitigate this by rebuilding Acrolls,
  refreshing the host dependency, and restarting the dev server.
