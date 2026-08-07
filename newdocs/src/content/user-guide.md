---
title: Repowiki User Guide
description: How to update, regenerate, and maintain the repo wiki — update flows, full and targeted regeneration, frontmatter fixing, and index maintenance.
type: overview
---

This guide is for **you** — the person maintaining the wiki. It explains every
maintenance task in plain language with exact commands. If you use an AI agent
(Claude Code, Codex, Cursor, or any LLM with file tools), you can say the short
commands in the tables and it will run the same flows — the contract in
[AGENTS.md](AGENTS.md) tells it exactly what to do.

> **The one rule that matters:** the wiki is updated **only when you ask**.
> There is no auto-update, no post-commit hook. Everything below is
> on-demand.

---

## 0. The mental model

Three things live in `repowiki/`:

| Thing | What it is | How it's maintained |
|---|---|---|
| `wiki/` — `cards/` + `concepts/` | The knowledge itself | **Hand-authored** (or generated once, then curated) |
| `repo/` + `projects/` | Module docs scaffolded from metadata | **Generated** from `meta/*.json`, then filled in by an agent |
| `INDEX.md` files + `wiki/TAGINDEX.md` | Navigation catalogs | **Generated** — never hand-edit, always re-run `generate-index.py` |

The scripts in `repowiki/scripts/` do the mechanical work. `validate.py` is
your safety net — run it after any change and it tells you what broke.

---

## 1. Updating the wiki

### 1a. Small edits to existing pages

Just edit the markdown file directly — `repowiki/wiki/cards/<name>.md`,
`repowiki/repo/<name>.md`, `repowiki/projects/.../`. Then:

```sh
python3 repowiki/scripts/generate-index.py   # refresh catalogs if titles/names changed
python3 repowiki/scripts/validate.py          # confirm nothing broke
```

### 1b. Adding a new card

Cards are **flat** — every card is a single `.md` file directly in
`repowiki/wiki/cards/`, no subfolders. Create a file with the full frontmatter
schema:

```markdown
---
title: My New Topic
description: One line saying what this is
tags: [tag1, tag2]
type: card
module: packages/whatever
path: packages/whatever
created: 2026-08-06
updated: 2026-08-06
---

Body text here. Section headings start at `##` (never a `#` at the top —
the title lives in frontmatter only).

See [Related Card](related-card.md) — links are file-relative, no leading slash.
```

Then refresh the catalogs:

```sh
python3 repowiki/scripts/generate-index.py
python3 repowiki/scripts/validate.py
```

### 1c. Adding a concept

Concepts are module-level overviews in `repowiki/wiki/concepts/` (also flat).
Same schema as cards but `type: concept`.

### 1d. Renaming, moving, or deleting a page

The wiki uses **file-relative links**, so a move breaks any incoming links.
After moving/renaming:

1. `grep -rn 'old-name.md' repowiki/` to find every reference.
2. Fix each link.
3. Re-run `generate-index.py` + `validate.py` — the validator reports any
   links it can't resolve.

### 1e. Updating the wiki because source code changed

When a source file/folder in the monorepo changes and you want the wiki to
reflect it, find which pages are affected first:

```sh
python3 repowiki/scripts/affected.py packages/fractalsvelte/src/lib
```

It prints every wiki page that references that path (via `source_files`
frontmatter, `module`/`path` values, body links, or filename heuristic).
Example output shape:

```
Wiki pages affected by packages/fractalsvelte/src/lib (N):
  repowiki/wiki/cards/fractalsvelte.md  [module, path]
  repowiki/repo/some-page.md             [link]
  repowiki/projects/sites/<site>/...     [name]
```

Exit codes: `0` = pages found, `1` = none found.

Then update **only those pages**, and refresh indexes:

```sh
python3 repowiki/scripts/generate-index.py
python3 repowiki/scripts/validate.py
```

**With an agent:** just say **"update `<path>` in repowiki"** — e.g. *"update
packages/fractalsvelte/src/lib in repowiki"*. The agent runs `affected.py`,
reads the changed source, updates only the affected pages, and validates.

---

## 2. Full regeneration ("generate fresh repowiki")

A full build from scratch has two parts: the **deterministic skeleton**
(scripts) and the **content pass** (an agent reading real source).

### Step 1 — scaffold the skeleton

```sh
python3 repowiki/scripts/generate-cards.py --force    # cards + concepts from a live source scan
python3 repowiki/scripts/generate-repo.py             # repo/ pages from meta/repowiki-monorepo-metadata.json
python3 repowiki/scripts/generate-projects.py --force # projects/ pages from meta/site-*-metadata.json
```

What each does:

| Script | Source | Writes | `--force` |
|---|---|---|---|
| `generate-cards.py` | scans `apps/`, `packages/`, `sites/` on disk (honors `wiki_plan.yaml` scope exclusions) | one flat card per module + module concepts in `wiki/` | **wipes the whole `wiki/cards/` + `wiki/concepts/` dir and regenerates everything from source** — curated card edits are lost |
| `generate-repo.py` | `meta/repowiki-monorepo-metadata.json` | `repo/` pages + category folders | *(none — never clobbers curated content)* |
| `generate-projects.py` | `meta/site-*-metadata.json` | `projects/sites/<name>/` pages | overwrites existing pages |

> **⚠️ `--force` is destructive.** For `generate-cards.py` it does **not** just
> prune stale cards — it deletes every card/concept and regenerates them from
> the source scan, so any hand-written card bodies are gone. Run
> `generate-cards.py --dry-run` first, and only use `--force` when you
> genuinely want a full reset of the cards dir.

All three accept `--dry-run` to preview without writing. `generate-repo.py`
never overwrites an existing page (your curated edits are safe);
`generate-projects.py` only overwrites with `--force`.

### Step 2 — the content pass (the real step)

The scaffold writes placeholder bodies. An agent (or you) then reads each
module's actual source and replaces `<!-- TODO: agent step -->` with real
content — keeping frontmatter, kebab-case names, and the no-H1 rule.

### Step 3 — finish

```sh
python3 repowiki/scripts/generate-index.py
python3 repowiki/scripts/validate.py
```

**With an agent:** just say **"generate fresh repowiki"**.

---

## 3. Regenerating selected files or folders

You don't have to rebuild everything. Each generator runs independently:

| Want only… | Run |
|---|---|
| Cards + concepts | `python3 repowiki/scripts/generate-cards.py --force` |
| `repo/` pages | `python3 repowiki/scripts/generate-repo.py` |
| `projects/` pages | `python3 repowiki/scripts/generate-projects.py --force` |
| Just one site's projects | edit `generate-projects.py`'s loop, or run it then delete the others — better: use `affected.py` and update only what changed |
| Only the pages affected by one source path | `python3 repowiki/scripts/affected.py <path>` → edit those → refresh indexes |

After any partial regeneration, always finish with:

```sh
python3 repowiki/scripts/generate-index.py
python3 repowiki/scripts/validate.py
```

> **Tip:** if you regenerated cards and want to re-import content from the old
> wiki, `repowiki/scripts/port-old.py --dry-run` shows what a one-shot port
> from `repowiki-old/` would do. It reads only from `repowiki-old/`, rewrites
> every relative link for the new depth, and is safe to re-run.

---

## 4. Checking and fixing frontmatter

Every `.md` file must have frontmatter matching its layer:

| Layer | Required keys |
|---|---|
| `wiki/cards`, `wiki/concepts` | `title`, `description`, `tags`, `type`, `module`, `path`, `created`, `updated` |
| `repo/`, `projects/` | `title`, `description`, `type` |
| `INDEX.md`, `TAGINDEX.md`, `README.md`, `AGENTS.md` | `title`, `description`, `type: catalog` |

### Check (read-only, default)

```sh
python3 repowiki/scripts/fix-frontmatter.py --check
```

Prints every violation and exits `1` if any are found:

```
FAIL — 3 frontmatter issue(s) (run --fix to repair):
  [missing tags] wiki/cards/foo.md
  [missing updated] wiki/cards/foo.md
  [leading H1] repo/bar.md
```

### Fix (auto-repair)

```sh
python3 repowiki/scripts/fix-frontmatter.py --fix
```

It adds missing keys, strips a leading `# H1` line, sets `type` by location,
derives `module`/`path` from `source_files` when absent, stamps
`created`/`updated`, and kebab-cases non-conforming filenames. Exit code `0`
= nothing to fix, `1` = files were repaired. When it renames a file it prints
a note — **links to the old name break**, so follow up with
`generate-index.py` + `validate.py`:

```sh
python3 repowiki/scripts/generate-index.py
python3 repowiki/scripts/validate.py
```

> External corpora (`module: external/...`) legitimately omit `path`; the
> checker knows this and won't flag it.

**With an agent:** say **"check and fix frontmatter"**.

---

## 5. Checking and updating index files

Two generated artifacts keep navigation working: **every folder's `INDEX.md`**
(a `type: catalog` page listing subitems) and **`wiki/TAGINDEX.md`** (every tag
in `wiki/`, with file-relative links to the files carrying it).

### Regenerate them

```sh
python3 repowiki/scripts/generate-index.py
```

```
INDEX.md regenerated in 16 folders
TAGINDEX.md written
```

This is safe to run any time — it rebuilds from what's on disk and never
touches your content. It's also what adds missing entries when you add/rename
pages or tags.

### Check them

```sh
python3 repowiki/scripts/validate.py
```

The validator checks INDEX coverage (every folder has one), TAGINDEX coverage
(every used tag listed, no stale tags), and that nothing else broke. A clean
run ends with a line like:

```
OK — N md files conform to the contract (M unresolved links, all prose/absent-source)
```

(N is the current file count — it grows as the wiki does.)

The "unresolved links" number is a **baseline**, not an error — it counts
links to source files whose repos aren't in this checkout (e.g.
`sites/fractalhome/...`) plus prose examples. What matters is the `OK`.

**With an agent:** say **"check and fix index files"**.

---

## 6. Plugging the wiki into your own SvelteKit project

The `svelte-docs-scaffold` package (`packages/svelte-docs-scaffold/`) is a
framework-agnostic TypeScript data layer that turns a folder of markdown into
a nav tree, tag index, doc pages, and prev/next — **without shipping any
components**. You bring your own UI; it hands you the data.

Full step-by-step integration (install, loaders, routes, load functions,
sidebar/tags/pager wiring) is in
[`packages/svelte-docs-scaffold/INTEGRATION-GUIDE.md`](../packages/svelte-docs-scaffold/INTEGRATION-GUIDE.md).

The 30-second version:

```ts
import { createDocs, loadFromGlob } from 'svelte-docs-scaffold';

const modules = import.meta.glob('/src/content/**/*.{md,svx}', {
  query: '?raw', import: 'default', eager: true
});
export const docs = createDocs({
  files: loadFromGlob(modules, { contentRoot: '/src/content' }),
  config: { base: '/docs' }
});
// docs.tree → sidebar · docs.tags → tag section · docs.prevNext(path) → pager
// docs.find(path) → the doc · docs.breadcrumbs(path) → trail
```

---

## Command cheat-sheet

| Task | Command |
|---|---|
| Edit a page | edit the `.md` file, then `generate-index.py` + `validate.py` |
| Add a card | create `wiki/cards/<kebab>.md`, then `generate-index.py` + `validate.py` |
| Find pages affected by a source change | `python3 repowiki/scripts/affected.py <path>` |
| Full regeneration | `generate-cards.py --force` + `generate-repo.py` + `generate-projects.py --force`, agent content pass, `generate-index.py` + `validate.py` |
| Partial regeneration | run only the generator you need, then `generate-index.py` + `validate.py` |
| Check frontmatter | `python3 repowiki/scripts/fix-frontmatter.py --check` |
| Fix frontmatter | `python3 repowiki/scripts/fix-frontmatter.py --fix`, then indexes + validate |
| Refresh indexes | `python3 repowiki/scripts/generate-index.py` |
| Full contract check | `python3 repowiki/scripts/validate.py` |

Every command above is also available as an agent phrase: **"generate fresh
repowiki"**, **"update `<path>` in repowiki"**, **"check and fix
frontmatter"**, **"check and fix index files"**.
