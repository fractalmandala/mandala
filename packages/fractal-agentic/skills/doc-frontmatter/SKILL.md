---
name: doc-frontmatter
description: Add or update structured YAML frontmatter (id, title, type, tags, summary, relates_to, status, source, updated) on markdown files in docs/adr, docs/design, and docs/routing, and maintain the agents/skills-and-agents.json registry that catalogs every folder under agents/skills/ and agents/orchestrators/. Use this whenever the user asks to tag docs, add frontmatter, build a doc index/manifest, make docs more navigable/searchable for agents, or asks to register, list, sync, or update the skills/agents registry — even if they don't use the word "frontmatter" explicitly, e.g. "make these docs easier for an agent to search" or "add doc-frontmatter to all ADRs" or "update the skills registry with the new skill I just added".
---

# doc-frontmatter

This skill gives every doc in `docs/adr/`, `docs/design/`, `docs/routing/` a small, consistent
YAML header so an agent can discover relevant docs by reading one short index instead of
opening every file in the relevant folder. It also maintains a sibling registry,
`agents/skills-and-agents.json`, that catalogs every folder under `agents/skills/` and
`agents/orchestrators/` using the same field schema.

The frontmatter/registry fields only capture _metadata about a doc_; they never replace or
duplicate the doc's own content. Keep the frontmatter block to the schema below — anything
the doc body already explains doesn't need to be repeated in `summary`.

## Why a script does half the work

Some fields are purely mechanical — `id` and `type` come from which folder the file lives in,
`source` for a routing doc comes from decoding `--` back into `/` in the filename. Getting
those right by hand is just an opportunity to introduce a typo. The bundled script,
`scripts/frontmatter_tool.py`, derives those deterministically and also parses/merges
existing YAML so you never have to hand-roll a frontmatter block from scratch.

The other fields — `title`, `summary`, `tags`, `relates_to`, `status` — need you to actually
read and understand the doc. The script surfaces the raw material (first H1, opening
paragraph, a status keyword hint) so you don't have to open the full file, but drafting
these fields well is your job, not the script's.

## Schema

```yaml
---
id:
  ADR-013 # ADR-NNN for adr docs; filename stem for design docs;
  # decoded source path for routing docs
title: Notes-Template Vault Persistence
type: adr # adr | design | routing
tags: [notes, persistence, localstorage, undo-redo]
summary: One sentence — this is what gets surfaced in a generated index, so make it count.
relates_to: [ADR-006, ADR-012] # other doc ids this doc is meaningfully connected to
status: accepted # adr-only: proposed | accepted | superseded
source: src/lib/components/NotesLayout.svelte # routing-only: file this doc describes
updated: 2026-06-25
---
```

Omit `status` on design/routing docs and `source` on adr/design docs — don't pad the schema
with empty fields just to keep it uniform.

## Workflow: tagging docs in docs/adr, docs/design, docs/routing

1. **Scan first.** Run the script against whatever the user pointed you at — a single file,
   a glob, or a whole folder:

   ```bash
   python agents/skills/doc-frontmatter/scripts/frontmatter_tool.py scan docs/adr
   ```

   This returns, per file: any frontmatter that already exists, the derived `type`/`id`
   (and `derived_source` for routing docs, `status_hint` for adr docs), the first H1, and the
   opening paragraph. Read this JSON instead of opening every markdown file individually —
   that's the whole point of the script.

2. **Draft the content-derived fields yourself.** For each file, work out:
   - `title` — usually the H1 verbatim, unless it's redundant with the filename.
   - `summary` — one sentence distilling what the doc is _for_, not what it contains. Read
     more of the file than just the opening paragraph if the purpose isn't clear from it.
   - `tags` — pull from the existing vocabulary forming across the corpus where it fits
     (`notes`, `canvas`, `ipc`, `theming`, `undo-redo`, `ai`, `browser`, `vault`, ...) rather
     than inventing a new near-synonym each time. If you're tagging a batch of files, scan
     them all first and keep a running tag vocabulary so the same concept gets the same tag.
   - `relates_to` — look for explicit references to other ADR numbers or doc topics in the
     text, and use your judgment about what's genuinely related (e.g. an ADR and the routing
     doc for the component it introduced almost always relate to each other).
   - `status` (adr only) — trust `status_hint` from the scan if it found one, otherwise read
     enough of the doc to tell whether the decision is still proposed, accepted, or
     superseded by a later ADR.

3. **Apply.** Write a single JSON file mapping each file path to its field updates, then run:

   ```bash
   python agents/skills/doc-frontmatter/scripts/frontmatter_tool.py apply /tmp/updates.json
   ```

   The script merges these into each file's frontmatter — existing fields not in the schema
   are preserved, fields you didn't touch stay as they were, the doc body is never modified.
   It prints a report of which fields were actually filled or changed per file vs. which were
   already correct and left alone. Relay that report back to whoever asked for the change so
   they can sanity-check it without re-reading every file.

## Workflow: maintaining agents/skills-and-agents.json

Every folder under `agents/skills/` and `agents/orchestrators/` is one skill or one
orchestrator agent, documented by a `SKILL.md` or `AGENT.md` inside it. The registry catalogs
all of them in one JSON file using the same field schema (`type` is `skill` or `agent`
instead of `adr`/`design`/`routing`).

1. **Scan:**

   ```bash
   python agents/skills/doc-frontmatter/scripts/frontmatter_tool.py scan-registry
   ```

   This walks both folders, finds each subfolder's `SKILL.md`/`AGENT.md`, and surfaces its
   frontmatter `name`/`description` (skills usually have these — `description` is often
   already a good `summary` draft) plus the first H1 and opening paragraph as a fallback for
   folders without frontmatter (most `AGENT.md` files won't have any). It also lists which
   ids are already in the registry, so you can tell new folders apart from ones that just
   need a refresh.

2. **Draft entries.** For each skill/agent folder, work out `id` (the folder name — don't
   change it), `title`, `summary` (the `description` field is usually most of this already),
   `tags`, `relates_to` (skills that are commonly used together, or an orchestrator and the
   skills it delegates to — e.g. `frontend-designer` relates to `web-artifacts-builder`,
   `impeccable`, `frontend-design`), and `source` (the `meta_path` from the scan).

3. **Apply:**

   ```bash
   python agents/skills/doc-frontmatter/scripts/frontmatter_tool.py apply-registry /tmp/registry-updates.json
   ```

   This merges by id into `agents/skills-and-agents.json` (creating it if it doesn't exist
   yet), leaving every other entry untouched. Pass `--registry <path>` to either command if
   the user wants the file somewhere else.

Update the registry whenever a skill or orchestrator is added, renamed, or substantially
changed — this is the same "registry sync" discipline AGENTS.md already asks for with the
ADR and design-docs tables, just for `agents/skills/` and `agents/orchestrators/` instead of
`docs/`.
