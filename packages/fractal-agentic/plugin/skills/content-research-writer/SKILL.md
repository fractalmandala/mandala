---
name: content-research-writer
description: 'Collaborative research-backed writing: outlines, citations, hook improvement, section-by-section feedback, and draft polish while preserving the author’s voice. Use for articles, newsletters, tutorials, thought leadership, case studies, and cited long-form content — not for product UI copy alone or pure code docs.'
---

# Content research writer

Writing partner for research, structure, drafting, and revision. Preserve the author’s voice; enhance rather than replace.

## When to use

- Blog posts, articles, newsletters
- Educational content and tutorials
- Thought leadership and case studies
- Outlines with research gaps marked
- Hooks, section feedback, citation cleanup
- Multi-draft iteration toward publishable prose

## When not to use

- Repo / API documentation standards → `docs-writer`
- Scholarly literature review as primary goal → `academic-research`
- Multi-platform social distribution systems → `content-engine`
- Strip AI tells only → `human-writing` (can chain after)

## Setup (recommended)

```text
writing/<slug>/
  outline.md
  research.md
  draft-v1.md
  draft-v2.md
  final.md
  sources/          # optional PDFs, notes
```

Work from the writing directory when possible so paths stay stable.

## Workflow

### 1. Clarify the project

- Topic and thesis
- Audience
- Length and format
- Goal (educate, persuade, explain, entertain)
- Existing sources or samples of the author’s voice
- Citation style preference

### 2. Outline together

Produce a living outline with research TODOs:

```markdown
# Outline: <title>

## Hook
- …

## Introduction
- Context, problem, promise

## Sections
### 1. …
- Points, examples
- [Research needed: …]

## Conclusion
- Summary, CTA, final thought

## Research to-do
- [ ] …
```

Iterate until structure and scope feel right before heavy drafting.

### 3. Research

When asked to research a point:

- Prefer primary or reputable secondary sources
- Extract facts, quotes, dates, and links
- Record citations immediately in `research.md`
- Flag weak or contested claims

Do not invent studies, quotes, or statistics.

### 4. Hooks

When reviewing an intro:

- What works / what is weak
- 2–3 alternate openings (data, story, question, concrete scene)
- Check: curiosity, specificity, audience fit, promised value

### 5. Section feedback

After each section (or on request), return:

```markdown
# Feedback: <section>

## What works
- …

## Improve
### Clarity
### Flow
### Evidence
### Voice

## Line edits
Original: …
Suggested: …
Why: …

## Questions
- …
```

Be specific. Quote the draft. Prefer options over mandates.

### 6. Preserve voice

- Read any samples the user provides
- Suggest; don’t overwrite style without agreement
- Match formality and jargon level
- Ask “does this still sound like you?” when rewrites are large

### 7. Citations

Support the user’s preferred form:

- Inline (Author, Year)
- Numbered `[1]` with references list
- Footnotes

Keep a running references section; verify links when possible.

### 8. Full draft polish

Structure, argument strength, evidence, consistency, readability, pre-publish checklist (claims sourced, CTA present, typos).

Optionally chain `human-writing` for AI-tell cleanup before publish.

## Citation honesty

| Do | Don’t |
| --- | --- |
| Quote or paraphrase with a source | Fabricate papers or experts |
| Mark “needs source” when missing | Present guesses as data |
| Prefer recent data when currency matters | Over-cite filler for appearance |

## Related skills

- `academic-research` — paper-primary search and BibTeX
- `deep-research` — multi-source web research reports
- `article-writing` — long-form in a supplied voice profile
- `brand-voice` — build/reuse a voice profile
- `human-writing` — remove AI writing patterns
- `content-engine` — platform-native distribution

## Credit

**ASI** — https://github.com/plurigrid/asi
