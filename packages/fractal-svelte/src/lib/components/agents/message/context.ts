import { getContext, setContext } from 'svelte';
export type MessageFrom = 'user' | 'assistant';
const KEY = Symbol('message');
export function setMessageContext(from: MessageFrom) {
	setContext(KEY, from);
}
export function getMessageContext(): MessageFrom {
	return getContext<MessageFrom>(KEY) ?? 'assistant';
}
