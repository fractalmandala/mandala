/** fractals-styler — Svelte showcase + token utilities.
 *
 * Import the live token editor + showcase anywhere in a SvelteKit app:
 *   import { StylerPreview } from 'fractals-styler/lib';
 *   import { loadOverrides, SCALING_VAR, TYPE_LEVELS } from 'fractals-styler/lib';
 */

export { default as StylerPreview } from './StylerPreview.svelte';
export * from './styler-preview.js';

/** Canonical docs app shell (CUBE Composition layer) + shared TOC store. */
export { default as AppShell } from './AppShell.svelte';
export { toc, type TocItem } from './toc.svelte';