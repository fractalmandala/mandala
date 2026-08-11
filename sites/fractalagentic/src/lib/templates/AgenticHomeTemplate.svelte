<script lang="ts">
	type Boss = { id: string; name: string; mission: string; href: string };
	type Counts = { skills: number; commands: number; agents: number; workflows: number };

	let {
		bosses = [],
		counts,
		version
	}: { bosses: Boss[]; counts: Counts; version: string } = $props();

	const continuity = [
		{ href: '/hooks', title: 'Hooks', description: 'Lifecycle guardrails for a safer session.' },
		{ href: '/docs/wiki', title: 'Wiki', description: 'Project memory that survives the handoff.' },
		{ href: '/docs/handoffs', title: 'Handoffs', description: 'Context passed forward, not lost.' }
	];
</script>

<svelte:head>
	<title>fractalagentic — coding-agent delivery infrastructure</title>
	<meta name="description" content="A repeatable orchestration runtime for coding agents." />
</svelte:head>

<div class="agentic-home">
	<section class="agentic-home-hero">
		<div>
			<p class="agentic-kicker">Fractal Agentic / documentation</p>
			<h1>Give every coding task a <span>clear next move.</span></h1>
			<p class="agentic-home-lede">
				A vendored armory of skills, commands, and domain bosses — wrapped in a reviewable runtime
				that helps agents ship with context.
			</p>
			<div class="agentic-home-actions">
				<a class="agentic-button" href="/docs/02-install">Install the armory <span aria-hidden="true">↗</span></a>
				<a class="agentic-link" href="/docs/guide">Read the guide <span aria-hidden="true">→</span></a>
			</div>
		</div>
		<div class="agentic-home-signal" aria-hidden="true"><span>01</span><i></i><span>∞</span></div>
	</section>

	<section class="agentic-home-strip" aria-label="Armory statistics">
		<div><strong>{counts.skills}</strong><span>skills</span></div>
		<div><strong>{counts.commands}</strong><span>commands</span></div>
		<div><strong>{counts.agents}</strong><span>agents</span></div>
		<div><strong>{bosses.length}</strong><span>domain bosses</span></div>
		<div><strong>{version}</strong><span>version</span></div>
	</section>

	<section class="agentic-home-section" aria-labelledby="agentic-boss-title">
		<div class="agentic-section-heading">
			<div><p class="agentic-kicker">01 / Route the work</p><h2 id="agentic-boss-title">One task. One boss.</h2></div>
			<p>Choose the domain that owns the decision, then let the runtime carry the work through review.</p>
		</div>
		<div class="agentic-card-grid">
			{#each bosses as boss, index (boss.id)}
				<a class="agentic-index-card" href={boss.href}>
					<span class="agentic-card-index">{String(index + 1).padStart(2, '0')}</span>
					<strong>{boss.name}</strong>
					<span>{boss.mission}</span>
					<small aria-hidden="true">↗</small>
				</a>
			{/each}
		</div>
	</section>

	<section class="agentic-home-section agentic-home-armory" aria-labelledby="agentic-armory-title">
		<div class="agentic-section-heading">
			<div><p class="agentic-kicker">02 / The armory</p><h2 id="agentic-armory-title">Everything the session needs.</h2></div>
			<p>Browse the pieces independently. Compose them when a project needs more than a one-off answer.</p>
		</div>
		<div class="agentic-armory-list">
			<a href="/skills"><span>Skills</span><small>{counts.skills} reusable capabilities</small><b>→</b></a>
			<a href="/commands"><span>Commands</span><small>{counts.commands} operational verbs</small><b>→</b></a>
			<a href="/agents"><span>Agents</span><small>{counts.agents} capability lanes</small><b>→</b></a>
			<a href="/workflows"><span>Workflows</span><small>{counts.workflows} repeatable playbooks</small><b>→</b></a>
		</div>
	</section>

	<section class="agentic-home-section" aria-labelledby="agentic-continuity-title">
		<div class="agentic-section-heading"><div><p class="agentic-kicker">03 / Continuity</p><h2 id="agentic-continuity-title">The next session starts ahead.</h2></div></div>
		<div class="agentic-continuity-grid">
			{#each continuity as item}<a href={item.href}><strong>{item.title}</strong><span>{item.description}</span><b>↗</b></a>{/each}
		</div>
	</section>

	<section class="agentic-home-cta">
		<p class="agentic-kicker">04 / First delivery</p>
		<h2>Start with the route. Keep the context.</h2>
		<a class="agentic-button agentic-button-dark" href="/docs/02-install">Run your first orchestrated task <span aria-hidden="true">→</span></a>
	</section>
</div>
