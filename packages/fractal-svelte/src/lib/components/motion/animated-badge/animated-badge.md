# Animated Badge Layout Capture

Source component: `animated-badge.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  badge_root["`**badge**\n*(inline-flex; aligned; nowrap; status/size variants)*`"] --> badge_pulse["`**pulse layer**\n*(conditional absolute inset; decorative)*`"]
  badge_root --> badge_icon["`**icon region**\n*(conditional; centered; status glyph or snippet)*`"]
  badge_root --> badge_label["`**label region**\n*(conditional children snippet)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph badge_dom["animated-badge.svelte DOM"]
    direction TB
    badge_span["span[data-slot=badge]"] --> badge_dom_pulse["conditional pulse span"]
    badge_span --> badge_dom_icon["conditional icon span"]
    badge_dom_icon --> badge_dom_icon_content["snippet or status glyph"]
    badge_span --> badge_dom_label["conditional label span"]
    badge_dom_label --> badge_dom_children["rendered children"]
  end
  subgraph badge_css["animated-badge.sass boundaries"]
    badge_row["inline-flex; align center; nowrap"]
    badge_sizes["sm 1.5rem; md 2rem; variant padding/gap"]
    badge_overlay["absolute inset pulse"]
  end
  badge_span -.-> badge_row
  badge_span -.-> badge_sizes
  badge_dom_pulse -.-> badge_overlay
```

The badge is an inline-flex pill with a fixed height per size variant: 1.5rem small or 2rem medium. Icon and label regions sit in normal row flow with size-dependent gaps and padding, while the optional pulse fills the badge via an absolute inset layer behind them. No responsive, sticky, fixed, grid, or scroll region is defined.
