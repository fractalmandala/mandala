import Task from './task.svelte';
import TaskTrigger from './task-trigger.svelte';
import TaskContent from './task-content.svelte';
import TaskItem from './task-item.svelte';
import TaskItemFile from './task-item-file.svelte';

export {
	Task,
	TaskTrigger,
	TaskContent,
	TaskItem,
	TaskItemFile,
	// Aliases
	Task as Root,
	TaskTrigger as Trigger,
	TaskContent as Content,
	TaskItem as Item,
	TaskItemFile as ItemFile
};

export type { TaskProps } from './task.svelte';
export type { TaskTriggerProps } from './task-trigger.svelte';
export type { TaskContentProps } from './task-content.svelte';
export type { TaskItemProps } from './task-item.svelte';
export type { TaskItemFileProps } from './task-item-file.svelte';
