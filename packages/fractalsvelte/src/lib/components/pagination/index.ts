import Root from "./pagination.svelte";
import Content from "./pagination-content.svelte";
import Item from "./pagination-item.svelte";
import Link from "./pagination-link.svelte";
import Previous from "./pagination-previous.svelte";
import Next from "./pagination-next.svelte";
import Ellipsis from "./pagination-ellipsis.svelte";

export {
	Root,
	Content,
	Item,
	Link,
	Previous,
	Next,
	Ellipsis,
	// Aliases
	Root as Pagination,
	Content as PaginationContent,
	Item as PaginationItem,
	Link as PaginationLink,
	Previous as PaginationPrevious,
	Next as PaginationNext,
	Ellipsis as PaginationEllipsis,
};

export type { PaginationProps } from "./pagination.svelte";
export type { PaginationContentProps } from "./pagination-content.svelte";
export type { PaginationItemProps } from "./pagination-item.svelte";
export type { PaginationLinkProps } from "./pagination-link.svelte";
export type { PaginationPreviousProps } from "./pagination-previous.svelte";
export type { PaginationNextProps } from "./pagination-next.svelte";
export type { PaginationEllipsisProps } from "./pagination-ellipsis.svelte";
