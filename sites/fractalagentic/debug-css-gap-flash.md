# Debug Session: CSS Gap Flash

Status: [OPEN]

## Symptom
On reload, page spacing/gap utilities briefly disappear and the layout renders compressed before or during stylesheet hydration.

## Hypotheses
1. Sass import order allows later rules to override or omit spacing utilities.
2. `fractals-styler` CSS is injected asynchronously, producing a flash before utility classes load.
3. The global stylesheet is absent or delayed in the initial SSR HTML.
4. A stylesheet split/import change introduces a cascade race or duplicate selector conflict.
5. The symptom is a transient unstyled render rather than the final computed layout.

## Evidence
- Pending runtime reproduction and computed-style capture.

## Changes
- No application logic or styles changed yet.
