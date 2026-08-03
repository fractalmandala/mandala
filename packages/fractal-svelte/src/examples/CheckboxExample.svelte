<script lang="ts">
	import { Checkbox } from '$lib/components/motion/checkbox/index.js';
	let checked = $state(false);
</script>

<div class="fixture-preview">
	<Checkbox bind:checked label="Include archived projects" />
	<p>{checked ? 'Archived projects included' : 'Showing active projects only'}</p>
</div>
