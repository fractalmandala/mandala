---
description: Initialize a project inside the mandala monorepo — detect stack, set up AGENTS.md, link fractal-agentic plugin, configure instincts.
---

# /project-init --monorepo

Monorepo-aware project initialization. Detects mandala monorepo structure
(apps/, sites/, packages/) and tailors onboarding accordingly.

## Detection

Check for monorepo signals at project root:
- AGENTS.md containing "Mandala monorepo"
- apps/, sites/, packages/ sibling dirs
- pnpm-workspace.yaml or pnpm-lock.yaml
- packages/fractal-agentic/plugin/ exists

## Monorepo-specific behavior

### 1. AGENTS.md template
If no AGENTS.md exists, create from monorepo template with Stack, Commands,
Fractal Agentic sections. If exists, merge sections under existing content.

### 2. Plugin link
Set FRACTAL_AGENTIC_ROOT to packages/fractal-agentic/plugin in .envrc.

### 3. Project-scoped instincts
Run instinct-cli.py projects to register. Auto-detected via git remote.

### 4. Hooks profile
Suggest FRACTAL_HOOK_PROFILE=standard in .envrc.

### 5. Cross-project context
Print related monorepo packages, shared dependencies, test coverage status.
