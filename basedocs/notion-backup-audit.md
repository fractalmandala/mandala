# Notion Backup Audit — `~/Documents/wikis/notion-out`

_Generated: 2026-08-03 · Target: `/Users/amrit/Documents/wikis/notion-out` · Status: **inventory only — nothing deleted or moved yet**_

## 1. Executive summary

This is a full **Notion workspace export** from 3–4 years ago. It contains **102,223 files totalling 1.9 GB**, of which **100,499 are markdown pages** (Notion exports every page as `.md`). The export is dominated by one folder — `home/master_db/` (101,626 files, 1.66 GB) — which holds the genuinely valuable content: years of **Sanskrit / dhātu research databases**, **Jeevan Vidya source material (76 PDFs)**, and a **worldbuilding lore project** ("thea").

About **40% of all files (42,940)** are ≤200-byte stub pages (empty Notion pages), and there are several classes of redundant duplicates (older import, CSV view pairs, `.DS_Store` files).

**The value is concentrated and small.** The keep-set is roughly: `home/master_db` (research + PDFs), `home/thea new` (newer lore), `home/janapada` (fiction), and the `home` entry page. Everything else is dead weight, redundancy, or sensitive material that should be moved aside.

## 2. Scale at a glance

| Metric | Value |
|---|---|
| Total files | 102,223 |
| Total size | 1.9 GB |
| Markdown files | 100,499 |
| PNG | 1,033 |
| SVG | 212 |
| CSV | 186 |
| TXT | 116 |
| PDF | 76 |
| MP4 | 9 |
| XLSX | 2 |
| GIF / JPG / WEBP / AAC / JPEG | 15 / 29 / 1 / 1 / 2 |
| `.DS_Store` | 42 |
| Stub `.md` files (≤200 bytes) | 42,940 |
| Largest `.md` file | `home/master_db/build 0/dhatubase build0/√pṛ …` (220 KB) |

> 💡 Takeaway: 98% of the file count is markdown, but nearly half of those markdown files are empty stubs.

## 3. Top-level structure

| Path | Size | What it is | Verdict |
|---|---|---|---|
| `home/` | **1.9 GB** | The main working workspace ("home"). Almost all real content. | **Keep** |
| `Import Dec 25, 2023/` | 0.5 MB (113 files) | Older duplicate of the "thea" worldbuilding project | **Delete** (superseded) |
| `People/` + `People d3d39a….csv` / `_all.csv` | tiny | Workspace People database (Amrit, i.amrit.p@gmail.com) | Keep (tiny) |
| `home a7c21207…md` | 439 B | Real entry page linking to everything below | Keep |
| `Home ce15c7d8…md` | 278 B | Dangling page — links to CSVs **not present** in this export | Delete (dead) |
| `Import Dec 25, 2023 2c65b074…md` | 100 B | Stub import page | Delete |
| `Import Feb 29, 2024 eef0dda8…md` | 21 B | Empty import page | Delete |
| ` 5c939a66…md` (leading space) | 71 B | Empty workspace member page | Delete |
| 42 × `.DS_Store` | — | macOS junk | Delete |

## 4. `home/` breakdown

| Subfolder | Size | Files | Content | Verdict |
|---|---|---|---|---|
| `home/master_db/` | 1.66 GB | 101,626 | ~60+ databases — Sanskrit research, Jeevan Vidya PDFs, work/creative/misc | **Keep** |
| `home/thea new/` | 0.8 MB | 458 | Worldbuilding lore: 340 md (`th-*` pages) + 115 TXT frontmatter notes | **Keep** (newer version) |
| `home/janapada/` | tiny | 3 md | Fiction — "Bharata janapada" story (Ajamidha prologue) | **Keep** |
| `home/Review/` | tiny | 2 CSV | Tag-theme tables (Sanskrit notes, cues, rakhigarhi/genetics) | Keep |
| `home/` root files | — | few | `c_29.png`, `ratha.webp`, `IMG-…jpg`, master_db/janapada/thea CSVs, Untitled CSVs | Keep |

### 4.1 `home/master_db/` — the three clusters

**A. Sanskrit / dhātu research (crown jewels — keep):**

- **OET Matrix** — the dhātu levels ontology; pages like `artha`, `mokṣa`, `nṛtam/anṛtam` carry full dictionary-grade entries (220 KB max)
- **amarakosha** — 3 variants (separated, shlokas, IAST)
- **ashtadhyayi** — sūtras with padaccheda, kaumudi/akārādi krama
- **rigveda digitisation** — devanāgarī + IAST + Griffith + pada pāṭha
- **dhatubase build 0**, dhatus 405 (deprecated), dhatu rupas (large), panini classes, sanskrit cases, pratyaya affixes, "all words of rv", Samskṛta Reader

**B. Jeevan Vidya / shivir material (keep — the 76 PDFs live here):**

- Numbered Hindi folders: `08 Jeevan Vidya Intro Shivir`, `12 The Alternative Background`, `20 Dhampur mil me Jeevan Vidhya`, `22 गणेश बागडिया शिविर (corrected by babaji)`, `26 adhyayan vidhi samvad sankalan`, `40 अनुभवात्मक अध्यात्मवाद छोटा संकलन`, `49 व्यवहारात्मक जनवाद`, `00 Vikalp the Alternative - 2018`
- madhyasth darshan, dhaarmika kratu anusandhaana, चतुर्सूत्रा 4 aphorisms

**C. Work + creative + misc (review):**

- **boodmo trial workspace** — old-job schema dumps → **likely delete**
- **payslips** → **sensitive — move aside**
- **aadhaar copy (Aadhar.pdf)** → **sensitive — move aside**
- brhat newsletter / notion changelog / web2 documentation
- project bharata creative assets, youtube DB, ss space (Questioning Mind videos)
- icon / SVG / palette / logo / wombo / mandala collections
- Notion templates (Gamification Project 2020, GTM, SEO), notion formulae, sumpas, katex options, golden ratio helper

## 5. Duplicates & dead weight (delete candidates)

### 5.1 `Import Dec 25, 2023/thea` — **strict subset of `home/thea new`**

Cross-checked by slug: **110/110 pages identical**; `home/thea new` additionally has 5 extra. The entire `Import Dec 25, 2023/` folder (113 files) can go.

### 5.2 42,940 stub `.md` files (≤200 bytes)

~40% of all files — empty/blank Notion pages. Bulk-delete candidates, **pending a spot-check sample**.

### 5.3 Redundant CSV view pairs

69 `_all.csv` files + 62 matching plain `.csv` — Notion exports each database twice (current-view + all-properties). The `_all` files are the superset; the plain ones are redundant views. (55 plain CSVs have no twin.)

### 5.4 Root stub/dead pages

`Home ce15c7d8…md` (dangling), `Import Feb 29, 2024…md`, `Import Dec 25, 2023…md`, ` 5c939a66…md`, plus 42 `.DS_Store`.

## 6. Recommended plan

| Bucket | Action | Contents |
|---|---|---|
| **Keep** | No action | `home/master_db` (research + Jeevan Vidya PDFs), `home/thea new`, `home/janapada`, `home/Review`, `home` entry page, People files |
| **Delete — confident** | After approval | `Import Dec 25, 2023/` (superseded), `.DS_Store` files, root stub/dead pages, `boodmo trial workspace` |
| **Delete — after review** | Sample first, then approve | 42,940 stub `.md` files; redundant plain `.csv` view duplicates |
| **Move aside — sensitive** | Archive to private location | `aadhaar copy front black and white/Aadhar.pdf`, `payslips/` |

## 7. Next steps (gated on approval)

1. Generate a sample of ~20 stub `.md` files → confirm they're genuinely empty
2. Draft the exact delete list (paths + sizes) for sign-off
3. Execute moves/deletes with a log, preferring archive over delete where uncertain

---

_Nothing in this document has been executed. Deletion requires explicit confirmation per file-group._
