<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { DocsTocItem } from './types.js';
	import { scanHeadings } from './toc.js';

	type Props = {
		/** Element that contains the article headings */
		contentEl?: HTMLElement | null;
		/** Or pass a CSS selector resolved under document */
		contentSelector?: string;
		minLevel?: number;
		maxLevel?: number;
		title?: string;
		/** Re-scan when this changes (e.g. pathname) */
		watch?: unknown;
		class?: string;
	};

	let {
		contentEl = null,
		contentSelector = '.acrolls-docs-shell__article',
		minLevel = 2,
		maxLevel = 3,
		title = 'On this page',
		watch,
		class: className = ''
	}: Props = $props();

	let items = $state<DocsTocItem[]>([]);
	let activeId = $state<string | null>(null);

	async function rescan() {
		await tick();
		const root =
			contentEl ??
			(typeof document !== 'undefined'
				? document.querySelector<HTMLElement>(contentSelector)
				: null);
		if (!root) {
			items = [];
			return;
		}
		items = scanHeadings({ root, minLevel, maxLevel, ensureIds: true });
	}

	onMount(() => {
		void rescan();
		const onScroll = () => {
			if (!items.length) return;
			const offset = 96;
			let current: string | null = null;
			for (const item of items) {
				const el = document.getElementById(item.id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= offset) current = item.id;
			}
			activeId = current ?? items[0]?.id ?? null;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		watch;
		contentEl;
		void rescan();
	});
</script>

{#if items.length > 0}
	<nav class={['acrolls-docs-toc', className].filter(Boolean).join(' ')} aria-label={title}>
		<p class="acrolls-docs-toc__title">{title}</p>
		<ul class="acrolls-docs-toc__list">
			{#each items as item}
				<li
					class="acrolls-docs-toc__item"
					class:is-active={activeId === item.id}
					data-level={item.level}
				>
					<a href="#{item.id}" class="acrolls-docs-toc__link">{item.text}</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
