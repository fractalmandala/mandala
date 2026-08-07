---
created: 2026-06-22T23:44:07 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/advancedtext
author: SveltoUI
---

# Advancedtext

> ## Excerpt
> Browse Advancedtext components for Svelte 5. Animation components you can copy into your project.

---
AdvancedText04.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Hero Text Styles -->
<!-- Hero Text Styles -->
<script>
	let visible = $state(true);

	function reset() {
		visible = false;
		setTimeout(() => visible = true, 100);
	}
</script>

<div class="space-y-8 w-full max-w-5xl">
	<div class="flex justify-end">
		<button onclick={reset} class="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
			Replay Animations
		</button>
	</div>

	{#if visible}
	<div class="py-12 text-center rounded-xl border border-border bg-card overflow-hidden">
		<h2 class="text-4xl md:text-6xl font-black tracking-tight hero-split-reveal" aria-label="Split Reveal">
			<span aria-hidden="true">
				<span class="block overflow-hidden">
					<span class="inline-block animate-hero-line" style="animation-delay: 0ms">SPLIT</span>
				</span>
				<span class="block overflow-hidden">
					<span class="inline-block animate-hero-line text-primary" style="animation-delay: 200ms">REVEAL</span>
				</span>
			</span>
		</h2>
	</div>
	{/if}

	{#if visible}
	<div class="py-12 text-center rounded-xl border border-border bg-gradient-to-br from-slate-900 to-slate-800">
		<h2 class="text-4xl md:text-6xl font-black tracking-tight text-white animate-glow-pulse">
			Glow Pulse
		</h2>
	</div>
	{/if}

	{#if visible}
	<div class="py-12 text-center rounded-xl border border-border bg-card">
		<h2 class="text-4xl md:text-6xl font-black tracking-tight" aria-label="STAGGER">
			<span aria-hidden="true">
				{#each "STAGGER".split("") as char, i}
					<span class="inline-block animate-bounce-drop" style="animation-delay: {i * 100}ms">{char}</span>
				{/each}
			</span>
		</h2>
	</div>
	{/if}
</div>

<style>
	/* Hero line */
	@keyframes heroLine {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	.animate-hero-line {
		animation: heroLine 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	/* Glow pulse */
	.animate-glow-pulse {
		animation: glowPulse 2s ease-in-out 3;
	}
	@keyframes glowPulse {
		0%, 100% {
			text-shadow:
				0 0 10px rgba(255, 255, 255, var(--opacity-50)),
				0 0 20px rgba(255, 255, 255, var(--opacity-30)),
				0 0 30px rgba(255, 255, 255, var(--opacity-20));
		}
		50% {
			text-shadow:
				0 0 20px rgba(255, 255, 255, 0.8),
				0 0 40px rgba(255, 255, 255, var(--opacity-50)),
				0 0 60px rgba(255, 255, 255, var(--opacity-30));
		}
	}

	/* Bounce drop */
	@keyframes bounceDrop {
		0% {
			opacity: 0;
			transform: translateY(-50px);
		}
		60% {
			transform: translateY(10px);
		}
		80% {
			transform: translateY(-5px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-bounce-drop {
		animation: bounceDrop 0.6s ease forwards;
		opacity: 0;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.animate-hero-line {
			animation: none !important;
			transform: translateY(0) !important;
		}

		.animate-glow-pulse {
			animation: none !important;
			text-shadow:
				0 0 10px rgba(255, 255, 255, var(--opacity-50)),
				0 0 20px rgba(255, 255, 255, var(--opacity-30));
		}

		.animate-bounce-drop {
			animation: none !important;
			opacity: 1 !important;
			transform: translateY(0) !important;
		}
	}
</style>
```
