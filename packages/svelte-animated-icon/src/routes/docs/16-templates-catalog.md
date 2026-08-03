---
title: Templates Catalog
id: 16
group: api-reference
description: "Every animation template with a live preview, its loop/one-shot nature, and line/fill suitability."
---

The complete list of `template` ids. Every template ships in the core `TEMPLATES` array and is reachable by id; you don't need to import them.

Browse them live on the home route - each card lets you swap templates, variants, sizes, and triggers.

## The list

| id | What it does | Loops well? | Best on |
|---|---|---|---|
| `draw` | Strokes each path from start to end | OK | `regular`, `light` |
| `native-draw` | Same idea, slower and smoother | OK | `regular`, `light` |
| `cascade` | Shapes pop in one after another | no | mixed |
| `pop` | Each shape scales 0 → 1.25 → 1 with a stagger | no | anything |
| `spin` | Whole icon rotates 360° around its center | yes | symmetric icons |
| `jelly` | Squish + wobble: 1 → 1.18/.82 → .9/1.1 → 1.05/.95 → 1 | yes | friendly UI |
| `orbit` | Each shape rotates from -120° into place | OK | layered icons |
| `assemble` | Shapes converge to final position from offsets | no | composed icons |
| `trace` | Outline first, then fill | OK | line → fill transition |
| `tada` | Scale + rotate accent (the Mac "+1" feel) | no | celebratory |
| `flip` | 3D Y-axis flip (rotateY) | OK | toggleable state |
| `swing` | Pendulum sway: rotate ±20° | yes | arrow-like |
| `wave` | Sequential opacity sweep, staggered by index | yes | multi-path icons |
| `march` | Strokes march along the path (stroke-dashoffset animation) | yes | line icons |
| `boil` | Bubbling organic motion | yes | cloud, fire, drop |
| `glitch` | Rapid translate/jitter | yes | status / debug |
| `wipe` | Reveal mask slides across the icon | OK | line icons, hero moments |
| `rise` | Fade + translateY from below | no | entrances |
| `iris` | Circular scale from center, perpetual | yes | loading indicators |
| `split` | Shape breaks apart and rejoins | OK | playful |
| `drop` | Fall + settle (translate + bounce) | no | drop, pin, download |
| `stamp` | Slam into place (overshoot then settle) | no | confirmations |

## Suitability shorthand

Each template declares a `for` field on its `IconTemplate` record:

- `for: 'line'` - needs a stroke. Looks wrong on solid `fill` icons. (`draw`, `march`, `wipe`.)
- `for: 'fill'` - best on solid silhouettes. (`pop`, `tada`, `stamp`.)
- *(omitted)* - geometry-agnostic. Works on both. (`cascade`, `spin`, `jelly`, `orbit`, `wave`, `glitch`, `iris`, `split`, `boil`, `drop`, `rise`, `flip`, `swing`, `assemble`, `trace`, `native-draw`.)

The `for` field is informational - there's no runtime guard against pairing `draw` with a `fill` icon, you'll just see a hollow outline drawn over an invisible (no-stroke) shape. The catalog table above mixes both signals into a single recommendation.

## Looping shorthand

The "Loops well?" column is a recommendation, not a rule. `loop={true}` forces any template to repeat - see [Loop](/docs/12-loop) for the full picture.

## Discovering ids at runtime

If you want to render a template picker UI:

```svelte
<script>
  import { TEMPLATE_IDS } from 'svelte-animated-icon';
  let template = $state(TEMPLATE_IDS[0]);
</script>

<select bind:value={template}>
  {#each TEMPLATE_IDS as id}
    <option value={id}>{id}</option>
  {/each}
</select>

<Gear {template} />
```

`TEMPLATE_IDS` is the canonical ordered list of ids; `TEMPLATES` is the full `{ id, label, for?, run }` records. See [Core Exports and Types](/docs/18-core-exports-and-types).