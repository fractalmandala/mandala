---
title: Plugin Manifests & CLI Installer — Architecture Design
description: Two-layer structure: (1) host-specific manifest directories .claude-plugin/ and .codex-plugin/, each containing a plugin.json declaring name/version/description/interface/skills/keywords so the respe…
tags: [packages/fractal_agentic/plugin_core/plugin_manifest_and_cli]
type: card
module: packages/fractal_agentic/plugin_core/plugin_manifest_and_cli
path: packages/fractal_agentic/plugin_core/plugin_manifest_and_cli
created: 2026-08-05
updated: 2026-08-06
---

Two-layer structure: (1) host-specific manifest directories `.claude-plugin/` and `.codex-plugin/`, each containing a `plugin.json` declaring name/version/description/interface/skills/keywords so the respective host can discover the plugin; `.claude-plugin/marketplace.json` registers the plugin with the Claude marketplace, and `PLUGIN_SCHEMA_NOTES.md` documents the minimal safe schema. (2) A single entry-point CLI at `bin/cli.js` (`#!/usr/bin/env node` that parses `--target=<host>` (antigravity|claude|codex|all) and `--project`, then either copies the entire `plugin/` tree into the host's cache directory under `$HOME/.gemini/config/plugins`, `$HOME/.claude/plugins/cache`, or `$HOME/.codex/plugins/cache`, or injects an AGENTS snippet into a project's `AGENTS.md`. The CLI delegates verification to `scripts/verify.sh` via `execSync`. Dependency direction is one-way: the CLI reads the local `plugin/` source tree and writes it into host-specific locations; manifests are pure declarative JSON with no runtime code.
