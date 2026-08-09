<script lang="ts">
	let {
		index,
		label,
		title,
		body,
		primaryHref,
		primaryLabel,
		links = []
	}: {
		index: string;
		label: string;
		title: string;
		body: string;
		primaryHref: string;
		primaryLabel: string;
		links?: { href: string; label: string }[];
	} = $props();

	const arrow = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 8L22 12L18 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
</script>

<section class="site-section site-container">
	<div class="cta-slab">
		<div class="slab-grid">
			<div class="box gap20">
				<p class="eyebrow">{index} / {label}</p>
				<h2 class="display-md">{title}</h2>
				<p class="slab-body">{body}</p>
				<a class="slab-cta" href={primaryHref}>
					{primaryLabel}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html arrow}
					<!-- eslint-enable svelte/no-at-html-tags -->
				</a>
			</div>
			{#if links.length > 0}
				<nav class="slab-links" aria-label="Related links">
					{#each links as link (link.href)}
						<a href={link.href}>
							{link.label}
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html arrow}
							<!-- eslint-enable svelte/no-at-html-tags -->
						</a>
					{/each}
				</nav>
			{/if}
		</div>
	</div>
</section>
