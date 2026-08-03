<script lang="ts">
	import { Switch } from '$lib/components/motion/switch/index.js';
	let checked = $state(true);
</script>

<div class="fixture-preview">
	<Switch bind:checked label="Email notifications" />
	<p>{checked ? 'Notifications are on' : 'Notifications are off'}</p>
</div>
