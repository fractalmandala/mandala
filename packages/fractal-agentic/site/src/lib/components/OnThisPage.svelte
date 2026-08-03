<script lang="ts">
	import { onMount } from 'svelte';

	interface OutlineLink {
		label: string;
		href: string;
	}

	let links = $state<OutlineLink[]>([]);
	let activeId = $state('');

	onMount(() => {
		const root = document.querySelector('main .doc-article') ?? document.querySelector('main');
		if (!root) return;
		const headings = Array.from(root.querySelectorAll('h2, h3'));
		links = headings
			.filter((h) => h.id)
			.map((h) => ({ label: (h.textContent ?? '').trim(), href: `#${h.id}` }));

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		for (const h of headings) {
			if (h.id) observer.observe(h);
		}
		return () => observer.disconnect();
	});
</script>

<section>
	<div class="label">ON THIS PAGE</div>
	<div class="links">
		{#each links as link}
			<a href={link.href} class:active={link.href === `#${activeId}`}>
				{link.label}
			</a>
		{/each}
	</div>
</section>
