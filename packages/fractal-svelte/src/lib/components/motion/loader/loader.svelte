<script lang="ts">
	import './loader.sass';
	export type LoaderVariant = 'spinner' | 'dots' | 'bars' | 'dot-matrix' | 'dither' | 'ascii' | 'ascii-line' | 'ascii-braille' | 'ascii-blocks' | 'ascii-bounce' | 'morph' | 'comet' | 'scramble' | 'metaballs' | 'newton' | 'helix' | 'percent';
	type Props = { variant?: LoaderVariant; size?: number; speed?: number; label?: string };
	let { variant = 'spinner', size = 32, speed = 1, label = 'Loading' }: Props = $props();
	const ascii: Record<string, string[]> = { ascii: ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'], 'ascii-line': ['|','/','-','\\'], 'ascii-braille': ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'], 'ascii-blocks': ['▁','▂','▃','▄','▅','▆','▇','█','▇','▆','▅','▄','▃','▂'], 'ascii-bounce': ['⠁','⠂','⠄','⡀','⢀','⠠','⠐','⠈'] };
	let frame = $state(0);
	let percent = $state(0);
	let scrambled = $state('LOADING');
	$effect(() => { const frames = ascii[variant]; if (!frames) return; const timer = setInterval(() => frame = (frame + 1) % frames.length, speed * 1000 / frames.length); return () => clearInterval(timer); });
	$effect(() => { if (variant !== 'percent') return; const timer = setInterval(() => percent = (percent + 4) % 104, Math.max(30, speed * 40)); return () => clearInterval(timer); });
	$effect(() => { if (variant !== 'scramble') return; const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*#@'; let reveal = 0; const timer = setInterval(() => { scrambled = Array.from('LOADING').map((char, i) => i < reveal ? char : glyphs[Math.floor(Math.random() * glyphs.length)]).join(''); reveal = (reveal + 1) % 11; }, speed * 80); return () => clearInterval(timer); });
</script>

<span data-slot="loader" data-variant={variant} role="status" aria-label={label} style={`--loader-size:${size}px;--loader-speed:${speed}s`}>
	{#if variant === 'spinner'}<svg data-part="spinner" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" /><path d="M16 3a13 13 0 0113 13" /></svg>
	{:else if variant === 'dots'}<span data-part="dots">{#each [0,1,2] as i}<i style={`--i:${i}`}></i>{/each}</span>
	{:else if variant === 'bars'}<span data-part="bars">{#each [0,1,2,3] as i}<i style={`--i:${i}`}></i>{/each}</span>
	{:else if variant === 'dot-matrix'}<span data-part="dot-matrix">{#each Array(9) as _, i}<i style={`--i:${i}`}></i>{/each}</span>
	{:else if variant === 'dither'}<span data-part="dither">{#each [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5] as order}<i style={`--i:${order}`}></i>{/each}</span>
	{:else if ascii[variant]}<span data-part="ascii" aria-hidden="true">{ascii[variant][frame]}</span>
	{:else if variant === 'morph'}<span data-part="morph" aria-hidden="true"></span>
	{:else if variant === 'comet'}<span data-part="comet">{#each [0,1,2,3,4,5] as i}<i style={`--i:${i}`}></i>{/each}</span>
	{:else if variant === 'scramble'}<span data-part="scramble" aria-hidden="true">{scrambled}</span>
	{:else if variant === 'metaballs'}<svg data-part="metaballs" viewBox="0 0 100 100" aria-hidden="true"><circle cx="30" cy="50" r="16" /><circle cx="70" cy="50" r="16" /></svg>
	{:else if variant === 'newton'}<span data-part="newton">{#each [0,1,2,3,4] as i}<i style={`--i:${i}`}></i>{/each}</span>
	{:else if variant === 'helix'}<span data-part="helix">{#each [0,1,2,3,4,5,6] as i}<b style={`--i:${i}`}><i></i><i></i></b>{/each}</span>
	{:else if variant === 'percent'}<span data-part="percent"><b>{percent}%</b><i><span style={`width:${percent}%`}></span></i></span>{/if}
</span>
