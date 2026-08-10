# Figmaboy vs Figma — Parity Analysis

**Date:** 2026-08-10  
**Status:** Living document  
**Scope:** Feature-level comparison of Figmaboy (local Tauri desktop app) against Figma (cloud design platform)

---

## CAPABILITY

Figmaboy is a local-first, single-player vector design tool built on Tauri + SvelteKit + Svelte 5. It targets the core editing workflow of Figma — creating frames, shapes, text, and images on an infinite canvas with property editing, layer management, and code export. The parity gap is significant in breadth: Figma has ~15 years of feature accretion across collaboration, components, prototyping, and platform integrations. Figmaboy's differentiation is not feature parity but local-first speed, code generation, and zero-infrastructure deployment.

---

## CURRENT PARITY MATRIX

### Fully Implemented (≥90% parity for the specific sub-feature)

| Feature | Figmaboy | Figma | Notes |
|---------|----------|-------|-------|
| **Infinite canvas** | Pan (hand tool, space+drag, scroll), zoom (wheel, pinch, toolbar) | Same | Figmaboy uses SVG rendering; Figma uses WebGL |
| **Node types** | 11 types: frame, group, rectangle, ellipse, line, arrow, polygon, star, text, image, icon | ~15 types | Missing: pen/path, boolean ops, sticky notes, shapes (rounded triangle etc.) |
| **Fill (solid)** | Color picker, hex input, opacity | Same | |
| **Fill (gradient)** | Linear + radial gradient, stop editing | Same | Missing: angular/diamond gradients, gradient handles on canvas |
| **Stroke** | Color, width, dash, cap, join | Same | Missing: stroke position (inside/center/outside), multiple strokes |
| **Corner radius** | Uniform + per-corner (TL/TR/BL/BR) | Same | |
| **Opacity** | 0-100% | Same | |
| **Blend modes** | 15 modes | Same set | |
| **Drop shadow** | x, y, blur, color, opacity | Same | |
| **Layer blur** | Radius control | Same | |
| **Text basics** | Font family, size, weight, style, line height, letter spacing | Same | |
| **Text alignment** | Horizontal (left/center/right) + vertical (top/center/bottom) | Same | |
| **Text case** | Original/upper/lower/title | Same | |
| **Text decoration** | None/underline/strikethrough | Same | |
| **Text auto-resize** | Auto width / auto height / fixed | Same | |
| **Selection** | Click, marquee, multi-select (shift), parent/child navigation | Same | |
| **Move/resize/rotate** | Drag handles, numeric inputs | Same | Missing: scale tool (non-uniform resize with constraints) |
| **Alignment** | 6 directions (left/center/right/top/middle/bottom) | Same | |
| **Arrange** | Front/back/forward/backward | Same | |
| **Group/ungroup** | Create group or frame from selection | Same | |
| **Copy/cut/paste/duplicate** | With clipboard persistence, cascade offset | Same | |
| **Undo/redo** | 100-step history, gesture-based batching | Same | Figma has deeper history via version system |
| **Keyboard shortcuts** | V/H/F/R/O/L/T for tools, Delete, Ctrl+Z/Y, arrows for nudge | Extensive | |
| **Multi-page** | Create/rename/duplicate/delete/reorder pages | Same | |
| **Project/file management** | Create/rename/star/trash/restore/duplicate files and projects | Same concept | |
| **Rulers** | Horizontal + vertical with adaptive tick intervals | Same | |
| **Guides** | Drag from rulers, reposition, delete by dragging back | Same | |
| **Smart guides** | Snap alignment guides (x/y) during drag | Same | |
| **Frame presets** | Phone, tablet, desktop, presentation, social media sizes | Same concept | Figma has more presets |
| **Export (image)** | PNG 1x/2x, SVG | Same | Missing: PDF, custom scale, export selected only |
| **Inline text editing** | Double-click to edit text on canvas | Same | |
| **Lock/visibility** | Per-node lock and visibility toggle | Same | |
| **Nudge** | Arrow keys (1px), shift+arrow (10px) | Same | |
| **Document validation** | Schema sanitization, recovery from corruption | Figma uses CRDT | Figmaboy validates on load |
| **Native file system** | Tauri backend for file I/O | Cloud-first | Figmaboy is fully local |

### Partially Implemented (30-89% parity)

| Feature | Figmaboy | Figma | Gap |
|---------|----------|-------|-----|
| **Prototype interactions** | Click → navigate to frame, start frame | Click, hover, drag, after delay, scroll triggers | Missing: smart animate, overlays, scroll, back navigation, conditional logic, variables |
| **Image handling** | Import, fit (fill/contain/cover), crop reset | Full crop UI, image fill on any shape | Missing: image as fill, crop handles on canvas, image filters |
| **Code generation** | Svelte+SASS, SASS, HTML+CSS, inline preview | Dev Mode with inspect, CSS/iOS/Android code | Figmaboy generates full component code; Figma is inspect-only |
| **Layer panel** | Tree view, drag reorder, reparent, rename, visibility/lock icons | Same + search, multi-select drag, component indicators | Missing: layer search, component indicators |
| **Inspector (design tab)** | Position, appearance, fill, stroke, effects, typography, code | Same + constraints, layout, auto layout | Missing: constraints section, auto layout section |
| **Drag to reorder** | Layer drag in left panel | Same | Works but no visual drop indicators on canvas |
| **Marquee selection** | Drag to select, additive with shift | Same | |
| **Resize handles** | 8 handles (corners + edges) | Same | Missing: handle visualization states |

### Not Implemented (0-29% parity)

| Feature | Figma | Figmaboy | Priority Notes |
|---------|-------|----------|----------------|
| **Components & instances** | Core feature — create, override, swap, nest | None | Highest gap for design systems |
| **Auto layout** | Flexbox-like layout in frames (direction, gap, padding, alignment) | None | Critical for responsive design |
| **Constraints** | Pin to edges, center, scale on resize | None | Needed for responsive frames |
| **Styles (color/text/effect)** | Reusable, publishable, library-linked | None | Design token foundation |
| **Variables** | Color, number, string, boolean with modes | None | Theming, dark mode support |
| **Variants & properties** | Component property panels, boolean/string/instance swap | None | Component API |
| **Boolean operations** | Union, subtract, intersect, exclude | None | Vector editing foundation |
| **Pen tool / vector editing** | Bezier pen, edit vertices, bend/straight corners | None | Core design tool |
| **Masks** | Alpha mask, outline mask | None | |
| **Multiple fills/strokes** | Stack fills/strokes with blend modes per layer | Single fill + single stroke | |
| **Inner shadow** | Inner shadow effect | None | |
| **Background blur** | Blur behind semi-transparent layers | None | iOS-style glass effects |
| **Stroke position** | Inside / center / outside | Center only | |
| **Angular/diamond gradients** | 4 gradient types | 2 (linear, radial) | |
| **Outline mode** | Wireframe view for performance | None | |
| **Pixel preview** | Sub-pixel rendering preview | None | |
| **Scale tool** | Scale (resize + move children proportionally) | None | |
| **Flatten** | Flatten groups/boolean ops into single path | None | |
| **Real-time collaboration** | Multiplayer cursors, live editing | None | Architecturally different (local-first) |
| **Comments** | Threaded comments on canvas | None | |
| **Version history** | Named versions, branching, restore | None | |
| **Shared libraries** | Publish/reuse component libraries | None | |
| **Plugins** | JavaScript plugin API | None | |
| **Dev Mode** | Inspect, token handoff, code snippets | Code panel only | Figmaboy's code gen is more advanced |
| **Sections** | Organize frames into labeled sections | None | |
| **Scrollable frames** | Overflow scroll in prototype | None | |
| **Smart animate** | Interpolation between component states | None | |
| **Overlay/modals** | Overlay positioning in prototype | None | |
| **Interactive components** | Hover/press states within components | None | |
| **Conditional visibility** | Show/hide based on variables | None | |
| **Expressions** | Dynamic values in prototype | None | |
| **Asset panel** | Browse team libraries, icons, images | Basic image import | |
| **Grid/layout grids** | Column, row, grid layouts on frames | None | |
| **Nudge amount** | Configurable (1px default, shift = 10px) | Fixed (1px, shift=10px) | Minor |
| **Outline stroke on shapes** | Stroke as outline (SVG-like) | None | |
| **Path operations** | Join, smooth, simplify vectors | None | |
| **Figmas / AI features** | AI-generated designs, first draft | None | Emerging feature |

---

## CONSTRAINTS

### Architectural Constraints (fixed)

1. **Local-first, single-player** — No cloud backend, no CRDT, no WebSocket. This eliminates real-time collaboration, shared libraries, and cloud versioning by design. The tradeoff is zero-latency editing and no account requirement.

2. **SVG rendering** — Canvas uses SVG, not WebGL. This limits performance at very high node counts (>5000 nodes) and prevents features like pixel preview at scale. Figma's WebGL renderer handles 100K+ nodes.

3. **Tauri desktop** — Native file system access via Rust backend. No web deployment possible. Browser fallback uses localStorage with size limits (~5-10MB).

4. **Svelte 5 runes** — Reactive state model using `$state`, `$derived`, `$effect`. No virtual DOM. This is a strength for performance but means no shared component ecosystem with React-based Figma plugins.

5. **Single-file document model** — `PageDocument` is a flat `Record<Id, DesignNode>` with `rootIds`. No CRDT, no operational transform. Undo is a simple snapshot stack (100 entries max).

### Business Constraints

6. **Solo developer** — Feature velocity is bounded by one developer. Prioritization must favor high-impact, low-complexity features.

7. **No design system use case yet** — Without components, styles, and variables, the tool cannot serve teams building design systems. This is the largest market gap.

8. **Code generation as differentiator** — Figmaboy's export to Svelte/SASS/HTML is more advanced than Figma's Dev Mode inspect. This is a unique value proposition for developer-designers.

---

## IMPLEMENTATION CONTRACT

### Actors

| Actor | Description |
|-------|-------------|
| **Solo designer** | Individual using Figmaboy for UI/UX design, wireframing, prototyping |
| **Developer-designer** | Developer who designs interfaces and wants direct code output |
| **Figma evaluator** | User comparing Figmaboy against Figma to decide adoption |

### Surfaces

| Surface | Current State |
|---------|---------------|
| **Canvas** | SVG-based infinite canvas with pan/zoom, node creation, selection, drag/resize/rotate, smart guides, rulers, user guides |
| **Left panel** | Layer tree with drag reorder, rename, visibility/lock, reparent |
| **Right panel (Design)** | Position, appearance, typography, fill, stroke, effects, code preview |
| **Right panel (Prototype)** | Click interaction, navigate to frame, start frame |
| **Toolbar** | Tool selection (select, hand, frame, shapes, text, image), zoom controls, terminal toggle |
| **Terminal** | Command palette / AI assistant panel |
| **Export** | PNG (1x, 2x), SVG, code generation (Svelte+SASS, SASS, HTML+CSS) |

### States and Transitions

```
Document Lifecycle:
  Empty → Has Pages → Has Nodes → Has Prototype → Has Export

Editor Modes:
  idle → pan | draw | text | edit-text | move | marquee | resize | rotate

Save States:
  saved → dirty → saving → saved | error | conflict
```

### Data Model Implications for Parity Features

To close the highest-priority gaps, the data model needs these additions:

1. **Components**: New `ComponentDefinition` type with `properties`, `variants`, and `instances[]` referencing back. `DesignNode` needs `componentId?: Id` and `overrides?: Record<string, unknown>`.

2. **Auto Layout**: `ContainerNode` needs `layoutMode: "none" | "horizontal" | "vertical"`, `gap`, `padding`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutSizing` per child.

3. **Constraints**: `DesignNode` needs `constraints: { horizontal: "left"|"right"|"center"|"left-right"|"scale", vertical: same }`.

4. **Styles**: New `StyleLibrary` with `colorStyles[]`, `textStyles[]`, `effectStyles[]`. `DesignNode` references `fillStyleId?`, `textStyleId?`, `effectStyleId?`.

5. **Variables**: New `VariableCollection` with typed values. `DesignNode` properties can reference variable IDs instead of literal values.

6. **Multiple fills/strokes**: Change `fill: Paint | null` to `fills: Paint[]` and `stroke: StrokeStyle | null` to `strokes: StrokeStyle[]`.

---

## NON-GOALS

This analysis explicitly does NOT cover:

- **Figma Slides** (presentation mode) — separate product
- **FigJam** (whiteboarding) — separate product
- **Figma Draw** (illustration) — separate product
- **Figma Make** (AI code generation) — emerging product
- **Plugin ecosystem** — requires API design, sandboxing, marketplace
- **Enterprise features** — SSO, SCIM, audit logs, admin console
- **Mobile apps** — Figma has mobile viewer; Figmaboy is desktop-only by design

---

## OPEN QUESTIONS

1. **Component model priority** — Should components be built before auto layout? Components without auto layout are less useful; auto layout without components is still valuable for single-use frames.

2. **Rendering architecture** — Should SVG rendering be replaced with WebGL/Canvas2D before adding more node types? WebGL would unlock pixel preview and better performance but requires a full rewrite of the canvas layer.

3. **Data model migration** — Changing `fill: Paint | null` to `fills: Paint[]` is a breaking schema change. What's the migration strategy? The `schemaVersion: 1` field suggests this was anticipated.

4. **Code generation scope** — Should code gen expand to React/Vue/Tailwind, or stay Svelte-focused as a differentiator?

5. **Collaboration model** — If real-time collaboration is ever needed, the entire architecture must change (CRDT, WebSocket server, conflict resolution). Is this a future goal or explicitly out of scope?

6. **Figma import** — Should Figmaboy support importing `.fig` files? This would lower the barrier for Figma migrants but requires reverse-engineering Figma's format.

---

## HANDOFF

### Immediate Priorities (highest impact, achievable scope)

1. **Auto Layout** — Most requested Figma feature. Adds `layoutMode`, `gap`, `padding`, alignment to `ContainerNode`. Requires canvas rendering changes for layout preview.

2. **Constraints** — Pin children to frame edges on resize. Adds `constraints` to `DesignNode`. Moderate complexity.

3. **Multiple fills/strokes** — Schema change from single to array. Breaking migration but unlocks layered fills, image fills, gradient stacks.

4. **Styles** — Reusable color/text/effect presets. New `StyleLibrary` type. Inspector integration for applying/linking styles.

### Medium-Term (significant architecture work)

5. **Components & instances** — Requires new data model types, override system, component editor UI.

6. **Variables** — Token system with collections and modes. Cross-cutting change to how property values are resolved.

7. **Pen tool / vector editing** — New tool mode, bezier path data model, vertex editing UI.

### Recommended Next Lane

For immediate implementation, use **`tdd-workflow`** to build auto layout with test-driven development, as it requires careful layout algorithm testing.

For data model changes (multiple fills, schema migration), use **`spec-writing`** first to document the migration contract before implementation.

---

## SUMMARY SCORECARD

| Category | Figmaboy Coverage | Figma Benchmark |
|----------|-------------------|-----------------|
| **Core editing** (create, select, move, resize, rotate) | 95% | 100% |
| **Shape tools** (rectangle, ellipse, line, polygon, star) | 85% | 100% |
| **Text** (typography, alignment, auto-resize) | 90% | 100% |
| **Fill & stroke** (solid, gradient, stroke styles) | 60% | 100% |
| **Effects** (shadow, blur) | 50% | 100% |
| **Layout** (auto layout, constraints, grids) | 0% | 100% |
| **Components** (instances, variants, overrides) | 0% | 100% |
| **Prototyping** (interactions, animations, overlays) | 15% | 100% |
| **Design systems** (styles, variables, libraries) | 0% | 100% |
| **Collaboration** (multiplayer, comments, versioning) | 0% | 100% |
| **Code export** (CSS, component code, tokens) | 70% | 40% (Dev Mode) |
| **Platform** (plugins, API, integrations) | 0% | 100% |
| **Overall parity** | **~35%** | 100% |

**Key insight:** Figmaboy's code generation capability (70%) actually exceeds Figma's Dev Mode (40%) in terms of producing usable component code. This is a genuine differentiator. The largest gaps are in layout automation (auto layout), design systems (components/styles/variables), and collaboration — all of which require significant architectural investment.
