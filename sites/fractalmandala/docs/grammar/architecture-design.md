---
title: "architecture_design"
description: ""
---

Three parallel Notion export trees under `home/master_db/`: (1) `sanskrit affixes pratyaya/` stores one Markdown file per affix in an `Untitled/` subfolder, each named `<affix> <suffix-type> <hex-id>.md`, plus a master CSV (`Untitled 327f99ad06584e2da54ead3466b2a672.csv`) with columns `affix,meaning,gender,vowel change,type` that also embeds kaikki.org source URLs; (2) `sanskrit cases/db_sanskrit cases/` holds one Markdown per case (Nominative through Vocative) with a uniform header `# <Case>` followed by Description, Dual/Singular/Plural endings, and a numeric index; (3) `iit roorkee sanskrit learning material/` is a flat CSV index mapping course names to relative paths or Google Drive links. Each directory ships both a per-row CSV and a `_all.csv` aggregate, following the repository's Notion export convention of hex-id suffixed filenames and percent-encoded internal links.