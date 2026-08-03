<script lang="ts">
	import './marquee.sass';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	type Props = HTMLAttributes<HTMLDivElement> & { speed?: number; direction?: 'left' | 'right' | 'up' | 'down'; pauseOnHover?: boolean; gap?: string; fade?: boolean; children?: Snippet };
	let { speed = 30, direction = 'left', pauseOnHover = true, gap = '1rem', fade = true, children, ...rest }: Props = $props();
	let vertical = $derived(direction === 'up' || direction === 'down');
	let reverse = $derived(direction === 'right' || direction === 'down');
</script>

<div {...rest} data-slot="marquee" data-vertical={vertical} data-fade={fade} style={`--marquee-speed:${speed}s;--marquee-gap:${gap}`}>
	{#each [0, 1] as copy}
		<div data-slot="marquee-track" data-vertical={vertical} data-reverse={reverse} data-pause={pauseOnHover} aria-hidden={copy === 1 ? 'true' : undefined} inert={copy === 1 ? true : undefined}>
			{@render children?.()}
		</div>
	{/each}
</div>
