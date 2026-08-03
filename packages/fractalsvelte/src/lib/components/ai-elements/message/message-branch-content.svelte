<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MessageVersion } from './message-context.svelte.js';

	export type MessageBranchContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		versions: MessageVersion[];
	};
</script>

<script lang="ts">
	import { getMessageBranchContext } from './message-context.svelte.js';
	import MessageContent from './message-content.svelte';
	import MessageResponse from './message-response.svelte';

	let {
		versions,
		ref = $bindable(null),
		...restProps
	}: MessageBranchContentProps = $props();

	const branchContext = getMessageBranchContext();

	$effect(() => {
		branchContext.setTotalBranches(versions.length);
	});
</script>

<div bind:this={ref} data-slot="message-branch-versions" {...restProps}>
	{#each versions as version, index (version.id)}
		<div
			data-slot="message-branch-content"
			data-active={index === branchContext.currentBranch || undefined}
			hidden={index !== branchContext.currentBranch}
		>
			<MessageContent>
				<MessageResponse content={version.content} />
			</MessageContent>
		</div>
	{/each}
</div>
