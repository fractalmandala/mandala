---
name: liquid-glass-design
description: Liquid glass design system for the web — dynamic glass material with blur, tint, specular highlights, and interactive morphing, built with CSS backdrop filters, custom properties, and indented SASS tokens.
---

# Liquid Glass Design System (Web)

Patterns for implementing a liquid-glass material on the web — a dynamic surface that blurs and saturates content behind it, picks up ambient tint, carries a specular edge highlight, and reacts to hover and press. Built entirely with CSS/SASS so it works in any SvelteKit app, desktop webview, or browser.

## When to Activate

- Designing or restyling floating surfaces: toolbars, panels, dialogs, docks, HUDs
- Adding depth layers over content-rich backgrounds (canvases, editors, media)
- Creating hover/press feedback that feels fluid rather than mechanical

## The Material, Four Layers

1. **Backdrop** — `backdrop-filter: blur() saturate()` over live content.
2. **Tint** — translucent fill that samples the ambient palette via custom properties.
3. **Specular edge** — bright 1px-ish inner border + subtle outer shadow for the "lens" rim.
4. **Motion** — scale/blur radius/opacity respond to interaction with springy easing.

## Base Token Set (indented SASS)

```sass
// _tokens.glass.sass — merge into the project token layer
:root
	--glass-blur: 18px
	--glass-saturate: 1.6
	--glass-tint-light: rgba(255, 255, 255, 0.55)
	--glass-tint-dark: rgba(30, 30, 34, 0.45)
	--glass-border: rgba(255, 255, 255, 0.35)
	--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.18)
	--glass-radius: 18px
	--glass-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

Follow the house rule: single-tab indented SASS, no braces, no semicolons, tokens drive everything.

## The Glass Surface

```sass
.glass
	position: relative
	border-radius: var(--glass-radius)
	background: var(--glass-tint-light)
	backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate))
	-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate))
	border: 1px solid var(--glass-border)
	box-shadow: var(--glass-shadow)
	transition: transform 240ms var(--glass-spring), box-shadow 240ms ease

	@media (prefers-color-scheme: dark)
		background: var(--glass-tint-dark)
		border-color: rgba(255, 255, 255, 0.12)
```

## Specular Edge Highlight

A soft inner top-light sells the "lens" look:

```sass
.glass::before
	content: ''
	position: absolute
	inset: 0
	border-radius: inherit
	padding: 1px
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0.2))
	-webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)
	-webkit-mask-composite: xor
	mask-composite: exclude
	pointer-events: none
```

## Interactive Morphing

```sass
.glass-button
	&:hover
		transform: scale(1.03)
		--glass-blur: 22px
	&:active
		transform: scale(0.97)
		transition-duration: 90ms

	@media (prefers-reduced-motion: reduce)
		transition: none
		&:hover, &:active
			transform: none
```

Content under a pressed glass surface can brighten slightly to imply light refraction:

```sass
.glass-panel:active ~ .underlay
	filter: brightness(1.04)
```

## Usage in Svelte

```svelte
<div class="glass panel">
	{@render children()}
</div>
```

- Use transitions (`transition:scale`, `in:fly`) gated on `prefers-reduced-motion` for mount/unmount morphing.
- Keep glass surfaces **above content, below modals** in the z-order; stacking too many blur layers is the main performance trap.

## Performance Rules

1. **Limit blur layers** — each `backdrop-filter` forces a repaint of everything beneath it. Cap simultaneous glass surfaces (≤ 3 visible is a sane default).
2. **Animate transform/opacity, not blur radius**, where possible — blur radius changes are expensive.
3. Prefer `will-change: transform` on interactive glass only while interacting.
4. Test at 2× content density — blur over text-heavy UIs tanks frame rate first.

## Fallbacks

```sass
@supports not (backdrop-filter: blur(1px))
	.glass
		background: var(--glass-tint-fallback) // higher-opacity solid tint
```

- Ship an opaque-ish fallback tint; never rely on blur alone for legibility.
- Verify contrast of text on glass at both color-scheme extremes — 4.5:1 minimum.

## Review Checklist

1. Glass used only for floating surfaces, not body backgrounds.
2. Blur + saturate behind live content; fallback tint when unsupported.
3. Specular edge present but ≤ 1px equivalent — no heavy borders (quiet UI rule).
4. Interaction feedback via transform with spring easing; `prefers-reduced-motion` honored.
5. Contrast verified in light and dark; no legibility loss over busy content.
6. Total simultaneous blur layers bounded and profiled.
