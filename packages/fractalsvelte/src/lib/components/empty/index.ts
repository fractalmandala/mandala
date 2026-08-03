import Root from "./empty.svelte";
import Header from "./empty-header.svelte";
import Title from "./empty-title.svelte";
import Description from "./empty-description.svelte";
import Media from "./empty-media.svelte";
import Content from "./empty-content.svelte";

export {
	Root,
	Header,
	Title,
	Description,
	Media,
	Content,
	// Aliases
	Root as Empty,
	Header as EmptyHeader,
	Title as EmptyTitle,
	Description as EmptyDescription,
	Media as EmptyMedia,
	Content as EmptyContent,
};

export type { EmptyProps } from "./empty.svelte";
export type { EmptyHeaderProps } from "./empty-header.svelte";
export type { EmptyTitleProps } from "./empty-title.svelte";
export type { EmptyDescriptionProps } from "./empty-description.svelte";
export type { EmptyMediaProps, EmptyMediaVariant } from "./empty-media.svelte";
export type { EmptyContentProps } from "./empty-content.svelte";
