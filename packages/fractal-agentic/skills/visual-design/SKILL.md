---
name: visual-design
description: 'Create and edit images (logos, icons, diagrams, assets, photo edits) and build presentations/slide decks. Use when the user needs generated visuals, architecture/flow diagrams, icon sets, or slides. Prefer tools available in the session (image APIs/CLIs, Imagine tools, Slidev, pptx skills, etc.) without locking to one vendor.'
---

# Visual design

Images and presentations for product, docs, and communication work. Tool-agnostic: pick the best available path in the current environment.

## When to use

- Logos, icons, app assets, patterns, textures
- Diagrams: flowcharts, architecture, sequence sketches
- Photo edit / restore / background removal (when tools allow)
- Slide decks and presentations from markdown or structured outline

## When not to use

- Production UI component craft in the monorepo → Design Boss skills (`impeccable`, `design-system`, …)
- Music-video / hyperpop media grammar → `taste`
- Long-form article writing → content skills

## Tool selection (in order of preference)

1. **Session-native image tools** — e.g. host Imagine / image generation and edit APIs when exposed.
2. **Project or user CLI** already configured (any image CLI with a key the user has set).
3. **Presentation stack the repo already uses** — Slidev, reveal, pptx pipeline, etc.
4. **Fallback** — describe assets precisely and export SVG/HTML mockups the user can take into Figma or design tools.

Never require a specific vendor, API key brand, or model name. If a tool is missing, say what is needed and offer a fallback.

### Image generation / edit checklist

| Task | Guidance |
| --- | --- |
| Logo / wordmark | Few strong variants; state aspect ratio; avoid unreadable fine type in raster logos |
| Icons | Consistent stroke/weight; export sizes if the user needs them |
| Diagrams | Prefer structured labels; keep one idea per diagram |
| Photo edit | Describe the change; preserve subject identity unless asked |
| Sequences | Number frames; shared style anchor |

Prompt craft:

- Subject, style, palette, lighting, composition, negative constraints
- For brand work, reuse colors/fonts from the project when known
- For diagrams, list nodes and edges explicitly

### Presentations checklist

1. Clarify audience, length, and call to action.
2. Outline sections before slides (one idea per slide).
3. Prefer markdown-driven decks when the environment supports them (e.g. Slidev) so content stays diffable.
4. Export formats the user asked for (PDF, PPTX, SPA) using available tooling.
5. Code samples: real, short, highlighted; avoid walls of text.

Suggested slide structure:

```text
Title → Problem → Insight → Approach → Detail (few) → Demo/Proof → Next steps
```

## Quality bar

- Legible type and contrast
- Consistent margins and alignment
- No decorative noise that fights the message
- Assets named clearly (`logo-dark.svg`, `arch-auth-flow.png`)
- Note license / generation source when the user will publish externally

## Safety

- Do not generate harmful or disallowed content.
- For real people, follow the host’s likeness / consent rules.
- Don’t embed secrets into image EXIF or slide speaker notes.

## Related skills

- `canvas-design` — print/poster style visual art when that skill fits better
- `theme-factory` — product theme tokens (not marketing slides)
- `ui-demo` — recorded UI walkthroughs
- Design Boss armory — real product UI implementation

## Credit

**ASI** — https://github.com/plurigrid/asi
