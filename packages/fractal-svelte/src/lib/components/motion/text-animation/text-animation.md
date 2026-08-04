# Text Animation Layout Capture

Source component: `text-animation.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  text_root["`**text animation**\n*(inline-block; duration variable)*`"] --> text_variant["`**one active text variant**\n*(conditional layout branch)*`"]
  text_variant --> text_reveal["`**reveal lines**\n*(block lines; inline-block units)*`"]
  text_variant --> text_type["`**typewriter text**\n*(text + cursor)*`"]
  text_variant --> text_cascade["`**cascade text**\n*(inline-flex; overflow hidden)*`"]
  text_variant --> text_shimmer["`**shimmer text**\n*(inline-block; optional children + text)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph text_dom["text-animation.svelte DOM"]
    direction TB
    text_span["span[data-slot=text-animation]"] --> text_branch["conditional variant"]
    text_branch --> text_lines["each span[data-slot=text-line]"]
    text_lines --> text_units["each motion span[data-slot=text-unit]"]
    text_branch --> text_type_dom["typewriter span + cursor"]
    text_branch --> text_cascade_dom["cascade span + character spans"]
    text_branch --> text_shimmer_dom["shimmer span + children/text"]
  end
  subgraph text_css["text-animation.sass boundaries"]
    text_inline["inline-block root and units"]
    text_line_css["block text lines"]
    text_clip["inline-flex; overflow hidden cascade"]
  end
  text_span -.-> text_inline
  text_lines -.-> text_line_css
  text_cascade_dom -.-> text_clip
```

The root is an inline-block. Reveal mode creates block lines containing inline-block animated units; typewriter mode remains inline text with a cursor; cascade mode uses an inline-flex clipped row; shimmer mode keeps optional children and text in an inline-block. No grid, sticky, fixed, or scroll container is present beyond cascade clipping.
