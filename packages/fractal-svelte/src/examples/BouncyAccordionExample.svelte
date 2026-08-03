<script lang="ts">
	import { BouncyAccordion } from '$lib/components/blocks/bouncy-accordion/index.js';
	const items = [
		{
			id: 'motion',
			title: 'Why use motion?',
			description: 'Small transitions help people understand what changed.'
		},
		{
			id: 'accessibility',
			title: 'Is it accessible?',
			description: 'Controls are keyboard friendly and respect reduced-motion preferences.'
		},
		{
			id: 'composition',
			title: 'Can I compose it?',
			description: 'Pass data and snippets to build richer panels.'
		}
	];
	let value = $state<string | null>('motion');
</script>

<div class="fixture-preview">
	<BouncyAccordion {items} bind:value />
</div>
