import Root from './conversation.svelte';
import Content from './conversation-content.svelte';
import EmptyState from './conversation-empty-state.svelte';
import ScrollButton from './conversation-scroll-button.svelte';

export {
	getStickToBottomContext,
	setStickToBottomContext,
	StickToBottomContext,
	type StickToBottomOptions
} from './stick-to-bottom-context.svelte.js';

export {
	Root,
	Content,
	EmptyState,
	ScrollButton,
	//
	Root as Conversation,
	Content as ConversationContent,
	EmptyState as ConversationEmptyState,
	ScrollButton as ConversationScrollButton
};

export type { ConversationProps } from './conversation.svelte';
export type {
	ConversationContentProps,
	ConversationContentGap
} from './conversation-content.svelte';
export type { ConversationEmptyStateProps } from './conversation-empty-state.svelte';
export type { ConversationScrollButtonProps } from './conversation-scroll-button.svelte';
