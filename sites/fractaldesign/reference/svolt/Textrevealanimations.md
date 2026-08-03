---
created: 2026-06-22T23:48:00 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/textrevealanimations
author: SveltoUI
---

# Textrevealanimations

> ## Excerpt
> Browse Textrevealanimations components for Svelte 5. Animation components you can copy into your project.

---
TextRevealAnimations01.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Text Reveal Animations -->
<!-- Text Reveal Animations -->
<script>
	let visible = $state(true);
	let paused = $state(false);

	function reset() {
		visible = false;
		paused = false;
		setTimeout(() => visible = true, 100);
	}

	function togglePause() {
		paused = !paused;
		// Apply animation-play-state to all animations
		if (typeof document !== 'undefined') {
			document.querySelectorAll('[class*="animate-"]').forEach(el => {
				el.style.animationPlayState = paused ? 'paused' : 'running';
			});
			document.querySelectorAll('.glitch-text').forEach(el => {
				const before = window.getComputedStyle(el, '::before');
				const after = window.getComputedStyle(el, '::after');
				el.style.setProperty('--animation-play-state', paused ? 'paused' : 'running');
			});
		}
	}
</script>

<div class="space-y-12 w-full max-w-5xl">
	<a href="#animation-controls" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 bg-primary text-primary-foreground rounded z-50">
		Skip to animation controls
	</a>

	<div id="animation-controls" class="flex justify-end gap-4">
		<button
			onclick={togglePause}
			aria-label={paused ? 'Resume all animations' : 'Pause all animations'}
			class="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
		>
			{paused ? 'Resume' : 'Pause'} Animations
		</button>
		<button
			onclick={reset}
			aria-label="Replay all animations from the beginning"
			class="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
		>
			Replay Animations
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		<!-- Fade Up Letter by Letter -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters fade up sequentially from bottom to top"
		>
			<h3 class="text-lg font-semibold text-reveal-fade">
				{#each "Fade Up".split("") as char, i}
					<span class="inline-block animate-fade-up-letter" style="animation-delay: {i * 50}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Letters fade up sequentially</p>
		</div>
		{/if}

		<!-- Slide from Left -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters slide in from the left side sequentially"
		>
			<h3 class="text-lg font-semibold overflow-hidden">
				{#each "Slide Left".split("") as char, i}
					<span class="inline-block animate-slide-left-letter" style="animation-delay: {i * 40}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Letters slide in from left</p>
		</div>
		{/if}

		<!-- Pop In -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters pop in with scaling effect from small to large"
		>
			<h3 class="text-lg font-semibold">
				{#each "Pop In".split("") as char, i}
					<span class="inline-block animate-pop-in-letter" style="animation-delay: {i * 60}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Letters pop in with scale</p>
		</div>
		{/if}

		<!-- Rotate In -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters rotate in from a 90 degree angle at the bottom"
		>
			<h3 class="text-lg font-semibold">
				{#each "Rotate In".split("") as char, i}
					<span class="inline-block animate-rotate-in-letter origin-bottom" style="animation-delay: {i * 50}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Letters rotate from bottom</p>
		</div>
		{/if}

		<!-- Blur In -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters transition from blurry to sharp focus"
		>
			<h3 class="text-lg font-semibold">
				{#each "Blur In".split("") as char, i}
					<span class="inline-block animate-blur-in-letter" style="animation-delay: {i * 45}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Letters blur into focus</p>
		</div>
		{/if}

		<!-- Wave Effect -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Letters move up and down in a wave pattern with staggered delays"
		>
			<h3 class="text-lg font-semibold">
				{#each "Wave Text".split("") as char, i}
					<span class="inline-block animate-wave-letter" style="animation-delay: {i * 80}ms">{char === " " ? "\u00A0" : char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">
				Letters wave up and down
				<span class="sr-only">
					- Each letter moves up and down continuously in a wave pattern with staggered delays
				</span>
			</p>
		</div>
		{/if}

		<!-- Typewriter -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Classic typewriter effect with blinking cursor revealing text character by character"
		>
			<h3 class="text-lg font-semibold font-mono">
				<span class="animate-typewriter border-r-2 border-primary">Typewriter Effect</span>
			</h3>
			<p class="text-sm text-muted-foreground">Classic typewriter with cursor</p>
		</div>
		{/if}

		<!-- Glitch Text -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Cyberpunk glitch effect with rapid color shifts. Warning: contains flashing animation"
		>
			<div role="alert" aria-live="polite" class="text-xs text-orange-500 font-medium mb-2">
				⚠️ Warning: Flashing colors
			</div>
			<h3 class="text-lg font-semibold glitch-text relative" data-text="Glitch">
				Glitch
			</h3>
			<p class="text-sm text-muted-foreground">Cyberpunk glitch effect (flashing animation)</p>
		</div>
		{/if}

		<!-- Scramble Text -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Matrix-style scramble effect with letters appearing through rapid changes"
		>
			<h3 class="text-lg font-semibold">
				{#each "Scramble".split("") as char, i}
					<span class="inline-block animate-scramble" style="animation-delay: {i * 100}ms">{char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Matrix-style scramble (rapid text changes)</p>
		</div>
		{/if}

		<!-- Gradient Reveal -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Animated gradient sweeps across the text continuously"
		>
			<h3 class="text-lg font-semibold animate-gradient-reveal bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] bg-clip-text text-transparent">
				Gradient Sweep
			</h3>
			<p class="text-sm text-muted-foreground">Animated gradient text</p>
		</div>
		{/if}

		<!-- Split Reveal -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card overflow-hidden"
			role="img"
			aria-label="Text animation demo: Text splits and reveals from the center outward"
		>
			<h3 class="text-lg font-semibold relative">
				<span class="animate-split-reveal-top block overflow-hidden">
					<span class="inline-block animate-split-top">Split Reveal</span>
				</span>
			</h3>
			<p class="text-sm text-muted-foreground">Text splits from center</p>
		</div>
		{/if}

		<!-- Bounce Letters -->
		{#if visible}
		<div
			class="space-y-3 p-6 rounded-xl border border-border bg-card"
			role="img"
			aria-label="Text animation demo: Playful bouncing letters with elastic motion"
		>
			<h3 class="text-lg font-semibold">
				{#each "Bouncy".split("") as char, i}
					<span class="inline-block animate-bounce-letter" style="animation-delay: {i * 70}ms">{char}</span>
				{/each}
			</h3>
			<p class="text-sm text-muted-foreground">Playful bouncing letters</p>
		</div>
		{/if}
	</div>
</div>

<style>
	@keyframes fadeUpLetter {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-up-letter {
		animation: fadeUpLetter 0.5s ease forwards;
		opacity: 0;
	}

	@keyframes slideLeftLetter {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	.animate-slide-left-letter {
		animation: slideLeftLetter 0.4s ease forwards;
		opacity: 0;
	}

	@keyframes popInLetter {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-pop-in-letter {
		animation: popInLetter 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
		opacity: 0;
	}

	@keyframes rotateInLetter {
		from {
			opacity: 0;
			transform: rotateX(-90deg);
		}
		to {
			opacity: 1;
			transform: rotateX(0);
		}
	}
	.animate-rotate-in-letter {
		animation: rotateInLetter 0.5s ease forwards;
		opacity: 0;
	}

	@keyframes blurInLetter {
		from {
			opacity: 0;
			filter: blur(10px);
		}
		to {
			opacity: 1;
			filter: blur(0);
		}
	}
	.animate-blur-in-letter {
		animation: blurInLetter 0.6s ease forwards;
		opacity: 0;
	}

	@keyframes waveLetter {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	.animate-wave-letter {
		animation: waveLetter 1s ease-in-out 3; /* 3 iterations instead of infinite */
	}

	@keyframes typewriter {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}
	.animate-typewriter {
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
		animation: typewriter 2s steps(17) forwards, blink 0.7s step-end infinite;
	}
	@keyframes blink {
		50% {
			border-color: transparent;
		}
	}

	.glitch-text::before,
	.glitch-text::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	.glitch-text::before {
		animation: glitch-1 0.3s infinite linear alternate-reverse;
		clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
		color: #ff00ff;
	}
	.glitch-text::after {
		animation: glitch-2 0.3s infinite linear alternate-reverse;
		clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
		color: #00ffff;
	}
	@keyframes glitch-1 {
		0% { transform: translateX(0); }
		100% { transform: translateX(-3px); }
	}
	@keyframes glitch-2 {
		0% { transform: translateX(0); }
		100% { transform: translateX(3px); }
	}

	@keyframes scramble {
		0%, 100% { opacity: 1; }
		10% { opacity: 0; transform: translateY(-5px); }
		20% { opacity: 1; transform: translateY(0); content: "X"; }
		30% { opacity: 0; transform: translateY(5px); }
		40% { opacity: 1; transform: translateY(0); }
	}
	.animate-scramble {
		animation: scramble 1s ease forwards;
	}

	@keyframes gradientReveal {
		from {
			background-position: 100% 50%;
		}
		to {
			background-position: 0% 50%;
		}
	}
	.animate-gradient-reveal {
		animation: gradientReveal 2s ease infinite;
	}

	@keyframes splitTop {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	.animate-split-top {
		animation: splitTop 0.6s ease forwards;
	}

	@keyframes bounceLetter {
		0%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-15px);
		}
		60% {
			transform: translateY(-7px);
		}
	}
	.animate-bounce-letter {
		animation: bounceLetter 0.6s ease forwards;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.animate-fade-up-letter,
		.animate-slide-left-letter,
		.animate-pop-in-letter,
		.animate-rotate-in-letter,
		.animate-blur-in-letter,
		.animate-wave-letter,
		.animate-typewriter,
		.animate-scramble,
		.animate-gradient-reveal,
		.animate-split-top,
		.animate-bounce-letter {
			animation: none;
			opacity: 1;
			transform: none;
			filter: none;
		}

		.animate-typewriter {
			width: auto;
			overflow: visible;
			border-color: transparent;
		}

		.glitch-text::before,
		.glitch-text::after {
			animation: none;
			transform: none;
		}
	}
</style>
```
