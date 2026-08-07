<script lang="ts">
	import { docsState } from '../state/docs.svelte';
</script>

<div class="fractaldocs-content" data-fractaldocs-scroll>
	{#if docsState.activeFilePath}
		<div class="fractaldocs-content-header">
			<span class="fractaldocs-content-path">{docsState.activeFilePath.split('/').pop()}</span>
		</div>
	{/if}
	
	<div class="fractaldocs-markdown-body">
		{#if docsState.isInitializing || docsState.loadingFilePath}
			<div class="fractaldocs-loading">Loading documentation...</div>
		{:else if docsState.error}
			<div class="fractaldocs-status-error" role="alert">
				<span>{docsState.error}</span>
				<button type="button" class="btn-app" onclick={() => docsState.init()}>Retry</button>
			</div>
		{:else if !docsState.fileContent}
			<div class="fractaldocs-empty">No document selected.</div>
		{:else}
			<!-- renderedHtml is sanitized by renderDocsMarkdown() before state assignment. -->
			{@html docsState.renderedHtml}
		{/if}
	</div>
</div>
