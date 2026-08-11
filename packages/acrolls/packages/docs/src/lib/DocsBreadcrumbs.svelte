<script lang="ts">
	import type { DocsCrumb } from './types.js';

	type Props = {
		crumbs: DocsCrumb[];
		/** Accessible name for the nav landmark */
		label?: string;
		class?: string;
	};

	let { crumbs, label = 'Breadcrumb', class: className = '' }: Props = $props();
</script>

<nav class={['acrolls-docs-breadcrumbs', className].filter(Boolean).join(' ')} aria-label={label}>
	<ol class="acrolls-docs-breadcrumbs__list">
		{#each crumbs as crumb, i}
			<li class="acrolls-docs-breadcrumbs__item">
				{#if i > 0}
					<span class="acrolls-docs-breadcrumbs__sep" aria-hidden="true">/</span>
				{/if}
				{#if crumb.href && i < crumbs.length - 1}
					<a class="acrolls-docs-breadcrumbs__link" href={crumb.href}>{crumb.label}</a>
				{:else}
					<span class="acrolls-docs-breadcrumbs__current" aria-current={i === crumbs.length - 1 ? 'page' : undefined}
						>{crumb.label}</span
					>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
