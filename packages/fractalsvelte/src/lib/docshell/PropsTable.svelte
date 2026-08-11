<script lang="ts" module>
	export type PropRow = {
		name: string;
		type: string;
		default?: string;
		description: string;
	};
</script>

<script lang="ts">
	// Props are this library's entire customisation surface — there is no class escape
	// hatch — so an undocumented prop is an unusable one. Every prop belongs here.
	let { props, caption }: { props: PropRow[]; caption?: string } = $props();
</script>

<div class="doc-table-wrap">
	<table class="doc-table">
		{#if caption}<caption>{caption}</caption>{/if}
		<thead>
			<tr>
				<th scope="col">Prop</th>
				<th scope="col">Type</th>
				<th scope="col">Default</th>
				<th scope="col">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each props as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td><code class="doc-type">{p.type}</code></td>
					<td>{#if p.default}<code>{p.default}</code>{:else}<span class="doc-dim">—</span>{/if}</td>
					<td>{p.description}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
