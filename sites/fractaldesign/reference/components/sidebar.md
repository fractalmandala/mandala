---
title: Sidebar
description: A collapsible side navigation panel used by the docs site. Supports three variants (sidebar, floating, inset) and three collapsible modes (offcanvas, icon, none) plus a mobile-sheet fallback.
---

# Sidebar

The `Sidebar` family is the primary navigation surface for the docs site. It supports three visual variants and three collapse modes, plus an automatic mobile fallback that switches to a `Sheet`.

The styling below is pure indented Sass.

## Tokens

```sass
$bg:                 hsl(0 0% 100%)
$bg-sidebar:         hsl(0 0% 100%)
$bg-sidebar-accent:  hsl(210 40% 96%)
$bg-sidebar-border:  hsl(214 32% 91%)
$fg-sidebar:         hsl(222 47% 11%)
$fg-sidebar-primary: hsl(222 47% 11%)
$fg-sidebar-primary-fg: hsl(210 40% 98%)
$fg-sidebar-accent:  hsl(215 16% 47%)
$fg-sidebar-muted:   hsl(215 16% 47%)
$fg-sidebar-ring:    hsl(222 47% 11% / 0.5)
$border-sidebar:     hsl(214 32% 91%)
$ring-foreground-10: hsl(222 47% 11% / 0.1)

$radius-md:          0.375rem
$radius-lg:          0.5rem
$radius-xl:          0.75rem
$transition:         200ms cubic-bezier(0.4, 0, 0.2, 1)
$font-size:          0.875rem

$width:              16rem         // 256px
$width-icon:         3rem          // 48px
$width-mobile:       18rem         // 288px

$header-height:      3.5rem        // 56px
$footer-height:      3.5rem        // 56px
$item-height:        2rem          // 32px
$item-padding-x:     0.5rem
$item-radius:        $radius-md
$gap-row:            0.25rem
$padding-y:          0.5rem
```

## Sidebar (root)

```sass
.sidebar
  display: none
  width: $width
  flex-direction: column
  background-color: $bg-sidebar
  color: $fg-sidebar
  font-size: $font-size

  // visible at md+
  @media (min-width: 768px)
    display: flex

  &[data-variant="sidebar"]
    background-color: $bg-sidebar

  &[data-variant="floating"]
    margin: 0.5rem
    border: 1px solid $border-sidebar
    border-radius: $radius-lg

  &[data-variant="inset"]
    margin: 0.5rem
    border-radius: $radius-lg
    background-color: $bg

  // offcanvas — collapses completely out of view
  &[data-collapsible="offcanvas"][data-state="collapsed"]
    margin-left: -$width

  // icon — collapses to icon width
  &[data-collapsible="icon"][data-state="collapsed"]
    width: $width-icon

  // sidebar rail hint when collapsed
  &[data-side="right"]
    border-left-width: 1px

  &[data-side="left"]
    border-right-width: 1px
```

## SidebarHeader

```sass
.sidebar-header
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.5rem
  height: $header-height
  flex-shrink: 0
```

## SidebarContent (scrollable inner region)

```sass
.sidebar-content
  display: flex
  flex: 1 1 auto
  flex-direction: column
  overflow-y: auto
  overflow-x: hidden
  gap: $gap-row
  padding: $padding-y 0

  // hide scrollbar visually
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none
```

## SidebarGroup

```sass
.sidebar-group
  display: flex
  width: 100%
  min-width: 0
  flex-direction: column
  padding: 0 0.5rem

  &[data-collapsible="icon"]
    overflow: hidden
```

## SidebarGroupLabel

```sass
.sidebar-group-label
  display: flex
  height: 1.75rem
  align-items: center
  padding: 0 0.5rem
  font-size: 0.6875rem
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.05em
  color: $fg-sidebar-accent

  // hide when collapsed to icons
  .sidebar[data-collapsible="icon"][data-state="collapsed"] &
    display: none
```

## SidebarGroupContent

```sass
.sidebar-group-content
  display: flex
  flex-direction: column
  gap: $gap-row
  width: 100%
  min-width: 0
```

## SidebarMenu / SidebarMenuItem

```sass
.sidebar-menu
  display: flex
  width: 100%
  min-width: 0
  flex-direction: column
  gap: $gap-row

.sidebar-menu-item
  position: relative
  display: flex
  width: 100%
  min-width: 0
  align-items: center
  gap: 0.5rem
```

## SidebarMenuButton

```sass
.sidebar-menu-button
  display: flex
  width: 100%
  min-width: 0
  align-items: center
  gap: 0.5rem
  padding: 0 $item-padding-x
  height: $item-height
  border: 0
  border-radius: $item-radius
  background-color: transparent
  color: $fg-sidebar
  font-size: $font-size
  text-align: left
  cursor: pointer
  outline: none
  user-select: none
  -webkit-user-select: none
  transition: background-color $transition, color $transition

  &:hover
    background-color: $bg-sidebar-accent
    color: $fg-sidebar

  &[data-active="true"],
  &[aria-current="page"]
    background-color: $bg-sidebar-accent
    color: $fg-sidebar-primary
    font-weight: 500

  &:focus-visible
    box-shadow: 0 0 0 3px $fg-sidebar-ring

  > svg
    width: 1rem
    height: 1rem
    flex-shrink: 0
    color: $fg-sidebar-accent

  &[data-active="true"] > svg,
  &[aria-current="page"] > svg
    color: $fg-sidebar-primary

  > span
    flex: 1 1 auto
    line-clamp: 1
    overflow: hidden
    text-overflow: ellipsis
```

## SidebarMenuSub

A nested list inside a `SidebarMenuItem`.

```sass
.sidebar-menu-sub
  display: flex
  flex-direction: column
  gap: $gap-row
  padding-left: 1rem

  // hide when sidebar is collapsed to icons
  .sidebar[data-collapsible="icon"][data-state="collapsed"] &
    display: none
```

## SidebarRail

A thin vertical handle on the inside edge of the sidebar — used to toggle the collapsed state.

```sass
.sidebar-rail
  position: absolute
  top: 0
  right: -0.5rem
  bottom: 0
  z-index: 10
  width: 1rem
  cursor: w-resize
  user-select: none
  -webkit-user-select: none

  &::after
    content: ""
    position: absolute
    top: 50%
    left: 0.5rem
    transform: translateY(-50%)
    width: 2px
    height: 1.5rem
    border-radius: 9999px
    background-color: transparent
    transition: background-color $transition

  &:hover::after
    background-color: $fg-sidebar
```

## SidebarTrigger

A small button placed in the header that toggles the sidebar on mobile.

```sass
.sidebar-trigger
  display: inline-flex
  align-items: center
  justify-content: center
  width: 2rem
  height: 2rem
  border: 0
  border-radius: $radius-md
  background-color: transparent
  color: $fg-sidebar
  cursor: pointer
  transition: background-color $transition, color $transition

  &:hover
    background-color: $bg-sidebar-accent

  &:focus-visible
    outline: 2px solid $fg-sidebar
    outline-offset: 2px

  > svg
    width: 1rem
    height: 1rem
```

## Dark mode

```sass
@media (prefers-color-scheme: dark)
  $bg-sidebar-dark:        hsl(222 47% 6%)
  $bg-sidebar-accent-dark: hsl(217 33% 17%)
  $fg-sidebar-dark:        hsl(210 40% 98%)
  $fg-sidebar-accent-dark: hsl(215 16% 65%)
  $border-sidebar-dark:    hsl(217 33% 17%)
  $ring-dark:              hsl(210 40% 98% / 0.1)

  .sidebar
    background-color: $bg-sidebar-dark
    color: $fg-sidebar-dark

  .sidebar-menu-button
    color: $fg-sidebar-dark
    &:hover
      background-color: $bg-sidebar-accent-dark

    &[data-active="true"],
    &[aria-current="page"]
      background-color: $bg-sidebar-accent-dark
      color: $fg-sidebar-dark

  .sidebar-rail:hover::after
    background-color: $fg-sidebar-dark
```

## Usage skeleton (Svelte, for reference)

```svelte
<aside class="sidebar" data-variant="sidebar" data-side="left" data-collapsible="icon" data-state="open">
  <div class="sidebar-header">
    <Logo />
    <span>ai-elements</span>
  </div>

  <div class="sidebar-content">
    <div class="sidebar-group">
      <div class="sidebar-group-label">Getting started</div>
      <div class="sidebar-group-content">
        <ul class="sidebar-menu">
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" href="/docs">
              <Book />
              <span>Introduction</span>
            </a>
          </li>
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" data-active="true" href="/docs/install">
              <Download />
              <span>Installation</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="sidebar-rail"></div>
</aside>
```
