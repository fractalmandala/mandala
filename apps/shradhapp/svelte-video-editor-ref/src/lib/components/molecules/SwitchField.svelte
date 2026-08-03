<script lang="ts">
	import { Switch, Label } from '../atoms/index.js';
	import { uid } from '../../utils.js';

	type Props = {
		id?: string;
		name?: string;
		label?: string;
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		id,
		name,
		label,
		checked = $bindable(false),
		disabled = false,
		class: className,
	onCheckedChange
}: Props = $props();

	function initialSwitchId() {
		return id ?? `switch-${uid()}`;
	}

	const switchId = initialSwitchId();
</script>

<div class="flex items-center gap-2">
	<Switch
		id={switchId}
		{name}
		ariaLabel={label}
		bind:checked
		{disabled}
		class={className}
		{onCheckedChange}
	/>
	{#if label}
		<Label for={switchId} class="cursor-pointer">{label}</Label>
	{/if}
</div>
