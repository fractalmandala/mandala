<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import './message-scroller.sass';
	let {
		children,
		followOutput = true,
		followThreshold = 56,
		smooth = true,
		onFollowChange,
		label = 'Conversation',
		busy = false,
		navigation
	}: {
		children?: Snippet;
		followOutput?: boolean;
		followThreshold?: number;
		smooth?: boolean;
		onFollowChange?: (v: boolean) => void;
		label?: string;
		busy?: boolean;
		navigation?: 'rail';
	} = $props();
	let viewport = $state<HTMLElement>();
	let content = $state<HTMLDivElement>();
	let following = $state(untrack(() => followOutput));
	let observer: ResizeObserver | undefined;
	let mutation: MutationObserver | undefined;
	function setFollowing(next: boolean) {
		if (next === following) return;
		following = next;
		onFollowChange?.(next);
	}
	function end() {
		if (!viewport) return;
		viewport.scrollTo?.({
			top: viewport.scrollHeight,
			behavior:
				smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches
					? 'smooth'
					: 'auto'
		});
		if (!viewport.scrollTo) viewport.scrollTop = viewport.scrollHeight;
	}
	function scroll() {
		if (!viewport) return;
		setFollowing(
			viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= followThreshold
		);
	}
	$effect(() => {
		if (!viewport || !content) return;
		following = followOutput;
		if (followOutput) requestAnimationFrame(end);
		if (typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(() => {
				if (followOutput && following) end();
			});
			observer.observe(content);
		}
		mutation = new MutationObserver(() => {
			if (followOutput && following) end();
		});
		mutation.observe(content, { subtree: true, childList: true, characterData: true });
		return () => {
			observer?.disconnect();
			mutation?.disconnect();
		};
	});
</script>

<div data-slot="message-scroller" data-navigation={navigation}>
	<div
		role="textbox"
			aria-multiline="true"
		bind:this={viewport}
		tabindex="0"
		data-slot="message-scroller-viewport"
		aria-label={label}
		onscroll={scroll}
		onwheel={() => setFollowing(false)}
		onkeydown={(e) => ['ArrowUp', 'PageUp', 'Home'].includes(e.key) && setFollowing(false)}
	>
		<div
			bind:this={content}
			data-slot="message-scroller-content"
			role="log"
			aria-live="polite"
			aria-relevant="additions text"
			aria-busy={busy}
		>
			{@render children?.()}
		</div>
	</div>
</div>
