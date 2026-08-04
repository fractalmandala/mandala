---
title: Optional Hooks Plane
description: User-installed host hooks are optional like wiki setup and must never gate product delivery.
tags: ['hooks', 'non-blocking', 'workflow']
sources: [2026-08-02-112400-asi-general-skills-multihost-hooks.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
---

Hooks (inspired by multi-host reference plugins, not wholesale ECC copy) install via `/hooks-init` / `/hooks-status` on the **user machine**. Default profile is minimal. Missing hooks never block `/orchestrate` or ship. Related: [[Boss Orchestration Runtime]], [[LLM-Maintained Wiki]], [[Domain Bosses Armory]].
