<script lang="ts">
	import { ideState } from '../state/ide.svelte';
	import { modelRegistry } from '$lib/state/modelRegistry.svelte';

	// Registry records for local sidecar models — provides runnable/downloaded status (B2)
	let localRecords = $derived(
		modelRegistry.records().filter(r => r.providerId === 'sidecar')
	);
	let allModels = $derived(modelRegistry.records());

	function modelKind(source: string): string {
		return source === 'env' ? 'API (.env)' : source === 'custom' ? 'API (added)' : source === 'local' ? 'Local' : source === 'preset' ? 'API preset' : 'API';
	}

	function isDownloaded(modelId: string): boolean {
		return localRecords.some(r => r.id === modelId && r.runnable);
	}
</script>

<div class="marketplace-container">
	<section class="box gap8">
		<div class="row xbetween ycenter">
			<span class="text-item accent">All usable models</span>
			<span class="text-meta">{allModels.filter(model => model.runnable).length} ready</span>
		</div>
		<div class="box gap4">
			{#each allModels as model (model.providerId + model.id)}
				<div class="row xbetween ycenter border rounded pad8 text-xs">
					<div class="box gap2"><span class="font-bold">{model.label}</span><span class="text-3xs col3">{model.modelId}</span></div>
					<span class={model.runnable ? 'col-totp font-bold' : 'col3'}>{modelKind(model.source)} · {model.runnable ? 'Ready' : model.unavailableReason ?? 'Unavailable'}</span>
				</div>
			{:else}
				<span class="text-meta">No models are configured yet.</span>
			{/each}
		</div>
	</section>

	<!-- Folder Selector Area -->
	<div class="marketplace-path-selector">
		<span class="text-meta">Local Storage Folder</span>
		<div class="path-input-row">
			<div class="path-display" title={ideState.localModelsDownloadDir || 'No folder selected'}>
				{ideState.localModelsDownloadDir || 'Click Select Folder...'}
			</div>
			<button class="btn-app" onclick={() => ideState.selectModelsDirectory()}>
				<span class="button-text">Select Folder</span>
			</button>
		</div>
	</div>

	<!-- Models Cards Grid -->
	<div class="marketplace-list-scroll">
		{#each ideState.recommendedModels as model (model.id)}
			{@const downloaded = isDownloaded(model.id)}
			<div class="marketplace-card {downloaded ? 'is-downloaded' : ''}">
				<div class="card-title-row">
					{#if model.optimizedForM3Pro}
					<span class="text-item accent">{model.name}</span>
					{:else}
					<span class="text-item">{model.name}</span>
					{/if}
					<span class="text-meta">{model.size}</span>
				</div>
				<div class="card-repo"><p class="text-item-sm">{model.repo}</p></div>
				<!-- Download Progress or Control Button -->
				{#if ideState.downloadingModelId === model.id}
					<div class="model-download-progress-container">
						<div class="row xbetween ycenter">
							<span class="text-item">Downloading...</span>
							<span class="text-meta">{Math.round(ideState.downloadProgress)}%</span>
						</div>
						<div class="model-download-progress-bar">
							<div class="progress-fill" style="width: {ideState.downloadProgress}%"></div>
						</div>
					</div>
				{:else if downloaded}
					<button class="btn-app disabled" disabled>
						<span class="button-text">Installed</span>
					</button>
				{:else}
					<button
						class="btn-app"
						onclick={() => ideState.startDownload(model.id)}
						disabled={ideState.downloadingModelId !== null}
					>
						<span class="button-text">Download</span>
					</button>
				{/if}
			</div>
		{/each}
	</div>
</div>
