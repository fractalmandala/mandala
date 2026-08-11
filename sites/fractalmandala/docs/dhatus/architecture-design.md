---
title: "architecture_design"
description: ""
---

The module is organized into three parallel content trees exported from Notion, each following the same pattern: a directory of per-entry markdown files (one file per dhātu or rūpa) plus one or two companion CSV index files.
- `dhatus 405 deprecated/` holds ~405 root entries under `dhatubase 405 dhatus/`, each `.md` file describing a single dhātu with fields like gana, meaning, setAnit, karmak; two CSVs (`_all.csv`) provide bulk indexes.
- `large repository of dhatu rupas/` contains ~9800+ individual conjugated forms under `dhatubase_rupas/`, each file representing one Sanskrit verb form with metadata (dhātu, pada, lakara, puruṣa, vacana, gana, meaning, setAnit, karmak); CSV indexes mirror this structure.
- `panini's classes/` documents the ten Pāṇinian gaṇas (bhvādigaṇa through curādigaṇa) as individual markdown pages plus a CSV class catalog.
Dependency direction is flat: markdown files are leaf records referencing each other only via hex-id suffixes in filenames; CSV files serve as cross-referenced indexes. There is no code — data is purely declarative.