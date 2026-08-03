import Root from "./alert-dialog.svelte";
import Portal from "./alert-dialog-portal.svelte";
import Trigger from "./alert-dialog-trigger.svelte";
import Title from "./alert-dialog-title.svelte";
import Action from "./alert-dialog-action.svelte";
import Cancel from "./alert-dialog-cancel.svelte";
import Footer from "./alert-dialog-footer.svelte";
import Header from "./alert-dialog-header.svelte";
import Overlay from "./alert-dialog-overlay.svelte";
import Content from "./alert-dialog-content.svelte";
import Description from "./alert-dialog-description.svelte";
import Media from "./alert-dialog-media.svelte";

export {
	Root,
	Title,
	Action,
	Cancel,
	Portal,
	Footer,
	Header,
	Trigger,
	Overlay,
	Content,
	Description,
	Media,
	// Aliases
	Root as AlertDialog,
	Title as AlertDialogTitle,
	Action as AlertDialogAction,
	Cancel as AlertDialogCancel,
	Portal as AlertDialogPortal,
	Footer as AlertDialogFooter,
	Header as AlertDialogHeader,
	Trigger as AlertDialogTrigger,
	Overlay as AlertDialogOverlay,
	Content as AlertDialogContent,
	Description as AlertDialogDescription,
	Media as AlertDialogMedia,
};

export type { AlertDialogProps } from "./alert-dialog.svelte";
export type { AlertDialogPortalProps } from "./alert-dialog-portal.svelte";
export type { AlertDialogTriggerProps } from "./alert-dialog-trigger.svelte";
export type { AlertDialogTitleProps } from "./alert-dialog-title.svelte";
export type { AlertDialogActionProps } from "./alert-dialog-action.svelte";
export type { AlertDialogCancelProps } from "./alert-dialog-cancel.svelte";
export type { AlertDialogFooterProps } from "./alert-dialog-footer.svelte";
export type { AlertDialogHeaderProps } from "./alert-dialog-header.svelte";
export type { AlertDialogOverlayProps } from "./alert-dialog-overlay.svelte";
export type { AlertDialogContentProps } from "./alert-dialog-content.svelte";
export type { AlertDialogDescriptionProps } from "./alert-dialog-description.svelte";
export type { AlertDialogMediaProps } from "./alert-dialog-media.svelte";
