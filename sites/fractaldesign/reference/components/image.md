---
title: Image
description: A minimal `<img>` wrapper used to render images attached to a message or returned by the model. Renders inline base64 source with sensible defaults for aspect-ratio and corners.
---

# Image

The `Image` component is a thin convenience wrapper around the native `<img>` element. It accepts either a base64-encoded payload or a `Uint8Array`, builds a `data:` URL on the fly, and applies rounded corners and intrinsic sizing.

The styling below is pure indented Sass.

## Tokens

```sass
$radius-md:    0.375rem
$max-width:    100%
$max-height:   auto
$bg:           transparent
```

## Image

```sass
.image
  display: block
  max-width: $max-width
  height: $max-height
  overflow: hidden
  border-radius: $radius-md
  background-color: $bg
  object-fit: contain

  // when used inside a message bubble, the corners match the bubble
  .message--user &,
  .message--assistant &
    border-radius: $radius-md

  // larger preview variant — used when image fills the content area
  &--preview
    max-height: 22rem
    object-fit: cover
```

## Caption

If consumers want a captioned image, pair with a small text block:

```sass
.image-caption
  display: block
  margin-top: 0.5rem
  font-size: 0.75rem
  line-height: 1rem
  color: hsl(215 16% 47%)
  text-align: center
```

## Hover affordance (optional)

If the image is clickable (e.g. opens a lightbox), add a slight scale and shadow on hover:

```sass
.image--zoomable
  cursor: zoom-in
  transition: transform 200ms ease, box-shadow 200ms ease

  &:hover
    transform: scale(1.01)
    box-shadow: 0 4px 12px hsl(0 0% 0% / 0.12)
```

## Dark mode

The component is transparent — it inherits colors from the surrounding message bubble. No additional rules are needed.

## Usage skeleton (Svelte, for reference)

```svelte
<img
  class="image"
  src="data:image/png;base64,..."
  alt="Diagram produced by the assistant"
/>
```
