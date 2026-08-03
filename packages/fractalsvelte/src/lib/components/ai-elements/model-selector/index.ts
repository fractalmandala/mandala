import Root from "./model-selector.svelte";
import Trigger from "./model-selector-trigger.svelte";
import Content from "./model-selector-content.svelte";
import Dialog from "./model-selector-dialog.svelte";
import Input from "./model-selector-input.svelte";
import List from "./model-selector-list.svelte";
import Item from "./model-selector-item.svelte";
import Group from "./model-selector-group.svelte";
import Empty from "./model-selector-empty.svelte";
import Separator from "./model-selector-separator.svelte";
import Shortcut from "./model-selector-shortcut.svelte";
import Logo from "./model-selector-logo.svelte";
import LogoGroup from "./model-selector-logo-group.svelte";
import Name from "./model-selector-name.svelte";

export {
	Root,
	Trigger,
	Content,
	Dialog,
	Input,
	List,
	Item,
	Group,
	Empty,
	Separator,
	Shortcut,
	Logo,
	LogoGroup,
	Name,
	// Aliases
	Root as ModelSelector,
	Trigger as ModelSelectorTrigger,
	Content as ModelSelectorContent,
	Dialog as ModelSelectorDialog,
	Input as ModelSelectorInput,
	List as ModelSelectorList,
	Item as ModelSelectorItem,
	Group as ModelSelectorGroup,
	Empty as ModelSelectorEmpty,
	Separator as ModelSelectorSeparator,
	Shortcut as ModelSelectorShortcut,
	Logo as ModelSelectorLogo,
	LogoGroup as ModelSelectorLogoGroup,
	Name as ModelSelectorName,
};

export type { ModelSelectorProps } from "./model-selector.svelte";
export type { ModelSelectorTriggerProps } from "./model-selector-trigger.svelte";
export type { ModelSelectorContentProps } from "./model-selector-content.svelte";
export type { ModelSelectorDialogProps } from "./model-selector-dialog.svelte";
export type { ModelSelectorInputProps } from "./model-selector-input.svelte";
export type { ModelSelectorListProps } from "./model-selector-list.svelte";
export type { ModelSelectorItemProps } from "./model-selector-item.svelte";
export type { ModelSelectorGroupProps } from "./model-selector-group.svelte";
export type { ModelSelectorEmptyProps } from "./model-selector-empty.svelte";
export type { ModelSelectorSeparatorProps } from "./model-selector-separator.svelte";
export type { ModelSelectorShortcutProps } from "./model-selector-shortcut.svelte";
export type { ModelSelectorLogoProps, ModelProvider } from "./model-selector-logo.svelte";
export type { ModelSelectorLogoGroupProps } from "./model-selector-logo-group.svelte";
export type { ModelSelectorNameProps } from "./model-selector-name.svelte";
