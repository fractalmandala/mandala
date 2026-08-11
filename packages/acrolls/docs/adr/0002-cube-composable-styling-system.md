# ADR-0002: CUBE-based composable styling system

**Date**: 2026-08-11  
**Status**: proposed  
**Deciders**: Amrit, Codex

## Context

Acrolls currently exposes broad `default` and `foundation` CSS entrypoints, while its styling
implementation and layout classes follow BEM-oriented naming. Those names do not tell host users
which design responsibility they are loading, and the current layouts and typography need a
substantial quality review. Acrolls needs a styling architecture that separates composition,
utilities, and exceptions while allowing a host to choose only the styling responsibilities it
needs.

## Decision

Acrolls will rework its styling system around CUBE CSS principles rather than BEM. Styling will be
organized and exposed by semantic responsibility—at minimum `layout`, `color-theme`, and
`typography`—with users able to load one responsibility or compose any combination. The existing
`default` and `foundation` names will be reviewed as compatibility aliases or retired entrypoints
after the new model is implemented. Every layout and typography surface will be reviewed as part
of the redesign, not treated as an incidental rename.

## Alternatives Considered

### Alternative 1: Keep BEM and add more descriptive entrypoint names

- **Pros**: Smaller migration; existing selectors and CSS files remain familiar.
- **Cons**: Preserves the current styling coupling and does not establish a clear composition
  model for layout, theme, and typography.
- **Why not**: Naming alone does not solve the architecture or current visual-quality problems.

### Alternative 2: Keep `default` and `foundation` as the primary style modes

- **Pros**: Minimal documentation and package-export changes.
- **Cons**: Users cannot tell what each mode controls and cannot easily combine responsibilities.
- **Why not**: The mode names describe implementation history rather than user intent.

### Alternative 3: Adopt a single monolithic theme stylesheet

- **Pros**: Simple installation and predictable cascade order.
- **Cons**: Forces hosts to accept Acrolls layout, color, and typography decisions together.
- **Why not**: It conflicts with host-owned design systems and makes targeted customization harder.

## Consequences

### Positive

- Users can understand styling choices in terms of layout, color theme, and typography.
- Hosts can compose only the styling responsibilities they need.
- CUBE gives Acrolls a clearer separation between composition, utilities, blocks, and exceptions.
- The redesign creates an explicit quality gate for layout and typography instead of preserving weak
  defaults indefinitely.
- The package exports and onboarding instructions can become more descriptive and discoverable.

### Negative

- Existing CSS imports, selectors, and documentation may require migration or compatibility aliases.
- More entrypoints increase package surface area and require clear cascade/order guidance.
- A full layout and typography review will take longer than a naming-only refactor.

### Risks

- CUBE can become ambiguous if responsibilities overlap; mitigate this with a documented layer map,
  ownership rules, and representative host fixtures.
- Composed styles may produce cascade conflicts; mitigate this with stable layer ordering, scoped
  tokens, and visual regression checks.
- Removing `default` or `foundation` too quickly could break existing hosts; retain aliases and a
  migration path until the new exports are proven.
