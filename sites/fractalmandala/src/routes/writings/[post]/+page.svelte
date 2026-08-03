<script lang="ts">
	let { data } = $props();
	import { tocState, toggleTocState, iW } from '$lib/utils/globalstores'
	import { page } from '$app/state'
	let ref = $state<HTMLElement | null>(null);
	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	import Shell from '$lib/comps/pageshell.svelte'
	import { slide } from 'svelte/transition'
	import { ExpandHeight } from 'svelte-animated-icon/remix'

	let current = $derived((page.url.pathname.split('/').filter(Boolean))[0]);

	$effect(() => {
		data;
		if (!ref) return;
		const seen = new Map<string, number>();
		headings = Array.from(ref.querySelectorAll('h2, h3')).map((el) => {
			const text = el.textContent ?? '';
			const base = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			const id = count === 0 ? base : `${base}-${count}`;
			el.id = id;
			return { id, text, level: parseInt(el.tagName[1]) };
		});
	});
</script>

<Shell>
	{#snippet children()}
		<div class="box rgap8 header-panel">
			<h1 class="text-4xl">{data.title}</h1>
			<p class="text-bs col2 padbot8">{data.description}</p>
			{#if data.tags && data.tags.length > 0}
				<div class="row gap4 wrap">
					{#each data.tags as tag}
						<span class="pill">{tag.replaceAll('-',' ')}</span>
					{/each}
				</div>
			{/if}
		</div>
		<div class="article-body" bind:this={ref}>
			<data.content/>
		</div>
		{#if data.groupPosts && data.groupPosts.length > 0}
			<div class="box rgap16 padtop32" style="border-top: 1px solid var(--border-default)">
				<h2 class="text-2xl col1">Articles in this Group</h2>
				<div class="box rgap12">
					{#each data.groupPosts as post}
						<a class="box rgap4 bordered blank link-theme" href={post.linkpath}>
							<span class="text-lg w600 col1">{post.title}</span>
							{#if post.description}
								<span class="text-sm col2">{post.description}</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/snippet}
	{#snippet asides()}
		<button class="blank row ycenter mobile-expand" class:expanded={$tocState} onclick={toggleTocState} style="color: var(--text-secondary)">
			<ExpandHeight template="jelly" variant="fill" speed={1.25} easing="cubic-bezier(0.68, -0.6, 0.32, 1.6)" size={28} />
			{#if $tocState}
			<span class="text-sm col2 tt-u w600">Collapse</span>
			{:else}
			<span class="text-sm col2 tt-u w600">Expand</span>
			{/if}
		</button>
		{#if !$iW || $tocState}
		<div class="box sticky-box gap32" transition:slide={{ duration: 240 }}>
			{#if headings.length >= 2}
				<nav class="box rgap16" aria-label="On this page">
					<div class="box rgap8">
						{#each headings as h}
							<a class="text-md blank link-theme" class:padleft8={h.level === 3} href="#{h.id}" onclick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
								<span class="col2">{h.text}</span>
							</a>
						{/each}
					</div>
				</nav>
			{/if}
			{#if data.related}
				<nav class="box rgap16" id="second-nav" aria-label="Also See">
				<span class="text-sm tt-c col3">Also See:</span>
				<div class="box rgap8">
				{#each data.related as related}
					<a class="text-md blank tt-c link-theme" href="/{current}/{related}"><span class="col2">{related.replaceAll('-',' ')}</span></a>
				{/each}
				</div>
				</nav>
			{/if}
		</div>
		{/if}
	{/snippet}
</Shell>