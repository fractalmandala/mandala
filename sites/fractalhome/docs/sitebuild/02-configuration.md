---
title: Configuration
description: Setting up sidebar rules, navigation heirarchy and visibility.
---

Set `navigation.sidebar.display` to `"group"` in `blume.config.ts`:

```
navigation: {
  sidebar: {
    display: "group", // "flat" | "group" | "page"
  },
}
```

hat renders each group as a collapsible `<details>` disclosure. Groups start collapsed; the one containing the current page starts open. Force a group open regardless via `collapsed: false` in its `meta.ts`, or per-group `collapsed` in an explicit sidebar.

`"page"` is an alternative: each group becomes one row that slides into a sub-panel.

