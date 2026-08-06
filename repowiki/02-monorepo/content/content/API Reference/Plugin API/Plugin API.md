# Plugin API

<cite>
**Referenced Files in This Document**
- [plugin.json](file://fractal-agentic/plugin.json)
- [.claude-plugin/plugin.json](file://fractal-agentic/.claude-plugin/plugin.json)
- [.claude-plugin/marketplace.json](file://fractal-agentic/.claude-plugin/marketplace.json)
- [PLUGIN_SCHEMA_NOTES.md](file://fractal-agentic/.claude-plugin/PLUGIN_SCHEMA_NOTES.md)
- [hooks.claude.json](file://fractal-agentic/hooks/hooks.claude.json)
- [hooks-installed.json](file://fractal-agentic/.fractal-agentic/hooks-installed.json)
- [resolve-plugin-root.sh](file://fractal-agentic/scripts/resolve-plugin-root.sh)
- [verify.sh](file://fractal-agentic/scripts/verify.sh)
- [check-nonblocking-policy.sh](file://fractal-agentic/scripts/check-nonblocking-policy.sh)
- [01-getting-started.md](file://fractal-agentic/docs/01-getting-started.md)
- [02-install.md](file://fractal-agentic/docs/02-install.md)
- [troubleshooting.md](file://fractal-agentic/docs/troubleshooting.md)
- [capability-mode.md](file://fractal-agentic/skills/boss-orchestration/references/capability-mode.md)
- [DEGRADATION.md](file://fractal-agentic/docs/DEGRADATION.md)
- [README.md (hooks)](file://fractal-agentic/hooks/README.md)
- [lib.js (hooks)](file://fractal-agentic/hooks/scripts/lib.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document defines the plugin API for host platform integration and marketplace deployment. It specifies the plugin manifest schema, capability declarations, dependency management, host discovery mechanisms, version compatibility checks, installation procedures, marketplace integration patterns, lifecycle methods, event handling, communication protocols, schemas, security considerations, sandboxing requirements, performance strategies, and practical development/deployment workflows. The content is grounded in the repository’s manifests, hooks configuration, installer scripts, and documentation.

## Project Structure
The installable unit is the plugin directory containing:
- Root manifest with metadata and capability bindings
- Host-specific manifests for Claude Code and Codex
- Marketplace catalog entries
- Optional hooks configuration and scripts
- Scripts to resolve plugin root and verify integrity

```mermaid
graph TB
subgraph "Plugin Root"
A["plugin.json"]
B[".claude-plugin/plugin.json"]
C[".claude-plugin/marketplace.json"]
D["hooks/hooks.claude.json"]
E["scripts/resolve-plugin-root.sh"]
F["scripts/verify.sh"]
end
subgraph "Hosts"
H1["Claude Code"]
H2["Codex"]
H3["Antigravity / Generic"]
end
A --> H3
B --> H1
C --> H1
D --> H1
E --> A
F --> A
```

**Diagram sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/plugin.json:1-20](file://fractal-agentic/.claude-plugin/plugin.json#L1-L20)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [verify.sh:67-101](file://fractal-agentic/scripts/verify.sh#L67-L101)

**Section sources**
- [02-install.md:59-69](file://fractal-agentic/docs/02-install.md#L59-L69)
- [CUSTOMIZE.md:49-77](file://fractal-agentic/CUSTOMIZE.md#L49-L77)

## Core Components
- Plugin Manifest (root): Declares name, version, description, author, homepage, repository, license, interface display fields, skills path, and keywords.
- Host-specific Manifests: Lean identity files for Claude Code and Codex; keep minimal to avoid validator rejections.
- Marketplace Catalog: Lists plugins with source paths, descriptions, versions, and authors for host marketplaces.
- Hooks Configuration: Event-driven automations mapped to host hook events with command-based handlers and timeouts.
- Root Resolution Script: Discovers the plugin root from environment, cwd walk-up, or script location.
- Verification Script: Validates JSON manifests and critical assets exist.

Key responsibilities:
- Metadata and UI presentation via manifests
- Capability exposure via skills binding and agent pins
- Lifecycle and safety via hooks
- Discovery and validation via scripts

**Section sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/plugin.json:1-20](file://fractal-agentic/.claude-plugin/plugin.json#L1-L20)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [PLUGIN_SCHEMA_NOTES.md:1-22](file://fractal-agentic/.claude-plugin/PLUGIN_SCHEMA_NOTES.md#L1-L22)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [verify.sh:67-101](file://fractal-agentic/scripts/verify.sh#L67-L101)

## Architecture Overview
The plugin integrates with multiple hosts through distinct manifests and a shared runtime. Discovery uses environment variables and filesystem heuristics. Installation can be performed via NPX or host marketplace commands. Hooks provide optional session automation and safety gates.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "npx fractal-agentic"
participant Host as "Host CLI (Claude/Codex/Antigravity)"
participant FS as "Filesystem"
participant Hooks as "Hooks Engine"
User->>CLI : install [--target]
CLI->>FS : write plugin root + manifests
CLI-->>Host : register plugin (marketplace add/install)
Host->>FS : read .claude-plugin/plugin.json or marketplace.json
Host->>FS : discover skills path from plugin.json
User->>Host : start session/task
Host->>Hooks : load hooks.claude.json
Hooks-->>Host : PreToolUse/SessionStart/Stop callbacks
Host-->>User : commands and capabilities available
```

**Diagram sources**
- [01-getting-started.md:1-59](file://fractal-agentic/docs/01-getting-started.md#L1-L59)
- [02-install.md:1-100](file://fractal-agentic/docs/02-install.md#L1-L100)
- [.claude-plugin/plugin.json:1-20](file://fractal-agentic/.claude-plugin/plugin.json#L1-L20)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)

## Detailed Component Analysis

### Plugin Manifest Schema
Root manifest fields:
- name: string (required)
- version: string (required)
- description: string
- author: object { name: string }
- homepage: string
- repository: string
- license: string
- interface: object { displayName, shortDescription, longDescription, defaultPrompt[] }
- skills: string (path to skills directory)
- keywords: string[]

Host-specific manifests should remain lean to avoid unknown field rejection.

```mermaid
classDiagram
class PluginManifest {
+string name
+string version
+string description
+Author author
+string homepage
+string repository
+string license
+Interface interface
+string skills
+string[] keywords
}
class Author {
+string name
}
class Interface {
+string displayName
+string shortDescription
+string longDescription
+string[] defaultPrompt
}
PluginManifest --> Author : "has"
PluginManifest --> Interface : "has"
```

**Diagram sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [PLUGIN_SCHEMA_NOTES.md:1-22](file://fractal-agentic/.claude-plugin/PLUGIN_SCHEMA_NOTES.md#L1-L22)

**Section sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/plugin.json:1-20](file://fractal-agentic/.claude-plugin/plugin.json#L1-L20)
- [PLUGIN_SCHEMA_NOTES.md:1-22](file://fractal-agentic/.claude-plugin/PLUGIN_SCHEMA_NOTES.md#L1-L22)

### Marketplace Integration
Marketplace catalog structure includes:
- name: string
- owner: object { name: string }
- description: string
- plugins: array of { name, source, description, version, author }

Source points to the plugin directory. Hosts use this to list and install plugins.

```mermaid
flowchart TD
A["marketplace.json"] --> B["plugins[]"]
B --> C["name"]
B --> D["source"]
B --> E["description"]
B --> F["version"]
B --> G["author"]
```

**Diagram sources**
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)

**Section sources**
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [02-install.md:59-69](file://fractal-agentic/docs/02-install.md#L59-L69)

### Host Discovery Mechanisms
Discovery algorithm:
- Check explicit environment variable for plugin root
- Walk up from current working directory looking for known layouts
- Prefer monorepo root’s plugin/ child if present
- Validate presence of required files and correct name
- Fallback to script install location when applicable

```mermaid
flowchart TD
Start(["Entry"]) --> EnvCheck{"FRACTAL_AGENTIC_ROOT set?"}
EnvCheck --> |Yes| ValidateEnv["Validate plugin root"]
ValidateEnv --> ValidEnv{"Valid?"}
ValidEnv --> |Yes| EmitEnv["Emit absolute path"]
ValidEnv --> |No| CwdWalk["Walk up from cwd"]
EnvCheck --> |No| CwdWalk
CwdWalk --> FoundCwd{"Found valid root?"}
FoundCwd --> |Yes| EmitCwd["Emit absolute path"]
FoundCwd --> |No| ScriptFallback["Use script dir parent"]
ScriptFallback --> EmitScript["Emit absolute path or fail"]
```

**Diagram sources**
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)

**Section sources**
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [01-getting-started.md:44-59](file://fractal-agentic/docs/01-getting-started.md#L44-L59)

### Version Compatibility and Capability Modes
Capability modes define how pinned agents are used versus degraded fallbacks:
- pinned/pinned_partial: prefer exposed types per role
- degraded: fall back to primary/general roles
- plugin_missing: continue under project defaults

Reporting includes mode, pin verification status, and layer coverage.

```mermaid
stateDiagram-v2
[*] --> Pinned : "pins exposed"
Pinned --> Degraded : "missing roles"
Degraded --> PluginMissing : "no plugin"
PluginMissing --> Degraded : "plugin installed later"
Degraded --> Pinned : "new task discovers pins"
```

**Diagram sources**
- [capability-mode.md:40-74](file://fractal-agentic/skills/boss-orchestration/references/capability-mode.md#L40-L74)

**Section sources**
- [capability-mode.md:40-74](file://fractal-agentic/skills/boss-orchestration/references/capability-mode.md#L40-L74)
- [DEGRADATION.md:80-114](file://fractal-agentic/docs/DEGRADATION.md#L80-L114)

### Installation Procedures
Methods:
- NPX installer auto-detects hosts and installs
- Host marketplace commands for Claude Code and Codex
- Manual checkout for development or host-neutral setup

Post-install steps include setting FRACTAL_AGENTIC_ROOT, verifying root resolution, and integrating AGENTS snippet into project.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant NPM as "npx fractal-agentic"
participant Host as "Host CLI"
participant FS as "Filesystem"
Dev->>NPM : install [--target|--project]
NPM->>FS : create plugin root + manifests
NPM-->>Host : register plugin (if supported)
Dev->>FS : add AGENTS snippet to project
Dev->>NPM : resolve-plugin-root.sh
NPM-->>Dev : print absolute plugin root
```

**Diagram sources**
- [01-getting-started.md:1-59](file://fractal-agentic/docs/01-getting-started.md#L1-L59)
- [02-install.md:1-100](file://fractal-agentic/docs/02-install.md#L1-L100)
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)

**Section sources**
- [01-getting-started.md:1-59](file://fractal-agentic/docs/01-getting-started.md#L1-L59)
- [02-install.md:1-100](file://fractal-agentic/docs/02-install.md#L1-L100)

### Hooks and Lifecycle Events
Hooks are optional and profile-gated:
- Profiles: minimal, standard, strict
- Events: PreToolUse, SessionStart, Stop
- Handlers: command-based Node scripts with timeouts
- Environment controls: FRACTAL_HOOK_PROFILE, FRACTAL_DISABLED_HOOKS, FRACTAL_GATEGUARD

Installation writes target-specific configurations and materialized settings.

```mermaid
flowchart TD
A["hooks.claude.json"] --> B["PreToolUse"]
A --> C["SessionStart"]
A --> D["Stop"]
B --> E["command handlers"]
C --> E
D --> E
E --> F["Node scripts with timeouts"]
```

**Diagram sources**
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [hooks-installed.json:1-9](file://fractal-agentic/.fractal-agentic/hooks-installed.json#L1-L9)
- [README.md (hooks):1-124](file://fractal-agentic/hooks/README.md#L1-L124)

**Section sources**
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [hooks-installed.json:1-9](file://fractal-agentic/.fractal-agentic/.fractal-agentic/hooks-installed.json#L1-L9)
- [README.md (hooks):1-124](file://fractal-agentic/hooks/README.md#L1-L124)
- [lib.js (hooks):1-59](file://fractal-agentic/hooks/scripts/lib.js#L1-L59)

### Communication Protocols
- WebSocket-based server for interactive sessions within skills (e.g., brainstorming), with message parsing, event logging, and broadcast.
- Command execution via Node scripts invoked by hooks with bounded stdin size and JSON input parsing.

```mermaid
sequenceDiagram
participant Client as "Client"
participant WS as "WebSocket Server"
participant Logger as "Event Logger"
Client->>WS : connect
Client->>WS : send JSON event
WS->>Logger : append event file
WS-->>Client : broadcast responses
```

**Diagram sources**
- [server.cjs:540-569](file://fractal-agentic/skills/brainstorming/scripts/server.cjs#L540-L569)
- [server.cjs:711-729](file://fractal-agentic/skills/brainstorming/scripts/server.cjs#L711-L729)

**Section sources**
- [server.cjs:540-569](file://fractal-agentic/skills/brainstorming/scripts/server.cjs#L540-L569)
- [server.cjs:711-729](file://fractal-agentic/skills/brainstorming/scripts/server.cjs#L711-L729)

### Security Considerations and Sandboxing
- Non-blocking policy ensures implementation continues even if pins/tools are missing; only irreversible harm is blocked.
- Hook profiles enforce safety boundaries (bash safety, config protection, no-verify block).
- Input limits protect against oversized stdin in hook scripts.
- Strict mode adds fact-force gating for first edits.

```mermaid
flowchart TD
A["Hook Trigger"] --> B{"Profile"}
B --> |minimal| C["Bash safety + config protection"]
B --> |standard| D["+ quality batch + console warn"]
B --> |strict| E["+ gateguard first-edit deny"]
C --> F["Command execution with timeout"]
D --> F
E --> F
```

**Diagram sources**
- [check-nonblocking-policy.sh:32-74](file://fractal-agentic/scripts/check-nonblocking-policy.sh#L32-L74)
- [README.md (hooks):1-124](file://fractal-agentic/hooks/README.md#L1-L124)
- [lib.js (hooks):1-59](file://fractal-agentic/hooks/scripts/lib.js#L1-L59)

**Section sources**
- [check-nonblocking-policy.sh:32-74](file://fractal-agentic/scripts/check-nonblocking-policy.sh#L32-L74)
- [README.md (hooks):1-124](file://fractal-agentic/hooks/README.md#L1-L124)
- [DEGRADATION.md:80-114](file://fractal-agentic/docs/DEGRADATION.md#L80-L114)

### Performance Optimization Strategies
- Progressive discovery keeps router compact and avoids monolithic references.
- Capability mode reporting reduces repeated preflight overhead after initial detection.
- Hooks run with bounded timeouts and minimal work unless expanded by profiles.
- Use new tasks to refresh spawn type discovery rather than blocking current work.

**Section sources**
- [check-progressive-discovery.sh:1-191](file://fractal-agentic/scripts/check-progressive-discovery.sh#L1-L191)
- [capability-mode.md:40-74](file://fractal-agentic/skills/boss-orchestration/references/capability-mode.md#L40-L74)
- [DEGRADATION.md:80-114](file://fractal-agentic/docs/DEGRADATION.md#L80-L114)

## Dependency Analysis
Dependencies between components:
- Root manifest binds skills path and metadata consumed by hosts
- Marketplace catalog depends on plugin source path and metadata
- Hooks depend on Node scripts and environment variables
- Root resolution depends on filesystem layout and environment
- Verification depends on JSON validity and asset presence

```mermaid
graph LR
M["plugin.json"] --> S["skills/"]
MP[".claude-plugin/marketplace.json"] --> M
H["hooks.claude.json"] --> HS["hooks/scripts/*"]
R["resolve-plugin-root.sh"] --> M
V["verify.sh"] --> M
```

**Diagram sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [verify.sh:67-101](file://fractal-agentic/scripts/verify.sh#L67-L101)

**Section sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [resolve-plugin-root.sh:1-140](file://fractal-agentic/scripts/resolve-plugin-root.sh#L1-L140)
- [verify.sh:67-101](file://fractal-agentic/scripts/verify.sh#L67-L101)

## Performance Considerations
- Keep manifests minimal to reduce parsing overhead.
- Avoid heavy operations in hooks; prefer lightweight checks and warnings.
- Use capability mode to minimize repeated discovery and preflight.
- Ensure router remains compact to speed up boss selection.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing marketplace manifest: ensure sparse checkout includes both .agents/plugins and plugin directories
- Commands not visible: point host at plugin directory where host-specific manifest resides
- Hooks do nothing: ensure host registers hooks and environment variables are set
- Pins not exposed: disk OK but session needs new task to discover types
- Wrong capability_mode: follow degradation guidance and report mode

**Section sources**
- [troubleshooting.md:39-76](file://fractal-agentic/docs/troubleshooting.md#L39-L76)
- [02-install.md:59-69](file://fractal-agentic/docs/02-install.md#L59-L69)
- [DEGRADATION.md:80-114](file://fractal-agentic/docs/DEGRADATION.md#L80-L114)

## Conclusion
The plugin API provides a robust, multi-host integration model with clear manifest schemas, marketplace catalogs, optional hooks for lifecycle and safety, and resilient discovery/validation mechanisms. By adhering to non-blocking policies, progressive discovery, and capability modes, developers can deliver reliable, secure, and performant plugins across diverse environments.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Appendix A: Complete Schema Definitions
- Plugin Manifest: name, version, description, author, homepage, repository, license, interface, skills, keywords
- Marketplace Catalog: name, owner, description, plugins[] with name, source, description, version, author
- Hooks Configuration: description, hooks mapping event names to matchers and command handlers with timeouts
- Installed Hooks State: version, target, profile, plugin_root, claude_settings, materialized

**Section sources**
- [plugin.json:1-31](file://fractal-agentic/plugin.json#L1-L31)
- [.claude-plugin/marketplace.json:1-19](file://fractal-agentic/.claude-plugin/marketplace.json#L1-L19)
- [hooks.claude.json:1-87](file://fractal-agentic/hooks/hooks.claude.json#L1-L87)
- [hooks-installed.json:1-9](file://fractal-agentic/.fractal-agentic/hooks-installed.json#L1-L9)

### Appendix B: Practical Development and Deployment Workflow
- Initialize plugin root and manifests
- Add skills and commands
- Configure hooks with desired profile
- Install via NPX or host marketplace
- Verify root resolution and integrity
- Test capability modes and degradation behavior
- Publish marketplace catalog and update versions

**Section sources**
- [01-getting-started.md:1-59](file://fractal-agentic/docs/01-getting-started.md#L1-L59)
- [02-install.md:1-100](file://fractal-agentic/docs/02-install.md#L1-L100)
- [verify.sh:67-101](file://fractal-agentic/scripts/verify.sh#L67-L101)