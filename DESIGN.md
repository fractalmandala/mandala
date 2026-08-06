# Fracta design system

Fracta is a desktop knowledge workspace: quiet paper, legible density, and green used only
when something is connected, active, or ready. The /design route is its interactive
Library Ledger prototype; it never reads or writes the user's vault.

## Foundations

### Colour

Warm neutral surfaces do the structural work. The natural green scale is deliberately
small and semantic.

| Role | Value | Use |
| --- | --- | --- |
| Primary / dark contrast | #2B8A3E | links, high-emphasis green text, borders on bright actions |
| Active | #37B24D | selected command surface, active document marker, current location |
| Hover | #2F9E44 | interactive hover and positive state |
| Focus / live | #40C057 | focus ring, active live indicator |
| Bright signal | #51CF66 | sparse success / availability signal |
| Selection | #DDF7E3 | selected row, soft callout, active icon surface |

Color00 (#FFFEFC) is the paper canvas and color10 (#F7F5F1) is the raised/navigation
surface. The dark token set maintains the same relationships rather than inverting
colors mechanically.

### Typography

Google Sans Flex is the application and reading face. It is loaded from
static/fonts/GoogleSansFlex.woff2 and exposed through the sans token. The mono token is
reserved for source, file paths, metadata, and tabular data. Counters use tabular numerals.

### Scale and motion

- Spacing foundation: 4, 8, 16, 32, 64, 80, 128px. Components compose adjacent steps
  for intermediate optical gaps rather than creating ad-hoc spacing tokens.
- Radius: 3px for small marks and 6px for controls; larger radii are reserved for
  nested surfaces and dialogs, where the outer-to-inner relationship needs it.
- Controls: 40px minimum; 44px primary actions.
- Motion: 80ms direct feedback, 180ms controls, 280ms entering content, 560ms only for
  onboarding. Animate only opacity and transform; never layout dimensions, grid tracks,
  margins, padding, or transition-all.
- Implementation: interactive preview motion uses `@humanspeak/svelte-motion` with
  `AnimatePresence`; `src/lib/motion.ts` is the single token and capability gate.
  The native settings dialog keeps a compositor-only compatibility transition to retain
  its desktop dialog semantics.
- Reduced motion removes transforms and limits transitions to brief opacity changes.

## Layers

The Sass system is intentionally compositional, not a utility-class catalogue.

1. Globals — reset, font smoothing, focus behavior, selection, scrollbars, form defaults,
   and reduced-motion baseline.
2. Tokens — semantic color, type, geometry, elevation, breakpoints, and motion values.
   The preview owns scoped aliases in `styles/preview/_tokens.sass`; global roles remain
   in `styles/_tokens.sass`.
3. Primitives — buttons, icon buttons, fields, segmented controls, pills, separators,
   surfaces, dialogs, and status markers. Shared app primitives live in
   `styles/_primitives.sass` and `styles/_buttonslinks.sass`; the prototype-specific
   form and segmented-control normalization is in `styles/preview/_primitives.sass`.
4. Components — chrome, navigator, ledger, canvas/data states, inspector, Ask, and
   settings own their contextual styles in `styles/preview/components/`. This is where
   a selector may be specific to a product feature; it must consume semantic tokens
   rather than introduce a new visual scale.
5. Layouts — desktop shell, four-region workbench, modal sheets, and print surface define
   geometry only.

`_design-preview.sass` is deliberately a composition entry point (eleven imports, no
selectors). It imports preview tokens, primitives, and pane geometry before the bounded
component modules. This keeps the high-fidelity route isolated while giving it the same
governance as the product system. `WorkbenchTopbar.svelte` is the first extracted
prototype shell component; subsequent prototype regions follow the same boundary.

Avoid adding spacing, typography, or color utility classes for one-off uses. Prefer a
semantic component selector, a token, and local nested Sass.

## Library Ledger prototype

At desktop width the workbench is Navigator (244px), Document ledger (336px), fluid
writing canvas, and Inspector (300px). The header carries search, Ask, theme, and
settings. Each region can collapse independently; the layout switches immediately,
while any entered panel fades/translates in.

The prototype supports:

- folder/type expansion, navigator/ledger/inspector collapse, document filtering and
  selection;
- Markdown read/source, CSV grid, JSON tree, and PDF/DOCX reader states;
- File, Links, and Outline inspector tabs;
- an Ask dialog with cited local mock answers, composer, focus trap, Escape, and focus
  return;
- a settings dialog with appearance, editor, agents, and hotkeys sections;
- a compact preview state and responsive pane-as-sheet behavior below desktop widths.

The prototype uses realistic in-memory documents only. It does not call a model, persist
settings, or change a vault.

## Accessibility and quality rules

- Every icon button has an accessible name; icons come from the Phosphor set via the local
  @fractaldesign/svelte-icons package.
- Keyboard focus is always visible and dialogs trap focus, close on Escape, and restore
  their trigger.
- Text wraps deliberately: headings balance, labels/metadata stay concise, prose keeps a
  readable measure, and source/table content never receives decorative wrapping.
- Borders separate surfaces; shadows are reserved for raised dialogs and document pages.
- Green does not decorate static surfaces. Use it to signal current location, a
  connection, a primary action, or a positive state.

## Preview and verification

Run the app and open /design. Test navigator tree toggles, every canvas view, all
inspector tabs, pane collapse/reopen, theme switch, Ask compose/send/close, settings
sections, Escape and focus return, and compact preview. Visual regression covers light,
dark-dialog, and compact states; type checking, production build, Sass hygiene, and
motion tests remain required gates.
