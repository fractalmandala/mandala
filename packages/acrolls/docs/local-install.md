# Local / monorepo install

The `acrolls` npm entry is the CLI wrapper. Until the scoped `@acrolls/*` runtime packages and
CLI are published together, the CLI-led host flow links the built packages from your clone.

## Recommended: CLI-led drop-in

From the Acrolls clone, build the CLI and run it from the existing host root:

```bash
ACROLLS=/Users/amrit/acrolls   # change me

cd "$ACROLLS" && pnpm install && pnpm build

cd /path/to/your-app
"$ACROLLS/packages/cli/dist/index.js" onboard --docs-dir docs --base-href /docs
```

The onboarding plan prints the exact `file:` package command for the host and then walks through
the config, content, source, routes, validation, local checks, and deployment handoff. Use
`--json` when an agent or UI should render the same plan. The path below is the manual fallback
for a checkpoint that needs to be merged by hand.

## Path form

```bash
ACROLLS=/Users/amrit/acrolls   # change me

cd "$ACROLLS" && pnpm install && pnpm build

cd /path/to/your-app
pnpm add \
  "file:$ACROLLS/packages/mdsvex" \
  "file:$ACROLLS/packages/svelte" \
  "file:$ACROLLS/packages/styles" \
  "file:$ACROLLS/packages/docs"

pnpm add -D mdsvex
```

In `package.json` this looks like:

```json
{
  "dependencies": {
    "@acrolls/docs": "file:../acrolls/packages/docs",
    "@acrolls/mdsvex": "file:../acrolls/packages/mdsvex",
    "@acrolls/styles": "file:../acrolls/packages/styles",
    "@acrolls/svelte": "file:../acrolls/packages/svelte"
  },
  "devDependencies": {
    "mdsvex": "^0.12.6"
  }
}
```

Relative `file:../acrolls/...` is fine if both repos are siblings.

## After pulling Acrolls changes

```bash
cd /Users/amrit/acrolls && pnpm build
cd /path/to/your-app && pnpm install   # refresh file: links if needed
```

Restart the host dev server after this refresh. Package managers may cache a packed
`file:` dependency, so rebuilding Acrolls alone is not always enough.

## Registry CLI

Once the Acrolls registry packages are published, the normal host command is:

```bash
cd /path/to/your-app
pnpm add -D acrolls
pnpm exec acrolls onboard --docs-dir docs --base-href /docs
```

The unscoped `acrolls` package is a thin executable wrapper around `@acrolls/cli`, so the
installed binary is available as `acrolls`. Publish the runtime packages first, then publish
`@acrolls/cli`, and publish `acrolls` last. Until that release sequence is complete, use the
local-clone command above.

## Do not install (for now)

| Package | Why |
|---|---|
| `@acrolls/sveltekit` via `file:` | Depends on `workspace:*` internals; use `@acrolls/mdsvex` APIs instead |

## CLI from a local clone

```bash
ACROLLS=/Users/amrit/acrolls
"$ACROLLS/packages/cli/dist/index.js" --help
"$ACROLLS/packages/cli/dist/index.js" onboard --non-interactive --docs-dir docs --base-href /docs
"$ACROLLS/packages/cli/dist/index.js" validate ./path/to/article.md
"$ACROLLS/packages/cli/dist/index.js" studio ./path/to/article.md
"$ACROLLS/packages/cli/dist/index.js" integrate --dry-run
```

## pnpm + file: tips

- Always `pnpm build` Acrolls before `pnpm add file:…`  
- If types or modules go stale: rebuild Acrolls, run `pnpm install` in the host, then restart `pnpm dev`. Do not manually delete package folders from `node_modules`.
- Do not publish the host app with `file:` deps — wait for registry versions  

## Multiple hosts

You can point several projects at the same Acrolls clone. They all share one `pnpm build` output.
