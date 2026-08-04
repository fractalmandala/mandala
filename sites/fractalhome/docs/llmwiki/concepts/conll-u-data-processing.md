---
title: CoNLL-U Data Processing
description: Scripts and rendering patterns for combining, parsing, converting, and displaying CoNLL-U linguistic data.
tags: [conllu, python, svelte]
sources: [combineconllu.md, conlluformatandrender.md, conlluparsing.md]
created: 2026-08-02
updated: 2026-08-02
type: concept
---


CoNLL-U files can be concatenated in filename order, parsed into structured JSON, and rendered as tables in Svelte. Avoid `eval` when decoding serialized data. Related: [[Supabase And SQL Patterns]] and [[Sanskritic Agent Architecture]].
