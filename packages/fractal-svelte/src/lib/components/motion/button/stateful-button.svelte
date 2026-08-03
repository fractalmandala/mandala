<script lang="ts">
	import { motion, AnimatePresence } from '@humanspeak/svelte-motion';
	import Button from './button.svelte';
	import { SPRING_SWAP } from '$lib/ease.js';

	let {
		state = 'idle',
		loadingText = 'Loading',
		successText = 'Done',
		errorText = 'Try again',
		children,
		onclick,
		disabled = false,
		...restProps
	}: {
		state?: 'idle' | 'loading' | 'success' | 'error';
		loadingText?: string;
		successText?: string;
		errorText?: string;
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		pressScale?: number;
		ripple?: boolean;
		children?: import('svelte').Snippet;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		[x: string]: unknown;
	} = $props();

	$effect(() => {
		if (state === 'success') {
			const timer = setTimeout(() => {
				state = 'idle';
			}, 2000);
			return () => clearTimeout(timer);
		}
	});

	$effect(() => {
		if (state === 'error') {
			const timer = setTimeout(() => {
				state = 'idle';
			}, 3000);
			return () => clearTimeout(timer);
		}
	});

	function handleClick(e: MouseEvent) {
		if (state === 'loading') return;
		if (state === 'error') {
			state = 'idle';
		}
		onclick?.(e);
	}

	let isBusy = $derived(state === 'loading');
</script>

<Button
	{...restProps}
	onclick={handleClick}
	disabled={disabled || isBusy}
	aria-busy={isBusy || undefined}
>
	<AnimatePresence mode="wait">
		{#if state === 'loading'}
			<motion.span
				key="loading"
				data-slot="button-content"
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={SPRING_SWAP}
			>
				<span data-slot="button-icon">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
				</span>
				{loadingText}
			</motion.span>
		{:else if state === 'success'}
			<motion.span
				key="success"
				data-slot="button-content"
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={SPRING_SWAP}
			>
				<span data-slot="button-icon">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</span>
				{successText}
			</motion.span>
		{:else if state === 'error'}
			<motion.span
				key="error"
				data-slot="button-content"
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={SPRING_SWAP}
			>
				<span data-slot="button-icon">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</span>
				{errorText}
			</motion.span>
		{:else}
			<motion.span
				key="idle"
				data-slot="button-content"
				initial={{ opacity: 0, y: 4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={SPRING_SWAP}
			>
				{@render children?.()}
			</motion.span>
		{/if}
	</AnimatePresence>
</Button>
