import Root, {
	type SidebarProps,
	type SidebarSide,
	type SidebarVariant,
	type SidebarCollapsible,
} from "./sidebar.svelte";
import Content, { type SidebarContentProps } from "./sidebar-content.svelte";
import Footer, { type SidebarFooterProps } from "./sidebar-footer.svelte";
import Group, { type SidebarGroupProps } from "./sidebar-group.svelte";
import GroupAction, { type SidebarGroupActionProps } from "./sidebar-group-action.svelte";
import GroupContent, { type SidebarGroupContentProps } from "./sidebar-group-content.svelte";
import GroupLabel, { type SidebarGroupLabelProps } from "./sidebar-group-label.svelte";
import Header, { type SidebarHeaderProps } from "./sidebar-header.svelte";
import Input, { type SidebarInputProps } from "./sidebar-input.svelte";
import Inset, { type SidebarInsetProps } from "./sidebar-inset.svelte";
import Menu, { type SidebarMenuProps } from "./sidebar-menu.svelte";
import MenuAction, { type SidebarMenuActionProps } from "./sidebar-menu-action.svelte";
import MenuBadge, { type SidebarMenuBadgeProps } from "./sidebar-menu-badge.svelte";
import MenuButton, {
	type SidebarMenuButtonProps,
	type SidebarMenuButtonVariant,
	type SidebarMenuButtonSize,
} from "./sidebar-menu-button.svelte";
import MenuItem, { type SidebarMenuItemProps } from "./sidebar-menu-item.svelte";
import MenuSkeleton, { type SidebarMenuSkeletonProps } from "./sidebar-menu-skeleton.svelte";
import MenuSub, { type SidebarMenuSubProps } from "./sidebar-menu-sub.svelte";
import MenuSubButton, {
	type SidebarMenuSubButtonProps,
	type SidebarMenuSubButtonSize,
} from "./sidebar-menu-sub-button.svelte";
import MenuSubItem, { type SidebarMenuSubItemProps } from "./sidebar-menu-sub-item.svelte";
import Provider, { type SidebarProviderProps } from "./sidebar-provider.svelte";
import Rail, { type SidebarRailProps } from "./sidebar-rail.svelte";
import Separator, { type SidebarSeparatorProps } from "./sidebar-separator.svelte";
import Trigger, { type SidebarTriggerProps } from "./sidebar-trigger.svelte";
import { useSidebar, setSidebar, type SidebarStateProps } from "./context.svelte.js";

export {
	Content,
	Footer,
	Group,
	GroupAction,
	GroupContent,
	GroupLabel,
	Header,
	Input,
	Inset,
	Menu,
	MenuAction,
	MenuBadge,
	MenuButton,
	MenuItem,
	MenuSkeleton,
	MenuSub,
	MenuSubButton,
	MenuSubItem,
	Provider,
	Rail,
	Root,
	Separator,
	Trigger,
	//
	Root as Sidebar,
	Content as SidebarContent,
	Footer as SidebarFooter,
	Group as SidebarGroup,
	GroupAction as SidebarGroupAction,
	GroupContent as SidebarGroupContent,
	GroupLabel as SidebarGroupLabel,
	Header as SidebarHeader,
	Input as SidebarInput,
	Inset as SidebarInset,
	Menu as SidebarMenu,
	MenuAction as SidebarMenuAction,
	MenuBadge as SidebarMenuBadge,
	MenuButton as SidebarMenuButton,
	MenuItem as SidebarMenuItem,
	MenuSkeleton as SidebarMenuSkeleton,
	MenuSub as SidebarMenuSub,
	MenuSubButton as SidebarMenuSubButton,
	MenuSubItem as SidebarMenuSubItem,
	Provider as SidebarProvider,
	Rail as SidebarRail,
	Separator as SidebarSeparator,
	Trigger as SidebarTrigger,
	//
	useSidebar,
	setSidebar,
	//
	type SidebarProps,
	type SidebarSide,
	type SidebarVariant,
	type SidebarCollapsible,
	type SidebarContentProps,
	type SidebarFooterProps,
	type SidebarGroupProps,
	type SidebarGroupActionProps,
	type SidebarGroupContentProps,
	type SidebarGroupLabelProps,
	type SidebarHeaderProps,
	type SidebarInputProps,
	type SidebarInsetProps,
	type SidebarMenuProps,
	type SidebarMenuActionProps,
	type SidebarMenuBadgeProps,
	type SidebarMenuButtonProps,
	type SidebarMenuButtonVariant,
	type SidebarMenuButtonSize,
	type SidebarMenuItemProps,
	type SidebarMenuSkeletonProps,
	type SidebarMenuSubProps,
	type SidebarMenuSubButtonProps,
	type SidebarMenuSubButtonSize,
	type SidebarMenuSubItemProps,
	type SidebarProviderProps,
	type SidebarRailProps,
	type SidebarSeparatorProps,
	type SidebarTriggerProps,
	type SidebarStateProps,
};
