<script lang="ts">
	import type { DocsTypeRow } from './type-table.js';

	let {
		rows,
		caption
	}: { rows: DocsTypeRow[]; caption?: string } = $props();
</script>

<div class="docs-type-table">
	<table>
		{#if caption}
			<caption>{caption}</caption>
		{/if}
		<thead>
			<tr>
				<th scope="col">Property</th>
				<th scope="col">Type</th>
				<th scope="col">Default</th>
				<th scope="col">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.name)}
				<tr>
					<th scope="row">
						<code>{row.name}</code>
						{#if row.required}
							<span class="docs-type-table__required" aria-label="required">*</span>
						{/if}
					</th>
					<td><code>{row.type}</code></td>
					<td>{#if row.default}<code>{row.default}</code>{:else}—{/if}</td>
					<td>{row.description ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
