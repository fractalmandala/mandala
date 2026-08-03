import Checkpoint from './checkpoint.svelte';
import CheckpointIcon from './checkpoint-icon.svelte';
import CheckpointTrigger from './checkpoint-trigger.svelte';

export {
	Checkpoint,
	CheckpointIcon,
	CheckpointTrigger,
	// Aliases
	Checkpoint as Root,
	CheckpointIcon as Icon,
	CheckpointTrigger as Trigger
};

export type { CheckpointProps } from './checkpoint.svelte';
export type { CheckpointIconProps } from './checkpoint-icon.svelte';
export type { CheckpointTriggerProps } from './checkpoint-trigger.svelte';
