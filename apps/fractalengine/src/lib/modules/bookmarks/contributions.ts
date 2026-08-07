import { contributions } from '$lib/state/contributions.svelte';
import { bookmarks } from './state/bookmarks.svelte';

contributions.registerCommands([
	{
		id: 'bookmarks.newBookmark',
		label: 'New Bookmark',
		category: 'Bookmarks',
		icon: '/iconset/add.svg',
		scope: 'bookmarks',
		run: () => { bookmarks.setShowAddForm(true); },
	},
]);

contributions.registerHeaderActions([
	{
		scope: 'bookmarks',
		kind: 'icon',
		ariaLabel: 'New Bookmark',
		title: 'New Bookmark',
		icon: '/iconset/add.svg',
		commandId: 'bookmarks.newBookmark',
		order: 10,
	},
]);
