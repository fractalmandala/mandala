<script lang="ts">
	import { docsState } from '../state/docs.svelte';

	let selectedHeadingId = $state<string | null>(null);

	function navigateToHeading(id: string, event: MouseEvent): void {
		event.preventDefault();
		const container = document.querySelector<HTMLElement>('[data-fractaldocs-scroll]');
		const heading = Array.from(container?.querySelectorAll<HTMLElement>('[id]') ?? [])
			.find((element) => element.id === id);
		if (!container || !heading) return;
		const top = heading.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
		container.scrollTo({ top, behavior: 'smooth' });
		selectedHeadingId = id;
		window.history.replaceState(null, '', `#${id}`);
	}
</script>

<div class="fractaldocs-sidebar-right">
	<div class="fractaldocs-sidebar-header bordbot">
		<span class="text-header">On This Page</span>
	</div>
	
	<div class="fractaldocs-toc">
		{#if docsState.toc.length === 0}
			<div class="fractaldocs-toc-empty">No headings found.</div>
		{:else}
			<ul class="fractaldocs-toc-list">
				{#each docsState.toc as heading}
					<li 
						class="fractaldocs-toc-item fractaldocs-toc-depth-{heading.depth}"
					>
						<a
							href="#{heading.id}"
							class="fractaldocs-toc-link"
							class:is-current={selectedHeadingId === heading.id}
							aria-current={selectedHeadingId === heading.id ? 'location' : undefined}
							onclick={(event) => navigateToHeading(heading.id, event)}
						>
							{heading.text}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
