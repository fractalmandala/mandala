# Design Debugging

## Class Bloat

Take this example:

```
.button, .icon-button, .rail-link, .phase-link, .project-row, .choice, .drawer-header, .timeline-clip, .timeline-add
	border: 1px solid transparent
	border-radius: var(--radius-sm)
	cursor: pointer
	transition-property: background-color, border-color, color, box-shadow, transform
	transition-duration: var(--motion-fast)
	transition-timing-function: ease-out
```

This is absolutely wrong. If so many different classes need the same styling, they should just be one class. And applying it with names like .button, .project-row, .drawer-header also confused the semantic meanings completely. In this case, all these stylings are nothing to do with a button necessarily. 

1. border: 1px solid transparent - is probably needed for application on some buttons sometimes. Have `.btn-nobord` to apply to such buttons.
2. border-radius: Have `.radius-sm` class.
3. cursor: pointer, have `.pointer` class.
4. define a few transition classes - `.trans-std`, etc.

Then, use them to style clips or rows or whatever is needed whenever.

### RULE - in creating a new class ask - is this class needing a unique styling combo that is not already possible with primitives?

## Confusing Nesting

This is bad:

```
.welcome-surface > p:not(.eyebrow)
	color: var(--text-muted)
	line-height: 1.55
.welcome-surface > p:not(.eyebrow)
	color: var(--text-muted)
	line-height: 1.55
.phase-empty > p:not(.eyebrow)
	color: var(--text-muted)
	line-height: 1.55
```

If you're having to define "not" so much, something has gone wrong.  Avoid usage of `>` or `:not` styling trends.
There is no need to use `<p>` anyway, but if you have to, you can use it with `.lh15`, `.text-muted` to achieve what you're trying with `.welcome-surface > p:not(.eyebrow)` in above example. 

### RULE 2 - Just use classes that exist first, don't create classes and clauses and subclauses.

### RULE 3 - Do not give margin top and margin bot to things. Manage parent container gaps instead.

## Styling general primitives or tags

Bad:

```
.section-heading > div
	display: grid
	gap: var(--space-1)
```

```
.bank
	.grid
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))
		gap: var(--space-3)
		padding-bottom: var(--space-4)
```

### RULE 4 - Do not styling a div like this. And .grid is a primitive, do not constrain it like this under .bank in above example. 

what if user tries to have 2 grids in “.bank” with different settings?

### RULE 5 - In the `DESIGN.md` doc, always maintain a layouts section for layout containers and children, like this instance:

```
project-shell (Outer Workspace Layout Container)
├── app-header (Top Navigation & Tool Bar)
│   ├── [Left Action Tooltips: Panels, Projects, Media, Gather]
│   └── [Right Action Tooltips: Voiceover, Export, Undo/Redo, Settings]
│
├── workspace-workarea (Main Flexible Workspace Area)
│   ├── workspace-sidebar (Left Resizable Sidebar / Nav Panel)
│   │   └── workspace-sidebar-content (Dynamic Content: Home/Projects list, Library items, Gather picker)
│   │
│   ├── workspace-resizer (Left Border Drag Handle for Resizing)
│   │
│   ├── project-workspace (Center Main Viewport)
│   │   ├── [Embedded Page View: SettingsPanel / YouTubeChannelViewer]
│   │   │   └── embedded-page
│   │   │
│   │   ├── [Empty/Fallback View: Non-project Dashboard]
│   │   │   └── bank
│   │   │       ├── section (Recent Projects)
│   │   │       └── section.content (Media Library Grid Wrapper)
│   │   │           └── grid-wrap
│   │   │
│   │   └── [Active Project Studio View]
│   │       ├── preview-surface (Video / Photo Preview Surface)
│   │       │   ├── preview-frame (Media Video, Image, or Placeholder)
│   │       │   └── transport (Play/Pause Controls and Moment Indicators)
│   │       │
│   │       ├── repair-drawer (Collapsible Audio Repair Drawer)
│   │       │   ├── drawer-header (Drawer Toggle Button)
│   │       │   └── repair-content (Waveform display and Repair Action Buttons)
│   │       │       ├── waveform
│   │       │       └── repair-actions
│   │       │
│   │       └── timeline-surface (Interactive Timeline Editor)
│   │           ├── timeline-toolbar (Timeline Edit Actions: Split, Trim, Remove)
│   │           ├── timeline-ruler (Time Code Ruler)
│   │           ├── track [Moments Track]
│   │           │   └── clip-row (Scrollable Moment/Clip List)
│   │           ├── track [Voiceover Track]
│   │           │   └── audio-track (Voiceover File Display)
│   │           └── track [Music Track]
│   │               └── music-track (Music Track Placeholder)
│   │
│   ├── workspace-resizer (Right Border Drag Handle for Resizing)
│   │
│   └── workspace-sidebar (Right Resizable Sidebar / Tools Panel)
│       └── workspace-sidebar-content (Dynamic Content: Voice Recorder / Export Options)
│           └── export-choices
│
└── modal-backdrop (Modal Wrapper - Shown when Export Modal is active)
    └── export-modal (Export Dialog Box)
        ├── export-choices (Quality Preset Buttons)
        └── modal-actions (Action Controls: Cancel / Export)
```

### RULE 6 - Please use existing classes in primitives and typography and components!

Example,

```
.workspace-header-actions
	display: flex
	align-items: center
	gap: var(--space-1)
```

You don't need that class at all! apply `flex row ycenter gap8` instead.
