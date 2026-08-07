---
title: Diagrams and math
description: Mermaid diagrams, KaTeX math, and diff blocks.
---

# Diagrams and math

## Architecture

```mermaid
graph LR
  A[Markdown] --> B[docs-kit compiler]
  B --> C[Manifest]
  C --> D[Theme]
```

## Math

Inline math such as $E = mc^2$ renders alongside prose, and display math stands alone:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

A price like $5 and a shell variable in `$PATH` are left alone.

## Changes

```diff title="vite.config.ts"
 export default defineConfig({
-	plugins: [sveltekit()]
+	plugins: [docs({ content: 'src/lib/docs' }), sveltekit()]
 });
```
