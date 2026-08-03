<script lang="ts">
	export type PropDef = { name: string; type: string; default: string; description: string };
	let { props }: { props: PropDef[] } = $props();
</script>

<div class="table-wrap"><table><thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>{#each props as prop}<tr><td><code>{prop.name}</code></td><td><code>{prop.type}</code></td><td>{prop.default}</td><td>{prop.description}</td></tr>{/each}</tbody></table></div>
