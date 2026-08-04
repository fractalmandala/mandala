# Marquee Layout Capture

Source component: `marquee.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  marquee_root["`**marquee viewport**\n*(relative; flex; width 100%; overflow hidden)*`"] --> marquee_track_a["`**track copy A**\n*(flex; shrink 0; gap variable; animated)*`"]
  marquee_root --> marquee_track_b["`**track copy B**\n*(duplicate; inert/aria-hidden; animated)*`"]
  marquee_track_a --> marquee_children_a["`**children snippet**\n*(repeated content flow)*`"]
  marquee_track_b --> marquee_children_b["`**children snippet**\n*(duplicate content flow)*`"]
  marquee_root -.-> marquee_fade["`**edge mask**\n*(optional horizontal or vertical fade)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph marquee_dom["marquee.svelte DOM"]
    direction TB
    marquee_div["div[data-slot=marquee]"] --> marquee_each["each copy"]
    marquee_each --> marquee_track["div[data-slot=marquee-track]"]
    marquee_track --> marquee_content["rendered children"]
  end
  subgraph marquee_css["marquee.sass boundaries"]
    marquee_view["relative flex; width 100%; overflow hidden"]
    marquee_track_css["flex-shrink 0; align center; gap variable"]
    marquee_vertical["vertical mode: column tracks and column mask"]
    marquee_mask["optional edge mask; 12% fade stops"]
  end
  marquee_div -.-> marquee_view
  marquee_track -.-> marquee_track_css
  marquee_div -.-> marquee_vertical
  marquee_div -.-> marquee_mask
```

The root is a full-width, overflow-hidden flex viewport with a configurable gap and optional 12% edge fade. Two non-shrinking track copies run side by side for horizontal motion or in a column for vertical motion; each track maintains the children snippet in a flex flow and can pause on hover. The root is the scroll/clipping region, but no sticky or fixed positioning is used.
