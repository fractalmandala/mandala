---
created: 2026-06-22T23:47:01 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/pagetransitions
author: SveltoUI
---

# Pagetransitions

> ## Excerpt
> Browse Pagetransitions components for Svelte 5. Animation components you can copy into your project.

---
PageTransitions01.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Page Transitions & Hero Animations -->
<!-- Page Transitions & Hero Animations -->
<script>
	let currentSlide = $state(0);
	let transitioning = $state(false);
	let transitionType = $state('fade');
	let animationsPaused = $state(false);

	const slides = [
		{ bg: 'from-primary to-primary', title: 'Slide One', subtitle: 'Elegant transitions' },
		{ bg: 'from-emerald-600 to-teal-700', title: 'Slide Two', subtitle: 'Smooth animations' },
		{ bg: 'from-orange-600 to-red-700', title: 'Slide Three', subtitle: 'Beautiful effects' },
		{ bg: 'from-primary to-primary', title: 'Slide Four', subtitle: 'Modern design' }
	];

	async function goToSlide(index, type = 'fade') {
		if (transitioning || index === currentSlide) return;
		transitioning = true;
		transitionType = type;
		await new Promise(r => setTimeout(r, 500));
		currentSlide = index;
		transitioning = false;
	}

	function nextSlide() {
		goToSlide((currentSlide + 1) % slides.length);
	}

	function handleCarouselKeydown(e) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			goToSlide((currentSlide - 1 + slides.length) % slides.length);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			goToSlide((currentSlide + 1) % slides.length);
		} else if (e.key === 'Home') {
			e.preventDefault();
			goToSlide(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			goToSlide(slides.length - 1);
		}
	}
</script>

<div class="space-y-12 w-full max-w-5xl" class:animations-paused={animationsPaused}>
	<!-- Animation control button -->
	<button
		onclick={() => animationsPaused = !animationsPaused}
		class="fixed bottom-4 right-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
		aria-label={animationsPaused ? 'Resume animations' : 'Pause animations'}
	>
		{animationsPaused ? 'Resume' : 'Pause'} Animations
	</button>

	<!-- Skip carousel link -->
	<a href="#after-carousel" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
		Skip carousel
	</a>

	<!-- Hero Transition Showcase -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Page/Hero Transitions</h3>

		<div
			role="region"
			aria-roledescription="carousel"
			aria-label="Page transition examples"
			onkeydown={handleCarouselKeydown}
			tabindex="0"
			class="relative h-80 rounded-2xl overflow-hidden focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
		>
			{#each slides as slide, i}
				<div
					role="group"
					aria-roledescription="slide"
					aria-label="Slide {i + 1} of {slides.length}: {slide.title}"
					aria-hidden={i !== currentSlide}
					class="absolute inset-0 bg-gradient-to-br {slide.bg} flex items-center justify-center transition-all duration-500"
					class:opacity-0={i !== currentSlide}
					class:scale-95={i !== currentSlide && transitionType === 'zoom'}
					class:translate-x-full={i > currentSlide && transitionType === 'slide'}
					class:-translate-x-full={i < currentSlide && transitionType === 'slide'}
				>
					<div class="text-center text-white">
						<h2 class="text-4xl font-bold mb-2">{slide.title}</h2>
						<p class="text-white/80">{slide.subtitle}</p>
					</div>
				</div>
			{/each}

			<!-- Navigation dots -->
			<div role="group" aria-label="Slide controls" class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
				{#each slides as _, i}
					<button
						onclick={() => goToSlide(i)}
						aria-label="Go to slide {i + 1}"
						aria-current={i === currentSlide}
						class="w-3 h-3 rounded-full transition-all duration-300 {i === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}"
					></button>
				{/each}
			</div>
		</div>

		<div class="flex justify-center gap-4 mt-4">
			<button onclick={() => goToSlide((currentSlide + 1) % slides.length, 'fade')} aria-label="Transition to next slide with fade effect" class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm">Fade</button>
			<button onclick={() => goToSlide((currentSlide + 1) % slides.length, 'slide')} aria-label="Transition to next slide with slide effect" class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm">Slide</button>
			<button onclick={() => goToSlide((currentSlide + 1) % slides.length, 'zoom')} aria-label="Transition to next slide with zoom effect" class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm">Zoom</button>
		</div>
	</div>

	<div id="after-carousel"></div>

	<!-- Hero Text Entrance -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Hero Text Animations</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Stagger from bottom -->
			<div class="p-8 rounded-xl border border-border bg-card group">
				<div class="space-y-2 stagger-bottom">
					<p class="text-sm text-primary font-medium stagger-item">Welcome to</p>
					<h2 class="text-3xl font-bold stagger-item">Amazing Product</h2>
					<p class="text-muted-foreground stagger-item">Build something incredible today</p>
					<button class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg stagger-item">Get Started</button>
				</div>
			</div>

			<!-- Split text -->
			<div class="p-8 rounded-xl border border-border bg-card overflow-hidden group">
				<div class="split-hero" aria-label="SPLIT REVEAL">
					<div class="split-top overflow-hidden" aria-hidden="true">
						<span class="inline-block text-3xl font-bold transform">SPLIT</span>
					</div>
					<div class="split-bottom overflow-hidden" aria-hidden="true">
						<span class="inline-block text-3xl font-bold transform">REVEAL</span>
					</div>
				</div>
				<p class="mt-4 text-muted-foreground">Hover to see split effect</p>
			</div>

			<!-- Mask reveal -->
			<div class="p-8 rounded-xl border border-border bg-card overflow-hidden group">
				<div class="mask-reveal-container">
					<h2 class="text-3xl font-bold">Mask Reveal</h2>
				</div>
				<p class="mt-4 text-muted-foreground">Text reveals with mask</p>
			</div>

			<!-- Gradient text animation -->
			<div class="p-8 rounded-xl border border-border bg-card">
				<h2 class="text-3xl font-bold gradient-flow bg-gradient-to-r from-primary via-primary/80 via-primary/80 to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
					Gradient Flow
				</h2>
				<p class="mt-4 text-muted-foreground">Animated gradient text</p>
			</div>
		</div>
	</div>

	<!-- Page Wipe Transitions -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Page Wipe Effects</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Left wipe -->
			<div class="relative h-32 rounded-xl overflow-hidden group cursor-pointer" aria-label="Left wipe transition demo">
				<div class="absolute inset-0 bg-muted flex items-center justify-center">
					<span>Page 1</span>
				</div>
				<div class="absolute inset-0 bg-primary flex items-center justify-center text-primary-foreground wipe-left">
					<span>Page 2</span>
				</div>
				<span class="absolute bottom-2 left-2 text-xs text-muted-foreground">Wipe Left</span>
			</div>

			<!-- Right wipe -->
			<div class="relative h-32 rounded-xl overflow-hidden group cursor-pointer" aria-label="Right wipe transition demo">
				<div class="absolute inset-0 bg-muted flex items-center justify-center">
					<span>Page 1</span>
				</div>
				<div class="absolute inset-0 bg-primary flex items-center justify-center text-white wipe-right">
					<span>Page 2</span>
				</div>
				<span class="absolute bottom-2 left-2 text-xs text-muted-foreground">Wipe Right</span>
			</div>

			<!-- Top wipe -->
			<div class="relative h-32 rounded-xl overflow-hidden group cursor-pointer" aria-label="Top wipe transition demo">
				<div class="absolute inset-0 bg-muted flex items-center justify-center">
					<span>Page 1</span>
				</div>
				<div class="absolute inset-0 bg-emerald-500 flex items-center justify-center text-white wipe-top">
					<span>Page 2</span>
				</div>
				<span class="absolute bottom-2 left-2 text-xs text-muted-foreground">Wipe Top</span>
			</div>

			<!-- Circle wipe -->
			<div class="relative h-32 rounded-xl overflow-hidden group cursor-pointer" aria-label="Circle wipe transition demo">
				<div class="absolute inset-0 bg-muted flex items-center justify-center">
					<span>Page 1</span>
				</div>
				<div class="absolute inset-0 bg-primary flex items-center justify-center text-white wipe-circle">
					<span>Page 2</span>
				</div>
				<span class="absolute bottom-2 left-2 text-xs text-muted-foreground">Circle Wipe</span>
			</div>
		</div>
	</div>

	<!-- Section Reveal Animations -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Section Reveals</h3>
		<div class="space-y-6">
			<!-- Curtain reveal -->
			<div class="relative h-48 rounded-xl overflow-hidden group">
				<div class="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/80 flex items-center justify-center text-white">
					<span class="text-xl font-semibold">Hidden Content Revealed!</span>
				</div>
				<div class="absolute inset-0 bg-card border border-border flex items-center justify-center curtain-left">
					<span class="text-xl font-semibold">Hover for Curtain Effect</span>
				</div>
			</div>

			<!-- Blinds effect -->
			<div class="relative h-48 rounded-xl overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
					<span class="text-xl font-semibold">Behind the Blinds</span>
				</div>
				<div class="blinds-container">
					{#each Array(8) as _, i}
						<div class="blind" style="animation-delay: {i * 50}ms"></div>
					{/each}
				</div>
				<span class="absolute bottom-4 left-4 text-white text-sm">Hover to open blinds</span>
			</div>
		</div>
	</div>

	<!-- Morphing Backgrounds -->
	<div>
		<h3 class="text-lg font-semibold mb-6">Animated Backgrounds</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Gradient morph -->
			<div class="h-48 rounded-xl overflow-hidden gradient-morph flex items-center justify-center">
				<span class="text-white font-semibold text-xl">Gradient Morph</span>
			</div>

			<!-- Mesh gradient -->
			<div class="h-48 rounded-xl overflow-hidden relative bg-slate-900">
				<div class="absolute w-96 h-96 -top-20 -left-20 bg-primary/30 rounded-full blur-3xl animate-blob"></div>
				<div class="absolute w-96 h-96 -bottom-20 -right-20 bg-cyan-500/30 rounded-full blur-3xl animate-blob" style="animation-delay: 2s"></div>
				<div class="absolute w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/30 rounded-full blur-3xl animate-blob" style="animation-delay: 4s"></div>
				<div class="relative h-full flex items-center justify-center">
					<span class="text-white font-semibold text-xl">Mesh Gradient</span>
				</div>
			</div>

			<!-- Moving stripes -->
			<div class="h-48 rounded-xl overflow-hidden moving-stripes flex items-center justify-center">
				<span class="relative z-10 text-white font-semibold text-xl">Moving Stripes</span>
			</div>

			<!-- Noise texture -->
			<div class="h-48 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary relative flex items-center justify-center">
				<div class="absolute inset-0 noise-overlay"></div>
				<span class="relative z-10 text-white font-semibold text-xl">Noise Texture</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* Focus visible styles */
	button:focus-visible,
	a:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	/* SR-only utilities */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Animation pause control */
	.gradient-flow,
	.gradient-morph,
	.animate-blob,
	.moving-stripes {
		animation-play-state: running;
	}
	:global(.animations-paused) .gradient-flow,
	:global(.animations-paused) .gradient-morph,
	:global(.animations-paused) .animate-blob,
	:global(.animations-paused) .moving-stripes {
		animation-play-state: paused;
	}

	/* Stagger animations */
	.stagger-bottom .stagger-item {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.5s ease;
	}
	.group:hover .stagger-bottom .stagger-item,
	.group:focus-within .stagger-bottom .stagger-item {
		opacity: 1;
		transform: translateY(0);
	}
	.group:hover .stagger-bottom .stagger-item:nth-child(1),
	.group:focus-within .stagger-bottom .stagger-item:nth-child(1) { transition-delay: 0ms; }
	.group:hover .stagger-bottom .stagger-item:nth-child(2),
	.group:focus-within .stagger-bottom .stagger-item:nth-child(2) { transition-delay: 100ms; }
	.group:hover .stagger-bottom .stagger-item:nth-child(3),
	.group:focus-within .stagger-bottom .stagger-item:nth-child(3) { transition-delay: 200ms; }
	.group:hover .stagger-bottom .stagger-item:nth-child(4),
	.group:focus-within .stagger-bottom .stagger-item:nth-child(4) { transition-delay: 300ms; }

	/* Split text */
	.split-hero .split-top span,
	.split-hero .split-bottom span {
		transition: transform 0.5s ease;
	}
	.group:hover .split-hero .split-top span,
	.group:focus-within .split-hero .split-top span {
		transform: translateY(-100%);
	}
	.group:hover .split-hero .split-bottom span,
	.group:focus-within .split-hero .split-bottom span {
		transform: translateY(100%);
	}

	/* Mask reveal */
	.mask-reveal-container {
		clip-path: inset(0 100% 0 0);
		transition: clip-path 0.8s ease;
	}
	.group:hover .mask-reveal-container,
	.group:focus-within .mask-reveal-container {
		clip-path: inset(0 0 0 0);
	}

	/* Gradient flow */
	.gradient-flow {
		animation: gradient-flow 3s linear infinite;
	}
	@keyframes gradient-flow {
		to { background-position: 200% center; }
	}

	/* Page wipes */
	.wipe-left {
		clip-path: inset(0 100% 0 0);
		transition: clip-path 0.5s ease;
	}
	.group:hover .wipe-left,
	.group:focus-within .wipe-left {
		clip-path: inset(0 0 0 0);
	}

	.wipe-right {
		clip-path: inset(0 0 0 100%);
		transition: clip-path 0.5s ease;
	}
	.group:hover .wipe-right,
	.group:focus-within .wipe-right {
		clip-path: inset(0 0 0 0);
	}

	.wipe-top {
		clip-path: inset(100% 0 0 0);
		transition: clip-path 0.5s ease;
	}
	.group:hover .wipe-top,
	.group:focus-within .wipe-top {
		clip-path: inset(0 0 0 0);
	}

	.wipe-circle {
		clip-path: circle(0% at 50% 50%);
		transition: clip-path 0.5s ease;
	}
	.group:hover .wipe-circle,
	.group:focus-within .wipe-circle {
		clip-path: circle(100% at 50% 50%);
	}

	/* Curtain */
	.curtain-left {
		clip-path: inset(0 0 0 0);
		transition: clip-path 0.6s ease;
	}
	.group:hover .curtain-left,
	.group:focus-within .curtain-left {
		clip-path: inset(0 100% 0 0);
	}

	/* Blinds */
	.blinds-container {
		position: absolute;
		inset: 0;
		display: flex;
	}
	.blind {
		flex: 1;
		background: var(--color-card);
		border-right: 1px solid var(--color-border);
		transition: transform 0.5s ease;
		transform-origin: top;
	}
	.blinds-container:hover .blind,
	.blinds-container:focus-within .blind {
		transform: scaleY(0);
	}

	/* Gradient morph */
	.gradient-morph {
		background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
		background-size: 400% 400%;
		animation: gradient-morph 15s ease infinite;
	}
	@keyframes gradient-morph {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	/* Blob animation */
	@keyframes blob {
		0%, 100% { transform: translate(0, 0) scale(1); }
		25% { transform: translate(30px, -50px) scale(1.1); }
		50% { transform: translate(-20px, 20px) scale(0.9); }
		75% { transform: translate(20px, 50px) scale(1.05); }
	}
	.animate-blob {
		animation: blob 7s ease-in-out infinite;
	}

	/* Moving stripes */
	.moving-stripes {
		background: repeating-linear-gradient(
			45deg,
			hsl(var(--primary)),
			hsl(var(--primary)) 10px,
			hsl(var(--primary)) 10px,
			hsl(var(--primary)) 20px
		);
		background-size: 200% 200%;
		animation: stripes-move 20s linear infinite;
	}
	@keyframes stripes-move {
		from { background-position: 0 0; }
		to { background-position: 100% 100%; }
	}

	/* Noise overlay */
	.noise-overlay {
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		opacity: 0.1;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.gradient-flow,
		.gradient-morph,
		.animate-blob,
		.moving-stripes {
			animation: none !important;
			background-position: 0% center;
		}

		.stagger-bottom .stagger-item,
		.group:hover .stagger-bottom .stagger-item,
		.group:focus-within .stagger-bottom .stagger-item {
			transition: none;
			opacity: 1;
			transform: translateY(0);
		}

		.split-hero .split-top span,
		.split-hero .split-bottom span,
		.group:hover .split-hero .split-top span,
		.group:focus-within .split-hero .split-top span,
		.group:hover .split-hero .split-bottom span,
		.group:focus-within .split-hero .split-bottom span {
			transition: none;
			transform: translateY(0);
		}

		.mask-reveal-container,
		.group:hover .mask-reveal-container,
		.group:focus-within .mask-reveal-container {
			transition: none;
			clip-path: inset(0 0 0 0);
		}

		.wipe-left,
		.wipe-right,
		.wipe-top,
		.wipe-circle,
		.group:hover .wipe-left,
		.group:focus-within .wipe-left,
		.group:hover .wipe-right,
		.group:focus-within .wipe-right,
		.group:hover .wipe-top,
		.group:focus-within .wipe-top,
		.group:hover .wipe-circle,
		.group:focus-within .wipe-circle {
			transition: none;
			clip-path: inset(0 0 0 0);
		}

		.curtain-left,
		.group:hover .curtain-left,
		.group:focus-within .curtain-left {
			transition: none;
			clip-path: inset(0 0 0 0);
		}

		.blind,
		.blinds-container:hover .blind,
		.blinds-container:focus-within .blind {
			transition: none;
			transform: scaleY(1);
		}

		/* Pause animations via JS control */
		:global(.animations-paused) .gradient-flow,
		:global(.animations-paused) .gradient-morph,
		:global(.animations-paused) .animate-blob,
		:global(.animations-paused) .moving-stripes {
			animation-play-state: paused !important;
		}
	}
</style>
```
