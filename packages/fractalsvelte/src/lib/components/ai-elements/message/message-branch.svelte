<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type MessageBranchProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		defaultBranch?: number;
		onBranchChange?: (branchIndex: number) => void;
	};
</script>

<script lang="ts">
	import {
		MessageBranchController,
		setMessageBranchContext,
	} from "./message-context.svelte.js";

	let {
		defaultBranch = 0,
		onBranchChange,
		children,
		ref = $bindable(null),
		...restProps
	}: MessageBranchProps = $props();

	const branchContext = new MessageBranchController();
	setMessageBranchContext(branchContext);

	let initialized = $state(false);
	let previousBranch = $state<number | null>(null);

	$effect.pre(() => {
		if (!initialized) {
			branchContext.setCurrentBranch(defaultBranch);
			previousBranch = branchContext.currentBranch;
			initialized = true;
		}
	});

	$effect(() => {
		const currentBranch = branchContext.currentBranch;

		if (previousBranch === null) {
			previousBranch = currentBranch;
			return;
		}

		if (currentBranch !== previousBranch) {
			previousBranch = currentBranch;
			onBranchChange?.(currentBranch);
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="message-branch"
	{...restProps}
>
	{@render children?.()}
</div>
