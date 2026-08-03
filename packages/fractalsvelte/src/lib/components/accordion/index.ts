import Root, {
	type AccordionProps,
	type AccordionSize,
	type AccordionVariant
} from './accordion.svelte';
import Content, {
	type AccordionContentProps,
	type AccordionContentTone
} from './accordion-content.svelte';
import Item, { type AccordionItemProps } from './accordion-item.svelte';
import Trigger, { type AccordionTriggerProps } from './accordion-trigger.svelte';

export {
	Root,
	Content,
	Item,
	Trigger,
	type AccordionProps as Props,
	//
	Root as Accordion,
	Content as AccordionContent,
	Item as AccordionItem,
	Trigger as AccordionTrigger,
	type AccordionProps,
	type AccordionSize,
	type AccordionVariant,
	type AccordionContentProps,
	type AccordionContentTone,
	type AccordionItemProps,
	type AccordionTriggerProps
};
