import Close, { type PopoverCloseProps } from './popover-close.svelte';
import Content, { type PopoverContentProps } from './popover-content.svelte';
import Description, { type PopoverDescriptionProps } from './popover-description.svelte';
import Header, { type PopoverHeaderProps } from './popover-header.svelte';
import Portal, { type PopoverPortalProps } from './popover-portal.svelte';
import Root, { type PopoverProps } from './popover.svelte';
import Title, { type PopoverTitleProps } from './popover-title.svelte';
import Trigger, { type PopoverTriggerProps } from './popover-trigger.svelte';

export {
	Close,
	Content,
	Description,
	Header,
	Portal,
	Root,
	Title,
	Trigger,
	//
	Root as Popover,
	Close as PopoverClose,
	Content as PopoverContent,
	Description as PopoverDescription,
	Header as PopoverHeader,
	Portal as PopoverPortal,
	Title as PopoverTitle,
	Trigger as PopoverTrigger,
	type PopoverCloseProps,
	type PopoverContentProps,
	type PopoverDescriptionProps,
	type PopoverHeaderProps,
	type PopoverPortalProps,
	type PopoverProps,
	type PopoverTitleProps,
	type PopoverTriggerProps
};
