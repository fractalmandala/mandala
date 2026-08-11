---
title: "architecture_design"
description: ""
---

Flat Notion export layout under a single Untitled folder: one Markdown note per school (filename = school name + hex-id suffix) containing a title heading followed by key-value lines for the five pramāṇas; a sibling CSV file with the same hex-id encodes the identical data in tabular form. The two CSV files are exported variants (one per-row-per-school, one aggregated), while the MD notes are the human-readable entry points. There is no internal code or build system — structure is purely document-based.