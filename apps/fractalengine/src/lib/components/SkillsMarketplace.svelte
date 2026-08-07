<script lang="ts">
	import { skillsApi } from '$lib/state/modelRegistry.svelte';
	import { onMount } from 'svelte';

	let searchQuery = $state('');
	let isLoading = $state(false);
	let loadError = $state('');
	let catalogLoaded = $state(false);
	let installingId = $state<string | null>(null);

	let filteredSkills = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		const catalog = skillsApi.catalog();
		if (!query) return catalog;
		return catalog.filter(
			skill =>
				skill.name.toLowerCase().includes(query) ||
				skill.description.toLowerCase().includes(query)
		);
	});

	onMount(async () => {
		if (catalogLoaded) return;
		isLoading = true;
		loadError = '';
		try {
			await skillsApi.loadCatalog();
			catalogLoaded = true;
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load skills catalog.';
		} finally {
			isLoading = false;
		}
	});

	async function installSkill(name: string) {
		const skill = skillsApi.catalog().find(s => s.name === name);
		if (!skill) return;
		installingId = name;
		try {
			await skillsApi.install(skill);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to install skill.';
		} finally {
			installingId = null;
		}
	}
</script>

<div class="marketplace-container">
	<!-- Search Box -->
	<div class="marketplace-path-selector marketplace-search-section">
		<span class="text-item">Search Agent Skills</span>
		<div class="marketplace-search-control">
			<img src="/iconset/find.svg" alt="" class="icon-svg-xs marketplace-search-icon" />
			<input
				type="text"
				aria-label="Filter agent skills"
				placeholder="Filter from skills.sh..."
				bind:value={searchQuery}
				class="marketplace-search-input"
			/>
		</div>
	</div>

	<!-- Skills Catalog Cards -->
	<div class="marketplace-list-scroll">
		{#if isLoading}
			<div class="empty-state pad16 text-center">
				<span class="text-item muted">Loading skills catalog...</span>
			</div>
		{:else if loadError}
			<div class="empty-state pad16 text-center">
				<span class="text-item muted text-red">{loadError}</span>
				<button class="btn-app margin-top8" onclick={() => {
					loadError = '';
					isLoading = true;
					skillsApi.loadCatalog().then(() => {
						catalogLoaded = true;
						isLoading = false;
					}).catch(err => {
						loadError = err instanceof Error ? err.message : 'Failed to load skills catalog.';
						isLoading = false;
					});
				}}>
					<span class="button-text">Retry</span>
				</button>
			</div>
		{:else if filteredSkills.length === 0}
			<div class="empty-state pad16 text-center">
				<span class="text-item muted">No skills match your search</span>
			</div>
		{:else}
			{#each filteredSkills as skill (skill.name)}
				<div class="marketplace-card {skill.installed ? 'is-downloaded' : ''}">
					<div class="card-title-row">
						<span class="text-item">/{skill.name}</span>
						{#if skill.installed}
							<span class="sidebar-badge activated">Active</span>
						{:else}
							<span class="sidebar-badge">Available</span>
						{/if}
					</div>
					<div class="card-repo">
						<p class="text-item-sm">{skill.description}</p>
					</div>

					<div class="row ycenter xbetween padbot8">
						<span class="text-item-sm">Path: agents/skills/{skill.name}/SKILL.md</span>
					</div>

					{#if skill.installed}
						<button class="btn-app disabled" disabled>
							<span class="button-text">Installed in Workspace</span>
						</button>
					{:else if installingId === skill.name}
						<button class="btn-app" disabled>
							<span class="button-text">Installing...</span>
						</button>
					{:else}
						<button
							class="btn-app"
							onclick={() => installSkill(skill.name)}
						>
							<span class="button-text">Install Skill Sheet</span>
						</button>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
