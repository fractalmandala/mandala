<script lang="ts">
	// src/lib/components/TemplateDock.svelte
	// T3.3 — large overlay that opens from the bottom dock's launcher.
	// Shows category tabs + search + grouped thumbnails. Clicking a template
	// calls canvas.insertTemplate(blocks) and closes the overlay.
	import { onMount } from 'svelte';
	import { designcanvas } from '$lib/modules/designer/state/designcanvas.svelte';
	import {
		TEMPLATES,
		TEMPLATE_CATEGORIES,
		findTemplate,
		type Template,
		type TemplateCategory
	} from '$lib/modules/designer/data/designtemplates'

	type Props = {
		open: boolean;
		onclose: () => void;
	};

	let { open, onclose }: Props = $props();

	let query = $state('');
	let activeCategory = $state<TemplateCategory | 'All'>('All');
	let lastFocusEl = $state<HTMLElement | null>(null);
	let dialogEl = $state<HTMLElement | null>(null);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return TEMPLATES.filter((t) => {
			const matchCat = activeCategory === 'All' || t.category === activeCategory;
			if (!matchCat) return false;
			if (!q) return true;
			return (
				t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
			);
		});
	});

	// Group by category for the heading sections (only when "All" is active).
	const groupedAll = $derived.by(() => {
		const out: Record<string, Template[]> = {};
		for (const t of filtered) {
			out[t.category] ??= [];
			out[t.category].push(t);
		}
		return out;
	});

	function activate(t: Template) {
		designcanvas.insertTemplate(t.blocks);
		onclose();
	}

	function close() {
		onclose();
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	$effect(() => {
		if (open) {
			lastFocusEl = (document.activeElement as HTMLElement) ?? null;
			// Focus the dialog so the Esc key works without further interaction.
			setTimeout(() => dialogEl?.focus(), 0);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			lastFocusEl?.focus?.();
		}
	});

	onMount(() => {
		return () => {
			document.body.style.overflow = '';
		};
	});

	function categoryClass(category: TemplateCategory): string {
		return `tpl-thumb--${category.toLowerCase()}`;
	}
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<!-- Backdrop + dialog. Click on backdrop closes; clicks inside the panel
	     don't propagate. Tab focus is trapped to the panel via tabindex=-1
	     on the backdrop so screen readers know to leave it alone. -->
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div
		class="tpl-backdrop"
		role="presentation"
		onclick={close}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
		<div
			bind:this={dialogEl}
			class="tpl-panel"
			role="dialog"
			aria-modal="true"
			aria-label="Insert template"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				// Inside the dialog: stop key events from bubbling to the
				// global svelte:window listener, so a stray Esc inside a
				// focused button (e.g. closing an open select) doesn't
				// double-fire. The window-level Esc handler still catches
				// the case where focus is outside the dialog.
				if (e.key === 'Escape') e.stopPropagation();
			}}
		>
			<header class="tpl-head">
				<div class="tpl-title-row">
					<h2 class="tpl-title">Templates</h2>
					<button
						type="button"
						class="tpl-close"
						onclick={close}
						aria-label="Close templates"
					>
						<img src="/iconset/close.svg" alt="" class="icon-svg-sm" />
					</button>
				</div>
				<div class="tpl-controls">
					<label class="tpl-search">
						<span class="visually-hidden">Search templates</span>
						<img src="/iconset/search.svg" alt="" class="icon-svg-sm" />
						<input
							type="search"
							placeholder="Search templates…"
							bind:value={query}
							aria-label="Search templates"
						/>
					</label>
					<div class="tpl-cats" role="tablist" aria-label="Template categories">
						<button
							role="tab"
							class="tpl-cat"
							class:active={activeCategory === 'All'}
							aria-selected={activeCategory === 'All'}
							onclick={() => (activeCategory = 'All')}
						>
							All
						</button>
						{#each TEMPLATE_CATEGORIES as cat (cat)}
							<button
								role="tab"
								class="tpl-cat"
								class:active={activeCategory === cat}
								aria-selected={activeCategory === cat}
								onclick={() => (activeCategory = cat)}
							>
								{cat}
							</button>
						{/each}
					</div>
				</div>
			</header>

			<div class="tpl-body">
				{#if filtered.length === 0}
					<div class="tpl-empty">
						No templates match "{query}"
					</div>
				{:else if activeCategory === 'All'}
					{#each TEMPLATE_CATEGORIES as cat (cat)}
						{#if groupedAll[cat] && groupedAll[cat].length > 0}
							<section class="tpl-group">
								<h3 class="tpl-group-title">{cat}</h3>
								<div class="tpl-grid">
									{#each groupedAll[cat] as t (t.id)}
										<button
											type="button"
											class="tpl-card"
											onclick={() => activate(t)}
											title="{t.name} — {t.description}"
										>
											<span class="tpl-thumb {categoryClass(t.category)}">
												<span class="tpl-thumb-shape tpl-thumb-shape--lg"></span>
												<span class="tpl-thumb-shape tpl-thumb-shape--sm"></span>
											</span>
											<span class="tpl-card-meta">
												<span class="tpl-card-name">{t.name}</span>
												<span class="tpl-card-desc">{t.description}</span>
											</span>
										</button>
									{/each}
								</div>
							</section>
						{/if}
					{/each}
				{:else}
					<div class="tpl-grid">
						{#each filtered as t (t.id)}
							<button
								type="button"
								class="tpl-card"
								onclick={() => activate(t)}
								title="{t.name} — {t.description}"
							>
								<span class="tpl-thumb {categoryClass(t.category)}">
									<span class="tpl-thumb-shape tpl-thumb-shape--lg"></span>
									<span class="tpl-thumb-shape tpl-thumb-shape--sm"></span>
								</span>
								<span class="tpl-card-meta">
									<span class="tpl-card-name">{t.name}</span>
									<span class="tpl-card-desc">{t.description}</span>
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<footer class="tpl-foot">
				<span class="tpl-foot-hint">Click any template to drop it at the viewport centre. One undo step.</span>
				<button class="tpl-foot-close" onclick={close}>Close (Esc)</button>
			</footer>
		</div>
	</div>
{/if}
