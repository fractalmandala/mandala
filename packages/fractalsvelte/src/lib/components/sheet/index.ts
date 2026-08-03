import Root from "./sheet.svelte";
import Trigger from "./sheet-trigger.svelte";
import Close from "./sheet-close.svelte";
import Portal from "./sheet-portal.svelte";
import Overlay from "./sheet-overlay.svelte";
import Content from "./sheet-content.svelte";
import Header from "./sheet-header.svelte";
import Footer from "./sheet-footer.svelte";
import Title from "./sheet-title.svelte";
import Description from "./sheet-description.svelte";

export {
	Root,
	Trigger,
	Close,
	Portal,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	// Aliases
	Root as Sheet,
	Trigger as SheetTrigger,
	Close as SheetClose,
	Portal as SheetPortal,
	Overlay as SheetOverlay,
	Content as SheetContent,
	Header as SheetHeader,
	Footer as SheetFooter,
	Title as SheetTitle,
	Description as SheetDescription,
};

export type { SheetProps } from "./sheet.svelte";
export type { SheetTriggerProps } from "./sheet-trigger.svelte";
export type { SheetCloseProps } from "./sheet-close.svelte";
export type { SheetPortalProps } from "./sheet-portal.svelte";
export type { SheetOverlayProps } from "./sheet-overlay.svelte";
export type { SheetContentProps, SheetSide } from "./sheet-content.svelte";
export type { SheetHeaderProps } from "./sheet-header.svelte";
export type { SheetFooterProps } from "./sheet-footer.svelte";
export type { SheetTitleProps } from "./sheet-title.svelte";
export type { SheetDescriptionProps } from "./sheet-description.svelte";
