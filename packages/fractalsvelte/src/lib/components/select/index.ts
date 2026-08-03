import Root, { type SelectProps } from './select.svelte';
import Content, { type SelectContentProps } from './select-content.svelte';
import Group, { type SelectGroupProps } from './select-group.svelte';
import GroupHeading, { type SelectGroupHeadingProps } from './select-group-heading.svelte';
import Item, { type SelectItemProps } from './select-item.svelte';
import Label, { type SelectLabelProps } from './select-label.svelte';
import Portal, { type SelectPortalProps } from './select-portal.svelte';
import ScrollDownButton, {
	type SelectScrollDownButtonProps
} from './select-scroll-down-button.svelte';
import ScrollUpButton, { type SelectScrollUpButtonProps } from './select-scroll-up-button.svelte';
import Separator, { type SelectSeparatorProps } from './select-separator.svelte';
import Trigger, { type SelectTriggerProps, type SelectTriggerSize } from './select-trigger.svelte';

export {
	Content,
	Group,
	GroupHeading,
	Item,
	Label,
	Portal,
	Root,
	ScrollDownButton,
	ScrollUpButton,
	Separator,
	Trigger,
	//
	Root as Select,
	Content as SelectContent,
	Group as SelectGroup,
	GroupHeading as SelectGroupHeading,
	Item as SelectItem,
	Label as SelectLabel,
	Portal as SelectPortal,
	ScrollDownButton as SelectScrollDownButton,
	ScrollUpButton as SelectScrollUpButton,
	Separator as SelectSeparator,
	Trigger as SelectTrigger,
	type SelectProps,
	type SelectContentProps,
	type SelectGroupProps,
	type SelectGroupHeadingProps,
	type SelectItemProps,
	type SelectLabelProps,
	type SelectPortalProps,
	type SelectScrollDownButtonProps,
	type SelectScrollUpButtonProps,
	type SelectSeparatorProps,
	type SelectTriggerProps,
	type SelectTriggerSize
};
