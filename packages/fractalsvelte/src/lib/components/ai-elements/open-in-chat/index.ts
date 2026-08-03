import Root from "./open-in-chat.svelte";
import Trigger from "./open-in-trigger.svelte";
import Content from "./open-in-content.svelte";
import Item from "./open-in-item.svelte";
import Label from "./open-in-label.svelte";
import Separator from "./open-in-separator.svelte";
import ChatGPT from "./open-in-chatgpt.svelte";
import Claude from "./open-in-claude.svelte";
import Scira from "./open-in-scira.svelte";
import T3 from "./open-in-t3.svelte";
import V0 from "./open-in-v0.svelte";

export {
	createOpenInContext,
	getOpenInContext,
	providers,
	type OpenInContextType,
	type ProviderConfig,
} from "./open-in-context.svelte.js";

export {
	Root,
	Trigger,
	Content,
	Item,
	Label,
	Separator,
	ChatGPT,
	Claude,
	Scira,
	T3,
	V0,
	// Aliases
	Root as OpenIn,
	Root as OpenInChat,
	Trigger as OpenInTrigger,
	Content as OpenInContent,
	Item as OpenInItem,
	Label as OpenInLabel,
	Separator as OpenInSeparator,
	ChatGPT as OpenInChatGPT,
	Claude as OpenInClaude,
	Scira as OpenInScira,
	T3 as OpenInT3,
	V0 as OpenInV0,
};

export type { OpenInChatProps } from "./open-in-chat.svelte";
export type { OpenInTriggerProps } from "./open-in-trigger.svelte";
export type { OpenInContentProps } from "./open-in-content.svelte";
export type { OpenInItemProps } from "./open-in-item.svelte";
export type { OpenInLabelProps } from "./open-in-label.svelte";
export type { OpenInSeparatorProps } from "./open-in-separator.svelte";
export type { OpenInChatGPTProps } from "./open-in-chatgpt.svelte";
export type { OpenInClaudeProps } from "./open-in-claude.svelte";
export type { OpenInSciraProps } from "./open-in-scira.svelte";
export type { OpenInT3Props } from "./open-in-t3.svelte";
export type { OpenInV0Props } from "./open-in-v0.svelte";
