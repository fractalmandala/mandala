<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type ReasoningProps = {
		isStreaming?: boolean;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		duration?: number;
		children?: Snippet;
		[key: string]: unknown;
	};
</script>

<script lang="ts">
	import { watch } from 'runed';
	import { untrack } from 'svelte';
	import { Collapsible } from '$lib/components/collapsible/index.js';
	import { ReasoningContext, setReasoningContext } from './reasoning-context.svelte.js';

	let {
		isStreaming = false,
		open = $bindable(),
		defaultOpen = true,
		onOpenChange,
		duration = $bindable(),
		children,
		...props
	}: ReasoningProps = $props();

	const AUTO_CLOSE_DELAY = 1000;
	const MS_IN_S = 1000;

	const reasoningContext = new ReasoningContext({
		isStreaming: untrack(() => isStreaming),
		isOpen: open ?? untrack(() => defaultOpen),
		duration: duration ?? 0
	});

	let isOpen = $state(open ?? untrack(() => defaultOpen));
	let hasAutoClosed = $state(false);
	let startTime = $state<number | null>(null);

	$effect(() => {
		reasoningContext.isStreaming = isStreaming;
	});

	$effect(() => {
		if (open !== undefined) {
			isOpen = open;
			reasoningContext.isOpen = open;
		}
	});

	$effect(() => {
		if (duration !== undefined) {
			reasoningContext.duration = duration;
		}
	});

	// Track duration when streaming starts and ends
	watch(
		() => isStreaming,
		(isStreamingValue) => {
			if (isStreamingValue) {
				if (startTime === null) {
					startTime = Date.now();
				}
			} else if (startTime !== null) {
				const newDuration = Math.ceil((Date.now() - startTime) / MS_IN_S);
				reasoningContext.duration = newDuration;
				if (duration !== undefined) {
					duration = newDuration;
				}
				startTime = null;
			}
		}
	);

	// Auto-close once after streaming ends when defaultOpen is true
	watch(
		() => [isStreaming, isOpen, defaultOpen, hasAutoClosed] as const,
		([isStreamingValue, isOpenValue, defaultOpenValue, hasAutoClosedValue]) => {
			if (defaultOpenValue && !isStreamingValue && isOpenValue && !hasAutoClosedValue) {
				const timer = setTimeout(() => {
					handleOpenChange(false);
					hasAutoClosed = true;
				}, AUTO_CLOSE_DELAY);

				return () => clearTimeout(timer);
			}
		}
	);

	function handleOpenChange(newOpen: boolean) {
		isOpen = newOpen;
		reasoningContext.setIsOpen(newOpen);
		if (open !== undefined) {
			open = newOpen;
		}
		onOpenChange?.(newOpen);
	}

	setReasoningContext(reasoningContext);
</script>

<Collapsible
	bind:open={isOpen}
	onOpenChange={handleOpenChange}
	data-slot="reasoning"
	{...props}
>
	{@render children?.()}
</Collapsible>
