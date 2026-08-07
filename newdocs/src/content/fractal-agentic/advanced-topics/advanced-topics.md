---
title: Advanced Topics
description: 1. Introduction 2. Project Structure 3. Core Components 4. Architecture Overview 5. Detailed Component Analysis 6. Dependency Analysis 7. Performance Considerations 8. Troubleshooting Guide 9. Conclus…
type: item
---
<cite>
**Referenced Files in This Document**
- `fractal-agentic/README.md`
- `fractal-agentic/CUSTOMIZE.md`
- `fractal-agentic/package.json`
- `fractal-agentic/CLAUDE.md`
- `fractal-agentic/AGENTS.md`
- `fractal-agentic/skills/boss-orchestration/SKILL.md`
- `fractal-agentic/docs/orchestration/runtime.md`
- `fractal-agentic/docs/orchestration/capability-lanes.md`
- `fractal-agentic/scripts/install-agents.sh`
- `fractal-agentic/scripts/verify.sh`
- `fractal-agentic/bin/cli.js`
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md`
- `fractal-agentic/agents/fractal-agentic-routine-implementer.toml`
- `fractal-agentic/agents/fractal-agentic-complex-implementer.toml`
- `fractal-agentic/scripts/check-armory.sh`
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion
10. Appendices

## Introduction
This document provides advanced, expert-level guidance for customizing and extending the Fractal Agentic plugin ecosystem. It focuses on:
- Custom agent development with architecture patterns and implementation guidelines
- Component extension patterns for skills, commands, and domain bosses
- Custom animation systems and theme customization via Svelte-based assets
- Performance optimization, memory management, and bundle size reduction
- Advanced configuration scenarios, security considerations, and enterprise deployment patterns
- Debugging complex issues, monitoring agent performance, and scaling considerations
- Migration guides for version upgrades and backwards compatibility notes

The content synthesizes orchestration runtime behavior, capability lanes, installer and verification tooling, and host integration points to enable robust, scalable, and secure deployments.

## Project Structure
Fractal Agentic is a plugin package that agents load directly from its root. The structure separates identity, discovery, armory (skills, agents, commands), orchestration runtime, and scripts for installation and verification. Host shims provide compatibility across Claude, Codex, Gemini, and others.

```mermaid
graph TB
A["Plugin Root<br/>package.json"] --> B["Identity & Router<br/>SOUL.md, AGENTS.md, CLAUDE.md"]
A --> C["Armory<br/>skills/, agents/, commands/"]
A --> D["Orchestration Runtime<br/>skills/boss-orchestration/*"]
A --> E["Scripts<br/>install-agents.sh, verify.sh, check-armory.sh"]
A --> F["Host Shims<br/>CLAUDE.md, GEMINI.md, KIMI.md, OPENCODE.md"]
A --> G["CLI Entry<br/>bin/cli.js"]
C --> H["Boss Playbooks<br/>docs/bosses/*/INDEX.md"]
D --> I["Role Contracts & References<br/>references/*"]
```

**Diagram sources**
- `fractal-agentic/package.json#L1-L59`
- `fractal-agentic/CLAUDE.md#L1-L8`
- `fractal-agentic/AGENTS.md#L1-L106`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/bin/cli.js#L1-L148`

**Section sources**
- `fractal-agentic/README.md#L1-L440`
- `fractal-agentic/package.json#L1-L59`
- `fractal-agentic/CLAUDE.md#L1-L8`
- `fractal-agentic/AGENTS.md#L1-L106`

## Core Components
- Startup router and boss selection: AGENTS.md defines precedence, trivial exemption, and one-boss selection rules.
- Orchestration runtime: skills/boss-orchestration/SKILL.md implements non-blocking capability lanes, five-part contracts, verification, and final review.
- Capability lanes: TOML templates define routine, complex, and reviewer roles; install-agents.sh installs them without mutating host config.
- Verification and health: verify.sh validates manifests, TOML pins, role contracts, and installer behavior; check-armory.sh ensures critical assets exist.
- CLI installer: bin/cli.js supports multi-host installation and project snippet injection.

Key responsibilities:
- Non-blocking policy: missing pins or incomplete installs never block product work.
- Five-part contract: objective, ownership, interfaces, constraints, verification.
- Final review: ship | fix-first | rethink verdicts with evidence.

**Section sources**
- `fractal-agentic/AGENTS.md#L1-L106`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`
- `fractal-agentic/bin/cli.js#L1-L148`

## Architecture Overview
The system follows a layered architecture:
- Layer A (Content): Readable plugin content and playbooks
- Layer B (Install): TOML templates installed under host agents directory
- Layer C (Session): Spawn catalog exposing capability types in the current task

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "bin/cli.js"
participant Installer as "install-agents.sh"
participant Host as "Host Agents Dir"
participant Runtime as "boss-orchestration SKILL.md"
participant Verify as "verify.sh"
User->>CLI : npx fractal-agentic install --target=all
CLI->>Host : Copy plugin files (filtered)
User->>Installer : sh scripts/install-agents.sh
Installer->>Host : Install TOML templates (no overwrite if differs)
User->>Runtime : /orchestrate (select boss, set capability_mode)
Runtime-->>User : Lane selection, contracts, verification, review
User->>Verify : sh scripts/verify.sh
Verify-->>User : Health checks and pin validation
```

**Diagram sources**
- `fractal-agentic/bin/cli.js#L1-L148`
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/scripts/verify.sh#L1-L274`

**Section sources**
- `fractal-agentic/docs/orchestration/runtime.md#L1-L53`
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`

## Detailed Component Analysis

### Custom Agent Development Patterns
- Define capability lanes via TOML templates with name, model, reasoning effort, and optional sandbox mode.
- Use role-contracts to standardize prompts and receipts for implementers and reviewers.
- Enforce non-blocking degradation when pins are absent; prefer exposed pins but continue degraded.

```mermaid
classDiagram
class RoutineImplementer {
+string name
+string description
+string model
+string model_reasoning_effort
+string developer_instructions
}
class ComplexImplementer {
+string name
+string description
+string model
+string model_reasoning_effort
+string developer_instructions
}
class RoleContracts {
+string shared_contract
+string receipt_fields
+string verdict_set
}
RoutineImplementer --> RoleContracts : "uses"
ComplexImplementer --> RoleContracts : "uses"
```

**Diagram sources**
- `fractal-agentic/agents/fractal-agentic-routine-implementer.toml#L1-L19`
- `fractal-agentic/agents/fractal-agentic-complex-implementer.toml#L1-L19`
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md#L1-L245`

**Section sources**
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md#L1-L245`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`

### Component Extension Patterns (Skills, Commands, Bosses)
- Add skills by placing directories under skills/<id>/ with SKILL.md frontmatter and mapping into owning boss INDEX.md.
- Add commands by creating commands/<command-id>.md with frontmatter and linking from indexes and boss playbooks.
- Retarget bosses for different stacks by editing router defaults, nested boss playbooks, and boss-prompts.

```mermaid
flowchart TD
Start(["Add Skill"]) --> Place["Place under skills/<id>/ with SKILL.md"]
Place --> Map["Map in docs/bosses/<boss>/INDEX.md"]
Map --> Index["Update skills/INDEX.md"]
Index --> Smoke["Run check-armory.sh"]
Smoke --> End(["Done"])
```

**Diagram sources**
- `fractal-agentic/CUSTOMIZE.md#L1-L579`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

**Section sources**
- `fractal-agentic/CUSTOMIZE.md#L1-L579`

### Custom Animation Systems and Theme Customization
- Animation assets and component ports live under sibling packages like fractal-svelte and svelte-animated-icon. Ports define JSON schemas for UI components; examples include marquee, text-animation, and streaming-response.
- Theme generation and tokens are supported via scripts and templates in fractals-styler and fractalsvelte.
- To customize animations:
  - Extend port definitions under ports/*.json
  - Update component implementations in src/lib or example routes
  - Regenerate catalogs using provided scripts

```mermaid
graph TB
P["Ports JSON<br/>ports/*.json"] --> C["Component Impl<br/>src/lib/*"]
C --> V["Vite Build<br/>vite.config.ts"]
V --> D["Dist Output<br/>dist/*"]
T["Theme Tokens<br/>templates/_tokens.sass"] --> S["Styler Generator<br/>fractals-styler/src/*"]
S --> D
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

**Section sources**
- `fractal-svelte/package.json`
- `fractal-svelte/vite.config.ts`
- `fractals-styler/src/generate.ts`
- `fractals-styler/src/registry.ts`

### Performance Optimization Techniques
- Prefer routine lane for bounded tasks; escalate to complex only when judgment is required.
- Use parallel execution for independent, non-overlapping work; serialize shared dependencies.
- Avoid silent fallbacks; degrade gracefully and report capability_mode and pins status.
- Minimize context switching by keeping primary session responsible for diff inspection and re-verification.

```mermaid
flowchart TD
Task["Task Shape"] --> Routine{"Routine?"}
Routine --> |Yes| DelegateR["Delegate to routine lane"]
Routine --> |No| Complex{"Complex?"}
Complex --> |Yes| DelegateC["Delegate to complex lane"]
Complex --> |No| Primary["Implement in primary"]
DelegateR --> Verify["Verify in primary"]
DelegateC --> Verify
Primary --> Verify
Verify --> Review["Final review"]
Review --> Verdict{"Verdict"}
Verdict --> |ship| Done["Report completion"]
Verdict --> |fix-first| Fix["Apply fixes"] --> Verify
Verdict --> |rethink| Redesign["Return to design"]
```

**Diagram sources**
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`

**Section sources**
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`

### Memory Management and Bundle Size Reduction
- Vendor skills locally to avoid external symlinks and reduce runtime overhead.
- Exclude unnecessary files during installation (node_modules, .git, etc.) via cli.js filter.
- Use incremental builds and selective imports in SvelteKit/Vite to minimize bundle size.
- Generate minimal themes and strip unused tokens via styler scripts.

**Section sources**
- `fractal-agentic/bin/cli.js#L1-L148`
- `fractal-agentic/CUSTOMIZE.md#L1-L579`

### Advanced Configuration Scenarios
- Set capability_mode once per task based on session spawn catalog exposure.
- Use CODEX_HOME or explicit --target-dir for installer to control destination.
- Maintain non-blocking policy: never require fresh task before coding; degrade and continue.

**Section sources**
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`

### Security Considerations
- Reviewer sandbox policies may be broader than requested; capture and note residual risk.
- Runtime inspector extracts safe allowlisted fields; ensure no secrets leak in logs.
- Enforce read-only reviewer where possible; do not claim OS-enforced isolation unless observed.

**Section sources**
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md#L1-L245`
- `fractal-agentic/scripts/verify.sh#L234-L274`

### Enterprise Deployment Patterns
- Use marketplace installations for controlled distribution; update plugin.json versions for fork differentiation.
- Centralize skill and command mappings under owning boss playbooks; maintain live indexes.
- Automate verification in CI with verify.sh and check-armory.sh; enforce non-blocking policy checks.

**Section sources**
- `fractal-agentic/CUSTOMIZE.md#L1-L579`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

### Debugging Complex Issues
- Use inspect-agent-runtime.sh to observe routing metadata for subagent threads.
- Validate TOML pins and installer behavior with verify.sh; check for byte-exact copies.
- Inspect openai.yaml shape and references to ensure marketplace skill UI strings are valid.

**Section sources**
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

### Monitoring Agent Performance
- Track capability_mode and pins status in reports; log degraded vs pinned states.
- Measure verification command results and diff inspection outcomes for evidence-based acceptance.
- Use evaluation_scripts for latency checks and load testing simulations.

**Section sources**
- `fractal-agentic/docs/orchestration/capability-lanes.md#L1-L64`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`

### Scaling Considerations
- Parallelize independent tasks; serialize shared file dependencies.
- Keep worker scope bounded to owned paths; preserve concurrent edits.
- Prefer domain specialists for consults when pins are absent; scale review capacity accordingly.

**Section sources**
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md#L1-L245`
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`

### Migration Guides and Backwards Compatibility
- When renaming lanes or adding new ones, update all references: SKILL.md, role-contracts.md, routing-matrix.md, commands, install-agents.sh, verify.sh, and README tables.
- Re-install for every developer machine; handle conflicts deliberately without overwriting differing files.
- Update plugin manifests and version numbers for marketplace differentiation.

**Section sources**
- `fractal-agentic/CUSTOMIZE.md#L1-L579`
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/scripts/verify.sh#L1-L274`

## Dependency Analysis
The orchestration runtime depends on role contracts, capability-mode, and boss-prompts. Scripts validate consistency between TOML pins, contracts, and installer behavior.

```mermaid
graph TB
SKILL["SKILL.md"] --> CONTRACTS["role-contracts.md"]
SKILL --> CAPMODE["capability-mode.md"]
SKILL --> BOSSPROMPTS["boss-prompts.md"]
VERIFY["verify.sh"] --> SKILL
VERIFY --> CONTRACTS
VERIFY --> INSTALLER["install-agents.sh"]
ARMORY["check-armory.sh"] --> SKILL
ARMORY --> OPENAI["openai.yaml"]
```

**Diagram sources**
- `fractal-agentic/skills/boss-orchestration/SKILL.md#L1-L312`
- `fractal-agentic/skills/boss-orchestration/references/role-contracts.md#L1-L245`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

**Section sources**
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

## Performance Considerations
- Route tasks to appropriate lanes to minimize reasoning overhead.
- Avoid unnecessary context loading; read boss playbooks only after selection.
- Use incremental verification and targeted diffs to reduce computation.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing spawn types: run install-agents.sh and start a new task.
- Installer conflicts: resolve differences deliberately; installer will not overwrite.
- Model/effort unknown: use inspect-agent-runtime.sh if rollout exists.
- Reviewer mutated files: stop and capture residual risk.
- Missing skill: confirm vendored local path exists.

**Section sources**
- `fractal-agentic/scripts/install-agents.sh#L1-L180`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`

## Conclusion
Fractal Agentic provides a robust, extensible orchestration framework for AI coding agents. By following the non-blocking policy, leveraging capability lanes, and maintaining strict contracts and verification, teams can build scalable, secure, and high-performance agent workflows. Customization through skills, commands, and bosses enables adaptation to diverse stacks and enterprise requirements.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices
- Versioning: Update plugin.json and host-specific manifests for marketplace differentiation.
- Health checks: Run verify.sh and check-armory.sh after structural edits.
- Project integration: Ensure AGENTS snippets point to correct plugin root and entry files.

**Section sources**
- `fractal-agentic/CUSTOMIZE.md#L1-L579`
- `fractal-agentic/scripts/verify.sh#L1-L274`
- `fractal-agentic/scripts/check-armory.sh#L1-L143`