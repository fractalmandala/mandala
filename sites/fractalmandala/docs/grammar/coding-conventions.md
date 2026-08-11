---
title: "coding_conventions"
description: ""
---

- Each affix or case gets its own Markdown file whose name encodes the concept plus a unique hex-id suffix (e.g. `Genitive ae2a577631f34201849ad8e53db5496b.md`).
- Affix entries follow a fixed CSV schema with columns `affix,meaning,gender,vowel change,type`, where `type` distinguishes `prefix` from `suffix`.
- Case pages share a uniform structure: an H1 title, a `Description:` line, then numbered lines for `Dual:`, `Singular:`, `Plural:` endings, and a `No.` field.
- Every CSV export is paired with a corresponding `_all.csv` aggregate file containing the same rows merged together.
- Internal cross-references use percent-encoded relative paths (e.g. `iit%20roorkee%20sanskrit%20learning%20material/...`) rather than absolute URLs.