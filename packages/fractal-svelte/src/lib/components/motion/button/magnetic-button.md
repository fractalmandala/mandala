# Magnetic Button Layout Capture

Source component: `magnetic-button.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  magnetic_root["`**magnetic wrapper**\n*(inline-flex; pointer-translated)*`"] --> magnetic_button["`**Button component**\n*(nested button layout)*"]
  magnetic_button --> magnetic_content["`**children snippet**\n*(forwarded into button content)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph magnetic_dom["magnetic-button.svelte DOM"]
    direction TB
    magnetic_span["span[role=presentation]"] --> magnetic_child["Button component"]
    magnetic_child --> magnetic_inner["button.svelte structure"]
  end
  subgraph magnetic_css["inline style boundary"]
    magnetic_transform["display inline-flex; transform translate; transition"]
  end
  magnetic_span -.-> magnetic_transform
```

The wrapper is an inline-flex positioning region and translates as a whole from pointer offsets. Its only child is the reusable Button component, which supplies the button, optional ripple layer, content flex row, dimensions, and spacing. No grid, sticky, fixed, or scroll region is introduced.
