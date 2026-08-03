<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as HoverCardRoot } from "$lib/components/hover-card/index.js";
	import type { ContextSchema } from "./context-context.svelte.js";

	export type ContextProps = ComponentProps<typeof HoverCardRoot> & ContextSchema;
</script>

<script lang="ts">
	import { ContextClass, setContextValue } from "./context-context.svelte.js";
	import { untrack } from "svelte";

	let {
		usedTokens,
		maxTokens,
		usage,
		modelId,
		children,
		closeDelay = 0,
		openDelay = 0,
		...restProps
	}: ContextProps = $props();

	const contextInstance = new ContextClass({
		usedTokens: untrack(() => usedTokens),
		maxTokens: untrack(() => maxTokens),
		usage: untrack(() => usage),
		modelId: untrack(() => modelId),
	});

	$effect(() => {
		contextInstance.usedTokens = usedTokens;
		contextInstance.maxTokens = maxTokens;
		contextInstance.usage = usage;
		contextInstance.modelId = modelId;
	});

	setContextValue(contextInstance);
</script>

<HoverCardRoot {openDelay} {closeDelay} {...restProps}>
	{@render children?.()}
</HoverCardRoot>
