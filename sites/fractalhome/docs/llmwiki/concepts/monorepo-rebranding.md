---
title: Monorepo Rebranding
description: Guidelines for auditing and modifying repository-wide paths, URLs, and naming structures during active renaming.
tags: [monorepo, migration, git, architecture]
sources:
  - 2026-08-03-monorepo-migration.md
created: 2026-08-03
updated: 2026-08-03
type: concept
boss: workflow
project: mandala
---

Rebranding a monorepo (e.g. from `fractals` to `mandala`) requires systematic auditing of configuration files, metadata pages, and references to prevent broken links and build errors.

## Key Audit Checklist

1. **Git Configuration and History**: Ensure the origin remote matches the new GitHub organization/repository layout.
2. **Metadata Files & Layouts**: Update Svelte/React layouts, `+layout.svelte`, headers, footer branding strings, and READMEs.
3. **Workspace Path Rules**: Update local paths (e.g. from `/Users/amrit/fractals` to `/Users/amrit/mandala`) in development configurations, workspaces, and doc panels.
4. **Ignored Directories**: Verify large asset packages (e.g. Dharma Sanskrit corpora) remain excluded in `.gitignore` to maintain clean tracking.
