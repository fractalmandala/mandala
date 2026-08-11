---
title: "architecture_design"
description: ""
---

Two parallel Notion export trees mirror each other:
- `db_rigveda/` holds ~10 500 Markdown files, one per ṛc, named `<maṇḍala> - <sūkta> <hex-id>.md`. Each file is a flat document with YAML-like key-value lines: `# <maṇḍala.sūkta>`, `IAST:`, `Status:`, `devanāgarī:`, `griffith:`, `line index:`, `maṇḍala:`, `maṇḍala.sūkta.ṛcā:`, `pada pāṭha:`, `ṛca no.:`.
- `words of rv/` holds ~29 900 Markdown files, one per distinct Sanskrit word, named `<word> <hex-id>.md`; most are single-line placeholders (`# <word>`).
- Each tree has a sibling CSV (`*_all.csv`) that is the full Notion table dump; the non-`_all` CSV contains the same rows as the number of Markdown files.
- Hexadecimal suffixes on every filename are Notion page IDs, used to keep filenames stable across edits.
- There is no code or build system — the corpus is pure data consumed by downstream scripts that read the Markdown frontmatter and the CSV tables.