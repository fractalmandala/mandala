<script lang="ts">
	import type { HeaderIcon } from '../types';
	import NavIconButton from './NavIconButton.svelte';

	interface Props {
		icon?: HeaderIcon;
		label?: string;
		href?: string;
	}

	let { icon = 'search', label = 'Action', href }: Props = $props();
</script>

<NavIconButton {icon} {label} {href} />
