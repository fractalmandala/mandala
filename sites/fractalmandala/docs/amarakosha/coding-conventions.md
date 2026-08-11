---
title: "coding_conventions"
description: ""
---

- Every entry file follows a `<descriptive-prefix> <hex-id>.md` filename pattern, where the hex suffix is a stable unique identifier appended after the leading text.
- Entry Markdown files use simple `Key: value` lines (e.g. `Form:`, `Index:`, `Ontology:`, `Varga:`) rather than YAML frontmatter, with the H1 being the word or śloka itself.
- CSV indexes keep column names consistent across the three corpora, using both Devanagari and IAST variants side-by-side (e.g. `Word` / `Word IAST`, `Varga` / `Varga IAST`, `Ontology` / `ontology IAST`).
- The `Index` field encodes the Amarakośa location as a dotted numeric path (e.g. `1.1.6.1.1`, `3.4.11.2.2`) enabling cross-referencing between the three corpora.
- Each corpus ships paired CSVs: a per-row index CSV and an `_all.csv` aggregate, suggesting a pipeline that generates both granular and consolidated views.