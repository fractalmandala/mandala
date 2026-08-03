<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { getMessageContext } from '../message/context.js';
	import {
		resolveAlign,
		setBubbleContext,
		type MessageBubbleAlign,
		type MessageBubbleVariant
	} from './context.js';
	import './message-bubble.sass';
	let {
		variant = 'soft',
		align,
		animateIn = false,
		children
	}: {
		variant?: MessageBubbleVariant;
		align?: MessageBubbleAlign;
		animateIn?: boolean;
		children?: Snippet;
	} = $props();
	let context = $state(untrack(() => ({ variant, align: resolveAlign(align, getMessageContext()), animateIn })));
	const resolved = $derived(resolveAlign(align, getMessageContext()));
	setBubbleContext(context);
	$effect(() => {
		context.variant = variant;
		context.align = resolved;
		context.animateIn = animateIn;
	});
</script>

<div
	data-slot="message-bubble"
	data-align={resolved}
	data-variant={variant}
	data-animate={animateIn || undefined}
>
	{@render children?.()}
</div>
