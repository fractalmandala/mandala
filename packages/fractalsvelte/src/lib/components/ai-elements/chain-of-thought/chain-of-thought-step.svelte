<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ChainOfThoughtStepStatus = 'complete' | 'active' | 'pending';

	export type ChainOfThoughtStepProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Leading icon as a snippet (no icon library). Default: small dot. */
		icon?: Snippet;
		label: string;
		description?: string;
		status?: ChainOfThoughtStepStatus;
		/** Stagger delay in ms when the chain opens. Defaults to stepIndex * 150. */
		delay?: number;
	};
</script>

<script lang="ts">
	import { getChainOfThoughtContext } from './chain-of-thought-context.svelte.js';

	let {
		icon,
		label,
		description,
		status = 'complete',
		delay,
		children,
		ref = $bindable(null),
		...restProps
	}: ChainOfThoughtStepProps = $props();

	const context = getChainOfThoughtContext();
	let isVisible = $state(false);

	function getStepIndex(): number {
		if (!ref?.parentElement) return 0;
		const steps = Array.from(
			ref.parentElement.querySelectorAll('[data-slot="chain-of-thought-step"]')
		);
		return steps.indexOf(ref);
	}

	$effect(() => {
		if (context.isOpen) {
			const stepIndex = getStepIndex();
			const calculatedDelay = delay ?? stepIndex * 150;
			const timer = setTimeout(() => {
				isVisible = true;
			}, calculatedDelay);
			return () => clearTimeout(timer);
		}
		isVisible = false;
	});
</script>

<div
	bind:this={ref}
	data-slot="chain-of-thought-step"
	data-status={status}
	data-visible={isVisible || undefined}
	{...restProps}
>
	<div data-slot="chain-of-thought-step-icon" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="3" />
			</svg>
		{/if}
		<div data-slot="chain-of-thought-step-line"></div>
	</div>
	<div data-slot="chain-of-thought-step-body">
		<div data-slot="chain-of-thought-step-label">{label}</div>
		{#if description}
			<div data-slot="chain-of-thought-step-description">{description}</div>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
