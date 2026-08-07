# backup tokens

Complete reference for spacing, color, radius, typography, shadow, motion, and size tokens.

### Color Tokens

Copy link

Semantic colors for consistent theming. All colors use light-dark() for automatic mode switching.

|Token|Value|
|---|---|
|\--color-accent|#262626 / #ebebeb|
|\--color-accent-muted|#f1f1f1 / #262626|
|\--color-on-accent|#ffffff / #171717|
|\--color-neutral|#0000000F / #FFFFFF1A|
|\--color-background-surface|#ffffff / #262626|
|\--color-background-body|#f1f1f1 / #1b1b1b|
|\--color-overlay|#00000080 / #000000CC|
|\--color-overlay-hover|#0000000D / #FFFFFF0D|
|\--color-overlay-pressed|#0000001A / #FFFFFF1A|
|\--color-background-muted|#f1f1f1 / #1b1b1b|
|\--color-text-primary|#171717 / #fafafa|
|\--color-text-secondary|#737373 / #a3a3a3|
|\--color-text-disabled|#a3a3a3 / #525252|
|\--color-text-accent|#262626 / #ebebeb|
|\--color-on-dark|#ffffff|
|\--color-on-light|#171717|
|\--color-icon-accent|#262626 / #ebebeb|
|\--color-icon-primary|#171717 / #fafafa|
|\--color-icon-secondary|#737373 / #a3a3a3|
|\--color-icon-disabled|#a3a3a3 / #525252|
|\--color-background-card|#ffffff / #1b1b1b|
|\--color-background-popover|#ffffff / #1b1b1b|
|\--color-background-inverted|#0A1317 / #FFFFFF|
|\--color-background-error-inverted|#AA071E / #E3193B|
|\--color-success|#007004 / #9fe59b|
|\--color-success-muted|#c5e5c0 / #84c9803D|
|\--color-on-success|#ffffff / #171717|
|\--color-error|#a50c25 / #ffc6c1|
|\--color-error-muted|#facecb / #ff9e973D|
|\--color-on-error|#ffffff / #171717|
|\--color-warning|#745b00 / #fdcf4f|
|\--color-warning-muted|#f8da9d / #deb4333D|
|\--color-on-warning|#171717|
|\--color-border|#ebebeb / #FFFFFF1A|
|\--color-border-emphasized|#d4d4d4 / #525252|
|\--color-skeleton|#ebebeb / #525252|
|\--color-track|#CCD3DB / #5A5E66|
|\--color-shadow|#0000001A / #0000004D|
|\--color-tint-hover|black / white|
|\--color-background-blue|#c4ddfb / #9eb7ff3D|
|\--color-border-blue|#b1c9e7 / #6d9cfe|
|\--color-icon-blue|#00458c / #9eb7ff|
|\--color-text-blue|#00458c / #c7d3ff|
|\--color-background-cyan|#a3e0ef / #83c2d43D|
|\--color-border-cyan|#91d3e3 / #67a7b8|
|\--color-icon-cyan|#00505f / #83c2d4|
|\--color-text-cyan|#00505f / #9edef0|
|\--color-background-gray|#e5e5e5 / var(--color-neutral)|
|\--color-border-gray|#d4d4d4 / #262626|
|\--color-icon-gray|#525252 / #a3a3a3|
|\--color-text-gray|#262626 / #e5e5e5|
|\--color-background-green|#c5e5c0 / #84c9803D|
|\--color-border-green|#b2d1ac / #69ad67|
|\--color-icon-green|#0c5700 / #84c980|
|\--color-text-green|#0c5700 / #9fe59b|
|\--color-background-orange|#fad0b5 / #ffa2583D|
|\--color-border-orange|#e6bda2 / #e2883e|
|\--color-icon-orange|#6e3500 / #ffa258|
|\--color-text-orange|#6e3500 / #ffc9a2|
|\--color-background-pink|#fccadc / #ff99c33D|
|\--color-border-pink|#e7b7c8 / #f273aa|
|\--color-icon-pink|#83004b / #ff99c3|
|\--color-text-pink|#83004b / #ffc3da|
|\--color-background-purple|#eccef3 / #f297ff3D|
|\--color-border-purple|#d8bbdf / #dd74f0|
|\--color-icon-purple|#700084 / #f297ff|
|\--color-text-purple|#700084 / #fac1ff|
|\--color-background-red|#facecb / #ff9e973D|
|\--color-border-red|#e6bab8 / #ff6f6c|
|\--color-icon-red|#89001a / #ff9e97|
|\--color-text-red|#89001a / #ffc6c1|
|\--color-background-teal|#a5e3d6 / #7ec6b83D|
|\--color-border-teal|#94d6c8 / #63ab9d|
|\--color-icon-teal|#005348 / #7ec6b8|
|\--color-text-teal|#005348 / #99e2d3|
|\--color-background-yellow|#f8da9d / #deb4333D|
|\--color-border-yellow|#e4c279 / #c0990e|
|\--color-icon-yellow|#584400 / #deb433|
|\--color-text-yellow|#584400 / #fdcf4f|
|\--color-syntax-keyword|#700084 / #efa8ff|
|\--color-syntax-string|#005600 / #a6d2a2|
|\--color-syntax-comment|#737373 / #a3a3a3|
|\--color-syntax-number|#6e3500 / #ffb37f|
|\--color-syntax-function|#00458c / #a0caff|
|\--color-syntax-type|#700084 / #efa8ff|
|\--color-syntax-variable|#171717 / #e5e5e5|
|\--color-syntax-operator|#737373 / #a3a3a3|
|\--color-syntax-constant|#6e3500 / #ffb37f|
|\--color-syntax-tag|#89001a / #ffaeaa|
|\--color-syntax-attribute|#584400 / #eec12f|
|\--color-syntax-property|#005348 / #83dac9|
|\--color-syntax-punctuation|#a3a3a3 / #525252|
|\--color-syntax-background|#fafafa / #0a0a0a|
|\--color-data-categorical-blue|#0171E3|
|\--color-data-categorical-orange|#EB6E00|
|\--color-data-categorical-purple|#6B1EFD|
|\--color-data-categorical-green|#0B991F|
|\--color-data-categorical-pink|#F351C0|
|\--color-data-categorical-cyan|#0171A4|
|\--color-data-categorical-red|#F5394F|
|\--color-data-categorical-teal|#08A3A3|
|\--color-data-categorical-brown|#965E03|
|\--color-data-categorical-indigo|#6F8AFF|
|\--color-data-neutral|#8494A3 / #8C939B|
|\--color-data-blue-5|#02165E|
|\--color-data-blue-4|#004CBC|
|\--color-data-blue-3|#2694FE|
|\--color-data-blue-2|#78BEFF|
|\--color-data-blue-1|#DBECFF|
|\--color-data-shamrock-5|#0B603D|
|\--color-data-shamrock-4|#138546|
|\--color-data-shamrock-3|#24BB5E|
|\--color-data-shamrock-2|#8EF7AA|
|\--color-data-shamrock-1|#D6FEE4|
|\--color-data-orange-5|#A13F04|
|\--color-data-orange-4|#D66100|
|\--color-data-orange-3|#FD9537|
|\--color-data-orange-2|#FDB876|
|\--color-data-orange-1|#FFE6CF|
|\--color-data-pink-5|#8E1073|
|\--color-data-pink-4|#D123A1|
|\--color-data-pink-3|#F989D3|
|\--color-data-pink-2|#FEADE3|
|\--color-data-pink-1|#FCE3F4|
|\--color-data-purple-5|#3E0697|
|\--color-data-purple-4|#6B1EFD|
|\--color-data-purple-3|#9081FF|
|\--color-data-purple-2|#B3B0FE|
|\--color-data-purple-1|#E8E8FB|
|\--color-data-red-5|#9D0519|
|\--color-data-red-4|#D31130|
|\--color-data-red-3|#FB7D87|
|\--color-data-red-2|#FFB2B8|
|\--color-data-red-1|#FEE4E6|
|\--color-data-teal-5|#08767D|
|\--color-data-teal-4|#0C9293|
|\--color-data-teal-3|#0DB7AF|
|\--color-data-teal-2|#6CE6D8|
|\--color-data-teal-1|#D7FCF8|
|\--color-data-yellow-5|#8A5001|
|\--color-data-yellow-4|#D69804|
|\--color-data-yellow-3|#FBCE03|
|\--color-data-yellow-2|#FCEC85|
|\--color-data-yellow-1|#FDF6BA|
|\--color-data-gray-5|#25363F / #333338|
|\--color-data-gray-4|#5D6C7B / #666A72|
|\--color-data-gray-3|#AFB9C4 / #B2B8BE|
|\--color-data-gray-2|#CCD3DB / #D0D3D6|
|\--color-data-gray-1|#F1F4F7 / #F2F4F6|
|\--color-brand|

### Spacing Tokens

Copy link

Spacing scale used for padding, gap, and margin. Component gap props map spacing steps to these tokens.

|Token|Value|
|---|---|
|\--spacing-0|0px|
|\--spacing-0-5|2px|
|\--spacing-1|4px|
|\--spacing-1-5|6px|
|\--spacing-2|8px|
|\--spacing-3|12px|
|\--spacing-4|16px|
|\--spacing-5|20px|
|\--spacing-6|24px|
|\--spacing-7|28px|
|\--spacing-8|32px|
|\--spacing-9|36px|
|\--spacing-10|40px|
|\--spacing-11|44px|
|\--spacing-12|48px|

### Size Tokens

Copy link

Control heights for consistent sizing across buttons, inputs, and selectors.

|Token|Value|
|---|---|
|\--size-element-sm|28px|
|\--size-element-md|32px|
|\--size-element-lg|36px|

### Border Tokens

Copy link

Border width for card and input borders.

|Token|Value|Example|
|---|---|---|
|\--border-width|1px|

### Radius Tokens

Copy link

Numeric scale based on a 4dp base unit. Tokens scale with the theme's radius multiplier; --radius-none and --radius-full are fixed.

|Token|Value|Example|
|---|---|---|
|\--radius-none|0px|
|\--radius-inner|8px|
|\--radius-element|12px|
|\--radius-container|16px|
|\--radius-page|32px|
|\--radius-chat|28px|
|\--radius-full|9999px|

### Shadow Tokens

Copy link

Elevation shadows (low to med to high) and inset shadows for input state rings.

|Token|Preview|
|---|---|
|\--shadow-low|
|\--shadow-med|
|\--shadow-high|
|\--shadow-inset-hover|
|\--shadow-inset-selected|
|\--shadow-inset-success|
|\--shadow-inset-warning|
|\--shadow-inset-error|

### Duration Tokens

Copy link

Motion duration primitives. Three bands: fast (micro-interactions), medium (entrance/exit), slow (continuous). Min/max variants derive from base × ratio.

|Token|Value|
|---|---|
|\--duration-fast-min|130ms|
|\--duration-fast|175ms|
|\--duration-fast-max|230ms|
|\--duration-medium-min|310ms|
|\--duration-medium|410ms|
|\--duration-medium-max|550ms|
|\--duration-slow-min|730ms|
|\--duration-slow|975ms|
|\--duration-slow-max|1300ms|

### Easing Tokens

Copy link

Easing curves for animations and transitions.

|Token|Value|
|---|---|
|\--ease-standard|cubic-bezier(0.24, 1, 0.4, 1)|

### Font Family Tokens

Copy link

Font family stacks for body, code, and heading text.

|Token|Value|Example|
|---|---|---|
|\--font-family-body|Figtree|The quick brown fox jumps over the lazy dog|
|\--font-family-code|"SF Mono"|The quick brown fox jumps over the lazy dog|
|\--font-family-heading|Figtree|The quick brown fox jumps over the lazy dog|

### Font Size Tokens

Copy link

Geometric type scale: round(14 × 1.2^step). Base is 14px (--font-size-base).

|Token|Value|Example|
|---|---|---|
|\--font-size-4xs|0.375rem|The quick brown fox jumps over the lazy dog|
|\--font-size-3xs|0.4375rem|The quick brown fox jumps over the lazy dog|
|\--font-size-2xs|0.5rem|The quick brown fox jumps over the lazy dog|
|\--font-size-xs|0.625rem|The quick brown fox jumps over the lazy dog|
|\--font-size-sm|0.75rem|The quick brown fox jumps over the lazy dog|
|\--font-size-base|0.875rem|The quick brown fox jumps over the lazy dog|
|\--font-size-lg|1.0625rem|The quick brown fox jumps over the lazy dog|
|\--font-size-xl|1.25rem|The quick brown fox jumps over the lazy dog|
|\--font-size-2xl|1.5rem|The quick brown fox jumps over the lazy dog|
|\--font-size-3xl|1.8125rem|The quick brown fox jumps over the lazy dog|
|\--font-size-4xl|2.1875rem|The quick brown fox jumps over the lazy dog|
|\--font-size-5xl|2.625rem|The quick brown fox jumps over the lazy dog|

### Font Weight Tokens

Copy link

Font weight values for body, emphasis, and headings.

|Token|Value|Example|
|---|---|---|
|\--font-weight-normal|400|The quick brown fox jumps over the lazy dog|
|\--font-weight-medium|500|The quick brown fox jumps over the lazy dog|
|\--font-weight-semibold|600|The quick brown fox jumps over the lazy dog|
|\--font-weight-bold|700|The quick brown fox jumps over the lazy dog|

### Type Scale Tokens

Copy link

Semantic tokens for headings, body, labels, code, supporting text, and display text. References font size and weight tokens. Override via typography.scale in defineTheme.

|Sample|Tokens|
|---|---|
|H1|1.5rem · Figtree600 · 1.3333 (2px)|
|H2|1.25rem · Figtree600 · 1.4 (2px)|
|H3|1.0625rem · Figtree600 · 1.4118 (2px)|
|H4|0.875rem · Figtree600 · 1.4286 (1px)|
|H5|0.75rem · Figtree600 · 1.6667 (1px)|
|H6|0.625rem · Figtree600 · 1.6 (1px)|
|Display 1|2.625rem · Figtree600 · 1.2381 (3px)|
|Display 2|2.1875rem · Figtree600 · 1.2571 (3px)|
|Display 3|1.8125rem · Figtree600 · 1.2414 (2px)|
|Large|1.0625rem · Figtree600 · 1.4118 (2px)|
|Body|0.875rem · Figtree400 · 1.4286 (1px)|
|Label|0.875rem · Figtree500 · 1.4286 (1px)|
|Code|0.875rem · "SF Mono"400 · 1.4286 (1px)|
|Supporting|0.75rem · Figtree400 · 1.6667 (1px)|