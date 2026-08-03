import Root from './prompt-input.svelte';
import Provider from './prompt-input-provider.svelte';
import Header from './prompt-input-header.svelte';
import Body from './prompt-input-body.svelte';
import Toolbar from './prompt-input-toolbar.svelte';
import Tools from './prompt-input-tools.svelte';
import Button from './prompt-input-button.svelte';
import Textarea from './prompt-input-textarea.svelte';
import Submit from './prompt-input-submit.svelte';
import Attachment from './prompt-input-attachment.svelte';
import AttachmentImagePreview from './prompt-input-attachment-image-preview.svelte';
import Attachments from './prompt-input-attachments.svelte';
import ActionMenu from './prompt-input-action-menu.svelte';
import ActionMenuTrigger from './prompt-input-action-menu-trigger.svelte';
import ActionMenuContent from './prompt-input-action-menu-content.svelte';
import ActionMenuItem from './prompt-input-action-menu-item.svelte';
import ActionAddAttachments from './prompt-input-action-add-attachments.svelte';

export {
	Root,
	Provider,
	Header,
	Body,
	Toolbar,
	Tools,
	Button,
	Textarea,
	Submit,
	Attachment,
	AttachmentImagePreview,
	Attachments,
	ActionMenu,
	ActionMenuTrigger,
	ActionMenuContent,
	ActionMenuItem,
	ActionAddAttachments,
	// Aliases
	Root as PromptInput,
	Provider as PromptInputProvider,
	Header as PromptInputHeader,
	Body as PromptInputBody,
	Toolbar as PromptInputToolbar,
	Tools as PromptInputTools,
	Button as PromptInputButton,
	Textarea as PromptInputTextarea,
	Submit as PromptInputSubmit,
	Attachment as PromptInputAttachment,
	AttachmentImagePreview as PromptInputAttachmentImagePreview,
	Attachments as PromptInputAttachments,
	ActionMenu as PromptInputActionMenu,
	ActionMenuTrigger as PromptInputActionMenuTrigger,
	ActionMenuContent as PromptInputActionMenuContent,
	ActionMenuItem as PromptInputActionMenuItem,
	ActionAddAttachments as PromptInputActionAddAttachments
};

export {
	AttachmentsContext,
	getAttachmentsContext,
	setAttachmentsContext
} from './attachments.svelte.js';

export {
	Controller,
	TextController,
	Controller as PromptInputController,
	TextController as TextInputController,
	getPromptInputProvider,
	usePromptInput,
	setPromptInputProvider
} from './provider.svelte.js';

export type {
	PromptInputAttachment as PromptInputAttachmentData,
	PromptInputUploadStatus,
	FileWithId,
	Message,
	Message as PromptInputMessage,
	ChatStatus,
	FileUIPart
} from './types.js';

export type { PromptInputProps } from './prompt-input.svelte';
export type { PromptInputProviderProps } from './prompt-input-provider.svelte';
export type { PromptInputHeaderProps } from './prompt-input-header.svelte';
export type { PromptInputBodyProps } from './prompt-input-body.svelte';
export type { PromptInputToolbarProps } from './prompt-input-toolbar.svelte';
export type { PromptInputToolsProps } from './prompt-input-tools.svelte';
export type { PromptInputButtonProps } from './prompt-input-button.svelte';
export type { PromptInputTextareaProps } from './prompt-input-textarea.svelte';
export type { PromptInputSubmitProps } from './prompt-input-submit.svelte';
export type { PromptInputAttachmentProps } from './prompt-input-attachment.svelte';
export type { PromptInputAttachmentImagePreviewProps } from './prompt-input-attachment-image-preview.svelte';
export type { PromptInputAttachmentsProps } from './prompt-input-attachments.svelte';
export type { PromptInputActionMenuProps } from './prompt-input-action-menu.svelte';
export type { PromptInputActionMenuTriggerProps } from './prompt-input-action-menu-trigger.svelte';
export type { PromptInputActionMenuContentProps } from './prompt-input-action-menu-content.svelte';
export type { PromptInputActionMenuItemProps } from './prompt-input-action-menu-item.svelte';
export type { PromptInputActionAddAttachmentsProps } from './prompt-input-action-add-attachments.svelte';
