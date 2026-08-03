<script lang="ts">
	let { label = 'Responding' }: { label?: string } = $props();
</script>

<span data-slot="message-typing"
	><span data-slot="sr-only">{label}</span>{#each [0, 1, 2] as i}<span
			data-slot="message-typing-dot"
			style={`--dot:${i}`}
			aria-hidden="true"
		></span>{/each}</span
>
