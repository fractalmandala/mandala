<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		asides?: Snippet;
	}

	let { children, asides }: Props = $props();
</script>

<div class="padtop128">
	{@render children()}
</div>
