# Shradhapp design system

Shradhapp is a calm, capable local video studio. The default dark theme gives the preview and timeline focus; light mode uses the same semantic roles for daytime use.

## Level-zero rules

- Component SASS uses the semantic 4, 8, 16, 32, 64, 80, and 128 pixel `--space-*` tokens; composed markup uses Fractals Styler's arbitrary pixel utilities.
- The only radii are 3px and 6px; aliases exist solely to keep component code semantic.
- Body copy uses a 1.5 line-height; headings use 1.1.
- Components own their styling. Utility classes are reserved for typography and the existing layout primitives.

## Architecture scheme

The system is deliberately layered. A lower layer never reaches upward, and a screen must compose patterns from these families instead of creating one-off styling.

1. `tokens` — the single source for semantic colour, spacing, type scale, radius, elevation, and motion values. `design-tokens.json` mirrors the portable subset.
2. `globals` — fonts, reset, document defaults, focus ring, and reduced-motion guardrails.
3. `typography` — text hierarchy and the small existing typography utility set.
4. `primitives` — existing flex/grid helpers, retained for legacy screens only. New studio work should compose layouts instead.
5. `buttonslinks` — the shared control and link family.
6. `layouts` — shell, workspace, and page frames.
7. `components` — reusable surface, panel, sidebar, drawer, notice, and tooltip foundations.
8. Domain modules — `navigation`, `projectstudio`, `media`, `recorder`, `settings`, and `command-palette` own their respective app domains.
9. `motion` — state transitions and feedback using only shared motion tokens. It remains last in the import order and never animates layout dimensions or positions.

Domain modules own cohesive application areas; they do not become page stylesheets.

## Universal styling vocabulary

The system is intentionally compositional. A screen should first assemble from these reusable families before introducing a semantic component name.

- Layout: `flex`, `row`, `col`, `grid`, `wrap`, `grow`, `shrink-0`, `min-w-0`, `min-h-0`, `w-full`, `h-full`.
- Alignment: existing `xleft`, `xcenter`, `xright`, `ycenter`, `ytop`, `ybot`, `xbetween`, and `xevenly` modifiers compose with `row` or `box`.
- Spacing: Fractals Styler owns arbitrary-pixel `gapN`, `cgapN`, `rgapN`, `padN`, directional padding/margin, and height/width utilities, and emits `var(--pxN)` for integer values referenced in source. Parent gaps own vertical rhythm; children do not introduce arbitrary top or bottom margins.
- Bounds and scrolling: `overflow-hidden`, `overflow-auto`, `overflow-x-auto`, and `overflow-y-auto` always pair with an explicit available size and `min-h-0` when used in a flex/grid child.
- Surfaces: `surface`, `surface-raised`, `panel`, `panel-header`, `panel-content`, `sidebar`, `sidebar-header`, `sidebar-content`, `drawer`, `drawer-content`, `empty-state`, and `notice`.
- Borders and motion: `border`, `border-transparent`, `bordtop`, `bordbot`, `bordleft`, `radius-sm`, `radius-md`, `pointer`, and `trans-std`.
- Controls and links: `control` is the shared interaction base; `button`, `button-primary`, `button-quiet`, `icon-button`, and `link` are the public control family.
- Typography: the type-size, alignment, weight, casing, tracking, and line-height classes in `typography`; semantic colour helpers `text-strong`, `text-muted`, `text-accent`, `text-success`, and `text-danger`; and content helpers `truncate`, `nowrap`, and `break-word`.

Project-specific class names are allowed only when they name a genuine domain concept with behavior or presentation beyond this vocabulary. They should compose these families rather than repeat their layout, border, radius, hover, or transition declarations.

## Workspace layout contract

`shell`
├── `shell-header` / `app-header` (optional fixed header)
├── `shell-main` / `app-main` (the remaining viewport)
│ └── `workspace` (one or more resizable surfaces)
│ ├── `sidebar` (optional, collapsible/resizable)
│ │ ├── `sidebar-header` (optional)
│ │ └── `sidebar-content` (bounded scroll region)
│ ├── `workspace-resizer` (optional)
│ ├── `workspace-main` (the central bounded viewport)
│ │ └── `viewport-page` or domain surface
│ ├── `workspace-resizer` (optional)
│ └── `sidebar` (optional, collapsible/resizable)
│ └── nested `workspace` when a surface itself splits
└── optional footer

The shell owns viewport height. Every flexible descendant that may scroll has `min-h-0`; the central workspace itself remains bounded and does not become a document-level vertical scroll container. Nested workspaces split only their host surface, so adjacent surfaces keep their allocation.

## Motion contract

- Motion must explain state, preserve orientation, or confirm an action. Decorative movement is out of scope.
- `src/lib/motion.ts` is the Svelte Motion gateway: it centralizes duration and low-end-device gating. Components use `useReducedMotion()` from `@humanspeak/svelte-motion` for the reactive OS accessibility preference.
- Collapsing audio repair fades its contents and rotates the disclosure glyph; export uses a brief opacity/transform confirmation; selected timeline clips lift by 4px.
- Timeline navigation works with horizontal trackpad scrolling, mouse-wheel scrolling, and left/right keyboard arrows.
- Reduced motion removes transforms and suppresses optional animation. No transition animates width, height, margin, padding, or positional layout properties.

## Rules

- Use semantic tokens only. Never hard-code a theme colour in a component; dark mode is `[data-theme="dark"]` and light mode is `[data-theme="light"]`.
- New UI begins with a layout or component family; do not create screen-specific utility classes.
- Buttons and icon controls have a minimum 44px hit area. Keyboard focus remains visible.
- Use borders for normal separation and one subtle elevation layer for modals or floating work.
- Motion uses explicit properties and respects reduced-motion preferences.
