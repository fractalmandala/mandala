```svelte
<div class="appshell">
	<header class="app-header" class:narrow-header={isLanding}>
		<div class="row xbetween ycenter w100">
			<div class="row ycenter gap16">
				<a class="blank gap0 row ycenter gap8" href="/">
					<img class="sz36 site-logo" src="/images/fractalagentic.png" alt="logo" />
					<p class="bold text-lg lstightx">fractal<span class="accented">agentic</span></p>
				</a>
			</div>
			<nav class="row gap16 ycenter" aria-label="Primary">
				{#each links as link (link.href)}
					<a
						class="nav-link"
						href={link.href}
						aria-current={isCurrent(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/each}
				<div class="row gap8 ycenter">
					<GlobalSearch items={data.search} />
					<a
						class="btn-icon"
						href="https://github.com/fractalmandala/fractal-agentic"
						rel="noopener noreferrer"
						target="_blank"
					>
						<RiGithubFill size={'20'} />
					</a>
					<a
						class="btn-icon"
						href="https://www.npmjs.com/package/fractal-agentic"
						rel="noopener noreferrer"
						target="_blank"
					>
						<RiNpmjsFill size={'20'} />
					</a>
					<ThemeToggle />
				</div>
			</nav>
		</div>
	</header>
	{#if isLanding}
		<main class="main new-layout">
				<aside class="left-side"></aside>
				<div class="inside center">
			<div class="narrow-width">
				{@render children()}
			</div>
				</div>
				<aside class="right-side"></aside>
		</main>
	{:else}
		<div class="content-grid">
			<aside class="sidebar">
				<DocsSidebar sections={data.sidebar} {statsLabel} />
			</aside>
			<main class="main">
				<div class="docs-shell__mobile">
					<MobileNav />
				</div>
				{@render children()}
			</main>
		</div>
	{/if}
</div>
```