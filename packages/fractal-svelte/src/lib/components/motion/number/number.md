# Number Layout Capture

Source component: `number.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  num_root["`**number**\n*(inline text, numeric display)*`"] --> num_value["`**rendered value**\n*(prefix/value/suffix; formatted text)*`"]
  num_root -.-> num_view["`**view trigger**\n*(optional IntersectionObserver; no layout change)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph num_dom["number.svelte DOM"]
    direction TB
    num_span["span[data-slot=number]"] --> num_text["rendered text"]
  end
  subgraph num_css["number.sass boundary"]
    num_tabular["tabular numeric typography"]
  end
  num_span -.-> num_tabular
```

The root inline `span` is the only layout region. It contains one rendered text node; animation and visibility state affect the value but do not add structural layout. SASS applies tabular numeric glyph metrics, with no explicit dimensions, gap, padding, flex, grid, sticky, fixed, or scroll region.
