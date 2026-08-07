<script lang="ts">
	// ai-elements/Conversation
	// Slot-based container that auto-sticks to bottom on content growth.
	// Uses a plain $effect + IntersectionObserver to detect when the user
	// is at the bottom and the content has expanded.

	import { onDestroy } from 'svelte';

	let {
		children,
		stickToBottom = true,
	} = $props<{
		children?: import('svelte').Snippet;
		stickToBottom?: boolean;
	}>();

	let scroller = $state<HTMLDivElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let observer: MutationObserver | null = null;
	let intersectionObserver: IntersectionObserver | null = null;
	let sentinel = $state<HTMLDivElement | null>(null);
	let userScrolled = $state(false);

	function scrollToBottom(behavior: 'auto' | 'smooth' = 'smooth') {
		if (!scroller) return;
		scroller.scrollTo({ top: scroller.scrollHeight, behavior });
	}

	function handleScroll() {
		if (!scroller) return;
		const atBottom =
			scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 24;
		userScrolled = !atBottom;
	}

	$effect(() => {
		if (!scroller || !sentinel || !stickToBottom) return;

		// Watch the sentinel to know when new content pushes it out of view.
		intersectionObserver = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry && !entry.isIntersecting && !userScrolled) {
					scrollToBottom('smooth');
				}
			},
			{ root: scroller, threshold: 0 }
		);
		intersectionObserver.observe(sentinel);

		return () => intersectionObserver?.disconnect();
	});

	onDestroy(() => {
		intersectionObserver?.disconnect();
	});
</script>

<div
	bind:this={scroller}
	class="ai-conversation"
	onscroll={handleScroll}
>
	<div bind:this={contentEl} class="ai-conversation-content">
		{#if children}
			{@render children()}
		{/if}
		<!-- Sentinel: when this is out of view, more content is below the fold -->
		<div bind:this={sentinel} class="ai-conversation-sentinel" aria-hidden="true"></div>
	</div>
</div>
