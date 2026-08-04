# Number Ticker Layout Capture

Source component: `number-ticker.svelte`

## Diagram 1 — UI architecture and layout flow
```mermaid
graph TD
  ticker_root["`**number ticker**\n*(inline-flex; tabular numerals)*`"] --> ticker_hidden["`**accessible value**\n*(aria-label; readable prefix/suffix)*`"]
  ticker_root --> ticker_visual["`**visual text row**\n*(aria-hidden; inline digit sequence)*`"]
  ticker_visual --> ticker_digits["`**digit cells**\n*(each digit clipped to 1ch × 1.1em)*`"]
  ticker_digits --> ticker_column["`**digit column**\n*(vertical flex stack; animated translateY)*`"]
```

## Diagram 2 — DOM and CSS containment
```mermaid
flowchart TD
  subgraph ticker_dom["number-ticker.svelte DOM"]
    direction TB
    ticker_span["span[data-slot=number-ticker]"] --> ticker_a11y["aria-hidden visual span"]
    ticker_a11y --> ticker_seq["each glyph"]
    ticker_seq --> ticker_digit["span[data-slot=number-digit]"]
    ticker_digit --> ticker_col["span[data-slot=number-column]"]
    ticker_col --> ticker_values["ten digit spans"]
  end
  subgraph ticker_css["number.sass boundaries"]
    ticker_row["inline-flex row"]
    ticker_clip["overflow hidden; 1ch × 1.1em"]
    ticker_stack["position absolute; flex column"]
  end
  ticker_span -.-> ticker_row
  ticker_digit -.-> ticker_clip
  ticker_col -.-> ticker_stack
```

The outer ticker is an inline-flex row. Each numeric glyph becomes a fixed-width, overflow-hidden cell containing an absolutely positioned vertical flex column of ten values; non-digits remain inline spans. No responsive, sticky, fixed, or scroll container is defined.
