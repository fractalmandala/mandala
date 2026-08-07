---
created: 2026-06-22T23:42:59 (UTC +05:30)
tags: []
source: https://sveltoui.dev/animations/advancedbuttons
author: SveltoUI
---

# Advancedbuttons

> ## Excerpt
> Browse Advancedbuttons components for Svelte 5. Animation components you can copy into your project.

---
AdvancedButtons01.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Liquid Fill Buttons -->
<!-- Liquid Fill Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Wave Fill -->
	<button type="button" class="wave-fill-btn relative overflow-hidden px-8 py-4 border-2 border-primary text-primary font-medium rounded-lg transition-colors hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
		<span class="relative z-10">Wave Fill</span>
		<div class="wave-fill"></div>
	</button>

	<!-- Bubble Fill -->
	<button type="button" class="bubble-fill-btn relative overflow-hidden px-8 py-4 border-2 border-primary text-primary font-medium rounded-lg transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
		<span class="relative z-10">Bubble Fill</span>
	</button>

	<!-- Diagonal Liquid -->
	<button type="button" class="group relative overflow-hidden px-8 py-4 border-2 border-emerald-500 text-emerald-500 font-medium rounded-lg transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-4">
		<span class="relative z-10">Diagonal</span>
		<div class="absolute inset-0 bg-emerald-500 -translate-x-full skew-x-12 group-hover:translate-x-0 transition-transform duration-500"></div>
	</button>

	<!-- Center Expand -->
	<button type="button" class="group relative overflow-hidden px-8 py-4 border-2 border-primary text-primary font-medium rounded-lg transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
		<span class="relative z-10">Center</span>
		<div class="absolute top-1/2 left-1/2 w-0 h-0 bg-primary rounded-full group-hover:w-80 group-hover:h-80 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"></div>
	</button>
</div>

<style>
	/* Wave fill button */
	.wave-fill-btn .wave-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 0;
		background: var(--color-primary);
		transition: height 0.5s ease;
		border-radius: 40% 40% 0 0;
	}
	.wave-fill-btn:hover .wave-fill {
		height: 100%;
		border-radius: 0;
	}

	/* Bubble fill button */
	.bubble-fill-btn::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: hsl(var(--primary));
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.5s, height 0.5s;
	}
	.bubble-fill-btn:hover::before {
		width: 300px;
		height: 300px;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.wave-fill-btn .wave-fill {
			transition: none;
		}
		.bubble-fill-btn::before {
			transition: none;
		}
		.group div {
			transition-duration: 0s;
		}
	}
</style>
```

AdvancedButtons02.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Neon & Glow Buttons -->
<!-- Neon & Glow Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-8 bg-slate-900 rounded-xl">
	<!-- Neon Pulse -->
	<button type="button" class="neon-pulse px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
		Neon Pulse
	</button>

	<!-- Rainbow Glow -->
	<button type="button" class="rainbow-glow px-8 py-4 bg-slate-800 text-white font-bold rounded-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
		Rainbow
	</button>

	<!-- Glow Trail -->
	<button type="button" class="glow-trail relative px-8 py-4 bg-primary text-white font-bold rounded-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
		<span class="relative z-10">Glow Trail</span>
	</button>

	<!-- Electric -->
	<button type="button" class="electric-btn relative px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold rounded-lg focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
		Electric
	</button>
</div>

<style>
	/* Neon pulse */
	.neon-pulse {
		animation: neonPulse 2s ease-in-out infinite;
	}
	@keyframes neonPulse {
		0%, 100% {
			box-shadow: 0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 20px #22d3ee;
		}
		50% {
			box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee;
		}
	}

	/* Rainbow glow */
	.rainbow-glow {
		animation: rainbowGlow 3s linear infinite;
	}
	@keyframes rainbowGlow {
		0% { box-shadow: 0 0 20px #ff0000; }
		16% { box-shadow: 0 0 20px #ff7700; }
		33% { box-shadow: 0 0 20px #ffff00; }
		50% { box-shadow: 0 0 20px #00ff00; }
		66% { box-shadow: 0 0 20px #0099ff; }
		83% { box-shadow: 0 0 20px #6600ff; }
		100% { box-shadow: 0 0 20px #ff0000; }
	}

	/* Glow trail */
	.glow-trail::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
		transform: translateX(-100%);
	}
	.glow-trail:hover::before {
		animation: glowTrail 0.8s ease;
	}
	@keyframes glowTrail {
		to { transform: translateX(100%); }
	}

	/* Electric button */
	.electric-btn::before,
	.electric-btn::after {
		content: '';
		position: absolute;
		inset: -2px;
		border: 2px solid transparent;
		border-radius: inherit;
	}
	.electric-btn:hover::before {
		border-color: #facc15;
		animation: electric 0.3s linear infinite;
	}
	@keyframes electric {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.neon-pulse {
			animation: none;
			box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee;
		}
		.rainbow-glow {
			animation: none;
			box-shadow: 0 0 20px #ff0000;
		}
		.glow-trail::before {
			animation: none;
		}
		.electric-btn::before {
			animation: none;
		}
	}
</style>
```

AdvancedButtons03.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Advanced animated button effects with smooth transitions. -->
<!-- 3D Button Effects -->
<script>
	function handleTilt(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		e.currentTarget.style.transform = `perspective(500px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
	}

	function resetTilt(e) {
		e.currentTarget.style.transform = 'perspective(500px) rotateY(0) rotateX(0)';
	}
</script>

<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Push Down -->
	<button type="button" class="push-down-btn px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
		Push Down
	</button>

	<!-- Flip 3D -->
	<button type="button" class="flip-3d-btn group [perspective:500px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
		<span class="block px-8 py-4 bg-primary text-white font-bold rounded-lg transition-transform duration-300 [transform-style:preserve-3d] group-hover:[transform:rotateX(45deg)] group-focus-visible:[transform:rotateX(45deg)]">
			Flip 3D
		</span>
	</button>

	<!-- Tilt Button -->
	<button
		type="button"
		class="tilt-btn px-8 py-4 bg-emerald-500 text-white font-bold rounded-lg transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
		onmousemove={handleTilt}
		onmouseleave={resetTilt}
		onfocus={resetTilt}
		onblur={resetTilt}
	>
		Tilt Me
	</button>

	<!-- Depth Shadow -->
	<button type="button" class="depth-shadow-btn px-8 py-4 bg-orange-500 text-white font-bold rounded-lg focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2">
		Depth
	</button>
</div>

<style>
	/* Push down button */
	.push-down-btn {
		box-shadow: 0 6px 0 color-mix(in oklab, var(--color-primary), black 30%);
		transition: all 0.1s ease;
	}
	.push-down-btn:active {
		box-shadow: 0 2px 0 color-mix(in oklab, var(--color-primary), black 30%);
		transform: translateY(4px);
	}

	/* Depth shadow button */
	.depth-shadow-btn {
		box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
		transition: all var(--duration-normal) ease;
	}
	.depth-shadow-btn:hover,
	.depth-shadow-btn:focus-visible {
		box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6);
		transform: translateY(-2px);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.push-down-btn:active {
			transform: none;
			box-shadow: 0 6px 0 color-mix(in oklab, var(--color-primary), black 30%);
		}
		.flip-3d-btn span {
			transform: none !important;
		}
		.tilt-btn {
			transform: none !important;
		}
		.depth-shadow-btn:hover,
		.depth-shadow-btn:focus-visible {
			transform: none;
		}
	}
</style>
```

AdvancedButtons04.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Magnetic Button Effects -->
<!-- Magnetic Button Effects -->
<script>
	function handleMagnetic(e, strength = 0.3) {
		// Check for reduced motion preference
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}
		const target = e.currentTarget;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		target.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
	}

	function resetMagnetic(e) {
		e.currentTarget.style.transform = 'translate(0, 0)';
	}
</script>

<div class="flex flex-wrap gap-8 justify-center p-6">
	<button
		type="button"
		onmousemove={(e) => handleMagnetic(e, 0.4)}
		onmouseleave={resetMagnetic}
		class="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
	>
		Strong Magnetic
	</button>

	<button
		type="button"
		onmousemove={(e) => handleMagnetic(e, 0.2)}
		onmouseleave={resetMagnetic}
		class="px-8 py-4 bg-primary text-white rounded-xl font-medium transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
	>
		Subtle Magnetic
	</button>

	<button
		type="button"
		aria-label="Add item"
		onmousemove={(e) => handleMagnetic(e, 0.5)}
		onmouseleave={resetMagnetic}
		class="w-16 h-16 bg-primary text-white rounded-full font-medium transition-transform duration-200 ease-out flex items-center justify-center focus-visible:ring-2 focus-visible:ring-400 focus-visible:ring-offset-2"
	>
		<svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
		</svg>
	</button>
</div>
```

AdvancedButtons05.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Icon Animation Buttons -->
<!-- Icon Animation Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Arrow Slide -->
	<button type="button" class="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
		<span>Explore</span>
		<svg aria-hidden="true" class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
		</svg>
	</button>

	<!-- Rotate Icon -->
	<button type="button" class="group flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
		<span>Settings</span>
		<svg aria-hidden="true" class="w-5 h-5 transition-transform duration-500 group-hover:rotate-180 group-focus-visible:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
		</svg>
	</button>

	<!-- Download Bounce -->
	<button type="button" class="group flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-medium rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2">
		<span>Download</span>
		<svg aria-hidden="true" class="w-5 h-5 group-hover:animate-bounce group-focus-visible:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
		</svg>
	</button>

	<!-- Icon Swap -->
	<button type="button" class="group relative px-8 py-4 bg-primary text-white font-medium rounded-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
		<span class="flex items-center gap-2">
			<span>Like</span>
			<svg aria-hidden="true" class="w-5 h-5 transition-transform duration-300 group-hover:scale-0 group-focus-visible:scale-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
			<svg aria-hidden="true" class="w-5 h-5 absolute right-4 scale-0 transition-transform duration-300 group-hover:scale-100 group-focus-visible:scale-100" fill="currentColor" viewBox="0 0 24 24">
				<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
		</span>
	</button>
</div>

<style>
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.group svg {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
```

AdvancedButtons06.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Text Animation Buttons -->
<!-- Text Animation Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Text Swap -->
	<button type="button" class="group relative px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg overflow-hidden h-14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		<span class="block transition-transform duration-300 group-hover:-translate-y-full">Submit</span>
		<span class="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">Done!</span>
	</button>

	<!-- Letter Spread -->
	<button type="button" class="group px-8 py-4 bg-primary text-white font-medium rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/500">
		<span class="inline-flex tracking-normal group-hover:tracking-[0.3em] transition-all duration-300">HOVER</span>
	</button>

	<!-- Underline Reveal -->
	<button type="button" class="group relative px-8 py-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		<span>Underline</span>
		<span class="absolute bottom-3 left-8 right-8 h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
	</button>

	<!-- Strike Through -->
	<button type="button" class="group relative px-8 py-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		<span>Strike</span>
		<span class="absolute top-1/2 left-4 right-4 h-0.5 bg-foreground scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
	</button>
</div>

<style>
	@media (prefers-reduced-motion: reduce) {
		button * {
			transition-duration: 0.01ms !important;
			animation-duration: 0.01ms !important;
		}
	}
</style>
```

AdvancedButtons07.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Morphing Buttons -->
<!-- Morphing Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Circle to Pill -->
	<button type="button" class="w-14 h-14 hover:w-32 bg-primary text-primary-foreground rounded-full hover:rounded-xl transition-all duration-500 flex items-center justify-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		<span class="opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">Click Me</span>
		<svg class="w-6 h-6 absolute hover:opacity-0 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
		</svg>
	</button>

	<!-- Blob Morph -->
	<button type="button" class="blob-morph-btn px-8 py-4 bg-primary text-white font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/500">
		Blob Morph
	</button>

	<!-- Width Expand -->
	<button type="button" class="px-8 py-4 bg-emerald-500 text-white font-medium rounded-lg hover:px-16 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
		Expand
	</button>

	<!-- Height Grow -->
	<button type="button" class="px-8 py-4 bg-primary text-white font-medium rounded-lg hover:py-6 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/500">
		Grow
	</button>
</div>

<style>
	/* Blob morph button */
	.blob-morph-btn {
		border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
		animation: blobMorph 5s ease-in-out infinite;
	}
	@keyframes blobMorph {
		0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
		25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
		50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
		75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
	}

	@media (prefers-reduced-motion: reduce) {
		button, button * {
			transition-duration: 0.01ms !important;
			animation: none !important;
		}
		.blob-morph-btn {
			border-radius: 0.5rem;
		}
	}
</style>
```

AdvancedButtons08.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Border Animation Buttons -->
<!-- Border Animation Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Rotating Border -->
	<button type="button" class="rotating-border px-8 py-4 font-medium rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		Rotating Border
	</button>

	<!-- Border Draw -->
	<button type="button" class="border-draw relative px-8 py-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		<span class="relative z-10">Draw Border</span>
	</button>

	<!-- Gradient Border -->
	<button type="button" class="gradient-border px-8 py-4 font-medium rounded-lg bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		Gradient
	</button>

	<!-- Dash Border -->
	<button type="button" class="dash-border px-8 py-4 font-medium rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
		Dash
	</button>
</div>

<style>
	/* Rotating border */
	.rotating-border {
		background: var(--color-card);
		position: relative;
		z-index: 1;
	}
	.rotating-border::before {
		content: '';
		position: absolute;
		inset: -2px;
		background: conic-gradient(from var(--angle, 0deg), var(--color-primary), hsl(var(--primary)), hsl(var(--primary)), var(--color-primary));
		border-radius: inherit;
		z-index: -1;
		animation: rotateBorder 3s linear infinite;
	}
	.rotating-border::after {
		content: '';
		position: absolute;
		inset: 2px;
		background: var(--color-card);
		border-radius: calc(0.5rem - 2px);
		z-index: -1;
	}
	@keyframes rotateBorder {
		to { --angle: 360deg; }
	}
	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	/* Border draw */
	.border-draw::before,
	.border-draw::after {
		content: '';
		position: absolute;
		width: 0;
		height: 2px;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}
	.border-draw::before {
		top: 0;
		left: 0;
	}
	.border-draw::after {
		bottom: 0;
		right: 0;
	}
	.border-draw:hover::before,
	.border-draw:hover::after {
		width: 100%;
	}

	/* Gradient border */
	.gradient-border {
		position: relative;
	}
	.gradient-border::before {
		content: '';
		position: absolute;
		inset: 0;
		padding: 2px;
		background: linear-gradient(135deg, var(--color-primary), hsl(var(--primary)), hsl(var(--primary)));
		border-radius: inherit;
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
	}

	/* Dash border */
	.dash-border {
		border: 2px dashed var(--color-primary);
		background: transparent;
		transition: all var(--duration-normal) ease;
	}
	.dash-border:hover {
		border-style: solid;
		background: var(--color-primary);
		color: var(--color-primary-foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		button, button::before, button::after {
			transition-duration: 0.01ms !important;
			animation: none !important;
		}
		.rotating-border::before {
			background: var(--color-primary);
		}
	}
</style>
```

AdvancedButtons09.svelte

```
<!-- @free -->
<!-- @small -->
<!-- @description Special Effect Buttons -->
<!-- Special Effect Buttons -->
<div class="flex flex-wrap gap-4 justify-center p-6">
	<!-- Glitch Button -->
	<button type="button" class="glitch-btn relative px-8 py-4 bg-slate-900 text-white font-bold rounded-lg overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
		<span class="relative z-10">Glitch</span>
		<span class="absolute inset-0 bg-cyan-500 translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
		<span class="absolute inset-0 bg-primary -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
	</button>

	<!-- Shake Button -->
	<button type="button" class="px-8 py-4 bg-red-500 text-white font-bold rounded-lg hover:animate-shake focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
		Shake!
	</button>

	<!-- Wobble Button -->
	<button type="button" class="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:animate-wobble focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
		Wobble
	</button>

	<!-- Jelly Button -->
	<button type="button" class="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:animate-jelly focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/500">
		Jelly
	</button>
</div>

<style>
	/* Shake animation */
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}
	.hover\:animate-shake:hover {
		animation: shake 0.5s ease-in-out;
	}

	/* Wobble animation */
	@keyframes wobble {
		0%, 100% { transform: rotate(0); }
		15% { transform: rotate(-5deg); }
		30% { transform: rotate(3deg); }
		45% { transform: rotate(-3deg); }
		60% { transform: rotate(2deg); }
		75% { transform: rotate(-1deg); }
	}
	.hover\:animate-wobble:hover {
		animation: wobble 0.5s ease-in-out;
	}

	/* Jelly animation */
	@keyframes jelly {
		0%, 100% { transform: scale(1, 1); }
		25% { transform: scale(0.95, 1.05); }
		50% { transform: scale(1.05, 0.95); }
		75% { transform: scale(0.98, 1.02); }
	}
	.hover\:animate-jelly:hover {
		animation: jelly 0.5s ease-in-out;
	}

	@media (prefers-reduced-motion: reduce) {
		button, button * {
			transition-duration: 0.01ms !important;
			animation: none !important;
		}
		.hover\:animate-shake:hover,
		.hover\:animate-wobble:hover,
		.hover\:animate-jelly:hover {
			animation: none !important;
		}
	}
</style>
```
