---
id: 06-animations
title: Animation Keyframes, Durations, Easings
type: design
tags: [animation, transitions]
summary: Documents standard animation keyframes, durations, and easing curves used across the UI.
updated: 2026-07-17
---


**Sources:**
- `_commandpalette.sass` (L121–126)
- `_settings.sass` (L108–113, L116–120)
- `_layout.sass` (module workspace view transition)

---

## `fadeIn`

Used on overlay backgrounds for modals, command palette, and settings.

```sass
@keyframes fadeIn
    from
        opacity: 0
    to
        opacity: 1
```

**Duration:** `0.15s` (command palette), `0.2s` (settings)

## `slideDown`

Card entrance for the command palette.

```sass
@keyframes slideDown
    from
        transform: translateY(-10px)
        opacity: 0
    to
        transform: translateY(0)
        opacity: 1
```

**Duration:** `0.2s`, cubic-bezier(0.16, 1, 0.3, 1)

## `slideUp`

Dialog entrance for the settings panel.

```sass
@keyframes slideUp
    from
        transform: translateY(10px)
        opacity: 0
    to
        transform: translateY(0)
        opacity: 1
```

**Duration:** `0.25s`, cubic-bezier(0.16, 1, 0.3, 1)

## `module-vertical-wipe`

The central workspace uses a same-document View Transition when switching directly
between loaded modules. The outgoing workspace remains behind the incoming snapshot;
the new snapshot is revealed from top to bottom.

```sass
@keyframes module-vertical-wipe
	0%
		clip-path: inset(0 0 100% 0)
	100%
		clip-path: inset(0 0 0 0)
```

**Duration:** `0.5s`, `ease-in-out`.

The named `fractalengine-workspace` transition surface excludes the application header,
footer, and browser drawer. The transition runs only for module-to-module changes
(Code, Notes, Design, Agent, Web, and Docs); Home and Blank remain instant. It is also
skipped when the platform lacks `document.startViewTransition()` or the user requests
reduced motion.

---

**Where used:**
- `.command-palette-overlay` → `fadeIn`
- `.command-palette-card` → `slideDown`
- `.settings-overlay` → `fadeIn`
- `.settings-dialog` → `slideUp`
- `.add-model-overlay` → `fadeIn`
- `.workspace-transition-surface` → `module-vertical-wipe` during direct module changes
