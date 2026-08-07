---
title: Plugin Manifests & CLI Installer — Coding Conventions
description: - Each host gets its own <host-plugin/plugin.json mirroring the same core fields (name, version, description, author) so manifests stay in sync across hosts.
tags: [packages/fractal_agentic/plugin_core/plugin_manifest_and_cli]
type: card
module: packages/fractal_agentic/plugin_core/plugin_manifest_and_cli
path: packages/fractal_agentic/plugin_core/plugin_manifest_and_cli
created: 2026-08-05
updated: 2026-08-06
---

- Each host gets its own `<host>-plugin/plugin.json` mirroring the same core fields (name, version, description, author) so manifests stay in sync across hosts.
- The root `plugin.json` and host-specific manifests share identical metadata strings (displayName, shortDescription, longDescription, defaultPrompt) to keep the user-facing description consistent across Claude and Codex.
- Installation functions follow a try/catch pattern that attempts the official host mechanism first (e.g. `claude plugin marketplace add/install` and falls back to copying into the host's cache directory on failure.
- CLI commands are parsed from `process.argv.slice(2)` with a simple string switch (`install`, `verify`, `help` rather than a dedicated argument-parsing library.
