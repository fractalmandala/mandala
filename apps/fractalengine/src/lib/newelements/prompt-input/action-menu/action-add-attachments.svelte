<script lang="ts">
	import { getAttachmentsContext } from "../context/attachments.svelte.js";
	import ActionMenuItem from "./action-menu-item.svelte";
	import { cn } from "$lib/newelements/utils";

	interface Props {
		onSelect?: () => void;
		label?: string;
		class?: string;
	}

	let { onSelect, label = "Add photos or files", class: className, ...props }: Props = $props();

	let attachments = getAttachmentsContext();

	let handleSelect = (e: Event) => {
		e.preventDefault();
		onSelect?.();
		attachments.openFileDialog();
	};
</script>

<ActionMenuItem class={cn("gap-2", className)} onSelect={handleSelect} {...props}>
	<span class="tt-u text-xs w600">IMG ICON</span>
	{label}
</ActionMenuItem>
