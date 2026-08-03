import Root, { type CollapsibleProps } from './collapsible.svelte';
import Content, { type CollapsibleContentProps } from './collapsible-content.svelte';
import Trigger, { type CollapsibleTriggerProps } from './collapsible-trigger.svelte';

export {
	Root,
	Content,
	Trigger,
	type CollapsibleProps as Props,
	//
	Root as Collapsible,
	Content as CollapsibleContent,
	Trigger as CollapsibleTrigger,
	type CollapsibleProps,
	type CollapsibleContentProps,
	type CollapsibleTriggerProps
};
