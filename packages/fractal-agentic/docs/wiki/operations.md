---
title: "Wiki operations"
description: "Capture sources, ingest them into structured pages, query the result, and lint the vault on a regular cadence."
type: guide
---

# Wiki operations

## Daily loop

```text
Add sources to raw/  (clipper, notes, PDFs, …)
        │
        ▼
   /wiki-ingest      → wiki/sources + entities + concepts
        │
        ▼
   /wiki-query       → answers with [[wikilinks]]
        │
        ▼
  (optional) file answer → wiki/synthesis/
        │
        ▼
   /wiki-lint        → every ~10 ingests or monthly
```

## Fractal engineering loop

```text
/orchestrate  … ship|fix-first|rethink
        │
        ▼
  (if wiki configured + capture.orchestrate)
  raw/fractal/<date>-slug.md   ← episode with description
        │
        ▼
  later /wiki-ingest if you want entities/concepts updated
```

## Commands

| Command | Purpose |
|---|---|
| `/wiki-status` | Root, counts, recent log |
| `/wiki-capture` | Manual episode |
| `/wiki-ingest` | Process unprocessed raw files |
| `/wiki-query` | Q&A against wiki |
| `/wiki-lint` | Health check (includes missing **description**) |

## Ingest rules of thumb

- Prefer **one source at a time** with human confirmation on large batches  
- One source may touch **10–15** wiki pages — expected  
- Prefer **update** over near-duplicate pages  
- Note contradictions with both sources cited  
- Never modify files in `raw/` except append under `raw/fractal/`  

## Query rules of thumb

- Read `wiki/index.md` (description lines) first  
- Optional `qmd` when large  
- Cite with `[[Page Title]]`  
- File durable analyses into `synthesis/`  

## Lint schedule

- After ~10 ingests  
- Monthly minimum  
- Before major synthesis work  
