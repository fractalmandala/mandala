---
created: 2026-06-22T23:44:29 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/advancedtransitions
author: SveltoUI
---

# Advancedtransitions

> ## Excerpt
> Browse Advancedtransitions components for Svelte 5. Animation components you can copy into your project.

---
AdvancedTransitions01.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Page Transitions Demo -->
<!-- Page Transitions Demo -->
<script>
	let currentView = $state(0);
	let transitioning = $state(false);
	let transitionType = $state('fade');

	const views = [
		{ id: 0, title: 'Welcome', subtitle: 'Start your journey', bg: 'from-primary to-primary' },
		{ id: 1, title: 'Features', subtitle: 'Discover possibilities', bg: 'from-emerald-600 to-teal-700' },
		{ id: 2, title: 'Pricing', subtitle: 'Choose your plan', bg: 'from-orange-600 to-red-700' },
		{ id: 3, title: 'Contact', subtitle: 'Get in touch', bg: 'from-primary to-primary' }
	];

	async function goToView(index, type = 'fade') {
		if (transitioning || index === currentView) return;
		transitioning = true;
		transitionType = type;
		await new Promise(r => setTimeout(r, 600));
		currentView = index;
		await new Promise(r => setTimeout(r, 50));
		transitioning = false;
	}

	function nextView() {
		goToView((currentView + 1) % views.length, transitionType);
	}

	function prevView() {
		goToView((currentView - 1 + views.length) % views.length, transitionType);
	}
</script>

<div class="space-y-6 w-full max-w-5xl">
	<!-- Transition Type Selector -->
	<div class="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Transition type">
		{#each ['fade', 'slide', 'zoom', 'flip', 'cube', 'swipe', 'morph', 'blur'] as type}
			<button
				onclick={() => transitionType = type}
				role="radio"
				aria-checked={transitionType === type}
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {transitionType === type ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
			>
				{type.charAt(0).toUpperCase() + type.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Transition Container -->
	<div class="relative h-80 rounded-2xl overflow-hidden [perspective:1000px]" role="region" aria-label="Page carousel" aria-live="polite">
		<p class="sr-only" aria-atomic="true">
			Showing {views[currentView].title}: {views[currentView].subtitle}
		</p>
		{#each views as view, i}
			<div
				class="absolute inset-0 bg-gradient-to-br {view.bg} flex items-center justify-center transition-all duration-500"
				class:opacity-0={i !== currentView && !['slide', 'cube', 'swipe'].includes(transitionType)}
				class:opacity-100={i === currentView || ['slide', 'cube', 'swipe'].includes(transitionType)}
				class:translate-x-full={i > currentView && transitionType === 'slide'}
				class:-translate-x-full={i < currentView && transitionType === 'slide'}
				class:scale-75={i !== currentView && transitionType === 'zoom'}
				class:scale-100={i === currentView && transitionType === 'zoom'}
				class:[transform:rotateY(180deg)]={i !== currentView && transitionType === 'flip'}
				class:[transform:rotateY(-90deg)]={i > currentView && transitionType === 'cube'}
				class:[transform:rotateY(90deg)]={i < currentView && transitionType === 'cube'}
				class:translate-y-full={i > currentView && transitionType === 'swipe'}
				class:-translate-y-full={i < currentView && transitionType === 'swipe'}
				class:blur-lg={i !== currentView && transitionType === 'blur'}
				class:rounded-full={i !== currentView && transitionType === 'morph'}
				class:scale-0={i !== currentView && transitionType === 'morph'}
				style="z-index: {i === currentView ? 10 : 0}; {transitionType === 'cube' ? 'transform-origin: center;' : ''}"
			>
				<div class="text-center text-white">
					<h2 class="text-4xl font-bold mb-2">{view.title}</h2>
					<p class="text-white/80">{view.subtitle}</p>
				</div>
			</div>
		{/each}

		<!-- Navigation Arrows -->
		<button
			onclick={prevView}
			aria-label="Go to previous view"
			class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
		>
			<svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
			</svg>
		</button>
		<button
			onclick={nextView}
			aria-label="Go to next view"
			class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
		>
			<svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
			</svg>
		</button>

		<!-- Dots -->
		<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
			{#each views as _, i}
				<button
					onclick={() => goToView(i, transitionType)}
					aria-label="Go to {views[i].title} view"
					aria-current={i === currentView ? 'true' : undefined}
					class="w-2 h-2 rounded-full transition-all duration-300 {i === currentView ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}"
				></button>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.transition-all {
			transition: none !important;
		}
		/* Show instant transitions instead */
		:global([class*="translate-"]),
		:global([class*="scale-"]),
		:global([class*="blur-"]),
		:global([class*="rotate"]) {
			transition: none !important;
		}
	}
</style>
```
