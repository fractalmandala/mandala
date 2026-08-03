---
name: docs-writer
description: 'Write, edit, and review technical documentation for repositories and products: clear voice, structure, procedures, accuracy against code, and link hygiene. Use for docs/, README, guides, how-tos, and markdown in the repo — not for marketing articles or pure literature reviews.'
---

# Docs writer

Technical writing and editing for software projects. Host- and model-agnostic. Prefer project contribution guides and house style when they exist; otherwise use the standards below.

## When to use

- Writing or rewriting files under `docs/`
- README, guides, tutorials, how-tos, concept pages
- Editing docs for accuracy after code changes
- Reviewing docs for clarity, structure, and consistency

## When not to use

- Long-form marketing / thought leadership → `content-research-writer` / `article-writing`
- Academic papers → `academic-research`
- Design-system visual craft → Design skills
- AI-tell cleanup only → `human-writing` (can chain)

## Phase 1 — Standards

### Voice and tone

- Address the reader as **you**. Active voice, present tense.
- Professional, direct, helpful — not marketing hype.
- Simple vocabulary; define jargon on first use.
- Standard US English unless the project standard says otherwise.
- Requirements: **must** vs recommendations: **recommend** (avoid vague “should” when a hard requirement is meant).
- Avoid “please,” anthropomorphism (“the server thinks”), and empty filler.

### Language

- Prefer “for example” / “that is” over Latin abbreviations in user-facing docs if house style is plain English.
- Serial comma; clear date formats (e.g. January 22, 2026).
- Prefer “lets you” over “allows you to.”
- Meaningful example names; avoid meaningless foo/bar unless illustrating placeholders.

### Formatting

- Every heading gets at least one overview sentence before lists or subheadings.
- Sentence case for headings unless house style uses title case.
- Numbered lists for sequences; bullets for unordered sets.
- **Bold** UI labels; `code` for files, commands, APIs, flags.
- Descriptive link text (no “click here”).
- Alt text for images; accessible heading hierarchy.
- Prefer wrapping prose near ~80 characters when the repo already does; don’t fight Prettier/MD formatters the project already runs.

### Structure

- **BLUF:** open with what the page is for and who it helps.
- Hierarchical headings that match the user journey.
- Procedures:
  - Introduce steps with a full sentence.
  - Start steps with imperative verbs.
  - Conditions before actions (“On the Settings page, open…”).
  - Mark optional steps.
- Use notes and warnings sparingly with clear labels.
- End with **Next steps** when a natural continuation exists.
- Skip decorative tables of contents unless the doc is very long and the project wants one.

## Phase 2 — Prepare

1. Clarify: new page vs edit; audience; success criteria.
2. Read the relevant code or config so docs match reality.
3. Read existing nearby docs for tone and cross-links.
4. Find inbound references if behavior or paths change.
5. Plan headings and file placement before large writes.

## Phase 3 — Execute

- Small edits: precise patches.
- New pages: match existing docs layout and navigation patterns.
- When reviewing existing docs: fix gaps vs code, structure, tone, consistency.

## Phase 4 — Verify

1. Accuracy against implementation.
2. Self-review for flow and grammar.
3. Links: new and affected existing links resolve.
4. Run the project’s doc/format scripts when the user wants (e.g. prettier, markdown lint) — don’t invent CI jobs that don’t exist.

## Project overrides

If the repo has `CONTRIBUTING.md`, docs style guides, or `docs/` README rules, **those win** over this skill on conflicts. Note the override when you follow it.

## Related skills

- `app-documenter` — area docs from SvelteKit surfaces
- `doc-frontmatter` — structured YAML frontmatter on docs
- `documentation-lookup` — third-party library docs via MCP
- `human-writing` — remove AI writing patterns
- `spec-writing` — implementation specs (not user-facing docs)

## Credit

**ASI** — https://github.com/plurigrid/asi
