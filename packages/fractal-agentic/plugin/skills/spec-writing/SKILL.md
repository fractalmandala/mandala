---
name: spec-writing
description: Use when documenting any feature, fix, or task — guides context collection and structured technical specification generation.
---

# Spec Writing

When invoked, announce: **"Using Spec Writing skill to generate technical specification(s)."**

---

## Phase 1 — Project Context Collection

**Goal:** Understand the project before asking any questions.

1. Use the Read tool to open `AGENTS.md` at the project root (if it exists). Extract: tech stack, architecture, conventions.
2. Use the Read tool to open `package.json`. Extract: `dependencies`, `devDependencies`, `scripts`.
3. Use the Read tool to open `tsconfig.json` (if it exists). Note whether TypeScript is in use.
4. Use the Glob tool with pattern `src/**` (or `app/**`, `lib/**` if `src/` doesn't exist) to list main source directories.
5. Run the context-reader script via Bash:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/specdev/scripts/context-reader.js" "${PWD}"
   ```
   Parse the JSON output. Store the result mentally as the **Project Context Card**.
6. Present the Project Context Card to the developer:
   ```
   Project Context Card
   ─────────────────────
   Tech Stack: [list]
   Architecture: [pattern]
   Main Modules: [list]
   External Integrations: [list]
   Test Framework: [name]
   ```
7. Ask: "Does this look correct? Any corrections before we continue?"
8. Wait for confirmation. Adjust if needed.

---

## Phase 2 — Business Rule Elicitation

**Goal:** Collect everything needed to write the spec.

Ask ONE question at a time. Wait for the developer's answer. Record it. Only then ask the next question. Do NOT ask multiple questions in a single message.

Ask these 8 questions in order:

1. "What feature or change do you need to implement?"
2. "What problem does this solve for the user or system?"
3. "Who uses this feature and what is the expected user journey?"
4. "What are the validation rules and constraints? (required fields, formats, limits, permissions)"
5. "What are the edge cases or error scenarios that must be handled?"
6. "Which systems, services, databases, or external APIs does this touch?"
7. "Are there performance, scalability, or security requirements?"
8. "What defines success? How will we know this feature is working correctly?"

After all 8 answers are collected, say: "Thank you. Generating your technical specification now."

---

## Phase 3 — Spec Generation

**Goal:** Produce the structured specification document.

1. Determine spec type:
   - If the feature involves an API endpoint → use `${CLAUDE_PLUGIN_ROOT}/skills/specdev/templates/api-spec.md`
   - Otherwise → use `${CLAUDE_PLUGIN_ROOT}/skills/specdev/templates/feature-spec.md`
2. Use the Read tool to load the chosen template.
3. Populate ALL 9 sections using information from Phases 1 and 2. Remove all `<!-- FILL: -->` markers. Replace them with real content.
4. Determine the save path:
   - Format: `specs/YYYY-MM-DD-<feature-slug>.md`
   - Where `<feature-slug>` is the feature name lowercased, spaces replaced with hyphens
   - Example: `specs/2026-05-11-user-jwt-authentication.md`
5. Use the Write tool to save the spec file at that path within the current project directory.
6. Confirm: "Spec saved to `specs/<filename>.md`."

---

## Phase 4 — Spec Validation

**Goal:** Verify spec completeness before showing to developer.

Run the validator via Bash:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/specdev/scripts/spec-validator.js" "${PWD}/specs/<filename>.md"
```

Parse the JSON output. Display results:

```
Spec Validation
───────────────────────────────
[✓] Feature Overview
[✓] Problem Being Solved
[✓] Business Rules
[✓] Impacted Files / Modules
[✓] Input / Output Contracts
[✓] Acceptance Criteria
[✓] Technical Risks
[✓] Suggested Implementation Plan
[✓] Validation Checklist

Score: 9/9 — Spec is complete.
```

If any section fails, fix it before proceeding.

---

## Phase 5 — Developer Approval Gate

**Goal:** Get explicit approval before allowing implementation.

1. Display the full spec contents using the Read tool.
2. Ask: "Please review the spec above. Do you approve it, or would you like any changes?"
3. If changes requested: make them, re-run validation, show again.
4. When approved: "Spec approved. Implementation may now begin. You can reference `specs/<filename>.md` in future sessions for context."
5. Offer (if superpowers plugin is installed): "Would you like me to use `superpowers:writing-plans` to create an implementation plan from this spec?"

---

## Available Sub-Commands

- `/specdev:generate-spec` — Full flow (Phases 1–5)
- `/specdev:analyze-context` — Context-only analysis, no business rule elicitation
- `/specdev:validate-spec [path]` — Validate an existing spec file

---

## Key Rules

- One question at a time in Phase 2. Never batch questions.
- Never skip phases. Order is mandatory.
- Always save the spec to disk before showing it.
- HARD-GATE blocks all implementation code until spec is approved.
- If context-reader.js fails (no Node.js, missing file), continue manually without it.
