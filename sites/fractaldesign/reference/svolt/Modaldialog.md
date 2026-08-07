---
created: 2026-06-22T23:46:28 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/modaldialog
author: SveltoUI
---

# Modaldialog

> ## Excerpt
> Browse Modaldialog components for Svelte 5. Animation components you can copy into your project.

---
ModalDialog01.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Modal & Dialog Animations -->
<!-- Modal & Dialog Animations -->
<script>
	import { tick } from 'svelte';

	let modals = $state({
		fade: false,
		scale: false,
		slide: false,
		flip: false,
		bounce: false,
		blur: false
	});

	let triggerRef = null;

	async function openModal(type, event) {
		triggerRef = event?.currentTarget || document.activeElement;
		modals[type] = true;

		// Move focus to modal after render
		await tick();
		const modal = document.getElementById(`modal-${type}`);
		const focusable = modal?.querySelector('[data-autofocus]');
		focusable?.focus();
	}

	function closeModal(type) {
		modals[type] = false;
		// Return focus to trigger button
		if (triggerRef) {
			triggerRef.focus();
			triggerRef = null;
		}
	}

	function handleKeydown(event, type) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeModal(type);
		}

		// Focus trap implementation
		if (event.key === 'Tab') {
			const modal = document.getElementById(`modal-${type}`);
			if (!modal) return;

			const focusableElements = modal.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement?.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement?.focus();
				}
			}
		}
	}
</script>

<div class="space-y-12 w-full max-w-5xl">
	<!-- Modal Triggers -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Modal Entrance Animations</h3>
		<div class="flex flex-wrap gap-4 justify-center">
			<button type="button" onclick={(e) => openModal('fade', e)} class="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
				Fade In
			</button>
			<button type="button" onclick={(e) => openModal('scale', e)} class="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
				Scale In
			</button>
			<button type="button" onclick={(e) => openModal('slide', e)} class="px-6 py-3 rounded-lg bg-emerald-500 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
				Slide In
			</button>
			<button type="button" onclick={(e) => openModal('flip', e)} class="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
				Flip In
			</button>
			<button type="button" onclick={(e) => openModal('bounce', e)} class="px-6 py-3 rounded-lg bg-orange-500 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
				Bounce In
			</button>
			<button type="button" onclick={(e) => openModal('blur', e)} class="px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
				Blur In
			</button>
		</div>
	</div>

	<!-- Fade Modal -->
	{#if modals.fade}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-fade"
			id="modal-fade"
			onkeydown={(e) => handleKeydown(e, 'fade')}
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div onclick={() => closeModal('fade')} aria-hidden="true" class="absolute inset-0 bg-black/50 animate-overlay-fade"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-fade">
				<h4 id="modal-title-fade" class="text-xl font-semibold mb-2">Fade Animation</h4>
				<p class="text-muted-foreground mb-4">This modal fades in smoothly with an opacity transition.</p>
				<button type="button" data-autofocus onclick={() => closeModal('fade')} class="px-4 py-2 rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Scale Modal -->
	{#if modals.scale}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-scale"
			id="modal-scale"
			onkeydown={(e) => handleKeydown(e, 'scale')}
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div onclick={() => closeModal('scale')} aria-hidden="true" class="absolute inset-0 bg-black/50 animate-overlay-fade"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-scale">
				<h4 id="modal-title-scale" class="text-xl font-semibold mb-2">Scale Animation</h4>
				<p class="text-muted-foreground mb-4">This modal scales up from a smaller size with a slight overshoot.</p>
				<button type="button" data-autofocus onclick={() => closeModal('scale')} class="px-4 py-2 rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Slide Modal -->
	{#if modals.slide}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-slide"
			id="modal-slide"
			onkeydown={(e) => handleKeydown(e, 'slide')}
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div onclick={() => closeModal('slide')} aria-hidden="true" class="absolute inset-0 bg-black/50 animate-overlay-fade"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-slide">
				<h4 id="modal-title-slide" class="text-xl font-semibold mb-2">Slide Animation</h4>
				<p class="text-muted-foreground mb-4">This modal slides in from the bottom of the screen.</p>
				<button type="button" data-autofocus onclick={() => closeModal('slide')} class="px-4 py-2 rounded-lg bg-emerald-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Flip Modal -->
	{#if modals.flip}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-flip"
			id="modal-flip"
			onkeydown={(e) => handleKeydown(e, 'flip')}
			class="fixed inset-0 z-50 flex items-center justify-center [perspective:1000px]"
		>
			<div onclick={() => closeModal('flip')} aria-hidden="true" class="absolute inset-0 bg-black/50 animate-overlay-fade"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-flip">
				<h4 id="modal-title-flip" class="text-xl font-semibold mb-2">Flip Animation</h4>
				<p class="text-muted-foreground mb-4">This modal flips in with a 3D rotation effect.</p>
				<button type="button" data-autofocus onclick={() => closeModal('flip')} class="px-4 py-2 rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Bounce Modal -->
	{#if modals.bounce}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-bounce"
			id="modal-bounce"
			onkeydown={(e) => handleKeydown(e, 'bounce')}
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div onclick={() => closeModal('bounce')} aria-hidden="true" class="absolute inset-0 bg-black/50 animate-overlay-fade"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-bounce">
				<h4 id="modal-title-bounce" class="text-xl font-semibold mb-2">Bounce Animation</h4>
				<p class="text-muted-foreground mb-4">This modal bounces in with an elastic spring effect.</p>
				<button type="button" data-autofocus onclick={() => closeModal('bounce')} class="px-4 py-2 rounded-lg bg-orange-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Blur Modal -->
	{#if modals.blur}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-blur"
			id="modal-blur"
			onkeydown={(e) => handleKeydown(e, 'blur')}
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div onclick={() => closeModal('blur')} aria-hidden="true" class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-overlay-blur"></div>
			<div class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl animate-modal-blur">
				<h4 id="modal-title-blur" class="text-xl font-semibold mb-2">Blur Animation</h4>
				<p class="text-muted-foreground mb-4">This modal fades in from a blurred state with backdrop blur.</p>
				<button type="button" data-autofocus onclick={() => closeModal('blur')} class="px-4 py-2 rounded-lg bg-cyan-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">Close</button>
			</div>
		</div>
	{/if}

	<!-- Drawer Previews -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Drawer Animations</h3>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<!-- Left drawer preview -->
			<div class="relative h-40 rounded-xl border border-border overflow-hidden bg-muted/30">
				<div class="absolute left-0 top-0 bottom-0 w-1/3 bg-card border-r border-border shadow-lg drawer-left-demo">
					<div class="p-2 text-xs">Left</div>
				</div>
			</div>

			<!-- Right drawer preview -->
			<div class="relative h-40 rounded-xl border border-border overflow-hidden bg-muted/30">
				<div class="absolute right-0 top-0 bottom-0 w-1/3 bg-card border-l border-border shadow-lg drawer-right-demo">
					<div class="p-2 text-xs">Right</div>
				</div>
			</div>

			<!-- Top drawer preview -->
			<div class="relative h-40 rounded-xl border border-border overflow-hidden bg-muted/30">
				<div class="absolute top-0 left-0 right-0 h-1/3 bg-card border-b border-border shadow-lg drawer-top-demo">
					<div class="p-2 text-xs">Top</div>
				</div>
			</div>

			<!-- Bottom drawer preview -->
			<div class="relative h-40 rounded-xl border border-border overflow-hidden bg-muted/30">
				<div class="absolute bottom-0 left-0 right-0 h-1/3 bg-card border-t border-border shadow-lg drawer-bottom-demo">
					<div class="p-2 text-xs">Bottom</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Toast/Notification Animations -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Toast Animations</h3>
		<div class="space-y-4 max-w-md mx-auto">
			<!-- Slide from right -->
			<div class="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-lg animate-toast-right">
				<div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
					<svg aria-hidden="true" class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
					</svg>
				</div>
				<div class="flex-1">
					<p class="font-medium text-sm">Success!</p>
					<p class="text-xs text-muted-foreground">Slide from right</p>
				</div>
			</div>

			<!-- Slide from top -->
			<div class="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-lg animate-toast-top">
				<div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
					<svg aria-hidden="true" class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<div class="flex-1">
					<p class="font-medium text-sm">Info</p>
					<p class="text-xs text-muted-foreground">Slide from top</p>
				</div>
			</div>

			<!-- Pop up -->
			<div class="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-lg animate-toast-pop">
				<div class="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
					<svg aria-hidden="true" class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
					</svg>
				</div>
				<div class="flex-1">
					<p class="font-medium text-sm">Warning</p>
					<p class="text-xs text-muted-foreground">Pop animation</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Popover Animations -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Popover/Tooltip Animations</h3>
		<div class="flex flex-wrap justify-center gap-12">
			<!-- Fade tooltip -->
			<div class="relative group">
				<button class="px-4 py-2 rounded-lg border border-border">Fade</button>
				<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
					Tooltip
					<div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
				</div>
			</div>

			<!-- Scale tooltip -->
			<div class="relative group">
				<button class="px-4 py-2 rounded-lg border border-border">Scale</button>
				<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 invisible scale-75 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-200 origin-bottom">
					Tooltip
					<div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
				</div>
			</div>

			<!-- Slide tooltip -->
			<div class="relative group">
				<button class="px-4 py-2 rounded-lg border border-border">Slide</button>
				<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
					Tooltip
					<div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
				</div>
			</div>

			<!-- Bounce tooltip -->
			<div class="relative group">
				<button class="px-4 py-2 rounded-lg border border-border">Bounce</button>
				<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:animate-tooltip-bounce transition-opacity duration-200">
					Tooltip
					<div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Sheet/Panel Animations -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Bottom Sheet Animation</h3>
		<div class="relative h-64 rounded-xl border border-border overflow-hidden bg-muted/20">
			<div class="absolute inset-0 flex items-end">
				<div class="w-full bg-card border-t border-border rounded-t-2xl p-4 animate-sheet-up">
					<div class="w-12 h-1 bg-muted rounded-full mx-auto mb-4"></div>
					<h4 class="font-semibold text-center mb-2">Bottom Sheet</h4>
					<p class="text-sm text-muted-foreground text-center">Slides up from bottom with spring effect</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Overlay animations */
	@keyframes overlay-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.animate-overlay-fade {
		animation: overlay-fade 0.2s ease-out;
	}

	@keyframes overlay-blur {
		from { opacity: 0; backdrop-filter: blur(0); }
		to { opacity: 1; backdrop-filter: blur(4px); }
	}
	.animate-overlay-blur {
		animation: overlay-blur 0.3s ease-out;
	}

	/* Modal animations */
	@keyframes modal-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.animate-modal-fade {
		animation: modal-fade 0.3s ease-out;
	}

	@keyframes modal-scale {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}
	.animate-modal-scale {
		animation: modal-scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes modal-slide {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-modal-slide {
		animation: modal-slide 0.3s ease-out;
	}

	@keyframes modal-flip {
		from { opacity: 0; transform: rotateX(-15deg); }
		to { opacity: 1; transform: rotateX(0); }
	}
	.animate-modal-flip {
		animation: modal-flip 0.4s ease-out;
	}

	@keyframes modal-bounce {
		0% { opacity: 0; transform: scale(0.3); }
		50% { transform: scale(1.05); }
		70% { transform: scale(0.9); }
		100% { opacity: 1; transform: scale(1); }
	}
	.animate-modal-bounce {
		animation: modal-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	@keyframes modal-blur {
		from { opacity: 0; filter: blur(10px); }
		to { opacity: 1; filter: blur(0); }
	}
	.animate-modal-blur {
		animation: modal-blur 0.4s ease-out;
	}

	/* Drawer demos */
	@keyframes drawer-left {
		from { transform: translateX(-100%); }
		to { transform: translateX(0); }
	}
	.drawer-left-demo {
		animation: drawer-left 0.5s ease-out infinite alternate;
	}

	@keyframes drawer-right {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}
	.drawer-right-demo {
		animation: drawer-right 0.5s ease-out infinite alternate;
	}

	@keyframes drawer-top {
		from { transform: translateY(-100%); }
		to { transform: translateY(0); }
	}
	.drawer-top-demo {
		animation: drawer-top 0.5s ease-out infinite alternate;
	}

	@keyframes drawer-bottom {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}
	.drawer-bottom-demo {
		animation: drawer-bottom 0.5s ease-out infinite alternate;
	}

	/* Toast animations */
	@keyframes toast-right {
		from { opacity: 0; transform: translateX(100%); }
		to { opacity: 1; transform: translateX(0); }
	}
	.animate-toast-right {
		animation: toast-right 0.3s ease-out;
	}

	@keyframes toast-top {
		from { opacity: 0; transform: translateY(-20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-toast-top {
		animation: toast-top 0.3s ease-out;
	}

	@keyframes toast-pop {
		0% { opacity: 0; transform: scale(0.8); }
		50% { transform: scale(1.05); }
		100% { opacity: 1; transform: scale(1); }
	}
	.animate-toast-pop {
		animation: toast-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	/* Tooltip bounce */
	@keyframes tooltip-bounce {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50% { transform: translateX(-50%) translateY(-5px); }
	}
	.group-hover\:animate-tooltip-bounce {
		animation: tooltip-bounce 0.5s ease-in-out;
	}

	/* Sheet animation */
	@keyframes sheet-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}
	.animate-sheet-up {
		animation: sheet-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.animate-overlay-fade,
		.animate-overlay-blur,
		.animate-modal-fade,
		.animate-modal-scale,
		.animate-modal-slide,
		.animate-modal-flip,
		.animate-modal-bounce,
		.animate-modal-blur,
		.drawer-left-demo,
		.drawer-right-demo,
		.drawer-top-demo,
		.drawer-bottom-demo,
		.animate-toast-right,
		.animate-toast-top,
		.animate-toast-pop,
		.group-hover\:animate-tooltip-bounce,
		.animate-sheet-up {
			animation: none;
			opacity: 1;
			transform: none;
			filter: none;
		}

		.group:hover .group-hover\:animate-tooltip-bounce {
			animation: none;
			transform: translateX(-50%) translateY(0);
		}

		/* Tooltips - instant transitions */
		.group:hover > div {
			transition-duration: 0.01s;
		}
	}
</style>
```
