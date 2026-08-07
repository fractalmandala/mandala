import { contributions } from '$lib/state/contributions.svelte';

contributions.registerCommands([
	{ 
		id: 'fractaldocs.open', 
		label: 'Open FractalDocs Wiki', 
		category: 'Global', 
		icon: '/ic-fin/module-docs.svg',
		scope: 'global', 
		run: () => import('$lib/state/app.svelte').then(({ appState }) => {
			appState.applyTemplate('docs');
		})
	},
]);
