---
name: academic-research
description: 'Search and synthesize academic literature across arXiv, PubMed, Semantic Scholar, bioRxiv, medRxiv, Google Scholar, and similar sources. Use for literature reviews, finding papers, BibTeX/citation export, citation networks, and research synthesis. Prefer installed paper-search MCP tools when available; fall back to web search with careful source attribution.'
---

# Academic research

Search, retrieve, and cite scholarly literature. Host- and model-agnostic: use whatever paper-search MCP servers or web tools the session exposes.

## When to use

- Literature reviews and related-work sections
- Finding papers by topic, author, or venue
- Citation export (BibTeX, APA, MLA, Chicago)
- Citation networks (who cites whom)
- Checking claims against primary sources

## When not to use

- General web product research → prefer `deep-research` or web search
- Code API / library docs → prefer `documentation-lookup`
- Casual blog content without scholarly sources → `content-research-writer`

## Available tooling (use what is installed)

Prefer MCP or CLI tools when present. Names vary by install; probe the session tool list.

| Capability | Typical tools / sources |
| --- | --- |
| Multi-source search | paper-search style MCP (arXiv, PubMed, Semantic Scholar, Scholar, …) |
| Semantic Scholar | papers, citations, authors, recommendations, citation formats |
| arXiv | advanced filters; BibTeX / JSON / Markdown export |
| PDF access | Unpaywall, open PDF links, user-provided files |
| Bibliography | Zotero MCP, Crossref, OpenAlex when configured |

If no paper MCP is available:

1. Use web search with site filters (`site:arxiv.org`, Semantic Scholar, PubMed).
2. Prefer DOI / arXiv IDs in citations.
3. Do not invent paper titles, authors, years, or DOIs.

## Workflow

1. **Clarify scope** — question, field, year range, max papers, citation style.
2. **Search** — 2–3 query variants; include synonyms and key method names.
3. **Triage** — title/abstract first; keep primary sources over secondary summaries.
4. **Deepen** — open top papers; extract methods, claims, limitations.
5. **Network** — follow key citations forward/backward when tools allow.
6. **Synthesize** — themes, agreements, conflicts, open questions.
7. **Cite** — every claim that is not common knowledge gets a real reference.

## Output formats

### Literature snapshot

```markdown
# Literature snapshot: <topic>

## Query & scope
- Question:
- Sources searched:
- Date of search:

## Key papers
| # | Title | Authors | Year | Venue | ID (arXiv/DOI) | Why relevant |
|---|-------|---------|------|-------|----------------|--------------|

## Themes
1. …
2. …

## Gaps / contradictions
- …

## Suggested next reads
- …

## References
[1] …
```

### BibTeX

Export only entries you actually retrieved. Prefer official BibTeX from arXiv / publisher / Semantic Scholar when available.

## Quality rules

- **No hallucinated citations.** If unsure, say so and search again.
- Prefer peer-reviewed or preprint servers over random blogs for scholarly claims.
- Distinguish preprints from published versions when both exist.
- Note access limits (paywall, abstract-only) honestly.
- Keep quotes short and attributed.

## Related skills

- `deep-research` — multi-source web research with citations (not paper-primary)
- `content-research-writer` — long-form writing with research support
- `docs-writer` — product/repo documentation standards

## Credit

**ASI** — https://github.com/plurigrid/asi
