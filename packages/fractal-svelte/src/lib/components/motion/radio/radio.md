# Radio Layout Capture

Source component: `radio.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  radio_root["`**radio group**\n*(flex; vertical or horizontal responsive orientation)*`"] --> radio_items["`**radio items**\n*(each; inline-flex; aligned)*`"]
  radio_items --> radio_control["`**radio control**\n*(1.25rem square; circular)*`"]
  radio_control --> radio_dot["`**selected dot**\n*(conditional absolute inset 0.25rem)*`"]
  radio_items --> radio_label["`**radio label**\n*(inline text)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph radio_dom["radio.svelte DOM"]
    direction TB
    radio_group["div[data-slot=radio-group]"] --> radio_each["each label[data-slot=radio-item]"]
    radio_each --> radio_btn["button[data-slot=radio-control]"]
    radio_btn --> radio_dom_dot["conditional motion span dot"]
    radio_each --> radio_dom_label["span[data-slot=radio-label]"]
  end
  subgraph radio_css["radio.sass boundaries"]
    radio_flow["flex; gap space-3; column or row wrap"]
    radio_item_flow["inline-flex; align center; gap space-3"]
    radio_dot_pos["absolute; inset 0.25rem"]
  end
  radio_group -.-> radio_flow
  radio_each -.-> radio_item_flow
  radio_dom_dot -.-> radio_dot_pos
```

The group switches between a vertical column and a horizontally wrapping row based on `data-orientation`, with `space-3` gaps. Each label is an inline-flex row containing a 1.25rem circular control and text label; the selected dot is positioned inside the control. No sticky, fixed, or scroll region exists.
