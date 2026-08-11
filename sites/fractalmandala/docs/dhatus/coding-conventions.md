---
title: "coding_conventions"
description: ""
---

- Each record is a standalone markdown file whose filename follows the pattern `<Sanskrit-or-English-name> <hex-id>.md`, with the 32-character hex suffix serving as a stable identifier.
- Markdown records use YAML-style key-value lines after the H1 heading (e.g. `dhātu:`, `gana:`, `meaning:`, `pada:`, `puruṣa:`, `setAnit:`, `karmak:`) rather than structured frontmatter.
- CSV index files are named `<base-name> <hex-id>.csv` and `_all.csv` variants, with UTF-8 BOM-prefixed headers (visible as `﻿` before the first column name).
- Pāṇinian terminology is stored in Devanāgarī with IAST transliteration separated by a semicolon (e.g. `अकत्थथाः; akatthathāḥ`, `भ्वादिगण; bhvādigaṇa`), consistently across both markdown and CSV fields.
- Paninian gaṇa classification files follow a fixed schema: an H1 title, then `Class No.:`, `Name:`, and `Description:` lines, with descriptions citing specific Aṣṭādhyāyī sūtra numbers.