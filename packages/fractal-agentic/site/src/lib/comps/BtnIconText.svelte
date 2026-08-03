<script lang="ts">
	import IconTextButton from './IconTextButton.svelte';

	interface Props {
		label?: string;
		href?: string;
		icon?: 'github' | 'share' | 'arrow';
		reverse?: boolean;
		accent?: boolean;
	}

	let { label = '', href, icon = 'share', reverse = false, accent = false }: Props = $props();
</script>

<IconTextButton {label} {href} {icon} {reverse} {accent} />
