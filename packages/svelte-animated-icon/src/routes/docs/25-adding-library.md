---
title: Adding an Icon Library
id: 25
group: guides-and-advanced
description: "Wiring a new set into the codegen config."
---

The package is set up to ingest any icon set that ships as a folder of SVG files, one per icon, in one or more "variant" subfolders. Adding a new set is a config change plus running the codegen script.

## The shape of an icon set

Source SVGs should look like this:

```
static/svg/<set-name>-<variant>/
  <icon-name>-<variant>.svg
  <another-icon>-<variant>.svg
  ...
```

Phosphor uses `phosphor-regular/`, `phosphor-light/`, `phosphor-fill/`. Remix uses `remixicons-line/`, `remixicons-fill/`. Each file is a single SVG of one icon, with `<svg viewBox="0 0 256 256">` and a few inner shapes.

If your set uses a different viewBox or layout, you'll need to normalize before running codegen. A small script over the source folder is usually enough.

## Step 1 - drop the SVGs in

Put the variant folders under `static/svg/<your-set>-<variant>/`:

```
static/svg/materialsymbols-fill/
static/svg/materialsymbols-line/
```

The folder name matters: it becomes both the variant id and the prefix used by the codegen script when stripping suffixes from filenames.

## Step 2 - add an entry to `SETS`

Open `scripts/generate.js` and add an entry to the `SETS` array:

```js
const SETS = [
  // ... existing entries
  {
    name: 'materialsymbols',
    variants: {
      line: 'static/svg/materialsymbols-line',
      fill: 'static/svg/materialsymbols-fill'
    },
    defaultVariant: 'line',
    nameFromFile: (filename, variant) =>
      filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: {}
  }
];
```

The fields:

- `name` - used as the subpath (`svelte-animated-icon/materialsymbols`) and the directory under `src/lib/`.
- `variants` - `{ variantId: 'path/from/project/root' }`. The script reads SVGs from each.
- `defaultVariant` - which variant is selected when the user doesn't pass `variant={…}`. Must be one of the keys in `variants`.
- `nameFromFile(filename, variant)` - turns a filename into the icon's component name. For most sets, this strips the `.svg` extension and the `-<variant>` suffix.
- `stripSuffix` - extra suffixes to strip during generation. Phosphor uses `{ fill: '-fill', light: '' }` to handle names like `acorn-fill.svg`; Remix needs nothing.

## Step 3 - run the codegen

```sh
node scripts/generate.js
```

The script:

1. Reads SVGs from each variant directory.
2. Matches icons by name across variants.
3. Strips the `<svg>` wrapper and any bounding `<rect fill="none">` from each.
4. Writes `src/lib/<name>/icons/<PascalName>.svelte` with the variants embedded and `...rest` forwarded to `AnimatedIcon`.
5. Writes `src/lib/<name>/index.ts` - the per-library barrel.

Generated components look identical to Phosphor's. See [Icon Components](/docs/15-icon-components) for the shape.

## Step 4 - add the subpath to `exports`

Open `package.json` and add a new entry under `exports`:

```json
{
  "exports": {
    ".":                 { "types": "./dist/index.d.ts",                 "svelte": "./dist/index.js" },
    "./phosphor":        { "types": "./dist/phosphor/index.d.ts",        "svelte": "./dist/phosphor/index.js" },
    "./remix":           { "types": "./dist/remix/index.d.ts",           "svelte": "./dist/remix/index.js" },
    "./flowbite":        { "types": "./dist/flowbite/index.d.ts",        "svelte": "./dist/flowbite/index.js" },
    "./hero":            { "types": "./dist/hero/index.d.ts",            "svelte": "./dist/hero/index.js" },
    "./ion":             { "types": "./dist/ion/index.d.ts",             "svelte": "./dist/ion/index.js" },
    "./materialsymbols": { "types": "./dist/materialsymbols/index.d.ts", "svelte": "./dist/materialsymbols/index.js" }
  }
}
```

Now consumers can `import { Whatever } from 'svelte-animated-icon/materialsymbols'`, and the bundler tree-shakes Material Symbols out of any app that doesn't import it.

## Step 5 - verify

Run the dev site:

```sh
pnpm dev
```

and visit the library's landing page (`/materialsymbols` if you followed the example above). You should see a grid of every generated icon, each animated on hover.

## Naming gotchas

- **PascalCase component names.** `nameFromFile` returns the *raw* stem - `name_from_file.svg` becomes the component `Name_from_file`, not `NameFromFile`. If your set uses snake_case, convert inside `nameFromFile`:

  ```js
  nameFromFile: (filename, variant) => {
    const stem = filename.replace('.svg', '').replace(`-${variant}`, '');
    return stem
      .split(/[-_]/)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join('');
  }
  ```

- **Variant suffix collisions.** If your icons are named `gear-line.svg` and `gear-fill.svg`, the strip logic handles them. If they're named `gear.svg` (no suffix), the script can't match them across variants - add a suffix in your source files or change `nameFromFile`.

- **Component name collisions across sets.** Two libraries can ship `Gear` (Phosphor does, Remix will). Each lives in its own subpath and namespace, so they don't collide on disk - only on import in your own file. Alias the import:

  ```svelte
  <script>
    import { Gear as PhosphorGear } from 'svelte-animated-icon/phosphor';
    import { Gear as MaterialGear } from 'svelte-animated-icon/materialsymbols';
  </script>
  ```

## If the icon set doesn't fit the model

The codegen script handles the common case - variant folders with matching icon names. If your set uses a single folder with no variant split, or ships icons in a different layout, the script will need a tweak. Fork it, change the read step, keep the rest. The output shape is what matters.

See [Codegen Pipeline](/docs/26-codegen-pipeline) for the full walkthrough.