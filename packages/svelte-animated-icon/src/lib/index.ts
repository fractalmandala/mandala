// Main package entry — re-exports core utilities.
// Icon libraries are available via subpath imports:
//   import { Gear } from 'svelte-animated-icon/phosphor'
export { AnimatedIcon, TEMPLATES, TEMPLATE_IDS, getTemplate, clearProps } from '$lib/core/index.svelte';
export type { AnimatedIconProps, IconTemplate } from '$lib/core/index.svelte';
