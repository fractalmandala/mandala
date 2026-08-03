import Root, { type TooltipProps } from './tooltip.svelte';
import Content, { type TooltipContentProps } from './tooltip-content.svelte';
import Portal, { type TooltipPortalProps } from './tooltip-portal.svelte';
import Provider, { type TooltipProviderProps } from './tooltip-provider.svelte';
import Trigger, {
	type TooltipTriggerProps,
	type TooltipTriggerVariant
} from './tooltip-trigger.svelte';

export {
	Root,
	Content,
	Portal,
	Provider,
	Trigger,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Portal as TooltipPortal,
	Provider as TooltipProvider,
	Trigger as TooltipTrigger,
	type TooltipProps,
	type TooltipContentProps,
	type TooltipPortalProps,
	type TooltipProviderProps,
	type TooltipTriggerProps,
	type TooltipTriggerVariant
};
