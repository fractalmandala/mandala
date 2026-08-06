# Agent Configuration

<cite>
**Referenced Files in This Document**
- [SOUL.md](file://fractal-agentic/SOUL.md)
- [AGENTS.md](file://fractal-agentic/AGENTS.md)
- [README.md](file://fractal-agentic/README.md)
- [CUSTOMIZE.md](file://fractal-agentic/CUSTOMIZE.md)
- [TROUBLESHOOTING.md](file://fractal-agentic/TROUBLESHOOTING.md)
- [package.json](file://fractal-agentic/package.json)
- [plugin.json](file://fractal-agentic/plugin.json)
- [scripts/resolve-plugin-root.sh](file://fractal-agentic/scripts/resolve-plugin-root.sh)
- [scripts/install-agents.sh](file://fractal-agentic/scripts/install-agents.sh)
- [scripts/check-armory.sh](file://fractal-agentic/scripts/check-armory.sh)
- [scripts/verify.sh](file://fractal-agentic/scripts/verify.sh)
- [hooks/profiles.json](file://fractal-agentic/hooks/profiles.json)
- [agents/fractal-agentic-routine-implementer.toml](file://fractal-agentic/agents/fractal-agentic-routine-implementer.toml)
- [agents/fractal-agentic-complex-implementer.toml](file://fractal-agentic/agents/fractal-agentic-complex-implementer.toml)
- [agents/fractal-agentic-fresh-reviewer.toml](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml)
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
This document explains how to configure and set up the Fractal Agentic agent system. It covers the startup router, authority precedence rules, trivial exemption policy, environment variables, configuration files, runtime settings, identity principles from SOUL.md, plugin configuration, host integration, profile management, security and access control, debugging and logging, troubleshooting, and performance tuning. The goal is to help both new and experienced users operate the system reliably across different hosts and environments.

## Project Structure
The installable unit is the plugin directory referenced by FRACTAL_AGENTIC_ROOT. It contains:
- Identity and routing: SOUL.md, AGENTS.md, host shims (CLAUDE.md, GEMINI.md, KIMI.md, OPENCODE.md)
- Armory: skills/, agents/*.md, commands/*.md
- Runtime kernel: skills/boss-orchestration/*, capability TOML pins under agents/*.toml
- Scripts for installation, verification, and inspection
- Hooks for optional session automation and profiles
- Plugin manifests for marketplace integration

```mermaid
graph TB
subgraph "Plugin Root"
A["SOUL.md"]
B["AGENTS.md"]
C["plugin.json"]
D["skills/"]
E["agents/*.toml"]
F["commands/*.md"]
G["hooks/"]
H["scripts/"]
end
subgraph "Host Integration"
I["CLAUDE.md / GEMINI.md / KIMI.md / OPENCODE.md"]
end
A --> B
B --> D
B --> F
D --> E
G --> |"profiles"| G
H --> |"install/verify/inspect"| H
I --> C
```

**Diagram sources**
- [SOUL.md:1-53](file://fractal-agentic/SOUL.md#L1-L53)
- [AGENTS.md:1-106](file://fractal-agentic/AGENTS.md#L1-L106)
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [scripts/resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [scripts/install-agents.sh:1-180](file://fractal-agentic/scripts/install-agents.sh#L1-L180)
- [hooks/profiles.json:1-38](file://fractal-agentic/hooks/profiles.json#L1-L38)

**Section sources**
- [README.md:44-56](file://fractal-agentic/README.md#L44-L56)
- [CUSTOMIZE.md:49-74](file://fractal-agentic/CUSTOMIZE.md#L49-L74)

## Core Components
- Startup router: AGENTS.md defines authority precedence, one-boss selection, handoffs, and stop-reading rules.
- Identity and principles: SOUL.md describes core identity, boss-first routing, orchestration philosophy, and cross-harness vision.
- Capability lanes: Three TOML pins define routine implementer, complex implementer, and fresh reviewer roles with model and effort pins.
- Orchestration runtime: skills/boss-orchestration provides the delivery loop, contracts, and review gate.
- Host integration: plugin.json and host shims enable marketplace discovery and default prompts.
- Profiles: hooks/profiles.json selects a hook profile controlling session automation and safety checks.

Key environment variables:
- FRACTAL_AGENTIC_ROOT: Points to the plugin root; used by resolve-plugin-root.sh and all scripts.

**Section sources**
- [AGENTS.md:6-36](file://fractal-agentic/AGENTS.md#L6-L36)
- [SOUL.md:1-27](file://fractal-agentic/SOUL.md#L1-L27)
- [agents/fractal-agentic-routine-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-routine-implementer.toml#L1-L19)
- [agents/fractal-agentic-complex-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-complex-implementer.toml#L1-L19)
- [agents/fractal-agentic-fresh-reviewer.toml:1-20](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml#L1-L20)
- [plugin.json:11-20](file://fractal-agentic/plugin.json#L11-L20)
- [scripts/resolve-plugin-root.sh:76-86](file://fractal-agentic/scripts/resolve-plugin-root.sh#L76-L86)

## Architecture Overview
The system follows a strict startup flow:
- Read project-local AGENTS.md and this router.
- Apply trivial exemption when applicable.
- Select exactly one domain boss and read its playbook.
- For non-trivial work, load /orchestrate and follow the runtime contracts.
- Use capability lanes (routine/complex/reviewer) when available; otherwise degrade gracefully.

```mermaid
sequenceDiagram
participant User as "User"
participant Router as "AGENTS.md"
participant Boss as "Boss Playbook"
participant Runtime as "boss-orchestration"
participant Lanes as "Capability Lanes (TOML)"
participant Review as "Fresh Reviewer"
User->>Router : Start session
Router->>Router : Authority + Trivial Exemption
Router->>Boss : Select one boss and read playbook
alt Non-trivial work
User->>Runtime : /orchestrate
Runtime->>Lanes : Preflight and choose lane
Lanes-->>Runtime : Model/effort/sandbox info
Runtime->>Review : Final verdict required
Review-->>Runtime : ship | fix-first | rethink
Runtime-->>User : Delivery outcome
else Trivial
Router-->>User : Direct answer without loading boss/runtime
end
```

**Diagram sources**
- [AGENTS.md:17-36](file://fractal-agentic/AGENTS.md#L17-L36)
- [README.md:280-329](file://fractal-agentic/README.md#L280-L329)
- [agents/fractal-agentic-fresh-reviewer.toml:1-20](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml#L1-L20)

## Detailed Component Analysis

### Startup Router and Authority Precedence
- Authority precedence:
  1) Project-local AGENTS.md and explicit user requirements win for repository conventions and scope.
  2) This router supplies process guidance.
  3) The runtime source-of-truth is skills/boss-orchestration and its references.
- Trivial exemption: For single-sentence answers or pure explanations with no repo changes, respond directly without loading bosses or runtime.
- Mandatory state machine: Read applicable instructions, apply trivial exemption, select exactly one boss, read its INDEX.md fully, stop reading other playbooks, then use /orchestrate for delivery work.

**Section sources**
- [AGENTS.md:6-36](file://fractal-agentic/AGENTS.md#L6-L36)

### Trivial Exemption Policy
- Applies to quick answers, pure explanations, or simple “what is X?” questions.
- Avoid loading bosses, runtime, pins, or inventories unless the task becomes non-trivial.

**Section sources**
- [AGENTS.md:17-21](file://fractal-agentic/AGENTS.md#L17-L21)

### Environment Variables and Resolution
- FRACTAL_AGENTIC_ROOT must point at the plugin root (not monorepo root).
- resolve-plugin-root.sh resolves the plugin root via env, cwd walk-up, and script location fallback.
- If FRACTAL_AGENTIC_ROOT points to monorepo root but plugin/ exists and is valid, it will be accepted.

```mermaid
flowchart TD
Start(["Start"]) --> CheckEnv{"FRACTAL_AGENTIC_ROOT set?"}
CheckEnv --> |Yes| ValidateEnv["Validate plugin root or plugin/ child"]
ValidateEnv --> ValidEnv{"Valid?"}
ValidEnv --> |Yes| EmitRoot["Emit absolute path"]
ValidEnv --> |No| FailEnv["Fail with error"]
CheckEnv --> |No| WalkCwd["Walk common paths from cwd"]
WalkCwd --> FoundCwd{"Found?"}
FoundCwd --> |Yes| EmitRoot
FoundCwd --> |No| WalkUp["Walk parent directories"]
WalkUp --> FoundUp{"Found?"}
FoundUp --> |Yes| EmitRoot
FoundUp --> |No| ScriptFallback["Use script dir fallback (unless --from-cwd)"]
ScriptFallback --> FoundScript{"Found?"}
FoundScript --> |Yes| EmitRoot
FoundScript --> |No| FailNotFound["Fail: not found"]
```

**Diagram sources**
- [scripts/resolve-plugin-root.sh:76-136](file://fractal-agentic/scripts/resolve-plugin-root.sh#L76-L136)

**Section sources**
- [scripts/resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)

### Capability Lanes and TOML Pins
- Routine implementer: bounded, fully specified work under an active boss.
- Complex implementer: context-heavy or higher-risk work under an active boss.
- Fresh reviewer: read-only final review with ship|fix-first|rethink verdict.
- Fields include name, description, model, model_reasoning_effort, and sandbox_mode (reviewer).

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
class FreshReviewer {
+string name
+string description
+string model
+string model_reasoning_effort
+string sandbox_mode
+string developer_instructions
}
```

**Diagram sources**
- [agents/fractal-agentic-routine-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-routine-implementer.toml#L1-L19)
- [agents/fractal-agentic-complex-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-complex-implementer.toml#L1-L19)
- [agents/fractal-agentic-fresh-reviewer.toml:1-20](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml#L1-L20)

**Section sources**
- [agents/fractal-agentic-routine-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-routine-implementer.toml#L1-L19)
- [agents/fractal-agentic-complex-implementer.toml:1-19](file://fractal-agentic/agents/fractal-agentic-complex-implementer.toml#L1-L19)
- [agents/fractal-agentic-fresh-reviewer.toml:1-20](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml#L1-L20)

### Plugin Configuration and Host Shims
- plugin.json defines display metadata, default prompts, and skills path.
- Host shims (CLAUDE.md, GEMINI.md, KIMI.md, OPENCODE.md) provide adapter behavior for specific hosts.
- package.json exposes CLI entry and scripts for verification and health checks.

**Section sources**
- [plugin.json:11-20](file://fractal-agentic/plugin.json#L11-L20)
- [package.json:1-34](file://fractal-agentic/package.json#L1-L34)

### Hook Profiles and Session Automation
- hooks/profiles.json defines minimal, standard, and strict profiles that compose lifecycle hooks.
- Profiles include pre-bash safety, config protection, session start/handoff detection, periodic essays, and stop hooks for quality and console warnings.

**Section sources**
- [hooks/profiles.json:1-38](file://fractal-agentic/hooks/profiles.json#L1-L38)

### Installation and Verification
- install-agents.sh installs three TOML templates into $CODEX_HOME/agents or ~/.codex/agents without modifying config files.
- verify.sh validates JSON manifests, runs armory check, enforces non-blocking policy, validates TOML pins, checks role contracts, ensures command frontmatter, tests installer idempotency and conflict refusal, and inspects runtime data safely.
- check-armory.sh asserts presence of critical files and skills, warns on missing critical skills, and validates openai.yaml shape.

```mermaid
flowchart TD
A["Run verify.sh"] --> B["Validate JSON manifests"]
B --> C["Run check-armory.sh"]
C --> D["Run non-blocking policy check"]
D --> E["Validate TOML pins and role contracts"]
E --> F["Test installer: clean install, idempotency, conflicts"]
F --> G["Inspect runtime sessions safely (if jq present)"]
G --> H["Report PASS/FAIL"]
```

**Diagram sources**
- [scripts/verify.sh:92-143](file://fractal-agentic/scripts/verify.sh#L92-L143)
- [scripts/verify.sh:173-226](file://fractal-agentic/scripts/verify.sh#L173-L226)
- [scripts/check-armory.sh:84-106](file://fractal-agentic/scripts/check-armory.sh#L84-L106)

**Section sources**
- [scripts/install-agents.sh:1-180](file://fractal-agentic/scripts/install-agents.sh#L1-L180)
- [scripts/verify.sh:1-274](file://fractal-agentic/scripts/verify.sh#L1-L274)
- [scripts/check-armory.sh:1-143](file://fractal-agentic/scripts/check-armory.sh#L1-L143)

### Security, Authentication, and Access Control
- Fresh reviewer uses sandbox_mode=read-only to enforce read-only constraints during final review.
- Installer never overwrites differing destination files and does not mutate config.toml.
- Runtime inspector extracts only allowlisted fields and refuses invalid thread IDs or zero-match cases.
- Hooks include pre-edit config protection and bash safety measures.

**Section sources**
- [agents/fractal-agentic-fresh-reviewer.toml:1-20](file://fractal-agentic/agents/fractal-agentic-fresh-reviewer.toml#L1-L20)
- [scripts/install-agents.sh:127-163](file://fractal-agentic/scripts/install-agents.sh#L127-L163)
- [scripts/verify.sh:234-273](file://fractal-agentic/scripts/verify.sh#L234-L273)
- [hooks/profiles.json:1-38](file://fractal-agentic/hooks/profiles.json#L1-L38)

### Debugging, Logging, and Diagnostics
- Use inspect-agent-runtime.sh to extract safe routing information from a subagent thread ID when available.
- verify.sh includes runtime inspector tests to ensure safe extraction and refusal of invalid inputs.
- TROUBLESHOOTING.md provides quick links and a 30-second health checklist.

**Section sources**
- [scripts/verify.sh:234-273](file://fractal-agentic/scripts/verify.sh#L234-L273)
- [TROUBLESHOOTING.md:17-27](file://fractal-agentic/TROUBLESHOOTING.md#L17-L27)

### Common Configuration Scenarios
- One-time setup:
  - Set FRACTAL_AGENTIC_ROOT to the plugin root.
  - Run install-agents.sh to install capability TOML pins.
  - Confirm with check-armory.sh and verify.sh.
- Per-project auto-use:
  - Paste the AGENTS snippet into the project’s AGENTS.md.
  - Ensure resolve-plugin-root.sh succeeds from the project directory.
- Profile selection:
  - Choose minimal, standard, or strict in hooks/profiles.json based on desired safety and automation level.
- Stack defaults:
  - Detect Svelte, React, Vue, Flutter, Rust, or Tauri from manifests and extensions; adjust boss mappings accordingly.

**Section sources**
- [README.md:143-168](file://fractal-agentic/README.md#L143-L168)
- [scripts/resolve-plugin-root.sh:76-136](file://fractal-agentic/scripts/resolve-plugin-root.sh#L76-L136)
- [hooks/profiles.json:1-38](file://fractal-agentic/hooks/profiles.json#L1-L38)
- [AGENTS.md:54-61](file://fractal-agentic/AGENTS.md#L54-L61)

### Performance Considerations
- Prefer routine implementer for bounded tasks to reduce reasoning overhead.
- Use complex implementer only when necessary due to higher model effort.
- Keep capability_mode degraded when pins are absent to avoid blocking product work.
- Minimize hook complexity for faster session startup; choose minimal profile where appropriate.

[No sources needed since this section provides general guidance]

## Dependency Analysis
The following diagram shows key dependencies among configuration and runtime components.

```mermaid
graph TB
R["resolve-plugin-root.sh"] --> P["plugin.json"]
R --> A["AGENTS.md"]
V["verify.sh"] --> I["install-agents.sh"]
V --> C["check-armory.sh"]
V --> O["openai.yaml"]
V --> M["role-contracts.md"]
V --> S["SKILL.md"]
I --> T1["routine-implementer.toml"]
I --> T2["complex-implementer.toml"]
I --> T3["fresh-reviewer.toml"]
H["hooks/profiles.json"] --> Hooks["Hook Scripts"]
P --> UI["Default Prompts"]
```

**Diagram sources**
- [scripts/resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [scripts/verify.sh:1-274](file://fractal-agentic/scripts/verify.sh#L1-L274)
- [scripts/install-agents.sh:1-180](file://fractal-agentic/scripts/install-agents.sh#L1-L180)
- [scripts/check-armory.sh:1-143](file://fractal-agentic/scripts/check-armory.sh#L1-L143)
- [hooks/profiles.json:1-38](file://fractal-agentic/hooks/profiles.json#L1-L38)
- [plugin.json:11-20](file://fractal-agentic/plugin.json#L11-L20)

**Section sources**
- [scripts/verify.sh:1-274](file://fractal-agentic/scripts/verify.sh#L1-L274)
- [scripts/check-armory.sh:1-143](file://fractal-agentic/scripts/check-armory.sh#L1-L143)

## Performance Considerations
- Use the least capable lane sufficient for the task to minimize cost and latency.
- Avoid unnecessary hook execution by selecting minimal profiles for fast iteration.
- Keep skills vendored locally to prevent network or symlink delays.
- Defer heavy diagnostics (runtime inspector) until needed.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Health checks:
  - Resolve plugin root: export FRACTAL_AGENTIC_ROOT and run resolve-plugin-root.sh.
  - Armory health: run check-armory.sh.
  - Full verification: run verify.sh.
- Common issues:
  - Spawn types missing: install capability TOMLs and start a new task.
  - Installer conflict: resolve differing destination files deliberately; installer will not overwrite.
  - Wrong stack defaults: re-read router and active boss stack gate; monorepo default is Svelte.
  - Missing skill: confirm SKILL.md exists under skills/<id>/; all skills are vendored locally.

**Section sources**
- [TROUBLESHOOTING.md:17-27](file://fractal-agentic/TROUBLESHOOTING.md#L17-L27)
- [scripts/install-agents.sh:127-163](file://fractal-agentic/scripts/install-agents.sh#L127-L163)
- [scripts/check-armory.sh:84-106](file://fractal-agentic/scripts/check-armory.sh#L84-L106)

## Conclusion
Fractal Agentic provides a robust, host-agnostic agent configuration system centered on a clear startup router, strict authority precedence, and a non-blocking capability policy. By using environment variables, TOML pins, hook profiles, and verification scripts, teams can tailor the system to their stack and security needs while maintaining reliable delivery through orchestration and review gates.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Quick Reference: Environment and Commands
- FRACTAL_AGENTIC_ROOT: Path to plugin root.
- install-agents.sh [--target-dir <path>] [--check]: Install or validate capability TOML pins.
- check-armory.sh: Assert critical assets and skills.
- verify.sh: Full local verification suite.
- resolve-plugin-root.sh [--from-cwd]: Resolve plugin root from env/cwd/script location.

**Section sources**
- [scripts/resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [scripts/install-agents.sh:1-180](file://fractal-agentic/scripts/install-agents.sh#L1-L180)
- [scripts/check-armory.sh:1-143](file://fractal-agentic/scripts/check-armory.sh#L1-L143)
- [scripts/verify.sh:1-274](file://fractal-agentic/scripts/verify.sh#L1-L274)