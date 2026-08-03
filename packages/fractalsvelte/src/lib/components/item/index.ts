import Root, { type ItemProps, type ItemSize, type ItemVariant } from './item.svelte';
import Actions, { type ItemActionsProps } from './item-actions.svelte';
import Content, {
	type ItemContentAlign,
	type ItemContentGap,
	type ItemContentProps
} from './item-content.svelte';
import Description, {
	type ItemDescriptionClamp,
	type ItemDescriptionProps
} from './item-description.svelte';
import Footer, { type ItemFooterProps } from './item-footer.svelte';
import Group, {
	type ItemGroupGap,
	type ItemGroupLayout,
	type ItemGroupProps
} from './item-group.svelte';
import Header, { type ItemHeaderProps } from './item-header.svelte';
import Media, { type ItemMediaProps, type ItemMediaVariant } from './item-media.svelte';
import Separator, { type ItemSeparatorProps } from './item-separator.svelte';
import Title, { type ItemTitleClamp, type ItemTitleProps } from './item-title.svelte';

export {
	Root,
	Group,
	Separator,
	Header,
	Footer,
	Content,
	Title,
	Description,
	Actions,
	Media,
	//
	Root as Item,
	Group as ItemGroup,
	Separator as ItemSeparator,
	Header as ItemHeader,
	Footer as ItemFooter,
	Content as ItemContent,
	Title as ItemTitle,
	Description as ItemDescription,
	Actions as ItemActions,
	Media as ItemMedia,
	type ItemProps,
	type ItemSize,
	type ItemVariant,
	type ItemGroupProps,
	type ItemGroupLayout,
	type ItemGroupGap,
	type ItemSeparatorProps,
	type ItemHeaderProps,
	type ItemFooterProps,
	type ItemContentProps,
	type ItemContentGap,
	type ItemContentAlign,
	type ItemTitleProps,
	type ItemTitleClamp,
	type ItemDescriptionProps,
	type ItemDescriptionClamp,
	type ItemActionsProps,
	type ItemMediaProps,
	type ItemMediaVariant,
	type ItemProps as Props
};
