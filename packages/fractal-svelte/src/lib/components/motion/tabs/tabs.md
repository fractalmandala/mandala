# Tabs Layout Capture

Source component: `tabs.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  tabs_root["`**tabs**\n*(flex column; gap space-4)*`"] --> tabs_list["`**tabs list**\n*(inline-flex row; start-aligned; gap space-1)*`"]
  tabs_list --> tabs_triggers["`**tab triggers**\n*(each; nowrap; min-height 2.5rem)*`"]
  tabs_triggers --> tabs_indicator["`**active indicator**\n*(conditional absolute inset; underline variant bottom edge)*`"]
  tabs_root --> tabs_panel["`**tab panel**\n*(conditional selected content)*`"]
  tabs_panel --> tabs_children["`**children snippet**\n*(selected Tab argument)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph tabs_dom["tabs.svelte DOM"]
    direction TB
    tabs_container["div[data-slot=tabs]"] --> tabs_dom_list["div[data-slot=tabs-list]"]
    tabs_dom_list --> tabs_dom_trigger["each button[data-slot=tab-trigger]"]
    tabs_dom_trigger --> tabs_dom_indicator["conditional motion span indicator"]
    tabs_dom_trigger --> tabs_dom_label["tab label span"]
    tabs_container --> tabs_dom_panel["conditional motion.div tab panel"]
    tabs_dom_panel --> tabs_dom_children["rendered children(selected)"]
  end
  subgraph tabs_css["tabs.sass boundaries"]
    tabs_stack["flex column; gap space-4"]
    tabs_row["inline-flex; align-items center; gap space-1"]
    tabs_abs["absolute indicator; inset 0"]
  end
  tabs_container -.-> tabs_stack
  tabs_dom_list -.-> tabs_row
  tabs_dom_indicator -.-> tabs_abs
```

The root is a vertical flex layout separating the trigger list and selected panel by `space-4`. Triggers form a non-wrapping inline-flex row with a padded pill, segmented, or underline presentation; the active indicator is an absolute child. Only the selected panel is rendered. No sticky, fixed, or scroll region is specified.
