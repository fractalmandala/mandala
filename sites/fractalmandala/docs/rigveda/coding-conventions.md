---
title: "coding_conventions"
description: ""
---

- Every Markdown file is named `<semantic-key> <notion-page-hex-id>.md`, where the hex suffix is the Notion page ID and never changes across edits.
- Verse files use a flat key-value header (no YAML frontmatter) with fixed keys `IAST`, `Status`, `devanāgarī`, `griffith`, `line index`, `maṇḍala`, `maṇḍala.sūkta.ṛcā`, `pada pāṭha`, `ṛca no.`.
- Word files contain only a single H1 line `# <word>` with no additional body content.
- CSV exports follow Notion's column naming convention (e.g. `maṇḍala - sūkta`, `maṇḍala.sūkta.ṛcā`, `pada pāṭha`) and include a `_all.csv` variant alongside the per-database CSV.
- Sanskrit text is stored in two forms side-by-side: Devanāgarī script and IAST transliteration, with an English Griffith translation kept in sync per verse.