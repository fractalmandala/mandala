---
name: layout-capture
description: Analyzes Svelte components, pages, layouts, or combinations of them and produces two complementary, production-ready Mermaid diagrams illustrating the UI layout architecture and DOM containment boundaries.
metadata:
  origin: fractal-agentic
---

# Skill: Svelte to Mermaid Architecture Generator

## Description
Analyzes Svelte component structures (`+page.svelte`, `+layout.svelte`, standalone `.svelte` components, or combinations of them) and produces two complementary, production-ready Mermaid diagrams illustrating the UI layout architecture and DOM containment boundaries.

---

## Capabilities & Directives

### 1. Code Parsing & Abstraction
* **Slot & Children Identification:** Locate `<slot />`, `{@render children()}`, or named slots/snippets to understand component wrapping dynamics.
* **Layout Structure:** Identify top-level containers, CSS grids, flex parents, sidebars, sticky headers, scroll regions, and viewports.
* **Metadata Extraction:** Extract key visual cues from class names (Tailwind or standard CSS) and comments (e.g., heights, gaps, paddings, fixed positions, dynamic conditions like `#if`).

---

## Required Output Formats

Always output **both** diagrams enclosed in valid ```mermaid``` code blocks.

### Diagram 1: Clean Flowchart (UI Architecture & Layout Flow)
* **Type:** `graph TD`
* **Purpose:** Highlights top-down structural relationships, component trees, and functional annotations.
* **Formatting:**
  * Use markdown strings in nodes: `["\`**node-name**\n*(Annotation metadata)*\`"]`
  * Group distinct regions clearly from root to leaf.
  * Include responsive layout annotations (e.g., `100vh`, `flex column`, `scrollable`, sticky headers).

### Diagram 2: Subgraphs / Box Model (Component Containment)
* **Type:** `flowchart TD`
* **Purpose:** Mirrors DOM nesting, CSS grid/flexbox grouping, and layout containment boundaries.
* **Formatting:**
  * Use `subgraph` blocks to visually wrap child elements inside parent elements.
  * Set inner layout direction using `direction TB` or `direction LR`.
  * Ensure node names reflect component or HTML class semantics.

---

## Step-by-Step Prompt Trigger Template

When invoked, the agent must perform:
1. Scan the provided `.svelte` file(s) for visual hierarchy and container structure.
2. Filter out non-layout logic (script tags, plain event handlers, data fetching) unless it directly conditionally renders visual containers (`{#if}`, `{#each}`).
3. Render Diagram 1 (`graph TD`).
4. Render Diagram 2 (`flowchart TD`).
5. Provide a brief breakdown comparing how layout regions map to the diagram nodes.