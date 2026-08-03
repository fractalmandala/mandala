<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { MagnifyingGlassIcon, WarningCircleIcon } from 'phosphor-svelte';

	export interface CommandItem {
		id: string;
		title: string;
		subtitle: string;
		keywords: string[];
		group: string;
		shortcut?: string;
		danger?: boolean;
		disabled?: boolean;
		run: () => void | Promise<void>;
	}

	let {
		open,
		commands,
		confirmDanger = true,
		onClose
	}: {
		open: boolean;
		commands: CommandItem[];
		confirmDanger?: boolean;
		onClose: () => void;
	} = $props();

	let query = $state('');
	let active = $state(0);
	let confirming = $state<string | null>(null);
	let input = $state<HTMLInputElement | undefined>();
	const shortcutLabel = $derived.by(() => {
		if (typeof navigator === 'undefined') return 'Ctrl K';
		return navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl K';
	});

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const available = commands.filter((command) => !command.disabled);
		if (!q) return available;
		return available.filter((command) => {
			const hay = [command.title, command.subtitle, command.group, ...command.keywords]
				.join(' ')
				.toLowerCase();
			return hay.includes(q);
		});
	});

	$effect(() => {
		if (!open) return;
		query = '';
		active = 0;
		confirming = null;
		void tick().then(() => input?.focus());
	});

	onMount(() => {
		const onKeydown = (event: KeyboardEvent) => {
			const paletteShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
			if (!open && paletteShortcut) {
				event.preventDefault();
				return;
			}
			if (!open) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
			}
		};
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	async function run(command: CommandItem) {
		if (command.danger && confirmDanger && confirming !== command.id) {
			confirming = command.id;
			return;
		}
		await command.run();
		onClose();
	}

	function move(delta: number) {
		if (!filtered.length) return;
		active = (active + delta + filtered.length) % filtered.length;
		confirming = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			move(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			move(-1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const command = filtered[active];
			if (command) void run(command);
		}
	}
</script>

{#if open}
	<div class="palette-backdrop" role="presentation" onclick={onClose}>
		<dialog
			class="command-palette"
			open
			aria-label="Command palette"
			onclick={(event) => event.stopPropagation()}>
			<div class="palette-search">
				<MagnifyingGlassIcon size={20} />
				<input
					bind:this={input}
					value={query}
					oninput={(event) => {
						query = event.currentTarget.value;
						active = 0;
						confirming = null;
					}}
					onkeydown={handleKeydown}
					placeholder="Search commands, projects, media..."
					aria-label="Search commands" />
				<kbd>{shortcutLabel}</kbd>
			</div>
			<div class="palette-list" role="listbox" aria-label="Available commands">
				{#if filtered.length === 0}
					<p class="palette-empty">No commands found.</p>
				{:else}
					{#each filtered as command, index (command.id)}
						<button
							class:active={active === index}
							class:danger={command.danger}
							class="palette-command"
							role="option"
							aria-selected={active === index}
							onmouseenter={() => (active = index)}
							onclick={() => run(command)}>
							<span>
								<strong>{command.title}</strong>
								<small>
									{confirming === command.id ? 'Press again to confirm' : command.subtitle}
								</small>
							</span>
							{#if confirming === command.id}
								<WarningCircleIcon size={18} weight="fill" />
							{:else if command.shortcut}
								<kbd>{command.shortcut}</kbd>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</dialog>
	</div>
{/if}
