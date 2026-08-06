# React shadcn/ui (Radix) → bits-ui mapping

Only needed when the source is React shadcn/ui rather than shadcn-svelte. Prefer finding the official shadcn-svelte port of the component first (huntabyte/shadcn-svelte registry) — it already uses bits-ui.

| Radix (React)                     | bits-ui (Svelte)                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@radix-ui/react-accordion`       | `Accordion.Root/Item/Header/Trigger/Content`                                                                                         |
| `@radix-ui/react-alert-dialog`    | `AlertDialog.Root/Trigger/Content/Title/Description/Action/Cancel`                                                                   |
| `@radix-ui/react-avatar`          | `Avatar.Root/Image/Fallback`                                                                                                         |
| `@radix-ui/react-checkbox`        | `Checkbox.Root` (`bind:checked`)                                                                                                     |
| `@radix-ui/react-collapsible`     | `Collapsible.Root/Trigger/Content`                                                                                                   |
| `@radix-ui/react-context-menu`    | `ContextMenu.*`                                                                                                                      |
| `@radix-ui/react-dialog`          | `Dialog.Root/Trigger/Content/Title/Description/Close` (Sheet also uses Dialog)                                                       |
| `@radix-ui/react-dropdown-menu`   | `DropdownMenu.*`                                                                                                                     |
| `@radix-ui/react-hover-card`      | `LinkPreview.*` (bits-ui name for hover card)                                                                                        |
| `@radix-ui/react-label`           | `Label.Root`                                                                                                                         |
| `@radix-ui/react-menubar`         | `Menubar.*`                                                                                                                          |
| `@radix-ui/react-navigation-menu` | `NavigationMenu.*`                                                                                                                   |
| `@radix-ui/react-popover`         | `Popover.Root/Trigger/Content`                                                                                                       |
| `@radix-ui/react-progress`        | `Progress.Root`                                                                                                                      |
| `@radix-ui/react-radio-group`     | `RadioGroup.Root/Item`                                                                                                               |
| `@radix-ui/react-scroll-area`     | `ScrollArea.Root/Viewport/Scrollbar/Thumb`                                                                                           |
| `@radix-ui/react-select`          | `Select.Root/Trigger/Content/Item/Value/Group`                                                                                       |
| `@radix-ui/react-separator`       | `Separator.Root`                                                                                                                     |
| `@radix-ui/react-slider`          | `Slider.Root` (`bind:value`, `type="single"\|"multiple"`)                                                                            |
| `@radix-ui/react-switch`          | `Switch.Root` (`bind:checked`)                                                                                                       |
| `@radix-ui/react-tabs`            | `Tabs.Root/List/Trigger/Content`                                                                                                     |
| `@radix-ui/react-toggle`          | `Toggle.Root` (`bind:pressed`)                                                                                                       |
| `@radix-ui/react-toggle-group`    | `ToggleGroup.Root/Item`                                                                                                              |
| `@radix-ui/react-tooltip`         | `Tooltip.Root/Trigger/Content/Provider`                                                                                              |
| `input-otp` (React)               | `PINInput.Root/Group/Cell` (bits-ui; expose `cells` snippet)                                                                         |
| `react-day-picker` (calendar)     | bits-ui `Calendar.Root` (`type="single"\|"multiple"`); range → separate `RangeCalendar` — do NOT document `type="range"` on Calendar |
| `vaul` (drawer)                   | `vaul-svelte` `Drawer.*`                                                                                                             |
| `react-resizable-panels`          | `paneforge` `PaneGroup/Pane/PaneHandle`                                                                                              |
| `embla-carousel-react`            | `embla-carousel-svelte`                                                                                                              |
| `sonner`                          | `svelte-sonner` `Toaster`/`toast`                                                                                                    |
| `@tanstack/react-table`           | `@tanstack/table-core` `createSvelteTable` + `FlexRender`                                                                            |
| `recharts` (chart)                | `layerchart` + `ChartConfig` container                                                                                               |

## React → Svelte 5 syntax translation

- `useState` → `let x = $state(...)`; controlled props → `bind:value`, `bind:open`, `bind:checked`, `bind:pressed`.
- `className` → `class`; `{...props}` → `{...restProps}` from `$props()`.
- Render props / children-as-function → Svelte snippets (`{#snippet cell(...)}` + `{@render}`).
- `React.forwardRef` → bits-ui `ref` prop (`bind:ref`).
- `asChild` → bits-ui `child` snippet pattern.
- Context providers (`<TooltipProvider>`) → bits-ui `Tooltip.Provider` etc.
