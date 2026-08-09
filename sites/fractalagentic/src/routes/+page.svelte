<script lang="ts">
	import type { PageData } from './$types';
	import { SITE_NAME } from '$lib/site';
	import SectionPanel from '$lib/components/SectionPanel.svelte';
	import AssetCard from '$lib/components/AssetCard.svelte';
	import StatsStrip from '$lib/components/StatsStrip.svelte';
	import TerminalBlock from '$lib/components/TerminalBlock.svelte';
	import CtaSlab from '$lib/components/CtaSlab.svelte';

	let { data }: { data: PageData } = $props();

	const stats = $derived([
		{ value: String(data.counts.skills), label: 'skills' },
		{ value: String(data.counts.commands), label: 'commands' },
		{ value: String(data.counts.agents), label: 'agents' },
		{ value: String(data.bosses.length), label: 'bosses' },
		{ value: String(data.counts.workflows), label: 'workflows' },
		{ value: data.version, label: 'plugin version' }
	]);

	const continuity = [
		{
			href: '/hooks',
			title: 'Hooks',
			description: 'Lifecycle guardrails in minimal, standard, and strict profiles.'
		},
		{
			href: '/docs/wiki',
			title: 'Wiki',
			description: 'Continuous project memory carried forward between sessions.'
		},
		{
			href: '/docs/handoffs',
			title: 'Handoffs',
			description: 'Any agent closes work with a note the next agent picks up.'
		}
	];
</script>

<svelte:head>
	<title>{SITE_NAME} — coding-agent delivery infrastructure</title>
	<meta
		name="description"
		content="Route work to one domain boss, equip the session with a vendored armory, and ship with review gates."
	/>
</svelte:head>

<header class="site-container box gap32 padtop64 padbot48">
	<p class="eyebrow">Coding-agent delivery infrastructure</p>
	<h1 class="display">
		Yoke agents into a<br />self-improving <span class="accent-word">delivery system</span>
	</h1>
	<p class="lede">
		Fractal Agentic routes every task to one domain boss, equips the session with a vendored armory
		of skills, commands, and agents, and closes the loop with fresh review — one repeatable
		orchestration runtime for any coding-agent host.
	</p>
	<div class="hero-terminal">
		<TerminalBlock code="npx fractal-agentic init" />
	</div>
	<StatsStrip {stats} />
</header>

<SectionPanel
	index="01"
	label="One-boss discovery"
	title="One runtime,"
	accent="seven domain bosses"
	lede="The startup router detects the work in front of the agent and selects exactly one boss playbook — or invoke any boss directly."
>
	<div class="index-grid">
		{#each data.bosses as boss, i (boss.id)}
			<AssetCard
				href={boss.href}
				title={boss.name}
				description={boss.mission}
				num={String(i + 1).padStart(2, '0')}
			/>
		{/each}
	</div>
</SectionPanel>

<SectionPanel
	index="02"
	label="The armory"
	title="Everything the session"
	accent="ships with"
	lede="Skills, commands, agents, and workflows vendored inside the plugin — browsable here, live in the harness at install time."
>
	<div class="index-grid">
		<AssetCard
			href="/skills"
			title="Skills"
			description="Reusable capabilities, from brand discovery to release gates."
			badge={String(data.counts.skills)}
		/>
		<AssetCard
			href="/commands"
			title="Commands"
			description="Operational verbs for orchestration, verification, and shipping."
			badge={String(data.counts.commands)}
		/>
		<AssetCard
			href="/agents"
			title="Agents"
			description="Capability lanes pinned for the delivery runtime."
			badge={String(data.counts.agents)}
		/>
		<AssetCard
			href="/workflows"
			title="Workflows"
			description="Multi-step playbooks, from review fan-out to monorepo release."
			badge={String(data.counts.workflows)}
		/>
	</div>
</SectionPanel>

<SectionPanel
	index="03"
	label="The continuity layer"
	title="The orchestrator remembers,"
	accent="performs and grows"
	lede="Optional systems extend delivery beyond a single session: hooks keep the environment safe, the wiki carries project memory, and handoffs pass live context between agents."
>
	<div class="index-grid">
		{#each continuity as item (item.href)}
			<AssetCard href={item.href} title={item.title} description={item.description} />
		{/each}
	</div>
</SectionPanel>

<CtaSlab
	index="04"
	label="First delivery"
	title="Run your first orchestrated task"
	body="Install the plugin, point it at a project, and let the startup router do the rest. The armory, bosses, and guard hooks come with it."
	primaryHref="/docs/02-install"
	primaryLabel="Install guide"
	links={[
		{ href: '/docs/guide', label: 'Read the guide' },
		{ href: '/docs/orchestration', label: 'Orchestration runtime' },
		{ href: '/cli', label: 'CLI reference' },
		{ href: 'https://github.com/fractalmandala/mandala', label: 'GitHub' }
	]}
/>
