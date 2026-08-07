import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { DocsManifestPage, DocsNavigationNode } from '@docs-kit/core';

import Breadcrumbs from './Breadcrumbs.svelte';
import DocsHead from './DocsHead.svelte';
import LocaleSwitcher from './LocaleSwitcher.svelte';
import VersionSwitcher from './VersionSwitcher.svelte';
import { createDocsDimensionSwitchers } from './dimensions.js';
import DocsLayout from './DocsLayout.svelte';
import DocsPage from './DocsPage.svelte';
import MobileNav from './MobileNav.svelte';
import Pagination from './Pagination.svelte';
import SearchDialog from './SearchDialog.svelte';
import SearchTrigger from './SearchTrigger.svelte';
import Sidebar from './Sidebar.svelte';
import Toc from './Toc.svelte';
import { findNavigationTrail } from './navigation-trail.js';
import { themeScript } from './theme-script.js';

import type { DocsPageData } from './types.js';

const navigation: DocsNavigationNode[] = [
	{ type: 'page', id: 'index.md', label: 'Introduction', pathname: '/docs' },
	{
		type: 'section',
		id: 'guides',
		label: 'Guides',
		collapsible: true,
		collapsed: false,
		children: [
			{ type: 'page', id: 'guides/install.md', label: 'Installation', pathname: '/docs/guides/install' },
			{ type: 'page', id: 'guides/deploy.md', label: 'Deployment', pathname: '/docs/guides/deploy' }
		]
	},
	{
		type: 'link',
		id: 'github',
		label: 'GitHub',
		href: 'https://github.com/acme/product',
		external: true
	}
];

const page: DocsManifestPage = {
	id: 'guides/install.md',
	collection: 'default',
	source: { relativePath: 'guides/install.md', extension: '.md' },
	slug: 'guides/install',
	slugSegments: ['guides', 'install'],
	pathname: '/docs/guides/install',
	aliases: [],
	title: 'Installation',
	description: 'Install the framework.',
	label: 'Installation',
	frontmatter: {},
	headings: [
		{ id: 'requirements', text: 'Requirements', depth: 2, line: 3 },
		{ id: 'steps', text: 'Steps', depth: 3, line: 9 },
		{ id: 'deep', text: 'Deep', depth: 5, line: 15 }
	],
	next: { id: 'guides/deploy.md', label: 'Deployment', pathname: '/docs/guides/deploy' }
};

const data: DocsPageData = {
	page,
	navigation,
	site: { title: 'Acme', description: 'Acme docs', url: 'https://acme.com' },
	basePath: '/docs'
};

function body(value: string) {
	return createRawSnippet(() => ({ render: () => `<p>${value}</p>` }));
}

describe('Sidebar', () => {
	it('marks the current page and links external entries safely', () => {
		render(Sidebar, { props: { navigation, pathname: page.pathname } });

		expect(screen.getByRole('navigation', { name: 'Documentation' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Installation' }).getAttribute('aria-current')).toBe('page');
		expect(screen.getByRole('link', { name: /Introduction/ }).getAttribute('aria-current')).toBeNull();

		const external = screen.getByRole('link', { name: /GitHub/ });
		expect(external.getAttribute('rel')).toBe('noreferrer');
		expect(external.getAttribute('target')).toBe('_blank');
	});

	it('collapses and expands sections from the keyboard', async () => {
		const user = userEvent.setup();
		render(Sidebar, { props: { navigation, pathname: '/docs' } });

		const toggle = screen.getByRole('button', { name: /Guides/ });
		expect(toggle.getAttribute('aria-expanded')).toBe('true');

		await user.click(toggle);
		expect(screen.getByRole('button', { name: /Guides/ }).getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('link', { name: 'Installation' })).toBeNull();
	});
});

describe('Toc', () => {
	it('renders only the configured heading depths', () => {
		render(Toc, { props: { headings: page.headings } });

		expect(screen.getByRole('navigation', { name: 'On this page' })).toBeTruthy();
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		expect(screen.getByRole('link', { name: 'Requirements' }).getAttribute('href')).toBe('#requirements');
	});
});

describe('Breadcrumbs', () => {
	it('shows the trail to the current page and marks the last entry', () => {
		render(Breadcrumbs, { props: { navigation, pathname: page.pathname } });

		expect(findNavigationTrail(navigation, page.pathname).map((entry) => entry.label)).toEqual([
			'Guides',
			'Installation'
		]);
		expect(screen.getByText('Installation').getAttribute('aria-current')).toBe('page');
	});
});

describe('Pagination', () => {
	it('renders only the directions that exist', () => {
		render(Pagination, { props: { next: page.next } });

		expect(screen.getByRole('link', { name: /Deployment/ }).getAttribute('href')).toBe(
			'/docs/guides/deploy'
		);
		expect(screen.queryByText('Previous')).toBeNull();
	});
});

describe('MobileNav', () => {
	it('opens a modal drawer and closes it again', async () => {
		const user = userEvent.setup();
		const { container } = render(MobileNav, { props: { navigation, pathname: page.pathname } });
		const dialog = container.querySelector('dialog') as HTMLDialogElement;

		const trigger = screen.getByRole('button', { name: 'Menu' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(dialog.open).toBe(false);

		await user.click(trigger);
		expect(dialog.open).toBe(true);
		expect(dialog.getAttribute('aria-label')).toBe('Documentation');
		expect(screen.getByRole('navigation', { name: 'Documentation' })).toBeTruthy();

		await user.click(screen.getByRole('button', { name: 'Close' }));
		expect(dialog.open).toBe(false);
		expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('false');
	});
});

describe('DocsLayout', () => {
	it('renders the page, its content, and its landmarks', () => {
		render(DocsLayout, { props: { data, children: body('Install it.') } });

		expect(screen.getByRole('heading', { level: 1, name: 'Installation' })).toBeTruthy();
		expect(screen.getByText('Install the framework.')).toBeTruthy();
		expect(screen.getByText('Install it.')).toBeTruthy();
		expect(screen.getByRole('main').id).toBe('docs-content');
	});

	it('can drop the framework chrome so a host supplies its own', () => {
		render(DocsLayout, {
			props: {
				data,
				sidebar: false,
				toc: false,
				breadcrumbs: false,
				pagination: false,
				children: body('Bare content.')
			}
		});

		expect(screen.queryByRole('navigation')).toBeNull();
		expect(screen.getByText('Bare content.')).toBeTruthy();
	});
});

describe('DocsPage', () => {
	it('renders the full shell with a skip link and header', () => {
		render(DocsPage, { props: { data, children: body('Full shell.') } });

		expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe(
			'#docs-content'
		);
		expect(screen.getByRole('banner')).toBeTruthy();
		expect(screen.getByRole('contentinfo')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Acme' }).getAttribute('href')).toBe('/docs');
	});

	it('drops the shell when the host provides one', () => {
		render(DocsPage, { props: { data, shell: false, children: body('Embedded.') } });

		expect(screen.queryByRole('banner')).toBeNull();
		expect(screen.queryByRole('contentinfo')).toBeNull();
		expect(screen.getByText('Embedded.')).toBeTruthy();
	});
});

describe('themeScript', () => {
	it('applies a stored scheme before paint and ignores anything else', () => {
		expect(themeScript).toContain('docs-kit:color-scheme');
		expect(themeScript).toContain("setAttribute('data-theme'");
		expect(themeScript).toContain('try');
	});
});

describe('page heading', () => {
	it('renders its own H1 only when the document does not have one', () => {
		const withOwnH1: DocsPageData = {
			...data,
			page: { ...page, headings: [{ id: 'installation', text: 'Installation', depth: 1, line: 1 }] }
		};

		const { unmount } = render(DocsLayout, {
			props: { data: withOwnH1, children: body('Body.') }
		});
		expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
		unmount();

		render(DocsLayout, { props: { data, children: body('Body.') } });
		expect(screen.getAllByRole('heading', { level: 1, name: 'Installation' })).toHaveLength(1);
	});
});

describe('SearchDialog', () => {
	const results = [
		{
			record: {
				id: 'a.md',
				pageId: 'a.md',
				pathname: '/docs/a#vercel',
				title: 'Deployment',
				section: 'Vercel',
				headingPath: ['Deployment', 'Vercel'],
				body: 'Deploy with the Vercel adapter.',
				boost: 1,
				tags: []
			},
			score: 3,
			excerpt: 'Deploy with the Vercel adapter.'
		},
		{
			record: {
				id: 'b.md',
				pageId: 'b.md',
				pathname: '/docs/b',
				title: 'Styling',
				headingPath: ['Styling'],
				body: 'Override tokens.',
				boost: 1,
				tags: []
			},
			score: 1,
			excerpt: 'Override tokens.'
		}
	];

	function client(searched: string[] = []) {
		return async () => ({
			name: 'stub',
			async search(query: string) {
				searched.push(query);
				return query.includes('nothing') ? [] : results;
			}
		});
	}

	it('is closed until asked, then queries lazily', async () => {
		const user = userEvent.setup();
		const searched: string[] = [];
		const { container } = render(SearchDialog, { props: { client: client(searched), open: true } });
		const dialog = container.querySelector('dialog') as HTMLDialogElement;

		expect(dialog.open).toBe(true);
		expect(searched).toEqual([]);

		await user.type(screen.getByRole('searchbox'), 'deploy');
		expect(searched.at(-1)).toBe('deploy');
		// Results are grouped by page, so the page title heads the group and the section
		// names the entry.
		expect(await screen.findByRole('group', { name: 'Deployment' })).toBeTruthy();
		expect(screen.getByText('Vercel')).toBeTruthy();
		expect(screen.getByRole('status').textContent).toContain('2 results');
	});

	it('exposes results as a listbox and moves the active option with the keyboard', async () => {
		const user = userEvent.setup();
		render(SearchDialog, { props: { client: client(), open: true } });

		await user.type(screen.getByRole('searchbox'), 'deploy');
		await screen.findByRole('group', { name: 'Deployment' });

		const options = screen.getAllByRole('option');
		expect(options[0]?.getAttribute('aria-selected')).toBe('true');

		await user.keyboard('{ArrowDown}');
		expect(screen.getAllByRole('option')[1]?.getAttribute('aria-selected')).toBe('true');

		await user.keyboard('{ArrowUp}{ArrowUp}');
		expect(screen.getAllByRole('option')[1]?.getAttribute('aria-selected')).toBe('true');
	});

	it('announces an empty result set', async () => {
		const user = userEvent.setup();
		render(SearchDialog, { props: { client: client(), open: true } });

		await user.type(screen.getByRole('searchbox'), 'nothing');
		expect((await screen.findByRole('status')).textContent).toContain('0 results');
	});

	it('reports provider failures instead of hanging', async () => {
		const user = userEvent.setup();
		render(SearchDialog, {
			props: {
				open: true,
				client: async () => ({
					name: 'broken',
					search: async () => {
						throw new Error('index unavailable');
					}
				})
			}
		});

		await user.type(screen.getByRole('searchbox'), 'deploy');
		expect((await screen.findByRole('status')).textContent).toContain('unavailable');
	});
});

describe('SearchTrigger', () => {
	it('shows the shortcut and opens on click', async () => {
		const user = userEvent.setup();
		let opened = 0;
		render(SearchTrigger, { props: { onopen: () => (opened += 1) } });

		expect(screen.getByText('⌘K')).toBeTruthy();
		await user.click(screen.getByRole('button', { name: /Search/ }));
		expect(opened).toBe(1);
	});
});

describe('DocsHead', () => {
	function headHtml() {
		return document.head.innerHTML;
	}

	it('emits canonical, social, and structured data', async () => {
		render(DocsHead, {
			props: {
				page: { ...page, description: 'Install the framework.' },
				site: { title: 'Acme', url: 'https://acme.com' },
				navigation,
				basePath: '/docs',
				image: '/og/guides-install.svg'
			}
		});

		const head = headHtml();
		expect(document.title).toBe('Installation · Acme');
		expect(head).toContain('<link rel="canonical" href="https://acme.com/docs/guides/install">');
		expect(head).toContain('property="og:image" content="https://acme.com/og/guides-install.svg"');
		expect(head).toContain('name="twitter:card" content="summary_large_image"');

		const jsonLd = JSON.parse(
			head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '[]'
		);
		expect(jsonLd[0]).toMatchObject({ '@type': 'TechArticle', headline: 'Installation' });
		expect(jsonLd[1]?.itemListElement?.map((entry: { name: string }) => entry.name)).toEqual([
			'Acme',
			'Guides',
			'Installation'
		]);
	});

	it('marks drafts noindex and renders locale alternates', () => {
		render(DocsHead, {
			props: {
				page: { ...page, draft: true, locale: 'en' },
				site: { title: 'Acme', url: 'https://acme.com' },
				alternates: [{ hreflang: 'de', href: 'https://acme.com/docs/de/guides/install' }]
			}
		});

		const head = headHtml();
		expect(head).toContain('name="robots" content="noindex"');
		expect(head).toContain('hreflang="de"');
		expect(head).toContain('property="og:locale" content="en"');
	});
});

describe('dimension switchers', () => {
	const versionItems = [
		{ id: 'v2', label: 'Latest', current: true, target: { slug: 'guides/install', version: 'v2' }, href: '/docs/guides/install', fallback: false, match: 'exact' as const },
		{ id: 'v1', label: 'Version 1', current: false, target: { slug: '', version: 'v1' }, href: '/docs/v1', fallback: true, match: 'destination-index' as const },
		{ id: 'v0', label: 'Version 0', current: false, target: { slug: 'guides/install', version: 'v0' }, fallback: true, match: 'none' as const }
	];

	const localeItems = [
		{ id: 'en', label: 'English', dir: 'ltr' as const, default: true, current: true, target: { slug: 'guides/install', locale: 'en' }, href: '/docs/guides/install', fallback: false, match: 'exact' as const },
		{ id: 'de', label: 'Deutsch', dir: 'ltr' as const, default: false, current: false, target: { slug: 'guides/install', locale: 'de' }, href: '/docs/de/guides/install', fallback: false, match: 'exact' as const }
	];

	it('renders a labelled control showing the current version', () => {
		render(VersionSwitcher, { props: { items: versionItems } });

		const select = screen.getByLabelText('Version') as HTMLSelectElement;
		expect(select.value).toBe('v2');
		expect(screen.getAllByRole('option').map((option) => option.textContent?.trim())).toEqual([
			'Latest',
			'Version 1 ·',
			'Version 0 ·'
		]);
	});

	it('marks fallbacks and disables versions with no reachable page', () => {
		render(VersionSwitcher, { props: { items: versionItems } });
		const options = screen.getAllByRole('option') as HTMLOptionElement[];

		expect(options[1]?.title).toContain('not translated on this page');
		expect(options[1]?.disabled).toBe(false);
		expect(options[2]?.disabled).toBe(true);
	});

	it('renders locales with their language tag', () => {
		render(LocaleSwitcher, { props: { items: localeItems } });

		const select = screen.getByLabelText('Language') as HTMLSelectElement;
		expect(select.value).toBe('en');
		expect((screen.getAllByRole('option')[1] as HTMLOptionElement).lang).toBe('de');
	});

	it('stays hidden when there is nothing to switch between', () => {
		const { unmount } = render(VersionSwitcher, { props: { items: [versionItems[0]!] } });
		expect(screen.queryByLabelText('Version')).toBeNull();
		unmount();

		render(LocaleSwitcher, { props: { items: [] } });
		expect(screen.queryByLabelText('Language')).toBeNull();
	});
});

describe('createDocsDimensionSwitchers', () => {
	function versionedManifest() {
		const make = (id: string, slug: string, pathname: string, version: string, locale: string) => ({
			id,
			source: { relativePath: `${slug || 'index'}.md`, extension: '.md' as const },
			slug,
			slugSegments: slug === '' ? [] : slug.split('/'),
			pathname,
			version,
			locale,
			title: slug || 'Home',
			label: slug || 'Home',
			frontmatter: {},
			headings: []
		});

		return {
			generatedAt: 'fixed',
			configHash: 'fixed',
			navigation: {},
			versions: [
				{ id: 'v2', label: 'Latest', current: true },
				{ id: 'v1', label: 'Version 1', current: false }
			],
			locales: [
				{ id: 'en', label: 'English', default: true, dir: 'ltr' as const },
				{ id: 'de', label: 'Deutsch', default: false, dir: 'ltr' as const }
			],
			pages: [
				make('v2/en/install.md', 'install', '/docs/install', 'v2', 'en'),
				make('v2/de/install.md', 'install', '/docs/de/install', 'v2', 'de'),
				make('v1/en/index.md', '', '/docs/v1', 'v1', 'en')
			]
		};
	}

	it('derives switcher items from the manifest, preserving the page where possible', () => {
		const manifest = versionedManifest();
		const switchers = createDocsDimensionSwitchers({
			manifest: manifest as never,
			page: manifest.pages[0] as never,
			basePath: '/docs'
		});

		expect(switchers.locales.map((item) => [item.id, item.href])).toEqual([
			['en', '/docs/install'],
			['de', '/docs/de/install']
		]);
		// v1 has no `install` page, so the switcher falls back to that version's index.
		expect(switchers.versions.map((item) => [item.id, item.href, item.fallback])).toEqual([
			['v2', '/docs/install', false],
			['v1', '/docs/v1', true]
		]);
	});

	it('returns nothing for single-dimension documentation', () => {
		const manifest = { ...versionedManifest(), versions: [], locales: [] };

		expect(
			createDocsDimensionSwitchers({
				manifest: manifest as never,
				page: manifest.pages[0] as never
			})
		).toEqual({ versions: [], locales: [] });
	});
});

describe('SearchDialog history and grouping', () => {
	const grouped = [
		{
			record: {
				id: 'deploy.md',
				pageId: 'deploy.md',
				pathname: '/docs/deploy',
				title: 'Deployment',
				headingPath: ['Deployment'],
				body: 'Deploy the docs.',
				boost: 2,
				tags: []
			},
			score: 4,
			excerpt: 'Deploy the docs anywhere.'
		},
		{
			record: {
				id: 'deploy.md#vercel',
				pageId: 'deploy.md',
				pathname: '/docs/deploy#vercel',
				title: 'Deployment',
				section: 'Vercel',
				headingPath: ['Deployment', 'Vercel'],
				body: 'Use the Vercel adapter.',
				boost: 1,
				tags: []
			},
			score: 3,
			excerpt: 'Use the Vercel adapter.'
		}
	];

	function client() {
		return async () => ({ name: 'stub', search: async () => grouped });
	}

	it('groups sections under their page and highlights matches', async () => {
		const user = userEvent.setup();
		render(SearchDialog, { props: { client: client(), open: true } });

		await user.type(screen.getByRole('searchbox'), 'deploy');
		await screen.findByRole('group', { name: 'Deployment' });

		expect(screen.getAllByRole('group')).toHaveLength(1);
		expect(screen.getAllByRole('option')).toHaveLength(2);
		expect(screen.getByText('Vercel')).toBeTruthy();

		const marks = document.querySelectorAll('#docs-search-results mark');
		expect(marks.length).toBeGreaterThan(0);
		expect([...marks].every((mark) => mark.textContent?.toLowerCase().includes('deploy'))).toBe(true);
	});

	it('remembers a visited query and can clear the history', async () => {
		const user = userEvent.setup();
		localStorage.clear();
		const { unmount } = render(SearchDialog, { props: { client: client(), open: true } });

		await user.type(screen.getByRole('searchbox'), 'deploy');
		await screen.findByRole('group', { name: 'Deployment' });
		await user.click(screen.getAllByRole('link')[0]!);
		unmount();

		render(SearchDialog, { props: { client: client(), open: true } });
		expect(await screen.findByRole('button', { name: 'deploy' })).toBeTruthy();

		await user.click(screen.getByRole('button', { name: 'Clear' }));
		expect(screen.queryByRole('button', { name: 'deploy' })).toBeNull();
	});
});
