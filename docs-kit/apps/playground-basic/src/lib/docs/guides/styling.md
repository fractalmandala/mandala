---
title: Styling
description: Inherit the host application's design tokens.
---

# Styling

Every theme value is a CSS custom property, so a host overrides tokens instead of
forking components.

```css title="src/app.css"
:root {
	--docs-accent: var(--brand);
	--docs-content-width: 52rem;
}
```
