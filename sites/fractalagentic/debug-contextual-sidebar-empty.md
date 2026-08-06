# Debug Session: Contextual Sidebar Empty

Status: [OPEN]

## Symptom
The left contextual sidebar is present on commands, skills, and agents routes, but contains no navigation entries on list and detail pages.

## Hypotheses
1. The `import.meta.glob` paths in `catalog.ts` resolve to zero files, so `listSkills`, `listCommands`, and `listAgents` return empty arrays.
2. The route layouts evaluate catalog functions in a way that does not survive SSR/prerendering.
3. The sidebar receives items, but the rendered links are hidden or clipped by CSS.
4. The sidebar links are generated with incompatible route values.

## Evidence
- Pending static and runtime inspection.

## Changes
- No application logic or styling changed yet.
