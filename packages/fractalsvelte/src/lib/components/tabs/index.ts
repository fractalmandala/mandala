import Root, { type TabsProps } from './tabs.svelte';
import Content, { type TabsContentProps } from './tabs-content.svelte';
import List, { type TabsListProps, type TabsListVariant } from './tabs-list.svelte';
import Trigger, { type TabsTriggerProps } from './tabs-trigger.svelte';

export {
	Root,
	Content,
	List,
	Trigger,
	type TabsProps as Props,
	//
	Root as Tabs,
	Content as TabsContent,
	List as TabsList,
	Trigger as TabsTrigger,
	type TabsProps,
	type TabsContentProps,
	type TabsListProps,
	type TabsListVariant,
	type TabsTriggerProps
};
