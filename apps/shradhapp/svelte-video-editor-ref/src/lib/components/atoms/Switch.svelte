<script lang="ts">
	import { cn } from '../../utils.js';

	type Props = {
		id?: string;
		name?: string;
		checked?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		class?: string;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		id,
		name,
		checked = $bindable(false),
		disabled = false,
		ariaLabel,
		class: className,
		onCheckedChange
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onCheckedChange?.(checked);
	}
</script>

<button
	{id}
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={ariaLabel ?? name ?? 'Toggle'}
	data-name={name}
	{disabled}
	onclick={toggle}
	class={cn(
		'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none',
		'focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		checked ? 'bg-primary' : 'bg-muted',
		className
	)}
>
	<span
		class={cn(
			'pointer-events-none block size-4 rounded-full bg-background shadow-sm transition-transform',
			checked ? 'translate-x-4' : 'translate-x-0'
		)}
	></span>
</button>
