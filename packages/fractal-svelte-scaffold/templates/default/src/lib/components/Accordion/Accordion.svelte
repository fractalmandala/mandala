<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';
	import './Accordion.sass';

	interface Section {
		id: string;
		title: string;
		disabled?: boolean;
	}

	interface Props {
		sections: Section[];
		multiple?: boolean;
		ariaLabel?: string;
		children?: Snippet<[section: Section, isOpen: boolean]>;
	}

	let { sections, multiple = true, ariaLabel, children }: Props = $props();

	let open = $state(new SvelteSet<string>());

	function toggle(id: string, disabled?: boolean) {
		if (disabled) return;
		if (open.has(id)) {
			open.delete(id);
		} else {
			if (!multiple) open.clear();
			open.add(id);
		}
	}

	function handleKeydown(e: KeyboardEvent, section: Section) {
		if ((e.key === 'Enter' || e.key === ' ') && !section.disabled) {
			e.preventDefault();
			toggle(section.id, section.disabled);
		}
	}
</script>

<div class="accordion" aria-label={ariaLabel}>
	{#each sections as section (section.id)}
		{@const isOpen = open.has(section.id)}
		<div class="accordion-section" class:accordion-disabled={section.disabled}>
			<button
				type="button"
				class="accordion-trigger"
				aria-expanded={isOpen}
				aria-controls="accordion-panel-{section.id}"
				disabled={section.disabled}
				onclick={() => toggle(section.id, section.disabled)}
				onkeydown={(e) => handleKeydown(e, section)}
			>
				<span class="accordion-title">{section.title}</span>
				<svg
					class="accordion-chevron"
					class:accordion-chevron-open={isOpen}
					aria-hidden="true"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
			{#if isOpen}
				<div
					id="accordion-panel-{section.id}"
					class="accordion-panel"
					role="region"
					in:slide={{ duration: 250, easing: quintOut }}
					out:slide={{ duration: 200, easing: quintOut }}
				>
					<div class="accordion-content">
						{#if children}
							{@render children(section, isOpen)}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
