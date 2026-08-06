# CLAUDE.md

This file provides guidance to the coding agent (claude.ai/code) when working with code in this repository.

## What this repository is

A collection of agent skills for building great product interfaces (typography, colors, UI polish), distributed two ways: via `npx skills add jakubkrehel/skills`, and as the agent plugin `interfaces` served by the marketplace in this same repository. It is documentation-only; there is no build, lint, or test tooling.

`.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` define the plugin and its marketplace. Both are named `interfaces`, so plugin users invoke skills as `/interfaces:better-interface` while skills-CLI users invoke `/better-interface`; keep the README's Use section covering both forms. Skills are discovered from `skills/` automatically, so adding a skill needs no manifest change. Bump `version` in `plugin.json` when you want plugin users to receive an update. Run `claude plugin validate .` and `claude plugin validate .claude-plugin/plugin.json` after touching either manifest.

## Structure

Each skill lives in `skills/<skill-name>/`:

- `SKILL.md` is the entry point. YAML frontmatter with `name` (matching the directory) and `description` (one-line summary, "Use when..." guidance, and a "Triggers on ..." keyword list that agents match against). The body: a short philosophy paragraph (one or two lines, with hand-off lines naming sibling skills that own adjacent topics), a **Quick Reference** table linking to reference files (only when the skill has them), numbered **Core Principles**, a **Common Mistakes** table, and a **Review Output Format** section. No review checklists and no trailing reference-file index; the Quick Reference is the only file listing.
- Supporting `.md` reference files are optional; single-file skills are fine. Add one only when it carries depth beyond the principle statements (recipes, code patterns, lookup tables), not to restate SKILL.md in longer form. Link via relative paths from the Quick Reference table.
- Each rule lives in exactly one skill; other skills point to it by skill name in backticks (e.g. `better-layout`), never via cross-skill relative links.

Current skills: `better-interface` (user-invoked cross-discipline review), `better-ui` (interface polish details), `better-typography` (web typography), `better-colors` (OKLCH color space and color usage), `better-accessibility` (accessibility engineering), `better-layout` (layout structure), `better-writing` (UX writing and interface copy).

### Rule ownership

| Skill                  | Owns                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `better-interface`     | Review orchestration, shared severity, consolidation, coverage, and final output                                          |
| `better-accessibility` | Semantic HTML, keyboard and focus behavior, accessible names, forms, assistive technology, and accessibility requirements |
| `better-layout`        | Spatial grouping, alignment, spacing, responsive structure, logical CSS properties, and spatial RTL behavior              |
| `better-writing`       | Source wording, terminology, voice, tone, labels, errors, and empty-state copy                                            |
| `better-typography`    | Visual text rendering, type systems, font behavior, wrapping mechanics, punctuation, and text-level bidi behavior         |
| `better-colors`        | Color notation, palette construction, gamut, rendered-pair contrast measurement, and color remediation                    |
| `better-ui`            | Optional visual polish: surfaces, icons, and motion aesthetics after the underlying interaction is sound                  |

When a concern crosses domains, keep the rule in the owner above and let other skills name only the handoff or secondary effect. In particular:

- `better-accessibility` decides when contrast is required and the severity of a failure; `better-colors` owns measuring the rendered pair and changing its colors.
- `better-accessibility` owns semantic heading structure; `better-typography` owns how heading levels render visually.
- `better-layout` owns logical CSS properties and spatial mirroring; `better-typography` owns language metadata, punctuation, and mixed-direction text.
- `better-typography` owns truncation mechanics; `better-layout` owns whether the surrounding layout has room or an expansion affordance; `better-writing` owns the source copy.
- `better-accessibility` owns reduced-motion requirements; `better-ui` owns the optional animation recipe used when motion is appropriate.

## Authoring conventions

- Principles are prescriptive and specific: exact CSS properties, exact values (e.g. scale `0.25` → `1`, blur `4px` → `0px`), not vague advice.
- Match the degree of prescription to the decision: requirements may be unconditional, while design heuristics name the context and escape conditions before giving exact recipe values.
- Skills instruct agents to match the target project's existing styling system (Tailwind vs. plain CSS vs. CSS-in-JS) rather than impose one.
- Frontmatter `description` is the discovery surface; when adding or changing a skill's scope, update its trigger keywords accordingly.
- Skill directory names use the `better-*` prefix; renaming a skill means renaming its directory and frontmatter `name` together.
