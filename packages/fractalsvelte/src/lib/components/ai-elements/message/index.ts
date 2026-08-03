import Message from "./message.svelte";
import MessageContent from "./message-content.svelte";
import MessageActions from "./message-actions.svelte";
import MessageAction from "./message-action.svelte";
import MessageToolbar from "./message-toolbar.svelte";
import MessageAttachments from "./message-attachments.svelte";
import MessageAttachment from "./message-attachment.svelte";
import MessageAttachmentPreview from "./message-attachment-preview.svelte";
import MessageBranch from "./message-branch.svelte";
import MessageBranchSelector from "./message-branch-selector.svelte";
import MessageBranchPrevious from "./message-branch-previous.svelte";
import MessageBranchNext from "./message-branch-next.svelte";
import MessageBranchPage from "./message-branch-page.svelte";
import MessageBranchContent from "./message-branch-content.svelte";
import MessageResponse from "./message-response.svelte";

export {
	MessageBranchController,
	setMessageBranchContext,
	getMessageBranchContext,
	type MessageRole,
	type MessageVersion,
	type MessageAttachmentData,
} from "./message-context.svelte.js";

export {
	Message,
	MessageContent,
	MessageActions,
	MessageAction,
	MessageToolbar,
	MessageAttachments,
	MessageAttachment,
	MessageAttachmentPreview,
	MessageBranch,
	MessageBranchSelector,
	MessageBranchPrevious,
	MessageBranchNext,
	MessageBranchPage,
	MessageBranchContent,
	MessageResponse,
	// Aliases
	Message as Root,
	MessageContent as Content,
	MessageActions as Actions,
	MessageAction as Action,
	MessageToolbar as Toolbar,
	MessageAttachments as Attachments,
	MessageAttachment as Attachment,
	MessageAttachmentPreview as AttachmentPreview,
	MessageBranch as Branch,
	MessageBranchSelector as BranchSelector,
	MessageBranchPrevious as BranchPrevious,
	MessageBranchNext as BranchNext,
	MessageBranchPage as BranchPage,
	MessageBranchContent as BranchContent,
	MessageResponse as Response,
};

export type { MessageProps } from "./message.svelte";
export type { MessageContentProps } from "./message-content.svelte";
export type { MessageActionsProps } from "./message-actions.svelte";
export type { MessageActionProps } from "./message-action.svelte";
export type { MessageToolbarProps } from "./message-toolbar.svelte";
export type { MessageAttachmentsProps } from "./message-attachments.svelte";
export type { MessageAttachmentProps } from "./message-attachment.svelte";
export type { MessageAttachmentPreviewProps } from "./message-attachment-preview.svelte";
export type { MessageBranchProps } from "./message-branch.svelte";
export type { MessageBranchSelectorProps } from "./message-branch-selector.svelte";
export type { MessageBranchPreviousProps } from "./message-branch-previous.svelte";
export type { MessageBranchNextProps } from "./message-branch-next.svelte";
export type { MessageBranchPageProps } from "./message-branch-page.svelte";
export type { MessageBranchContentProps } from "./message-branch-content.svelte";
export type { MessageResponseProps } from "./message-response.svelte";
