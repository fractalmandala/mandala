---
title: "architecture_design"
description: ""
---

Three sibling directories hold the same Amarakośa content in different representations:
- `amarakosha/amarakosha IAST/` — one `.md` file per IAST word (e.g. `a 3fe363b00e3c42e784eff9b6ebeb4ddc.md`), plus two CSV indexes (`amarakosha IAST 493c9bed...csv`, `_all.csv`) keyed by `Word IAST`, `form`, `Varga IAST`, `ontology IAST`, `No.`, `Index`.
- `amarakosha separated/db_amarakoshaseparated/` — one `.md` per Devanagari word (e.g. `अ 00f07dedd6d5403b81f6bac7ab483000.md`), with matching CSVs (`db_amarakoshaseparated caffb052...csv`, `_all.csv`) adding both Devanagari and IAST columns for Word, Varga, Ontology.
- `amarakosha shlokas/db_amarakoshashlokas/` — one `.md` per śloka whose filename is the first few words of the verse followed by a hex id; CSVs (`db_amarakoshashlokas 4a594875...csv`, `_all.csv`) index by `śloka`, `I Full`, `श्लोक`, `I1`, `I2`, `I3`.

Each entry Markdown is flat key-value metadata (no nested structure). The CSVs are the canonical indexes; the MD files are leaf records derived from them. There is no code or build system — this is pure data export material.