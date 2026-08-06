# The scan envelope

Every view emits the same outer object. Only the middle differs: graph views
carry `nodes`/`edges`/`flows`, the health view carries `files`. The renderer
picks its canvas from `scan`.

```jsonc
{
  "version": 1,
  "scan": "layout | system | boundary | health",
  "project": {
    "name": "my-repo",
    "slug": "my-repo",
    "tagline": "one line (<=80, optional)",
    "date": "2026-08-04",
    "windowDays": 365,        // health only
    "commitCount": 2519       // health only
  },
  "stats": { "files": 2250, "loc": 678534 },   // any numeric keys; rendered as tiles
  "topTools":        [{ "id": "vite", "label": "Vite", "domain": "vitejs.dev" }],
  "topIntegrations": [{ "id": "vercel", "label": "Vercel", "domain": "vercel.com" }],
  "topModels":       [],
  "groups": [{ "id": "services", "label": "Build-time Services" }],
  "nodes": [ /* graph views */ ],
  "edges": [ /* graph views */ ],
  "flows": [ /* graph views */ ],
  "files": [ /* health only  */ ],
  "notes": [ /* all views    */ ]
}
```

`domain` is a favicon domain with no scheme. It is rendered as a text label,
not fetched — the output file must work offline.

## nodes

```jsonc
{
  "id": "apps/web/components",   // stable across runs; prefer a real repo path
  "kind": "dir",
  "label": "components",
  "sub": "/components/[slug]",   // optional second line
  "parentId": "apps/web",        // containment; null for roots
  "group": "services",           // system views: synthesized into a lane parent
  "sourceRef": "src/x.ts:42",    // jump-to-code
  "detail": "one sentence shown when clicked",
  "domain": "openai.com",
  "data": { "files": 12, "loc": 3400, "totalFiles": 519, "totalLoc": 88200 }
}
```

Kinds: `package` `dir` `file` `stylesheet` (layout) · `entry` `cron` `service`
`state` `command` `ipc` `store` `component` `layout` `function` `shared`
`external` `tool` `integration` `model` `agent` `style` (system) · `layer`
(boundary).

**`id` must be stable across runs** — diffing two generations is only
meaningful if IDs don't churn.

**Every ancestor in a `parentId` chain must exist**, and containment must be
acyclic. A missing ancestor silently drops the subtree; the validator catches
both.

**`group` becomes containment.** If a node has `group` and no `parentId`, the
renderer parents it to a synthesized lane node. Swim lanes therefore inherit
drilling, collapsing and edge-lifting for free.

## edges

```jsonc
{ "id": "e17", "source": "apps/web", "target": "packages/contracts",
  "layer": "import:cross-package",   // OR "kind": "calls"
  "label": "charges on trial end", "weight": 34 }
```

Use `layer` (`family:variant`) for extracted edges and `kind` for authored
ones; the renderer treats them identically. Families: `import` `style` `data`
`call` `order`. Kinds: `renders` `imports` `reads` `writes` `calls` `commands`
`dispatches` `listens` `ipc` `navigates` `triggers` `uses` `transforms`
`allowed` `violation`.

**Emit edges at their natural granularity.** The renderer lifts each endpoint
to its deepest *visible* ancestor and merges duplicates, summing `weight`.
Never pre-aggregate.

`weight` is a count, not a score — users filter on it.

## flows

```jsonc
{ "id": "create-note",
  "name": "Create note",
  "trigger": "Cmd+N or the toolbar 'New Note' button",
  "steps": ["cmd:notes.new", "state:notesState", "ipc:saveNote", "cmp:NoteList"],
  "summary": "one line (<=80)" }
```

Ordered node IDs from trigger to final effect, minimum two. The renderer draws
the path explicitly, so a narrative step with no literal edge behind it still
appears as part of the journey. `trigger` must be a real affordance seen in
code. 3–8 flows is the useful range.

## notes

```jsonc
{ "title": "reduced-motion is the most-connected node",
  "body": "34 edges converge on one policy module — good centralisation, single point of failure.",
  "severity": "info | warn | alert",
  "path": "lib_internal_motion" }   // node id or repo path; makes the note clickable
```

`alert` = act soon, `warn` = watch, `info` = context.

## files (health only)

```jsonc
{ "path": "src/state/ide.ts", "loc": 2400, "commits": 87, "linesChanged": 5600,
  "authors": 2, "lastCommit": "2026-07-30", "complexity": 72,
  "summary": "one line (top-12 files only)" }
```

`complexity` is 0–100. Colour is ranked *within the repo*, not absolute —
absolute scores cluster every file into one muddy mid-band, and the useful
question is always "which files here are worst".

## The style layer (layout scans)

Stylesheets become nodes with `kind: "stylesheet"`, nested in their natural
container:

```jsonc
"data": {
  "defines": {
    "classes": 128, "tokens": 166, "mixins": 0, "vars": 0,
    "layers": ["base", "components"],
    "consumedBy": ["apps/web/components", "apps/web/routes"]   // ← impact list
  },
  "topClasses": [{ "name": "font-system-ui", "users": 6 }]
}
```

Consumer nodes carry `data.styles`:

```jsonc
{ "authored": [{ "name": "drag-region", "count": 5 }], "authoredTotal": 12,
  "utilityTop": [{ "name": "flex", "count": 17 }],
  "utilityDistinct": 516, "utilityUses": 1064,
  "tokens": [{ "name": "--color-text-foreground", "count": 13 }], "tokensDistinct": 63,
  "mixins": [], "scopedBlocks": 9, "scopedClasses": 31,
  "recipeFiles": 8, "filesStyled": 35 }
```

Cap stylesheet nodes (`maxStyleNodes`, default 40); a SASS tree with 300
partials would otherwise swamp the diagram.

## Caps

| scan | nodes | edges | flows | notes |
|---|---|---|---|---|
| layout | 400 | 2000 | 12 | 8 |
| system | 80 | 200 | 10 | 8 |
| boundary | 40 | 200 | — | 12 |
| health | — | — | — | 8 |

Over a cap, raise granularity — not the cap.