---
title: Accessibility
id: 27
group: guides-and-advanced
description: "role/aria-label, decorative vs meaningful icons, and prefers-reduced-motion."
---

Icons present three distinct accessibility concerns: **what role they play** in the UI, **how they're announced** to assistive tech, and **whether the motion is appropriate** for users who prefer reduced motion. Each is a small choice with outsized impact.

## Decorative vs. meaningful

The first question to ask of every icon: *is this conveying information, or is it just visual chrome?*

- **Decorative** - sitting next to a text label that already says "Settings". Screen readers should ignore it.
- **Meaningful** - standing alone (a save button with no text label, an icon-only close button, a status indicator). Screen readers need a name.

For decorative icons, hide from assistive tech:

```svelte
<button>
  <Gear size={20} aria-hidden="true" />
  Settings
</button>
```

For meaningful icons, give them a name:

```svelte
<button aria-label="Settings">
  <Gear size={20} />
</button>
```

The label belongs on the **interactive parent**, not the icon - the button is what's clickable, the icon is its visual cue. The icon itself renders with `role="img"` by default; that role is right for both cases, but only meaningful icons need an `aria-label` (or `aria-labelledby`) attached to them.

## The `role="img"` default

`AnimatedIcon` renders its wrapper with `role="img"`. This signals to assistive tech that the element is an image and that any accessible name should be announced as the image's alternative text. If you want different semantics (for example, `role="presentation"` to mark an icon as truly decorative), override via the `class` prop and CSS:

```svelte
<style>
  .decorative :global(.animated-icon) {
    role: presentation; /* this won't work - role is an attribute, not a CSS property */
  }
</style>
```

The cleanest path is to wrap differently:

```svelte
<!-- For purely decorative icons -->
<span aria-hidden="true">
  <Gear size={20} />
</span>
```

The wrapper `<span>` hides both the icon's `role="img"` and its contents from the accessibility tree.

## Motion and `prefers-reduced-motion`

Animated icons can trigger vestibular discomfort for some users. The OS-level setting `prefers-reduced-motion: reduce` is the user's way of asking "less animation please." Respecting it is one media query:

```css
@media (prefers-reduced-motion: reduce) {
  .animated-icon :global(svg) {
    animation: none !important;
    transition: none !important;
  }
}
```

Inside a Svelte component, the equivalent pattern is:

```svelte
<script>
  import { onMount } from 'svelte';
  let reduced = $state(false);

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
</script>

<Gear template={reduced ? undefined : 'draw'} trigger={reduced ? undefined : 'hover'} />
```

Setting `template` to `undefined` makes the component fall back to the default, and disabling the trigger prevents the hover handler from running. Users with reduced-motion preferences see static icons.

A more global pattern is to put the media query in your app stylesheet - then every animated icon on the site respects it without per-component work:

```css
@media (prefers-reduced-motion: reduce) {
  :global([data-animated-icon]) {
    animation: none !important;
  }
}
```

## Color contrast

Icons inherit color from `currentColor`. Make sure the parent text color meets WCAG contrast against its background. For icons that need to be perceived as content (not decoration), aim for the same contrast ratio as body text - at least `4.5:1` against the surrounding background.

## Keyboard focus

The icon itself isn't focusable - it's the surrounding button or link that takes focus. Make sure focus rings are visible:

```css
button:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
```

## Live regions for status changes

When an icon's animation reflects an asynchronous status change, pair it with a live region so screen readers announce the change:

```svelte
<div role="status" aria-live="polite">
  {#if isLoading}
    <Gear template="spin" trigger="controlled" active={isLoading} loop />
    Loading…
  {:else if isSaved}
    Saved successfully
  {/if}
</div>
```

The icon animates; the live region announces. Both update together when `isLoading` flips.

## Don't autoplay forever without a stop

A perpetually looping icon without an off-switch is the most common motion-sickness trigger in real apps. Always:

- Pair `loop` with `trigger="controlled"` so your code can stop it.
- Provide a visual cue when the loop ends (color change, label change, icon swap).
- Respect `prefers-reduced-motion` (above).

See [Autoplay and Looping](/docs/22-guide-autoplay-loop) for the full pattern.