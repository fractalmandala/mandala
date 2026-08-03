// Shared prop enums.
//
// These exist because dropping `cn()` means props are the entire customisation surface.
// Keeping the vocabulary identical across all components is what stops 56 separate
// interpretations of "radius" from appearing. Each has a matching mixin in _mixins.sass
// (+radius-variants, +text-size-variants, +text-transform-variants) — use both together.

/** Maps to the --radius token scale. `2xl` and `full` are fixed values, not derived. */
export type Radius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

/** Maps to the --text-* scale in _typography.sass. */
export type TextSize = "xs" | "sm" | "base" | "lg";

export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
