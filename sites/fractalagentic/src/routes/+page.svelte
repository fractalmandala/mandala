<script lang="ts">
	import { resolve } from '$app/paths';
	import { SITE_NAME, SITE_DESCRIPTION } from '$lib/site';
	import RightArrow from '$lib/icons/right-arrow.svelte';
	import Design from '$lib/icons/design.svelte';
	import Code from '$lib/icons/code.svelte';
	import Creator from '$lib/icons/create.svelte';
	import Svelter from '$lib/icons/svelte.svelte';
	import Agent from '$lib/icons/agent.svelte';
	import Workflow from '$lib/icons/workflow.svelte';
	import Meta from '$lib/icons/meta.svelte';
	import { ToolboxIcon, CommandIcon, RobotIcon, CrownIcon, FilePlusIcon, StarFourIcon } from "phosphor-svelte"

	let { data } = $props();
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
</script>

<svelte:head>
	<title>{SITE_NAME}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
</svelte:head>

<div class="narrow-width box padtop32">
	<div class="page-section gap32 box padtop64 padbot64">
		<h1 class="page-header page-subsection box gap0">
			<p class="page-subtitle">fractal<span class="accented">agentic</span></p>
			<p class="page-title">orchestration</p>
		</h1>
		<p class="page-subsection text-xl lh15">
			Yoke agents into a self-improving system. Route work to the right domain. Equip the session
			with a vendored armory - all in one repeatable, orchestrated loop.
		</p>
		<div class="page-subsection row ycenter gap32">
			<a class="badge box xcenter ycenter" href="/skills">
				<span class="accented-x"><ToolboxIcon size={28}/></span>
				<span class="text-md fw600 accented">Skills</span>
			</a>
			<a class="badge box xcenter ycenter" href="/commands">
				<span class="accented-x"><CommandIcon size={28}/></span>
				<span class="text-md fw600 accented">commands</span>
			</a>
			<a class="badge box xcenter ycenter" href="/agents">
				<span class="accented-x"><RobotIcon size={28}/></span>
				<span class="text-md fw600 accented">agents</span>
			</a>
			<a class="badge box xcenter ycenter" href="/bosses">
				<span class="accented-x"><CrownIcon size={28}/></span>
				<span class="text-md fw600 accented">bosses</span>
			</a>
			<a class="badge box xcenter ycenter" href="/docs">
				<span class="accented-x"><FilePlusIcon size={28}/></span>
				<span class="text-md fw600 accented">orchestrators</span>
			</a>
			<a class="badge box xcenter ycenter" href="/docs/introduction">
				<span class="accented-x"><StarFourIcon size={28}/></span>
				<span class="text-md fw600 accented">Start</span>
			</a>
		</div>
	</div>
	<div class="page-section gap48 box padbot64 padtop64 bordtop">
			<h2 class="section-header box gap8 page-subsection">
				<span class="text-xs muted tt-u w500">02 / One-boss discovery</span>
				<div class="page-header">1 Runtime <span class="accented">7 Domain Bosses</span></div>
			</h2>
			<p class="text-xl lh15 page-subsection primary">
				Fractalagentic detects what you're up to, and immediately calls in the level-one
				orchestrator. Or, you can always invoke any of them directly.
			</p>
		<div class="home-boss-grid gap32 page-subsection">
			{#each data.bosses as boss, index (boss.id)}
				<a class="home-boss pad8" href={boss.href}>
					<span class="text-lg fw600">{boss.name}</span>
					<span class="text-md muted">{boss.mission}</span>
			<div class="accented">
			<RightArrow/>
		</div>
				</a>
			{/each}
		</div>
	</div>

	<div class="page-section gap48 box padbot64 padtop64 bordtop">
			<h2 class="section-header box gap8 page-subsection">
				<span class="text-xs muted tt-u w500">03 / The continuity layer</span>
				<div class="page-header">
The Orchestrator<br><span class="accented">Remembers</span>,
				<span class="accented">Performs</span>
				and <span class="accented">Grows.</span>
				</div>
			</h2>
			<p class="text-xl lh15 page-subsection">
				Optional systems extend delivery beyond a single session: hooks keep the environment safe,
				the wiki carries project memory forward, and Improve turns experience into better defaults.
			</p>
		<div class="grid grid-cols-3 border-grid page-subsection">
			<a class="home-boss box border-grid-child" href="/docs/hooks">
				<span class="text-2xl fw500">Hooks</span>
				<span class="muted">lifecycle safety and automation</span>
				<div class="accented">
					<RightArrow />
				</div>
			</a>
			<a class="home-boss box border-grid-child" href="/docs/wiki">
				<span class="text-2xl fw500">Wiki</span>
				<span class="muted">continuous project memory</span>
				<div class="accented">
					<RightArrow />
				</div>
			</a>
			<a class="home-boss box border-grid-child" href="/docs/self-improvement">
				<span class="text-2xl fw500">Improve</span>
				<span class="muted">observe, evaluate, and promote</span>
				<div class="accented">
					<RightArrow />
				</div>
			</a>
		</div>
	</div>
</div>
