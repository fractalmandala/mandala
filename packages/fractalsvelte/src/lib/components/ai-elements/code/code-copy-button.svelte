<script lang="ts">
	import { CopyButton } from "$lib/components/ai-elements/copy-button/index.js";
	import { useCodeCopyButton } from "./code.svelte.js";

	const copyButton = useCodeCopyButton();
</script>

<CopyButton text={copyButton.code} data-code-copy size="icon-sm" />
