---
name: 'react-to-sveltekit'
description: 'Universal conversion pipeline for converting any React / Next.js component (.tsx + .ts) into clean Svelte 5 Runes and SvelteKit implementations (.svelte + .ts). Translates React state/hooks, Framer Motion, GSAP, WebGL canvas, JSX templates, callback props, CUBE CSS, and indented SASS.'
---

# Universal React to SvelteKit Conversion Pipeline

This skill provides a systematic, zero-token-waste pipeline for taking **ANY** React or Next.js UI component written in TypeScript/JSX (`.tsx` + `.ts`) and converting it into idiomatic **Svelte 5 Runes** and **SvelteKit** (`.svelte` + `.ts` + `.sass`).

---

## 🎯 Deterministic 4-Tier Motion & Engine Decision Matrix

When converting any React component, the agent MUST inspect the animation engine used in the source file and execute the matching conversion tier:

```
                       Source React Component Animation Engine
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ Tier 1: Framer Motion ]       [ Tier 2: GSAP ]         [ Tier 3: CSS / JS Timers ]
 `motion/react` / `framer-motion` `gsap` / `ScrollTrigger`   `useState` + inline styles / timers
        │                                │                                │
        ▼                                ▼                                ▼
  Map 1:1 to                      Preserve GSAP 1:1              Convert to Native Svelte
  @humanspeak/svelte-motion       inside Svelte 5 $effect        Runes + svelte/transition
  (<Motion>, <Presence>)          with proper ctx.revert()       or svelte/motion
```

### Tier 1: Framer Motion (`motion/react` or `framer-motion`)
- **Action**: **Map 1:1 to `@humanspeak/svelte-motion`**.
- **Rule**: Check `package.json` for `@humanspeak/svelte-motion`. If present or approved, map components and hooks directly:
  - `<motion.div>` $\rightarrow$ `<Motion>`
  - `<AnimatePresence>` $\rightarrow$ `<Presence>`
  - `useMotionValue(0)` $\rightarrow$ `useMotionValue(0)`
  - `useSpring(val, config)` $\rightarrow$ `useSpring(val, config)`
  - `useScroll()`, `useTransform(...)` $\rightarrow$ `useScroll()`, `useTransform(...)`
  - `layoutId="..."` $\rightarrow$ `layoutId="..."`
- **Fallback**: If `@humanspeak/svelte-motion` is missing and native Svelte is requested, convert simple mount/unmount to `transition:fade` or `transition:fly` from `svelte/transition`, and numeric physics to `spring()` from `svelte/motion`.

### Tier 2: GSAP (`gsap`, `ScrollTrigger`, `SplitText`)
- **Action**: **Preserve GSAP 1:1 inside Svelte 5 `$effect`**.
- **Rule**: Keep GSAP timeline and trigger logic, but wrap inside Svelte 5 `$effect`:
  ```svelte
  <script lang="ts">
    import { gsap } from 'gsap';

    let containerEl = $state<HTMLElement | null>(null);

    $effect(() => {
      if (!containerEl) return;
      const ctx = gsap.context(() => {
        gsap.to('.card', { opacity: 1, duration: 0.5 });
      }, containerEl);

      return () => ctx.revert(); // Essential cleanup on unmount
    });
  </script>

  <div bind:this={containerEl}>...</div>
  ```

### Tier 3: CSS Transitions / Native JS Timers
- **Action**: **Convert to Native Svelte 5 Runes & `svelte/transition`**.
- **Rule**:
  - `{isOpen && <div className="fade" />}` $\rightarrow$ `{#if isOpen}<div transition:fade></div>{/if}`
  - `useState(0)` $\rightarrow$ `let count = $state(0)`
  - `useMemo(() => a + b, [a, b])` $\rightarrow$ `let sum = $derived(a + b)`

### Tier 4: Canvas / WebGL (`Three.js`, `OGL`)
- **Action**: **Bind Canvas & Lifecycle in `$effect`**.
- **Rule**: Bind `<canvas bind:this={canvasEl}>`. Initialize WebGL renderer inside `$effect` and attach a `ResizeObserver` for responsive scaling, destroying the renderer on unmount teardown.

---

## 1. Core Paradigm Translation Rules

### Rule 1: Props & Bindings
- **React**: `interface Props` + `export function Component({ value, onChange }: Props)`
- **Svelte 5**:
  ```svelte
  <script lang="ts">
    import type { ComponentProps } from './Component.types';

    let { value = $bindable(''), open = $bindable(false), onchange }: ComponentProps = $props();
  </script>
  ```
- Two-way props (e.g. `value`, `open`, `active`) use `$bindable()`.
- Children slots use `import type { Snippet } from 'svelte'` and `{@render children?.()}`.

---

## 2. State, Memoization & Effects

| React Hook (`.tsx`) | Svelte 5 Rune (`.svelte`) | Conversion Rule |
| :--- | :--- | :--- |
| `useState(initial)` | `let val = $state(initial)` | Reactive mutable state variable |
| `useRef(null)` | `let el = $state<HTMLElement \| null>(null)` | DOM node binding via `bind:this={el}` |
| `useMemo(() => fn, [deps])` | `let calc = $derived(fn)` | Auto-tracked computed values |
| `useCallback(fn, [deps])` | `function fn() { ... }` | Plain TS functions (Svelte 5 auto-tracks) |
| `useEffect(() => { ... }, [deps])` | `$effect(() => { ... })` | Reactive effect run after DOM mount |
| `useLayoutEffect(...)` | `$effect.pre(() => { ... })` | Runs before DOM mutation update |

> ⚠️ **Svelte2tsx Safety Guard**: Never name a local variable `state`, `derived`, `effect`, or `props` inside a component script block. Svelte2tsx treats those declarations as store getter shims, causing false `TS2448` scope collision errors.

---

## 3. JSX Template to Svelte HTML Syntax

- **Attributes**: `className="..."` $\rightarrow$ `class="..."`
- **Conditionals**: `{isOpen && <div>...</div>}` $\rightarrow$ `{#if isOpen}<div>...</div>{/if}`
- **Ternaries**: `{isEditing ? <Edit /> : <View />}` $\rightarrow$ `{#if isEditing}<Edit />{:else}<View />{/if}`
- **Lists / Mapping**: `{items.map(item => <div key={item.id}>...</div>)}` $\rightarrow$ `{#each items as item (item.id)}<div>...</div>{/each}`
- **Event Listeners**: `onClick={handleClick}` $\rightarrow$ `onclick={handleClick}`
- **DOM Insertion**: `dangerouslySetInnerHTML={{ __html: code }}` $\rightarrow$ `{@html code}`

---

## 4. Styling Conversion (Tailwind / `cn(...)` $\rightarrow$ CUBE CSS + JIT + SASS)

- **Bracket Grouping**: Convert Tailwind string lists into CUBE CSS layer groups:
  ```svelte
  class="[ block-name ] [ row ycenter gap12 ] [ pad16 radius8 bdr ]"
  ```
- **State Exceptions**: Replace dynamic class conditionals (`isOpen ? "bg-blue-500" : ""`) with HTML `data-*` attributes:
  ```svelte
  data-state={isOpen ? 'open' : 'closed'}
  data-variant={variant}
  ```
- **Custom SASS**: Scope non-JIT styles inside `<style lang="sass">` with single-tab indentation, no braces, no semicolons.

---

## 5. Execution Checklist for Agents

When requested to convert any React `.tsx` file:

1. **Check `package.json`**: Identify workspace dependencies (`@humanspeak/svelte-motion`, `gsap`, `clsx`, `lucide-svelte`).
2. **Inspect Source Engine**: Classify component into Tier 1 (Framer Motion), Tier 2 (GSAP), Tier 3 (CSS/JS), or Tier 4 (Canvas).
3. **Extract Types**: Create `Component.types.ts` containing all interface props, snippets, and data types.
4. **Translate Logic**: Convert React hooks to Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`).
5. **Rewrite Template**: Convert JSX map/if/render props to Svelte directives (`{#each}`, `{#if}`, `{@render}`).
6. **Apply Styling**: Convert Tailwind/styled-components to CUBE CSS or indented SASS.
7. **Verify Quality Gate**: Run `pnpm check` to confirm `0 errors and 0 warnings`.
