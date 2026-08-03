import { getContext, setContext } from 'svelte';
import type { MessageFrom } from '../message/context.js';
export type MessageBubbleVariant = 'solid' | 'soft' | 'tint' | 'outline' | 'ghost' | 'danger';
export type MessageBubbleAlign = 'start' | 'end';
type C = { variant: MessageBubbleVariant; align: MessageBubbleAlign; animateIn: boolean };
const KEY = Symbol('bubble');
export function setBubbleContext(value: C) {
	setContext(KEY, value);
}
export function getBubbleContext() {
	return getContext<C>(KEY) ?? { variant: 'soft', align: 'start', animateIn: false };
}
export function resolveAlign(align: MessageBubbleAlign | undefined, from: MessageFrom | undefined) {
	return align ?? (from === 'user' ? 'end' : 'start');
}
