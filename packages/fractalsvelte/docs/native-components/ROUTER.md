---
title: Native Components Router
description: This document is a high-speed, token-efficient router designed for AI agents and LLM builders.
---

## 1. Paradigm Quick Selector

When a user prompt specifies an implementation intent:

| Intent Keywords | Paradigm | Target Directory | Characteristic |
| :--- | :--- | :--- | :--- |
| `"full css"`, `"zero js"`, `"native html"`, `"pure css"` | **Zero-JS Native HTML** | `native-components/<name>.md` | Uses HTML5 tags (`<details>`, `<dialog>`, `popover`, `:has()`) + JIT CSS |
| `"svelte native"`, `"svelte 5"`, `"runes"`, `"controlled"` | **Svelte 5 Runes** | `native-components/svelte/<name>.md` | Uses `$state()`, `$derived()`, `$effect()`, `$bindable()`, SvelteKit `page`/`goto` |

---

## 2. Component Direct Lookup Index

| Component Intent Key | Zero-JS / Pure CSS Path | Svelte 5 Rune Path | Primary CUBE Classes |
| :--- | :--- | :--- | :--- |
| **accordion** | [`accordion.md`](./accordion.md) | [`svelte/accordion.md`](./svelte/accordion.md) | `[ accordion ] [ box w100 ] [ radius8 bdr ]` |
| **alert** | [`alert.md`](./alert.md) | N/A (Static HTML) | `[ alert ] [ row xtop gap12 ] [ pad16 radius8 bdr ]` |
| **alert-dialog** | [`dialog.md`](./dialog.md) | [`svelte/alert-dialog.md`](./svelte/alert-dialog.md) | `[ alert-dialog ] [ box maxw500 ] [ pad24 radius12 bdr ]` |
| **aspect-ratio** | [`aspect-ratio.md`](./aspect-ratio.md) | N/A (Static CSS) | `[ aspect-ratio ] [ w100 position-relative ]` |
| **avatar** | [`avatar.md`](./avatar.md) | N/A (Static HTML) | `[ avatar ] [ row xcenter ycenter ] [ radiusfull ]` |
| **badge** | [`badge.md`](./badge.md) | N/A (Static HTML) | `[ badge ] [ row ycenter ] [ pad4 padleft10 radiusfull ]` |
| **breadcrumb** | [`breadcrumb.md`](./breadcrumb.md) | N/A (Static HTML) | `[ breadcrumb__list ] [ row ycenter gap8 text-sm ]` |
| **button** | [`button.md`](./button.md) | N/A (Callback Prop) | `[ button ] [ row ycenter xcenter gap8 ] [ radius6 bold ]` |
| **button-group** | [`button-group.md`](./button-group.md) | N/A (Static Flex) | `[ button-group ] [ row ycenter ]` |
| **calendar** | N/A (JS Required) | [`svelte/calendar.md`](./svelte/calendar.md) | `[ calendar ] [ box maxw320 ] [ pad16 radius8 bdr ]` |
| **card** | [`card.md`](./card.md) | N/A (Static HTML) | `[ card ] [ box w100 ] [ radius8 bdr ]` |
| **carousel** | [`carousel.md`](./carousel.md) | [`svelte/carousel.md`](./svelte/carousel.md) | `[ carousel-track ] [ row gap16 padbot8 ]` |
| **checkbox** | [`checkbox.md`](./checkbox.md) | N/A (Native Input) | `[ checkbox ] [ row ycenter gap8 text-sm ]` |
| **collapsible** | [`collapsible.md`](./collapsible.md) | [`svelte/accordion.md`](./svelte/accordion.md) | `[ collapsible ] [ box w100 ] [ radius6 bdr ]` |
| **combobox** / **command** | N/A (JS Required) | [`svelte/combobox.md`](./svelte/combobox.md) | `[ combobox ] [ box w100 position-relative ]` |
| **context-menu** | N/A (JS Required) | [`svelte/context-menu.md`](./svelte/context-menu.md) | `[ context-menu ] [ box pad6 radius8 bdr position-fixed ]` |
| **data-table** | N/A (JS Required) | [`svelte/data-table.md`](./svelte/data-table.md) | `[ data-table-container ] [ box w100 gap16 ]` |
| **date-picker** | N/A (JS Required) | [`svelte/date-picker.md`](./svelte/date-picker.md) | `[ date-picker ] [ box position-relative ]` |
| **dialog** / **modal** | [`dialog.md`](./dialog.md) | [`svelte/dialog.md`](./svelte/dialog.md) | `[ modal-container ] [ box maxw500 ] [ pad24 radius12 bdr ]` |
| **drawer** / **sheet** | [`drawer.md`](./drawer.md) | [`svelte/drawer.md`](./svelte/drawer.md) | `[ drawer ] [ width360 maxw100 h100 ]` |
| **dropdown-menu** | [`dropdown-menu.md`](./dropdown-menu.md) | [`svelte/dropdown-menu.md`](./svelte/dropdown-menu.md) | `[ dropdown-menu ] [ pad6 radius8 bdr minw180 ]` |
| **empty** | [`empty.md`](./empty.md) | N/A (Static HTML) | `[ empty ] [ box xcenter ycenter ] [ pad48 radius12 ]` |
| **field** | [`field.md`](./field.md) | N/A (Static HTML) | `[ field ] [ box gap6 marginbot20 ]` |
| **hover-card** | [`hover-card.md`](./hover-card.md) | [`svelte/hover-card.md`](./svelte/hover-card.md) | `[ hover-card-popover ] [ pad16 radius8 bdr width280 ]` |
| **input** | [`input.md`](./input.md) | N/A (Native Input) | `[ input ] [ w100 pad8 padleft12 radius6 bdr text-sm ]` |
| **input-group** | [`input-group.md`](./input-group.md) | N/A (Static Flex) | `[ input-group ] [ row ycenter w100 ]` |
| **input-otp** | N/A (JS Required) | [`svelte/input-otp.md`](./svelte/input-otp.md) | `[ input-otp ] [ row ycenter gap8 ]` |
| **item** | [`item.md`](./item.md) | N/A (Static HTML) | `[ item ] [ row ycenter gap12 ] [ pad12 radius6 ]` |
| **kbd** | [`kbd.md`](./kbd.md) | N/A (Static Tag) | `[ kbd ] [ row ycenter xcenter ] [ pad2 padleft6 radius4 bdr ]` |
| **label** | [`label.md`](./label.md) | N/A (Static Tag) | `[ label ] [ row ycenter gap4 text-sm bold ]` |
| **menubar** | N/A (JS Required) | [`svelte/menubar.md`](./svelte/menubar.md) | `[ menubar ] [ row ycenter gap4 pad4 radius8 bdr ]` |
| **navigation-menu** | [`navigation-menu.md`](./navigation-menu.md) | [`svelte/navigation-menu.md`](./svelte/navigation-menu.md) | `[ nav-menu__list ] [ row ycenter gap16 ]` |
| **pagination** | [`pagination.md`](./pagination.md) | [`svelte/pagination.md`](./svelte/pagination.md) | `[ pagination__list ] [ row ycenter gap4 ]` |
| **popover** | [`popover.md`](./popover.md) | [`svelte/popover.md`](./svelte/popover.md) | `[ popover ] [ pad16 radius8 bdr maxw320 ]` |
| **progress** | [`progress.md`](./progress.md) | N/A (Native Tag) | `[ progress ] [ w100 height10 radiusfull ]` |
| **radio-group** | [`radio-group.md`](./radio-group.md) | N/A (Native Radio) | `[ radio-group ] [ box ]` |
| **resizable** | N/A (JS Required) | [`svelte/resizable.md`](./svelte/resizable.md) | `[ resizable-container ] [ row w100 h100 ]` |
| **scroll-area** | [`scroll-area.md`](./scroll-area.md) | N/A (CSS Overflow) | `[ scroll-area ] [ box w100 padright4 ]` |
| **select** | [`select.md`](./select.md) | [`svelte/select.md`](./svelte/select.md) | `[ custom-select ] [ w100 pad8 radius6 bdr text-sm ]` |
| **separator** | [`separator.md`](./separator.md) | N/A (Static Tag) | `[ separator ] [ margin0 ]` |
| **sidebar** | [`sidebar.md`](./sidebar.md) | [`svelte/sidebar.md`](./svelte/sidebar.md) | `[ sidebar ] [ box width260 h100 ]` |
| **skeleton** | [`skeleton.md`](./skeleton.md) | N/A (CSS Shimmer) | `[ skeleton ] [ radius6 ]` |
| **slider** | [`slider.md`](./slider.md) | N/A (Native Range) | `[ slider ] [ w100 height6 radiusfull ]` |
| **spinner** | [`spinner.md`](./spinner.md) | N/A (SVG Animation) | `[ spinner ] [ width24 height24 ]` |
| **switch** | [`switch.md`](./switch.md) | N/A (Native Switch) | `[ switch ] [ row ycenter gap8 text-sm ]` |
| **table** | [`table.md`](./table.md) | N/A (Static Table) | `[ table ] [ w100 text-sm ]` |
| **tabs** | [`tabs.md`](./tabs.md) | [`svelte/tabs.md`](./svelte/tabs.md) | `[ tabs ] [ box ]` |
| **textarea** | [`textarea.md`](./textarea.md) | N/A (Native Tag) | `[ textarea ] [ w100 pad10 radius6 bdr text-sm ]` |
| **toast** / **sonner** | N/A (JS Required) | [`svelte/toast.md`](./svelte/toast.md) | `[ toast-container ] [ box gap8 position-fixed ]` |
| **toggle** | [`toggle.md`](./toggle.md) | N/A (Native Input) | `[ toggle ] [ row ycenter ]` |
| **toggle-group** | [`toggle-group.md`](./toggle-group.md) | [`svelte/toggle-group.md`](./svelte/toggle-group.md) | `[ toggle-group ] [ row ycenter pad4 radius8 ]` |
| **tooltip** | [`tooltip.md`](./tooltip.md) | [`svelte/tooltip.md`](./svelte/tooltip.md) | `[ tooltip-wrapper ] [ position-relative ]` |
| **typography** | [`typography.md`](./typography.md) | N/A (Static Tags) | `[ typography ] [ margin0 text-sm ]` |

