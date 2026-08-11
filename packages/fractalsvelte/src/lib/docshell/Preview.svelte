<script lang="ts">
	import type { Snippet } from "svelte";
	import CodeBlock from "./CodeBlock.svelte";

	// Replaces shadcn's <ComponentPreview name="button-demo" />, which resolves a demo out of
	// a registry by name. Here the demo is passed as children, so the page and the thing it
	// documents cannot drift apart.
	let {
		children,
		code,
		/** Language for the Code tab (defaults to svelte — most demos are Svelte). */
		lang = 'svelte',
		description,
		align = 'start',
		/** Allow popovers/menus to escape the frame (navigation-menu, etc.). */
		overflow = 'hidden'
	}: {
		children: Snippet;
		code?: string;
		lang?: string;
		description?: string;
		align?: 'start' | 'center';
		overflow?: 'hidden' | 'visible';
	} = $props();

	let tab: "preview" | "code" = $state("preview");
</script>

<div class="doc-preview" data-overflow={overflow}>
	<div class="doc-preview-bar row ycenter xbetween">
		<p class="doc-preview-caption">{description ?? ""}</p>
		{#if code}
			<div class="doc-tabs row">
				<button
					type="button"
					class="doc-tab"
					data-active={tab === "preview"}
					onclick={() => (tab = "preview")}>Preview</button
				>
				<button
					type="button"
					class="doc-tab"
					data-active={tab === "code"}
					onclick={() => (tab = "code")}>Code</button
				>
			</div>
		{/if}
	</div>

	{#if tab === "preview"}
		<div class="doc-stage row wrap ycenter" data-align={align} data-overflow={overflow}>
			{@render children()}
		</div>
	{:else if code}
		<CodeBlock {code} {lang} />
	{/if}
</div>
