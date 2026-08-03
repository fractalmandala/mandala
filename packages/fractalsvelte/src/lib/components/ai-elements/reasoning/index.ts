import Reasoning from './reasoning.svelte';
import ReasoningTrigger from './reasoning-trigger.svelte';
import ReasoningContent from './reasoning-content.svelte';

export * from './reasoning-context.svelte.js';

export {
	Reasoning,
	ReasoningTrigger,
	ReasoningContent,
	// Aliases
	Reasoning as Root,
	ReasoningTrigger as Trigger,
	ReasoningContent as Content
};

export type { ReasoningProps } from './reasoning.svelte';
export type { ReasoningTriggerProps } from './reasoning-trigger.svelte';
export type { ReasoningContentProps } from './reasoning-content.svelte';
