import { ideState } from './ide.svelte';

// Compatibility domain store for shared AI state. The implementation still
// delegates to ideState while AI internals are migrated out incrementally.
export const aiState = ideState;
