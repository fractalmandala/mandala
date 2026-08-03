---
title: Workflow
description: A node-graph editor built on top of `@xyflow/svelte`. Renders a pannable/zoomable canvas with draggable node cards (header, title, description, body, footer) connected by bezier edges, plus floating zoom controls.
---

# Workflow

The `Workflow` family is the visual builder for agent DAGs (directed acyclic graphs of agent steps). Each node is a small card with a colored header (per node type), a title, an optional description, and connection handles on the left and right sides. Edges are bezier paths between handles.

The styling below is pure indented Sass. Because `@xyflow/svelte` ships its own base stylesheet (`@xyflow/svelte/dist/style.css`), this file targets the overrides that the Workflow components add on top.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-card:            hsl(0 0% 100%)
$bg-secondary:       hsl(210 40% 96%)
$bg-canvas:          hsl(210 40% 98%)
$bg-control:         hsl(0 0% 100%)
$fg:                 hsl(222 47% 11%)
$fg-muted:           hsl(215 16% 47%)
$border:             hsl(214 32% 91%)
$border-ring:        hsl(215 20% 65%)
$radius-md:          0.375rem
$radius-lg:          0.5rem
$shadow-sm:          0 1px 2px 0 hsl(0 0% 0% / 0.05)
$transition:         150ms cubic-bezier(0.4, 0, 0.2, 1)
$node-width:         24rem       // 384px — `w-sm`
$node-padding:       0.75rem
$controls-padding:   0.25rem
$handle-size:        0.625rem    // 10px — `h-2.5 w-2.5`
$gap-row:            0.125rem
```

## Canvas

The pannable/zoomable backdrop. The underlying `@xyflow/svelte` does most of the work; we just override the background and the controls.

```sass
.canvas
  width: 100%
  height: 100%
  background-color: $bg-canvas
  position: relative

  // dotted grid backdrop
  .svelte-flow__background
    background-color: $bg-canvas

  .svelte-flow__background-pattern.dots
    fill: $border
```

## Connection (live edge preview while dragging)

Drawn as an SVG `<path>` between the source and target points while the user is mid-drag.

```sass
.connection
  // the animated edge path
  &__path
    fill: none
    stroke: $border-ring
    stroke-width: 1
    stroke-dasharray: 4 4
    animation: connection-dash 0.5s linear infinite

  &__endpoint
    fill: $bg-card
    stroke: $border-ring
    stroke-width: 1

@keyframes connection-dash
  to
    stroke-dashoffset: -8
```

## Controls (zoom/fit/lock buttons)

Floats in the bottom-left corner of the canvas. The xyflow default is a horizontal pill; the Workflow overrides make it a tight square with separated buttons.

```sass
.controls
  display: flex
  align-items: center
  gap: 1px
  padding: $controls-padding
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-control
  box-shadow: $shadow-sm
  overflow: hidden

  // each child button
  & > button
    display: inline-flex
    align-items: center
    justify-content: center
    width: 1.75rem
    height: 1.75rem
    padding: 0
    border: 0
    border-radius: 0.375rem
    background-color: transparent
    color: $fg-muted
    cursor: pointer
    transition: background-color $transition, color $transition

    &:hover
      background-color: $bg-secondary
      color: $fg

    &:focus-visible
      outline: 2px solid $fg
      outline-offset: 1px

    > svg
      width: 0.875rem
      height: 0.875rem
      flex-shrink: 0
```

## Edge (static)

```sass
.edge
  &__path
    fill: none
    stroke: $border-ring
    stroke-width: 1.5
    transition: stroke $transition

    // animated while the underlying flow is running
    &--animated
      stroke-dasharray: 6 4
      animation: edge-dash 1s linear infinite

  &--selected &__path
    stroke: $fg

@keyframes edge-dash
  to
    stroke-dashoffset: -10
```

### Temporary edge

A ghosted edge shown while the user is mid-drag a new connection.

```sass
.edge--temporary
  opacity: 0.6

  .edge__path
    stroke-dasharray: 4 4
```

## Node (single card)

A small card with a tinted header, a body, optional description and actions, and connection handles on the left and right sides.

```sass
.node
  width: $node-width
  border: 1px solid $border
  border-radius: $radius-md
  background-color: $bg-card
  color: $fg
  box-shadow: $shadow-sm
  overflow: hidden
  transition: box-shadow $transition, border-color $transition

  &:hover
    box-shadow: 0 4px 12px hsl(0 0% 0% / 0.08)

  &[data-selected="true"]
    border-color: $fg
    box-shadow: 0 0 0 2px hsl(222 47% 11% / 0.15)

  // connection handles
  .svelte-flow__handle
    width: $handle-size
    height: $handle-size
    border: 2px solid $bg-card
    background-color: $fg-muted
    transition: background-color $transition, transform $transition

    &:hover
      background-color: $fg
      transform: scale(1.2)
```

### NodeHeader

The colored strip at the top of the node. Background is `bg-secondary` by default; per-type variants override it.

```sass
.node-header
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding: $node-padding
  border-bottom: 1px solid $border
  background-color: $bg-secondary
  border-top-left-radius: $radius-md
  border-top-right-radius: $radius-md

  // type variants
  .node--agent     &  background-color: hsl(217 91% 95%)
  .node--tool      &  background-color: hsl(142 76% 95%)
  .node--router    &  background-color: hsl(38 92% 95%)
  .node--trigger   &  background-color: hsl(280 70% 95%)
  .node--output    &  background-color: hsl(0 84% 95%)
```

### NodeTitle

```sass
.node-title
  margin: 0
  font-size: 0.875rem
  font-weight: 600
  line-height: 1.25
  color: $fg
```

### NodeDescription

```sass
.node-description
  margin: 0
  font-size: 0.75rem
  line-height: 1.4
  color: $fg-muted
```

### NodeContent

```sass
.node-content
  padding: $node-padding
  display: flex
  flex-direction: column
  gap: 0.5rem
```

### NodeAction

A small action button positioned in the header (e.g. delete / duplicate).

```sass
.node-action
  display: inline-flex
  align-items: center
  justify-content: center
  width: 1.5rem
  height: 1.5rem
  padding: 0
  border: 0
  border-radius: $radius-md
  background-color: transparent
  color: $fg-muted
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: hsl(0 0% 0% / 0.06)
    color: $fg

  &:focus-visible
    outline: 2px solid $fg
    outline-offset: 1px

  > svg
    width: 0.875rem
    height: 0.875rem
```

### NodeFooter

```sass
.node-footer
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding: $node-padding
  border-top: 1px solid $border
  background-color: $bg-card
```

## Toolbar (top floating bar)

Floats at the top of the canvas; typically hosts save / undo / add-node buttons.

```sass
.workflow-toolbar
  position: absolute
  top: 1rem
  left: 50%
  transform: translateX(-50%)
  z-index: 10
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.375rem
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  box-shadow: $shadow-sm
```

## Panel (right sidebar)

```sass
.workflow-panel
  position: absolute
  top: 1rem
  right: 1rem
  bottom: 1rem
  z-index: 10
  width: 18rem
  border: 1px solid $border
  border-radius: $radius-lg
  background-color: $bg-card
  box-shadow: $shadow-sm
  overflow-y: auto
  padding: 1rem
  display: flex
  flex-direction: column
  gap: 1rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-dark:            hsl(222 47% 6%)
  $bg-card-dark:       hsl(222 47% 6%)
  $bg-secondary-dark:  hsl(217 33% 17%)
  $bg-canvas-dark:     hsl(222 47% 5%)
  $bg-control-dark:    hsl(222 47% 8%)
  $fg-dark:            hsl(210 40% 98%)
  $fg-muted-dark:      hsl(215 16% 65%)
  $border-dark:        hsl(217 33% 17%)
  $border-ring-dark:   hsl(215 16% 35%)

  .canvas
    background-color: $bg-canvas-dark

    .svelte-flow__background
      background-color: $bg-canvas-dark

    .svelte-flow__background-pattern.dots
      fill: $border-dark

  .controls
    background-color: $bg-control-dark
    border-color: $border-dark
    & > button
      color: $fg-muted-dark
      &:hover
        background-color: $bg-secondary-dark
        color: $fg-dark

  .connection__path
    stroke: $border-ring-dark

  .edge__path
    stroke: $border-ring-dark
  .edge--selected .edge__path
    stroke: $fg-dark

  .node
    background-color: $bg-card-dark
    border-color: $border-dark
    color: $fg-dark
    &[data-selected="true"]
      border-color: $fg-dark
      box-shadow: 0 0 0 2px hsl(210 40% 98% / 0.15)

    .svelte-flow__handle
      border-color: $bg-card-dark
      background-color: $fg-muted-dark
      &:hover
        background-color: $fg-dark

  .node-header
    border-bottom-color: $border-dark

    .node--agent     &  background-color: hsl(217 91% 20%)
    .node--tool      &  background-color: hsl(142 76% 20%)
    .node--router    &  background-color: hsl(38 92% 20%)
    .node--trigger   &  background-color: hsl(280 70% 20%)
    .node--output    &  background-color: hsl(0 84% 20%)

  .node-title
    color: $fg-dark

  .node-description
    color: $fg-muted-dark

  .node-footer
    border-top-color: $border-dark
    background-color: $bg-card-dark

  .node-action
    color: $fg-muted-dark
    &:hover
      background-color: hsl(0 0% 100% / 0.06)
      color: $fg-dark

  .workflow-toolbar
    background-color: $bg-card-dark
    border-color: $border-dark

  .workflow-panel
    background-color: $bg-card-dark
    border-color: $border-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<div class="canvas">
  <SvelteFlow nodes={nodes} edges={edges}>
    <Controls />
    <Background />

    {#each nodes as node}
      <Node handles={{ target: true, source: true }}>
        <NodeHeader>
          <NodeTitle>{node.label}</NodeTitle>
          <NodeAction aria-label="Delete" onclick={deleteNode(node.id)}>
            <Trash />
          </NodeAction>
        </NodeHeader>
        <NodeContent>
          <NodeDescription>{node.description}</NodeDescription>
        </NodeContent>
      </Node>
    {/each}
  </SvelteFlow>

  <Toolbar />
  <Panel />
</div>
```
