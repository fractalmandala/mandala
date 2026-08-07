---
title: VS Code Workspace Definitions — Coding Conventions
description: - Each workspace file targets exactly one root folder using a relative ../ path pointing into the repository root.
tags: [ide_workspaces]
type: card
module: ide_workspaces
path: ide_workspaces
created: 2026-08-05
updated: 2026-08-06
---

- Each workspace file targets exactly one root folder using a relative `../` path pointing into the repository root.
- Per-workspace settings are declared inline under a top-level `settings` key rather than through shared workspace settings.
- Workspace filenames follow the `<project-name>.code-workspace` naming convention matching their target app/site/package.
