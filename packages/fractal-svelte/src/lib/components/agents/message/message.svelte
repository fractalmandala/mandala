<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setMessageContext, type MessageFrom } from './context.js';
	import { untrack } from 'svelte';
	import './message.sass';
	let {
		from = 'assistant',
		animateIn = false,
		children,
		id
	}: { from?: MessageFrom; animateIn?: boolean; children?: Snippet; id?: string } = $props();
	untrack(() => setMessageContext(from));
</script>

<article
	{id}
	data-slot="message"
	data-from={from}
	data-animate={animateIn || undefined}
	aria-label={`${from} message`}
>
	{@render children?.()}
</article>
