import Root, { type NavigationMenuProps } from './navigation-menu.svelte';
import Content, {
	type NavigationMenuContentLayout,
	type NavigationMenuContentProps,
	type NavigationMenuContentWidth
} from './navigation-menu-content.svelte';
import Indicator, { type NavigationMenuIndicatorProps } from './navigation-menu-indicator.svelte';
import Item, { type NavigationMenuItemProps } from './navigation-menu-item.svelte';
import Link, {
	type NavigationMenuLinkProps,
	type NavigationMenuLinkVariant
} from './navigation-menu-link.svelte';
import List, {
	type NavigationMenuListProps,
	type NavigationMenuListWrap
} from './navigation-menu-list.svelte';
import Trigger, {
	type NavigationMenuTriggerProps,
	type NavigationMenuTriggerVariant
} from './navigation-menu-trigger.svelte';
import Viewport, { type NavigationMenuViewportProps } from './navigation-menu-viewport.svelte';

export {
	Root,
	Content,
	Indicator,
	Item,
	Link,
	List,
	Trigger,
	Viewport,
	//
	Root as NavigationMenu,
	Root as NavigationMenuRoot,
	Content as NavigationMenuContent,
	Indicator as NavigationMenuIndicator,
	Item as NavigationMenuItem,
	Link as NavigationMenuLink,
	List as NavigationMenuList,
	Trigger as NavigationMenuTrigger,
	Viewport as NavigationMenuViewport,
	type NavigationMenuProps,
	type NavigationMenuContentLayout,
	type NavigationMenuContentProps,
	type NavigationMenuContentWidth,
	type NavigationMenuIndicatorProps,
	type NavigationMenuItemProps,
	type NavigationMenuLinkProps,
	type NavigationMenuLinkVariant,
	type NavigationMenuListProps,
	type NavigationMenuListWrap,
	type NavigationMenuTriggerProps,
	type NavigationMenuTriggerVariant,
	type NavigationMenuViewportProps
};
