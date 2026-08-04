# Loader Layout Capture

Source component: `loader.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  loader_root["`**loader**\n*(inline-flex; centered; min-width/height var(--loader-size))*`"] --> loader_variant["`**one active variant**\n*(conditional visual branch)*`"]
  loader_variant --> loader_spinner["`**spinner / SVG**\n*(size × size)*`"]
  loader_variant --> loader_flex["`**dots, bars, comet, newton**\n*(flex tracks; indexed items)*`"]
  loader_variant --> loader_grid["`**dot-matrix / dither**\n*(3×3 or 4-column grid)*`"]
  loader_variant --> loader_percent["`**percent**\n*(column; label + progress bar)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph loader_dom["loader.svelte DOM"]
    direction TB
    loader_span["span[data-slot=loader]"] --> loader_branch["conditional data-part branch"]
    loader_branch --> loader_svg["SVG variant"]
    loader_branch --> loader_items["flex item variant"]
    loader_branch --> loader_matrix["grid item variant"]
    loader_branch --> loader_percent_dom["percent column with b + i track"]
  end
  subgraph loader_css["loader.sass boundaries"]
    loader_root_css["inline-flex; centered; size variable"]
    loader_flex_css["flex; item gap 10% size"]
    loader_grid_css["grid; 3 columns or 4 columns; size square"]
    loader_percent_css["flex column; width 1.4× size; gap 14% size"]
  end
  loader_span -.-> loader_root_css
  loader_items -.-> loader_flex_css
  loader_matrix -.-> loader_grid_css
  loader_percent_dom -.-> loader_percent_css
```

The root centers one conditionally selected loader branch and exposes a size variable as minimum width and fixed height. Variants use inline SVG, flex rows, square grids, absolute-positioned motion, monospace text, or a vertical percent layout with a full-width progress track. The component has no external responsive, sticky, fixed, or scroll region.
