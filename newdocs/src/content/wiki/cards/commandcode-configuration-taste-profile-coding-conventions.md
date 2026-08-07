---
title: CommandCode Configuration & Taste Profile — Coding Conventions
description: - Each taste entry follows the pattern 'Preference statement — Confidence: X.Y' on a single bullet line.
tags: [commandcode]
type: card
module: commandcode
path: commandcode
created: 2026-08-05
updated: 2026-08-06
---

- Each taste entry follows the pattern 'Preference statement — Confidence: X.Y' on a single bullet line.
- Taste files use a two-level directory layout where `taste/taste.md` is a thin redirect to the canonical `taste/taste/taste.md`.
- Shell permissions are granted via explicit allowlist entries in `settings.json` rather than broad wildcard grants, with only a few generic patterns (e.g., `Shell(grep:*)` used alongside fully specified command strings.
