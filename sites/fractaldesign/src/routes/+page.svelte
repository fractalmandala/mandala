<script lang="ts">
	import DesignHomeTemplate from '$lib/templates/DesignHomeTemplate.svelte';
	let { data } = $props();

	const projects = [
		{ title: 'Fractals', href: 'https://github.com/fractalmandala/fractals', desc: "A monorepo and desktop app that's my main building project.", glyph: '◆', tint: 'rose' },
		{ title: 'Svelte Animated Icon', href: 'https://svelte-animated-icon.vercel.app/', desc: '100,000+ animated icon variants for SvelteKit.', glyph: '✦', tint: 'sky' },
		{ title: 'Fractaldharma', href: 'https://www.fractaldharma.in/', desc: 'An interconnected repository of Sanskrit words and texts.', glyph: '❋', tint: 'amber' },
		{ title: 'Fractalmandala', href: 'https://www.fractalmandala.in/', desc: 'A blog and a growing knowledge bank.', glyph: '✳', tint: 'mint' },
		{ title: 'Pipeline', href: '', desc: 'In the workshop: Fractalbodha, an AI chat app, and Design Bench.', glyph: '◌', tint: 'lav' }
	];
</script>

<DesignHomeTemplate projects={projects} posts={data.posts ?? []} pages={data.pages ?? []} />
