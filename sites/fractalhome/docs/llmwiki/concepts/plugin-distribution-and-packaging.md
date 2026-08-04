---
title: Plugin Distribution and Packaging
description: Patterns for packaging AI agent skills, rules, and commands across multiple host harnesses without lock-in.
tags: [plugin, packaging, claude, codex, antigravity, distribution]
sources: [2026-08-02-1216-plugin-packaging-distribution.md, 2026-08-02-112400-asi-general-skills-multihost-hooks.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
boss: creator
project: fractal-agentic
---

Package AI agent capabilities using host-agnostic loaders (`SOUL.md`, `AGENTS.md`) and harness-specific manifests (`plugin.json`, `.claude-plugin`, `.codex-plugin`). Provide non-interactive CLI script installers (`npx install`) for direct Git or global installation across targets. Related: [[AI Engineering Stack]] and [[Agent Harness Design]].

**Multi-host:** aim for install surfaces across Claude/Cursor/Codex/Trae-style hosts without vendor lock-in; vendor skills by copy, not runtime symlinks. See also [[General Utility Skills]] and [[Optional Hooks Plane]].
