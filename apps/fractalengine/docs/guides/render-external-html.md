---
id: render-external-html
title: Rendering External HTML
type: guide
tags: [security, html, sanitization, guide]
relates_to: [ADR-028]
summary: Guide on securely rendering external HTML using DOMPurify profiles and boundary guards.
updated: 2026-07-15
---

# Rendering External HTML

All HTML output rendering must go through security checks.

## Playbook & Steps

### 1. Identify html rendering sites
Any place in Svelte components using `{@html}` markup is a potential vulnerability site and is monitored by build guards.

### 2. Apply sanitization
Always wrap your expression in the sanitization parser imported from `$lib/sanitizeHtml`:
```svelte
<script lang="ts">
	import { sanitizeHtml } from '$lib/sanitizeHtml';
</script>

<div>{@html sanitizeHtml(rawContent, 'markdown')}</div>
```

### 3. Choose the right profile
Select the narrowest profile:
- `markdown` — For rich text blocks.
- `svg` — Specifically for raw SVG renderings.
- `inline` — Basic bold/italic inline text formats.

### 4. Register in allowlist
If adding a new `{@html}` block, add the file path to the allowlist inside `tests/unit/html-boundary.test.ts`.

## Verification Checklist

- [ ] Run `npx vitest run tests/unit/html-boundary.test.ts` to verify the HTML security guard.
- [ ] Run typechecks to verify profile mappings match.
