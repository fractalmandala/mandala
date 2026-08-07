---
title: Fractal Agentic Plugin Documentation, Scripts & Evaluation Suite — Unique Setup and Commands
description: scripts/verify.sh is the canonical self-test: it validates manifests, runs check-armory.sh and check-nonblocking-policy.sh, asserts TOML role pins against expected values, performs a clean install-ag…
tags: [packages/fractal_agentic/plugin_core/docs_and_config]
type: card
module: packages/fractal_agentic/plugin_core/docs_and_config
path: packages/fractal_agentic/plugin_core/docs_and_config
created: 2026-08-05
updated: 2026-08-06
---

`scripts/verify.sh` is the canonical self-test: it validates manifests, runs `check-armory.sh` and `check-nonblocking-policy.sh`, asserts TOML role pins against expected values, performs a clean `install-agents.sh --target-dir` round-trip with byte-for-byte comparison, tests `--check` mode, verifies CODEX_HOME handling, and exercises `inspect-agent-runtime.sh` against fixture JSONL sessions. `install-agents.sh [--target-dir <path>] [--check]` installs three custom-agent TOML templates without touching Codex config. `scripts/resolve-plugin-root.sh` resolves the plugin root via `FRACTAL_AGENTIC_ROOT` or upward filesystem search.
