# Framer Motion to Svelte Motion Direct Mapping Reference

This reference provides exact 1:1 code equivalences when converting React components that use Framer Motion (`motion/react` or `framer-motion`) into Svelte 5 components using `@humanspeak/svelte-motion`.

---

## Component Equivalences

| React Framer Motion (`.tsx`) | Svelte 5 `@humanspeak/svelte-motion` (`.svelte`) |
| :--- | :--- |
| `<motion.div animate={{ opacity: 1 }}>` | `<Motion animate={{ opacity: 1 }}>` |
| `<motion.button whileHover={{ scale: 1.05 }}>` | `<Motion whileHover={{ scale: 1.05 }}>` |
| `<AnimatePresence>` | `<Presence>` |
| `<motion.div layoutId="pill">` | `<Motion layoutId="pill">` |

---

## Hook & MotionValue Equivalences

| React Framer Motion Hook | Svelte 5 Svelte-Motion Equivalent |
| :--- | :--- |
| `const x = useMotionValue(0)` | `const x = useMotionValue(0)` |
| `const springX = useSpring(x, { stiffness: 300 })` | `const springX = useSpring(x, { stiffness: 300 })` |
| `const opacity = useTransform(x, [-100, 100], [0, 1])` | `const opacity = useTransform(x, [-100, 100], [0, 1])` |
| `const { scrollY, scrollYProgress } = useScroll()` | `const { scrollY, scrollYProgress } = useScroll()` |

---

## Code Transformation Example

### Source React Component (`.tsx`)
```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Converted Svelte 5 Component (`.svelte`)
```svelte
<script lang="ts">
  import { Motion, Presence } from '@humanspeak/svelte-motion';
  import type { Snippet } from 'svelte';

  let { isOpen = false, children }: { isOpen?: boolean; children?: Snippet } = $props();
</script>

<Presence>
  {#if isOpen}
    <Motion
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.3 }}
    >
      {@render children?.()}
    </Motion>
  {/if}
</Presence>
```
