---
title: Erste Schritte
description: docs-kit installieren und in eine SvelteKit-Anwendung einbinden.
order: 1
---

# Erste Schritte

Pakete installieren, das Vite-Plugin hinzufügen und eine Catch-all-Route einhängen.

## Installation

```bash
pnpm add @docs-kit/core @docs-kit/theme-default
```

:::warning{title="Reihenfolge der Plugins"}
Das Dokumentations-Plugin muss vor `sveltekit()` stehen.
:::
