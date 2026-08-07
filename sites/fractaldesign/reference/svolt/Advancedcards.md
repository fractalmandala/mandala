---
created: 2026-06-22T23:43:31 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/advancedcards
author: SveltoUI
---

# Advancedcards

> ## Excerpt
> Browse Advancedcards components for Svelte 5. Animation components you can copy into your project.

---
AdvancedCards03.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Cards with advanced animations. -->
<!-- 3D Tilt Cards -->
<script>
	let reducedMotion = $state(false);
	let activeCards = $state({});

	$effect(() => {
		if (typeof window !== 'undefined') {
			reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
	});

	function handleTilt(e, index) {
		if (reducedMotion) return;

		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		const rotateX = (y - 0.5) * -20;
		const rotateY = (x - 0.5) * 20;
		card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
	}

	function resetTilt(e) {
		e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
	}

	function toggleCard(index) {
		activeCards[index] = !activeCards[index];
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
	{#each [
		{ title: 'Premium Plan', price: '$99', color: 'from-primary/80 to-primary' },
		{ title: 'Business Plan', price: '$199', color: 'from-cyan-500 to-blue-700' },
		{ title: 'Enterprise', price: '$499', color: 'from-orange-500 to-red-700' }
	] as card, index}
		<button
			class="p-6 rounded-xl bg-gradient-to-br {card.color} text-white text-left transition-transform duration-200 ease-out shadow-lg hover:shadow-2xl focus-visible:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
			onmousemove={(e) => handleTilt(e, index)}
			onmouseleave={resetTilt}
			onclick={() => toggleCard(index)}
			aria-label="{card.title} - {card.price} - 3D interactive pricing card"
		>
			<div class="text-sm opacity-70 mb-2">Starting at</div>
			<div class="text-4xl font-bold mb-4">{card.price}</div>
			<h4 class="text-xl font-semibold mb-2">{card.title}</h4>
			<p class="text-white/70 text-sm">Interact to see 3D tilt effect</p>
		</button>
	{/each}
</div>

<style>
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none !important;
		}

		button:hover,
		button:focus-visible {
			transform: none !important;
			box-shadow: 0 12px 40px rgba(0, 0, 0, var(--opacity-20));
		}
	}
</style>
```
