---
title: Credits Attribution
description: Repo credits.json maps skill, agent, and command slugs to upstream name and source URL.
tags: ['credits', 'attribution', 'site']
sources: [2026-08-02-093517-credits-json-site-attribution.md, 2026-08-02-112400-asi-general-skills-multihost-hooks.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
---

Source of truth: root `credits.json` (from `credits-list.csv`). Each catalog slug maps to `{ name, source }`.

Site loads credits via `getCredit(kind, slug)` and renders a chip on skill/agent/command detail pages. Custom internals (`llm-wiki`, `orchestrate`) credit https://github.com/fractalmandala/fractal-agentic. Related: [[Fractal Agentic Plugin]], [[General Utility Skills]], [[Plugin Distribution and Packaging]].
