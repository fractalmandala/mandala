import Root, {
	type ScrollAreaOrientation,
	type ScrollAreaProps,
	type ScrollAreaWhitespace
} from './scroll-area.svelte';
import Scrollbar, { type ScrollAreaScrollbarProps } from './scroll-area-scrollbar.svelte';

export {
	Root,
	Scrollbar,
	//
	Root as ScrollArea,
	Scrollbar as ScrollAreaScrollbar,
	type ScrollAreaOrientation,
	type ScrollAreaProps,
	type ScrollAreaScrollbarProps,
	type ScrollAreaWhitespace,
	type ScrollAreaProps as Props
};
