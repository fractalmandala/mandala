# Style pack schema

Machine-readable contract for `style-pack.json` and the JSON block embedded in
`preview.html` as `#ssc-style-pack`.

Agents should produce valid JSON. Unknown extra fields are allowed; required fields
below must be present.

## Root object

```json
{
  "version": 1,
  "meta": {},
  "tokens": [],
  "classes": [],
  "regions": [],
  "states": [],
  "cssSubset": "",
  "orphans": [],
  "unresolved": []
}
```

### `version`

Integer. Current: `1`.

### `meta`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string | yes | Human title for the preview chrome |
| `targetPath` | string | yes | Repo-relative path to the primary `.svelte` file |
| `targetSlug` | string | yes | kebab-case folder name |
| `generatedAt` | string | yes | ISO-8601 date |
| `fidelity` | `"L1"` \| `"L2"` \| `"L3"` | yes | How styles were obtained |
| `layoutChain` | string[] | no | Additional layout files included |
| `notes` | string | no | Short free-text caveats |

### `tokens[]`

Design tokens actually referenced by resolved rules.

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | e.g. `--background10` or `$tile-bg` |
| `value` | string | Declared value (may itself be `var(...)`) |
| `kind` | `"css-var"` \| `"sass-var"` | |
| `source` | string | file path |
| `line` | number \| null | 1-based line if known |
| `confidence` | `"observed"` \| `"inferred"` \| `"unresolved"` | |

### `classes[]`

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Without leading `.` preferred; both acceptable |
| `selector` | string | Best-effort full selector, e.g. `.sidebar .item` |
| `source` | string | Stylesheet path |
| `line` | number \| null | Definition start line |
| `properties` | object | Map of css-property → value (camel or kebab keys) |
| `cssText` | string | Optional raw CSS rule body for injection |
| `tokenRefs` | string[] | Token names referenced |
| `usedByRegionIds` | string[] | Region ids that apply this class |
| `confidence` | `"observed"` \| `"inferred"` \| `"unresolved"` | |

### `regions[]`

Flat list with parent pointers (easier for the template than deep nesting).

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable id, e.g. `r0`, `r1` |
| `label` | string | Human label |
| `kind` | string | `shell` \| `region` \| `control` \| `list` \| `component` \| … |
| `tag` | string | DOM or component tag |
| `parentId` | string \| null | |
| `classes` | string[] | Class names applied in markup |
| `states` | string[] | `class:` state names or structural state ids |
| `file` | string | Source path |
| `lineStart` | number \| null | |
| `lineEnd` | number \| null | |
| `textHint` | string | Optional short content label for empty boxes |
| `confidence` | `"observed"` \| `"inferred"` \| `"unresolved"` | |

Root region(s): `parentId === null`.

### `states[]`

Toggleable variants for the preview toolbar.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | e.g. `active`, `empty`, `sidebar-open` |
| `label` | string | Button label |
| `appliesTo` | string[] | Region ids affected |
| `className` | string \| null | Class toggled on those regions when active |
| `kind` | `"class"` \| `"structural"` | |
| `defaultOn` | boolean | |

### `cssSubset`

Single string of CSS. Prefer:

1. `:root { … used tokens … }`
2. Rules for each resolved class (best-effort conversion from indented SASS)
3. Optional preview-only helpers under `.ssc-stage …` only if needed for layout
   approximation (mark in report if pure invent)

### `orphans[]`

Class names used in markup with no stylesheet hit.

```json
{ "name": "foo-bar", "usedIn": ["r2"], "note": "not found in scanned sass" }
```

### `unresolved[]`

Free-form issues: missing tokens, mixin-only rules, unexpanded children, etc.

```json
{ "code": "mixin-opaque", "message": "…", "related": [".button"] }
```

## Minimal valid example

```json
{
  "version": 1,
  "meta": {
    "title": "Example Sidebar",
    "targetPath": "apps/demo/src/lib/Sidebar.svelte",
    "targetSlug": "demo-sidebar",
    "generatedAt": "2026-08-10T00:00:00Z",
    "fidelity": "L1"
  },
  "tokens": [
    {
      "name": "--bg",
      "value": "#111",
      "kind": "css-var",
      "source": "src/lib/styles/_tokens.sass",
      "line": 4,
      "confidence": "observed"
    }
  ],
  "classes": [
    {
      "name": "sidebar",
      "selector": ".sidebar",
      "source": "src/lib/styles/_sidebar.sass",
      "line": 10,
      "properties": { "display": "flex", "background": "var(--bg)" },
      "cssText": "display:flex;background:var(--bg);",
      "tokenRefs": ["--bg"],
      "usedByRegionIds": ["r0"],
      "confidence": "observed"
    }
  ],
  "regions": [
    {
      "id": "r0",
      "label": "Sidebar",
      "kind": "region",
      "tag": "aside",
      "parentId": null,
      "classes": ["sidebar"],
      "states": ["collapsed"],
      "file": "apps/demo/src/lib/Sidebar.svelte",
      "lineStart": 12,
      "lineEnd": 40,
      "textHint": "Sidebar",
      "confidence": "observed"
    }
  ],
  "states": [
    {
      "id": "collapsed",
      "label": "Collapsed",
      "appliesTo": ["r0"],
      "className": "collapsed",
      "kind": "class",
      "defaultOn": false
    }
  ],
  "cssSubset": ":root{--bg:#111}.sidebar{display:flex;background:var(--bg)}.sidebar.collapsed{width:48px}",
  "orphans": [],
  "unresolved": []
}
```
