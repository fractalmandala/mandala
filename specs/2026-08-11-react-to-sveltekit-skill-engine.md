# Technical Specification: Universal React-to-SvelteKit Skill Engine (`react-to-sveltekit`)

**Spec ID:** `specs/2026-08-11-react-to-sveltekit-skill-engine.md`  
**Status:** Pending Review  
**Target Skill:** `.agents/skills/react-to-sveltekit/SKILL.md`  
**Target Stack:** SvelteKit / Svelte 5 (Runes) / TypeScript / Indented SASS & CUBE CSS  

---

## 1. Feature Overview

The **Universal React-to-SvelteKit Skill Engine** (`react-to-sveltekit`) is an agentic conversion pipeline designed to take **ANY** React or Next.js UI component written in TypeScript/JSX (`.tsx`/`.jsx`) and transform it into an idiomatic, type-safe, zero-error Svelte 5 component (`.svelte` + `.ts` + `.sass`).

This skill equips AI coding agents with a deterministic, multi-tier decision algorithm that eliminates common conversion failure modes — such as legacy Svelte 3/4 syntax hallucinations (`export let`, `onMount` state hacks), broken reactive effects, and lossy animation rewrites.

---

## 2. Problem Being Solved

The React ecosystem contains a ~20x larger library of UI motion components, interactive cards, WebGL shaders, and design blocks compared to Svelte/SvelteKit. 

Developers wanting to bring components from open-source React repositories (React Bits, Magic UI, Aceternity UI, 21st.dev, Shadcn UI) into SvelteKit currently face manual, error-prone code translation. This skill bridges the ecosystem gap by providing a standardized conversion engine that any agent can execute with high precision.

---

## 3. Business Rules & Deterministic Decision Matrix

### 3.1 4-Tier Motion Conversion Decision Matrix

Agents executing this skill MUST classify the source React component's animation engine and execute the corresponding 1:1 conversion path:

| Tier | React Source Engine | Target Svelte 5 Mapping | Conversion Action |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Framer Motion (`motion/react`, `framer-motion`) | `@humanspeak/svelte-motion` | **1:1 Structural Mirror**: Map `<motion.div>` $\rightarrow$ `<Motion>`, `<AnimatePresence>` $\rightarrow$ `<Presence>`, `useScroll` $\rightarrow$ `useScroll`, `useSpring` $\rightarrow$ `useSpring`, `useTransform` $\rightarrow$ `useTransform`. |
| **Tier 2** | GSAP (`gsap`, `ScrollTrigger`, `SplitText`) | Native GSAP inside Svelte 5 `$effect` | **Lifecycle Preservation**: Wrap GSAP timelines inside `$effect(() => { ... return () => ctx.revert(); })`. Preserve GSAP animations 1:1. |
| **Tier 3** | Pure CSS Transitions / JS Timers | Native Svelte 5 Runes + `svelte/transition` | **Native Optimization**: Replace `useState` toggles and inline styles with `let s = $state()`, `in:fade`, `transition:fly`, or `svelte/motion` `spring()`. |
| **Tier 4** | Canvas / WebGL (`Three.js`, `OGL`) | Canvas + Svelte 5 `$effect` Lifecycle | **Canvas Context Binding**: Bind `<canvas bind:this={canvasEl}>` and initialize WebGL context inside `$effect` with explicit `ResizeObserver` cleanup. |

### 3.2 Svelte 5 Runes & Paradigm Rules

1. **State & Properties**:
   - `useState(init)` $\rightarrow$ `let value = $state(init)`
   - `useMemo(() => fn, [deps])` $\rightarrow$ `let calc = $derived(fn)`
   - `useEffect(() => fn, [deps])` $\rightarrow$ `$effect(() => fn)`
   - `useRef(null)` $\rightarrow$ `let el = $state<HTMLElement \| null>(null)` + `bind:this={el}`
   - Props interface $\rightarrow$ `let { prop = defaultValue, value = $bindable() }: ComponentProps = $props()`

2. **Templates & Children**:
   - JSX `{children}` $\rightarrow$ `import type { Snippet } from 'svelte'` + `{@render children?.()}`
   - JSX lists `{items.map(...)}` $\rightarrow$ `{#each items as item (item.id)}...{/each}`
   - JSX conditionals `{isOpen && ...}` $\rightarrow$ `{#if isOpen}...{/if}`

3. **Styling & Classes**:
   - Tailwind utility lists $\rightarrow$ `fractals-styler` JIT CUBE CSS classes or indented SASS (`<style lang="sass">` with single-tab indentation, no braces, no semicolons).
   - Dynamic class toggles $\rightarrow$ HTML `data-*` state attributes (`data-state={isOpen ? 'open' : 'closed'}`).

---

## 4. Impacted Files & Reference Structure

- **Main Skill Entrypoint**: [`.agents/skills/react-to-sveltekit/SKILL.md`](file:///Users/amrit/mandala/.agents/skills/react-to-sveltekit/SKILL.md)
- **Reference Documentation**:
  - `.agents/skills/react-to-sveltekit/references/motion-mapping.md` (Detailed Framer Motion $\rightarrow$ Svelte Motion translation table)
  - `.agents/skills/react-to-sveltekit/references/runes-cheatsheet.md` (React hooks to Svelte 5 runes mapping guide)
- **Example Conversion Mappings**:
  - `.agents/skills/react-to-sveltekit/examples/motion-card.svelte` (Complete end-to-end converted component example)

---

## 5. Input / Output Contracts

### Input Contract
- **Source**: Any React `.tsx` or `.jsx` file, code snippet, or directory path.

### Output Contract
- **Target**: Clean Svelte 5 `.svelte` file + optional `.types.ts` and `.sass` stylesheet.
- **Compilation Gate**: `svelte-check` validation passing with **0 errors and 0 warnings** (`pnpm check`).
- **Runtime Target**: Smooth 60fps interaction equivalent to or exceeding the original React component.

---

## 6. Acceptance Criteria

1. **Zero Legacy Syntax**: No `export let`, `onMount` store hacks, or Svelte 3/4 legacy store assignments in generated code.
2. **1:1 Framer Motion Compatibility**: Components using `motion/react` convert seamlessly to `@humanspeak/svelte-motion` without breaking gestures, springs, or layout animations.
3. **Clean GSAP Lifecycles**: Components using GSAP use proper `gsap.context()` reverting inside Svelte `$effect` teardown callbacks.
4. **Strict Type Safety**: All props, snippets, and event handlers are fully typed with TypeScript.
5. **Indented SASS Compliance**: Any custom stylesheets follow single-tab indentation formatting without braces or semicolons.

---

## 7. Technical Risks & Mitigation

| Risk | Mitigation |
| :--- | :--- |
| Agent generating invalid `svelte2tsx` shims (e.g. naming local variables `state`) | Explicit anti-pattern warning rule added to SKILL.md. |
| Missing `@humanspeak/svelte-motion` package in target workspace | Clear fallback rule: check `package.json`, use `@humanspeak/svelte-motion` if present/approved, else default to native `svelte/transition` & `svelte/motion`. |
| Unhandled memory leaks from canvas or event listeners | Strict `$effect` return teardown pattern enforced in all conversion scripts. |

---

## 8. Suggested Implementation Plan

1. **Step 1**: Update `.agents/skills/react-to-sveltekit/SKILL.md` with the 4-tier decision matrix, runes cheatsheet, and execution checklist.
2. **Step 2**: Create supporting reference files in `.agents/skills/react-to-sveltekit/references/`.
3. **Step 3**: Validate converted output on 4 sample components across motion tiers.
4. **Step 4**: Run `pnpm check` across workspace to ensure 100% type safety.

---

## 9. Validation Checklist

- [x] Feature Overview & Problem Statement
- [x] Business Rules & 4-Tier Decision Matrix
- [x] Svelte 5 Runes Conversion Specifications
- [x] Impacted Files & Architecture
- [x] Input / Output Contracts
- [x] Acceptance Criteria
- [x] Technical Risks & Mitigations
- [x] Implementation Plan
- [x] Validation Checklist

Score: **9/9 — Specification Complete**.
