---
title: Skill Management Commands
description: **Referenced Files in This Document** `fractal-agentic/commands/skill-create.md` `fractal-agentic/commands/skill-health.md` `fractal-agentic/commands/learn.md` `fractal-agentic/commands/learn-eval.md`…
type: item
---
<cite>
**Referenced Files in This Document**
- `fractal-agentic/commands/skill-create.md`
- `fractal-agentic/commands/skill-health.md`
- `fractal-agentic/commands/learn.md`
- `fractal-agentic/commands/learn-eval.md`
- `fractal-agentic/commands/prune.md`
- `fractal-agentic/commands/promote.md`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py`
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
This document explains the skill management commands in Fractal Agentic that help you create, evaluate, and maintain skills and instincts across projects. It covers:
- skill-create: Analyze local git history to extract coding patterns and generate SKILL.md files.
- skill-health: Show a skill portfolio health dashboard with analytics.
- learn and learn-eval: Extract reusable patterns from sessions with self-evaluation before saving.
- prune: Delete pending instincts older than 30 days (configurable).
- promote: Move project-scoped instincts to global scope.

These commands enable a practical skill lifecycle: discover patterns, capture them as skills or instincts, evaluate quality, manage scope, and keep your knowledge base healthy over time.

## Project Structure
The relevant command definitions are Markdown-based instructions under the commands directory. The continuous learning subsystem is implemented by a Python CLI for managing instincts across projects and globally.

```mermaid
graph TB
subgraph "Commands"
A["skill-create.md"]
B["skill-health.md"]
C["learn.md"]
D["learn-eval.md"]
E["prune.md"]
F["promote.md"]
end
subgraph "Continuous Learning v2"
G["instinct-cli.py"]
end
A --> |"Generates SKILL.md"| H["skills/<name>/SKILL.md"]
B --> |"Runs dashboard script"| I["skills-health.js (external)"]
C --> |"Saves learned pattern"| J["~/.claude/skills/learned/*.md"]
D --> |"Quality-gated save"| J
E --> |"TTL pruning"| G
F --> |"Promote project->global"| G
```

**Diagram sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/learn.md#L1-L79`
- `fractal-agentic/commands/learn-eval.md#L1-L120`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

**Section sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/learn.md#L1-L79`
- `fractal-agentic/commands/learn-eval.md#L1-L120`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

## Core Components
- skill-create: Parses git history, detects patterns, and generates SKILL.md files. Optionally produces instincts for continuous-learning-v2.
- skill-health: Executes a dashboard script to visualize success rates, failure clustering, pending amendments, and version history.
- learn: Captures session insights into a structured markdown file under a learned directory.
- learn-eval: Adds a quality gate and save-location decision (Global vs Project) before writing any skill file.
- prune: Removes pending instincts older than a TTL threshold (default 30 days).
- promote: Moves project-scoped instincts to global scope based on cross-project usage and confidence thresholds.

**Section sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/learn.md#L1-L79`
- `fractal-agentic/commands/learn-eval.md#L1-L120`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

## Architecture Overview
The skill management system combines Markdown-driven command specifications with a Python-backed instinct lifecycle manager.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "Fractal Agentic CLI"
participant Git as "Git History"
participant SkillGen as "Skill Creator"
participant Dashboard as "Skills Health Script"
participant InstinctCLI as "instinct-cli.py"
User->>CLI : /skill-create
CLI->>Git : Parse commits and diffs
Git-->>CLI : Commit metadata and changed files
CLI->>SkillGen : Detect patterns and generate SKILL.md
SkillGen-->>CLI : Generated skill files
User->>CLI : /skill-health
CLI->>Dashboard : Run dashboard (--dashboard/--panel/--json)
Dashboard-->>CLI : Analytics output
User->>CLI : /learn or /learn-eval
CLI->>CLI : Extract patterns and evaluate quality
CLI-->>User : Save location decision and draft
CLI->>User : Confirm and write learned skill
User->>CLI : /prune
CLI->>InstinctCLI : Prune pending instincts (TTL)
InstinctCLI-->>CLI : Deletion summary
User->>CLI : /promote
CLI->>InstinctCLI : Promote project->global instincts
InstinctCLI-->>CLI : Promotion results
```

**Diagram sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/learn.md#L1-L79`
- `fractal-agentic/commands/learn-eval.md#L1-L120`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

## Detailed Component Analysis

### skill-create: Local Git Pattern Extraction and SKILL.md Generation
- Purpose: Analyze repository history to detect commit conventions, co-changed files, workflow sequences, architecture, and testing patterns; then produce SKILL.md files suitable for agents.
- Inputs: Git repository root; optional flags like commit count, output directory, and whether to also generate instincts.
- Outputs: One or more SKILL.md files capturing detected patterns; optionally instincts for continuous-learning-v2.
- Key steps:
  - Gather recent commits and file changes.
  - Identify recurring patterns via heuristics and regex on commit messages and file paths.
  - Generate valid SKILL.md frontmatter and content sections.
  - Optionally emit YAML-like instincts with triggers and confidence.

```mermaid
flowchart TD
Start(["Start /skill-create"]) --> Gather["Gather Git Data<br/>commits, file changes, messages"]
Gather --> Detect["Detect Patterns<br/>commit conventions, co-changes,<br/>workflows, architecture, tests"]
Detect --> Generate["Generate SKILL.md<br/>frontmatter + sections"]
Generate --> Optional{"--instincts?"}
Optional --> |Yes| EmitInstincts["Emit instincts for continuous-learning-v2"]
Optional --> |No| Done(["Done"])
EmitInstincts --> Done
```

**Diagram sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`

**Section sources**
- `fractal-agentic/commands/skill-create.md#L1-L126`

### skill-health: Portfolio Health Dashboard
- Purpose: Provide a comprehensive view of skill performance and maintenance needs.
- Panels: Success rate sparklines (30d), failure pattern clustering, pending amendments, version history.
- Usage modes: Full dashboard, specific panel, machine-readable JSON.
- Implementation: Invokes an external Node script with environment resolution for ECC root.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "Fractal Agentic CLI"
participant Env as "Env Resolver"
participant Script as "skills-health.js"
User->>CLI : /skill-health [--panel failures] [--json]
CLI->>Env : Resolve ECC_ROOT
Env-->>CLI : Path to scripts
CLI->>Script : Execute with flags
Script-->>CLI : Dashboard output (text/json)
CLI-->>User : Display results
```

**Diagram sources**
- `fractal-agentic/commands/skill-health.md#L1-L55`

**Section sources**
- `fractal-agentic/commands/skill-health.md#L1-L55`

### learn: Session Pattern Capture
- Purpose: Extract reusable patterns from the current session and save them as candidate skills or guidance.
- Focus areas: Error resolutions, debugging techniques, workarounds, project-specific patterns.
- Output: Structured markdown saved under a learned directory.

```mermaid
flowchart TD
Start(["Run /learn"]) --> Review["Review session for patterns"]
Review --> Draft["Draft skill file<br/>Problem, Solution, Example, When to Use"]
Draft --> Confirm{"Confirm save?"}
Confirm --> |Yes| Save["Save to learned directory"]
Confirm --> |No| Abort["Abort"]
Save --> End(["Done"])
Abort --> End
```

**Diagram sources**
- `fractal-agentic/commands/learn.md#L1-L79`

**Section sources**
- `fractal-agentic/commands/learn.md#L1-L79`

### learn-eval: Quality-Gated Pattern Capture
- Purpose: Extend /learn with a quality gate, save-location decision (Global vs Project), and awareness of existing knowledge before saving.
- Process highlights:
  - Determine save location based on reusability across projects.
  - Perform checklist verification against existing skills and memory files.
  - Produce a holistic verdict: Save, Improve then Save, Absorb into existing, or Drop.
  - Follow verdict-specific confirmation flow and save accordingly.

```mermaid
flowchart TD
Start(["Run /learn-eval"]) --> Review["Identify valuable insight"]
Review --> Location{"Global or Project?"}
Location --> Global["~/.claude/skills/learned/"]
Location --> Project[".claude/skills/learned/"]
Global --> Checklist["Check overlap and uniqueness"]
Project --> Checklist
Checklist --> Verdict{"Verdict"}
Verdict --> |Save| ConfirmSave["Confirm and save"]
Verdict --> |Improve then Save| Improve["Present improvements and revised draft"]
Verdict --> |Absorb into X| Append["Propose append to existing skill"]
Verdict --> |Drop| Noop["No action needed"]
ConfirmSave --> End(["Done"])
Improve --> ReEval["Re-evaluate after one iteration"]
ReEval --> Verdict
Append --> ConfirmAppend["Confirm append"]
ConfirmAppend --> End
Noop --> End
```

**Diagram sources**
- `fractal-agentic/commands/learn-eval.md#L1-L120`

**Section sources**
- `fractal-agentic/commands/learn-eval.md#L1-L120`

### prune: Pending Instinct TTL Cleanup
- Purpose: Remove pending instincts older than a configurable TTL (default 30 days) that were never promoted.
- Behavior: Scans pending directories (global and per-project), parses creation dates, and deletes expired entries. Supports dry-run and quiet modes.

```mermaid
flowchart TD
Start(["Run /prune"]) --> Scan["Scan pending directories"]
Scan --> Parse["Parse created date (frontmatter or mtime)"]
Parse --> Age["Compute age in days"]
Age --> Expired{"age >= TTL?"}
Expired --> |Yes| Delete["Delete expired instinct"]
Expired --> |No| Keep["Keep instinct"]
Delete --> Summary["Print summary"]
Keep --> Summary
Summary --> End(["Done"])
```

**Diagram sources**
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1783-L1827`

**Section sources**
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1783-L1827`

### promote: Project-to-Global Instinct Promotion
- Purpose: Promote project-scoped instincts to global scope when they appear across multiple projects and meet confidence thresholds.
- Modes: Auto-detect candidates or promote a specific instinct ID; supports dry-run and force options.
- Outcome: Writes promoted instincts to global personal directory with metadata indicating promotion source and timestamp.

```mermaid
sequenceDiagram
participant User as "User"
participant CLI as "Fractal Agentic CLI"
participant InstinctCLI as "instinct-cli.py"
User->>CLI : /promote [--dry-run] [--force] [instinct-id]
CLI->>InstinctCLI : Detect project context
InstinctCLI->>InstinctCLI : Find cross-project candidates or validate specific ID
InstinctCLI-->>CLI : Candidate list or validation result
alt Specific ID provided
CLI->>InstinctCLI : Promote specific instinct
else Auto-detect
CLI->>InstinctCLI : Promote qualified candidates
end
InstinctCLI-->>CLI : Write global instinct(s) with metadata
CLI-->>User : Promotion summary
```

**Diagram sources**
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1275-L1413`

**Section sources**
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1275-L1413`

## Dependency Analysis
- Command definitions are Markdown documents that instruct how to run underlying tools.
- skill-health depends on an external Node script resolved via environment variables.
- prune and promote depend on the Python instinct CLI which manages project-scoped and global instincts.
- The instinct CLI handles project detection, registry updates, and file operations with safeguards (path validation, URL validation, locking where available).

```mermaid
graph LR
CMD["Command Docs (*.md)"] --> SKILL_CREATE["skill-create.md"]
CMD --> SKILL_HEALTH["skill-health.md"]
CMD --> LEARN["learn.md"]
CMD --> LEARN_EVAL["learn-eval.md"]
CMD --> PRUNE["prune.md"]
CMD --> PROMOTE["promote.md"]
SKILL_HEALTH --> NODE_SCRIPT["skills-health.js (Node)"]
PRUNE --> INSTINCT_CLI["instinct-cli.py"]
PROMOTE --> INSTINCT_CLI
INSTINCT_CLI --> PROJECT_REGISTRY["projects.json"]
INSTINCT_CLI --> GLOBAL_DIR["~/.local/share/ecc-homunculus/..."]
INSTINCT_CLI --> PROJECT_DIRS["PROJECTS_DIR/*/instincts/..."]
```

**Diagram sources**
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

**Section sources**
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/commands/prune.md#L1-L32`
- `fractal-agentic/commands/promote.md#L1-L42`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L1-L2044`

## Performance Considerations
- skill-create: Large repositories may require limiting commit counts to avoid long analysis times. Prefer targeted ranges for faster feedback.
- skill-health: Dashboard execution depends on the external script’s efficiency; use --panel to focus on specific metrics when possible.
- learn/learn-eval: Quality checks involve scanning existing skills and memory files; keep these directories organized to reduce search overhead.
- prune: TTL scanning is linear over pending files; batch runs periodically to avoid large sweeps.
- promote: Cross-project scanning reads registries and instinct files; ensure project registry is up to date to minimize redundant scans.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Environment resolution for skill-health: Ensure CLAUDE_PLUGIN_ROOT or ECC root is resolvable; verify the Node script path exists.
- Permission issues: Confirm read/write access to learned directories and homunculus storage paths.
- Invalid instinct IDs: Validate IDs conform to allowed characters and length constraints; avoid path traversal.
- Remote imports: Only HTTPS URLs are permitted; host must resolve to a public address.
- Conflicts during import/promotion: Deduplication rules apply; higher-confidence versions win, and stale files are cleaned up within the same scope.

**Section sources**
- `fractal-agentic/commands/skill-health.md#L1-L55`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L187-L233`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L147-L171`
- `fractal-agentic/skills/continuous-learning-v2/scripts/instinct-cli.py#L174-L184`

## Conclusion
Fractal Agentic’s skill management commands provide a cohesive workflow for turning session insights and repository patterns into durable, reusable knowledge. By combining skill generation, health monitoring, quality-gated capture, and instinct lifecycle management, teams can maintain a high-quality, evolving skill portfolio that scales across projects.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Practical Examples and Best Practices
- Create skills from git history:
  - Run the skill creator in the repository root; limit commits if necessary; choose an output directory; optionally generate instincts for continuous learning.
- Monitor skill health:
  - Use the full dashboard initially; drill into failure clustering to identify problem areas; export JSON for automation.
- Capture lessons:
  - After solving non-trivial problems, run the basic learn command; for higher fidelity, use learn-eval to decide scope and ensure uniqueness.
- Maintain instincts:
  - Periodically run prune to remove stale pending instincts; use promote to elevate widely applicable instincts to global scope.

[No sources needed since this section provides general guidance]