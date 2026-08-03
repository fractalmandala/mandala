import Close, {
	type DialogClosePosition,
	type DialogCloseProps,
	type DialogCloseSize,
	type DialogCloseVariant
} from './dialog-close.svelte';
import Content, { type DialogContentProps } from './dialog-content.svelte';
import Description, { type DialogDescriptionProps } from './dialog-description.svelte';
import Footer, { type DialogFooterAlign, type DialogFooterProps } from './dialog-footer.svelte';
import Header, { type DialogHeaderProps } from './dialog-header.svelte';
import Overlay, { type DialogOverlayProps } from './dialog-overlay.svelte';
import Portal, { type DialogPortalProps } from './dialog-portal.svelte';
import Root, { type DialogProps } from './dialog.svelte';
import Title, { type DialogTitleProps } from './dialog-title.svelte';
import Trigger, {
	type DialogTriggerProps,
	type DialogTriggerSize,
	type DialogTriggerVariant
} from './dialog-trigger.svelte';

export {
	Close,
	Content,
	Description,
	Footer,
	Header,
	Overlay,
	Portal,
	Root,
	Title,
	Trigger,
	//
	Root as Dialog,
	Close as DialogClose,
	Content as DialogContent,
	Description as DialogDescription,
	Footer as DialogFooter,
	Header as DialogHeader,
	Overlay as DialogOverlay,
	Portal as DialogPortal,
	Title as DialogTitle,
	Trigger as DialogTrigger,
	type DialogClosePosition,
	type DialogCloseProps,
	type DialogCloseSize,
	type DialogCloseVariant,
	type DialogContentProps,
	type DialogDescriptionProps,
	type DialogFooterAlign,
	type DialogFooterProps,
	type DialogHeaderProps,
	type DialogOverlayProps,
	type DialogPortalProps,
	type DialogProps,
	type DialogTitleProps,
	type DialogTriggerProps,
	type DialogTriggerSize,
	type DialogTriggerVariant
};
