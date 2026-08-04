# Checkbox Layout Capture

Source component: `checkbox.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  checkbox_root["`**checkbox label**\n*(inline-flex row; gap space-3)*`"] --> checkbox_box["`**checkbox box**\n*(1.25rem square; centered)*`"]
  checkbox_box --> checkbox_icon["`**check/mixed icon**\n*(conditional SVG; 0.75rem)*`"]
  checkbox_root --> checkbox_label["`**optional label**\n*(inline text)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph checkbox_dom["checkbox.svelte DOM"]
    direction TB
    checkbox_wrap["label[data-slot=checkbox]"] --> checkbox_btn["button[data-slot=checkbox-box]"]
    checkbox_btn --> checkbox_dom_icon["conditional svg[data-slot=checkbox-icon]"]
    checkbox_wrap --> checkbox_dom_label["conditional span[data-slot=checkbox-label]"]
  end
  subgraph checkbox_css["checkbox.sass boundaries"]
    checkbox_row["inline-flex; align center; gap space-3"]
    checkbox_square["1.25rem × 1.25rem; centered"]
    checkbox_icon_css["0.75rem icon"]
  end
  checkbox_wrap -.-> checkbox_row
  checkbox_btn -.-> checkbox_square
  checkbox_dom_icon -.-> checkbox_icon_css
```

The label is the sole layout wrapper and forms an inline-flex row. Its button is a centered 1.25rem square; the check or mixed SVG appears only for checked or indeterminate state and is sized to 0.75rem. No responsive, sticky, fixed, grid, or scroll region is defined.
