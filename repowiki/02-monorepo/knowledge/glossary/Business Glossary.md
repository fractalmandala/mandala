---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### boss
- Definition：One of seven domain-specific playbooks (Design, Svelte, Code, Agent, Creator, Workflow, Meta) that an orchestrator selects exactly one of to handle a task. Each boss has its own INDEX.md playbook defining mission, stack rules, mapped agents/skills/commands, phases, verification defaults, and handoffs.
- Aliases：domain boss、boss playbook

### armory
- Definition：The shared collection of vendored skills (167), agents (33), and commands (59) organized per boss, plus the shared release armory (/quality-gate, /security-scan, /code-review, /santa-loop) that any boss can invoke during delivery.
- Aliases：shared armory、release armory

### capability lane
- Definition：Execution mode selected by the orchestrator: routine-implementer, complex-implementer, or fresh-reviewer. These pins determine how aggressively verification and review are performed during delivery.
- Aliases：lane、spawn pin

### verdict
- Definition：The final decision from the orchestrator's review phase: ship | fix-first | rethink. One verdict per delivery cycle; the primary session owns the real diff and verification evidence.
- Aliases：review verdict

### handoff
- Definition：A controlled transition between bosses where the active boss passes work to another boss (e.g., Svelte → Code before security gates, Creator → Agent for in-product AI). Each handoff preserves evidence and requires reading only the new boss's playbook.
- Aliases：boss handoff

### DEGRADATION.md
- Definition：Non-blocking policy document that defines capability_mode levels (pinned → plugin_missing) ensuring project work never blocks even when skills/agents/hooks are missing. Content/install/session layers degrade gracefully.
- Aliases：degradation policy、non-blocking rule

### trivial exemption
- Definition：Startup shortcut: single-sentence answers, pure explanations with no repository changes, or simple 'what is X?' questions bypass loading any boss, runtime, or inventories and stop reading immediately.
- Aliases：exemption

### stack and surface gate
- Definition：Auto-detection of technology stack (Svelte, React, Vue, Flutter, Rust, Tauri) from package manifests and file extensions to load appropriate reviewers. Surface-specific gates define deployment targets (Studio, public site, package docs, mobile, product harness).
- Aliases：stack detection、surface gate
