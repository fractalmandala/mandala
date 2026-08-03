<script lang="ts">
	let { data } = $props();
	import {
		RiToolsFill,
		RiRobot2Fill,
		RiCommandFill,
		RiBardFill,
		RiAiGenerate2Fill,
		RiPlayLargeFill,
		RiFileFill,
		RiGithubFill,
		RiNpmjsFill,
		RiArrowDownLongFill,
		RiCheckFill
	} from 'svelte-remixicon';
	import RightArrow from '$lib/icons/right-arrow.svelte'
	import Design from '$lib/icons/design.svelte'
	import Code from '$lib/icons/code.svelte'
	import Creator from '$lib/icons/create.svelte'
	import Svelter from '$lib/icons/svelte.svelte'
	import Agent from '$lib/icons/agent.svelte'
	import Workflow from '$lib/icons/workflow.svelte'
	import Meta from '$lib/icons/meta.svelte'

	const workflow = [
		{
			number: '01',
			label: 'Project Mandate',
			title: 'Set the context',
			body: 'Load the project rules, stack, and definition of done once.'
		},
		{
			number: '02',
			label: 'Domain Boss',
			title: 'Route the work',
			body: 'The startup router selects one boss; the agent reads only that nested playbook.'
		},
		{
			number: '03',
			label: 'Vendored Armory',
			title: 'Equip the session',
			body: 'Skills, agents, and commands arrive with the workflow instead of a blank context.'
		},
		{
			number: '04',
			label: 'Review and Ship',
			title: 'Close the loop',
			body: 'Fresh review and quality gates turn an agent session into a deliverable.'
		}
	];

	const launchGuides = $derived(
		data.startGuides.filter((guide) =>
			['01-getting-started', '02-install', '03-auto-use'].includes(guide.slug)
		)
	);
</script>

<svelte:head>
	<title>Fractal Agentic — Orchestration for coding agents</title>
	<meta
		name="description"
		content="A coding-agent delivery system with seven domain bosses, one orchestrator, and a vendored armory of skills, agents, and commands."
	/>
</svelte:head>

<div class="padtop128 gap16 box">
	<p class="text-xs tt-u fw600 muted">Coding-agent delivery infrastructure</p>
	<h1 class="page-title" id="home-title">
		<span class="page-subtitle">fractal<span class="accented">agentic</span></span>
		<span class="home-hero__title-line">orchestration</span>
	</h1>
	<section class="home-hero" aria-labelledby="home-title">
		<div class="box gap48">
			<p class="home-hero__lead">
				Yoke agents into a self-improving system. Route work to the right domain. Equip the session
				with a vendored armory - all in one repeatable, orchestrated loop.
			</p>
			<div class="stats-grid grid grid-cols-3 gap32">
				<a class="badge box gap4" href="/skills">
					<span class="accented"><RiToolsFill size={'24'} /></span>
					<span>{data.stats.skills} skills</span>
				</a>
				<a class="badge box gap4" href="/commands">
					<span class="accented"><RiCommandFill size={'24'} /></span>
					<span>{data.stats.commands} commands</span>
				</a>
				<a class="badge box gap4" href="/agents">
					<span class="accented"><RiRobot2Fill size={'24'} /></span>
					<span>{data.stats.agents} agents</span>
				</a>
				<a class="badge box gap4" href="/bosses">
					<span class="accented"><RiBardFill size={'24'} /></span>
					<span>{data.stats.bosses} bosses</span>
				</a>
				<a class="badge box gap4" href="/docs">
					<span class="accented"><RiAiGenerate2Fill size={'24'} /></span>
					<span>{data.stats.orchestrators} orchestrator</span>
				</a>
				<a class="badge box gap4" href="/docs/01-getting-started">
					<span class="accented"><RiPlayLargeFill size={'24'} /></span>
					<span>Get Started</span>
				</a>
			</div>
		</div>
		<div class="home-flow" aria-label="Fractal Agentic delivery loop">
			<div class="box">
				{#each workflow as item, index (item.number)}
					<div class="home-flow__node">
						<span class="home-flow__index">{item.number}</span>
						<div class="box gap4">
							<span class="w600 text-bs">{item.label}</span>
							<span class="muted text-sm">{item.body}</span>
						</div>
						<span class="home-flow__arrow" aria-hidden="true">
							{#if index === workflow.length - 1}
								<RiCheckFill size={'20'} />
							{:else}
								<RiArrowDownLongFill size={'20'} />
							{/if}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="home-section gap32 box bordtop" id="bosses" aria-labelledby="bosses-title">
		<div class="home-section__intro">
			<span class="text-xs muted tt-u w500">02 / One-boss discovery</span>
			<h2 class="home-section__title" id="bosses-title">
				1 Runtime. 
				<span class="accented">7 Domain Bosses</span>.
			</h2>
			<p class="text-xl lh15 secondary">
				Fractalagentic detects what you're up to, and immediately calls in the level-one orchestrator. Or, you can always invoke any of them directly.
			</p>
		</div>
		<div class="home-boss-grid">
			{#each data.bosses as boss, index (boss.id)}
				<a class="home-boss" href={boss.href}>
					<span class="home-boss__top">
						<span class="home-boss__index">{String(index + 1).padStart(2, '0')}</span>
					</span>
					<span class="text-2xl fw500">{boss.name}</span>
					<span class="muted">{boss.mission}</span>
			<div class="accented">
			<RightArrow/>
		</div>
				</a>
			{/each}
		</div>
	</section>
	<section class="home-section gap32" id="systems" aria-labelledby="systems-title">
		<div class="home-systems">
			<div class="home-systems__copy">
				<p class="text-xs tt-u fw500 muted">03 / The continuity layer</p>
				<h2 class="home-section__title" id="systems-title">
					The Orchestrator <br><span class="accented">Remembers</span>, <span class="accented">Performs</span> and <span class="accented">Grows.</span>
				</h2>
				<p class="text-xl lh15 secondary">
					Optional systems extend delivery beyond a single session: hooks keep the environment safe,
					the wiki carries project memory forward, and Improve turns experience into better
					defaults.
				</p>
			</div>
			<div class="grid grid-cols-3 border-grid">
				<a class="home-boss box border-grid-child" href="/docs/hooks">
					<span class="text-2xl fw500">Hooks</span>
					<span class="muted">lifecycle safety and automation</span>
								<div class="accented">
			<RightArrow/>
		</div>
				</a>
				<a class="home-boss box border-grid-child" href="/docs/wiki">
					<span class="text-2xl fw500">Wiki</span>
					<span class="muted">continuous project memory</span>
			<div class="accented">
			<RightArrow/>
		</div>
				</a>
				<a class="home-boss box border-grid-child" href="/docs/self-improvement">
					<span class="text-2xl fw500">Improve</span>
					<span class="muted">observe, evaluate, and promote</span>
			<div class="accented">
			<RightArrow/>
		</div>
				</a>
			</div>
		</div>
	</section>
	<section class="home-credits" aria-labelledby="credits-title">
		<div>
			<p class="home-eyebrow">Source credits</p>
			<h2 id="credits-title">Trace every capability back to its source.</h2>
		</div>
		<div class="box gap16">
		<p>
			We record the upstream source for every skill, agent, and command.
			Follow an entry to see where a capability came from.
		</p>
		<a
			class="home-credits__link"
			style="margin-top: auto"
			href="https://github.com/fractalmandala/fractal-agentic/blob/main/credits.json"
			target="_blank"
			rel="noreferrer"
		>
			View credits.json <span aria-hidden="true">↗</span>
		</a>
		</div>
	</section>
</div>
