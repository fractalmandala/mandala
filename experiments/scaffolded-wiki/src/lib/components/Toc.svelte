<script lang="ts">
	interface Heading {
		id: string;
		text: string;
		level: number;
	}

	let { bodyRef, resetKey }: { bodyRef: HTMLElement | null; resetKey: string } = $props();

	let headings = $state<Heading[]>([]);
	let active = $state('');
	let refsHTML = $state('');

	$effect(() => {
		bodyRef;
		resetKey; // re-scan on navigation
		if (!bodyRef) return;
		const seen = new Map<string, number>();
		headings = Array.from(bodyRef.querySelectorAll('h2, h3')).map((el) => {
			const text = (el.textContent ?? '').trim();
			// Prefer the server-rendered id (mdsvex assigns one); fall back to
			// the same slug so links always point at a real anchor.
			const base = text
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			const id = el.id || (count === 0 ? base : `${base}-${count}`);
			el.id = id;
			return { id, text, level: parseInt(el.tagName[1] ?? '2', 10) };
		});

		// Collect every referenced-files figure in the body and concatenate
		// their item lists for the rail (the inline figures are hidden on
		// wide screens via CSS). Each figure's `<ul class="rf-list">` holds
		// the ready-made `<li>` chips, so we reuse that exact markup.
		refsHTML = Array.from(bodyRef.querySelectorAll('.ref-files .rf-list'))
			.map((ul) => ul.innerHTML)
			.join('');
	});

	// Scrollspy: highlight the heading currently in view.
	$effect(() => {
		headings;
		if (!bodyRef || headings.length === 0) return;
		const map = new Map<string, HTMLElement>();
		for (const el of Array.from(bodyRef.querySelectorAll('h2, h3'))) {
			if (el.id) map.set(el.id, el as HTMLElement);
		}
		const els = [...map.values()];
		const obs = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						active = e.target.id;
						// last intersecting wins — iterate ascending
					}
				}
			},
			{ rootMargin: '-72px 0px -70% 0px', threshold: 0 }
		);
		els.forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	});
</script>

<nav class="toc" aria-label="On this page">
	{#if headings.length >= 2}
		<p class="label">On this page</p>
		<div class="toc-list">
			{#each headings as h (h.id)}
				<a
					href={`#${h.id}`}
					class="toc-link"
					class:lvl-3={h.level === 3}
					class:active={active === h.id}
					onclick={(e) => {
						e.preventDefault();
						document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						history.replaceState(null, '', `#${h.id}`);
						active = h.id;
					}}
				>
					{h.text}
				</a>
			{/each}
		</div>
	{/if}

	{#if refsHTML.trim()}
		<p class="label label-refs">Referenced files</p>
		<ul class="toc-refs">
			{@html refsHTML}
		</ul>
	{/if}
</nav>
