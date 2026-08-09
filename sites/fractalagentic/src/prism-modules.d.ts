// prismjs ships no per-component type declarations; the component files are
// side-effect imports that register grammars onto the Prism singleton.
declare module 'prismjs/components/*';

// Third-party Svelte grammar — also a side-effect import (registers
// Prism.languages.svelte). No types published.
declare module 'prism-svelte';
