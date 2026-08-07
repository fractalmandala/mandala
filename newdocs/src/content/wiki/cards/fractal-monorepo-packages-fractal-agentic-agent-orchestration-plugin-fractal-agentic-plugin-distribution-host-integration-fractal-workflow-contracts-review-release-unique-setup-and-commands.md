---
title: Fractal Workflow Contracts (Review & Release) — Unique Setup and Commands
description: Users invoke via slash commands /review-fanout and /hooks-init; the workflows themselves require no maintainer setup beyond plugin install. When a host provides a native Workflow engine, pass a JSON…
tags: [packages/fractal_agentic/plugin_core/workflows]
type: card
module: packages/fractal_agentic/plugin_core/workflows
path: packages/fractal_agentic/plugin_core/workflows
created: 2026-08-05
updated: 2026-08-06
---

Users invoke via slash commands `/review-fanout` and `/hooks-init`; the workflows themselves require no maintainer setup beyond plugin install. When a host provides a native Workflow engine, pass a JSON payload with `diff`, optional `language`, and optional `changedFiles` to trigger the parallel review path.
