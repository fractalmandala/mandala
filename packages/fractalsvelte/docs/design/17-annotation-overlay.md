---
id: 17-annotation-overlay
title: Shared Annotation Overlay
type: design
tags: [annotations, overlay, tokens, feedback, collaboration]
summary: Token-driven shared annotation pins and a compact feedback card above application content.
relates_to: [01-tokens, 04-layout-system, annotations]
updated: 2026-07-19
---


The shared annotation overlay is a non-layout-affecting fixed layer. It uses `--z-overlay` so annotation controls always sit above the active work surface, while pins use one layer below it to leave the selected comment card dominant.

Pins use the semantic accent (`--theme-color`) against the theme surface (`--background10`) and retain the existing focus-accent shadow. The comment card uses existing surface, border, text, radius, spacing, and popover-shadow tokens. It introduces no new primitives or semantic tokens.

The overlay is intentionally compact: a 24px target marker and a bounded card that respects the viewport. It must remain readable in both theme variants and must not obstruct the underlying element except while a user opens a comment.
