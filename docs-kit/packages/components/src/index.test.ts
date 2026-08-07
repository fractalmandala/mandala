import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Accordion from './Accordion.svelte';
import Badge from './Badge.svelte';
import Callout from './Callout.svelte';
import Columns from './Columns.svelte';
import Diff from './Diff.svelte';
import Frame from './Frame.svelte';
import ImageZoom from './ImageZoom.svelte';
import { diffLines } from './diff.js';
import Card from './Card.svelte';
import FileTree from './FileTree.svelte';
import Tab from './Tab.svelte';
import Tabs from './Tabs.svelte';
import TypeTable from './TypeTable.svelte';

/** Renders plain text as a snippet, which is how mdsvex passes content to a component. */
function text(value: string) {
	return createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));
}

describe('Callout', () => {
	it('labels itself by kind and exposes the region to assistive technology', () => {
		render(Callout, { props: { kind: 'warning', children: text('Back up your files.') } });

		const callout = screen.getByLabelText('Warning');
		expect(callout.tagName).toBe('ASIDE');
		expect(callout.className).toContain('docs-callout--warning');
		expect(callout.textContent).toContain('Back up your files.');
	});

	it('prefers an explicit title', () => {
		render(Callout, { props: { kind: 'danger', title: 'Stop', children: text('Careful.') } });

		expect(screen.getByLabelText('Stop').textContent).toContain('Stop');
	});
});

describe('Tabs', () => {
	function renderTabs() {
		return render(Tabs, {
			props: {
				labels: ['npm', 'pnpm', 'bun'],
				children: createRawSnippet(() => ({
					render: () => '<div data-testid="panels"></div>'
				}))
			}
		});
	}

	it('marks the first tab selected and applies roving tabindex', () => {
		renderTabs();
		const tabs = screen.getAllByRole('tab');

		expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
		expect(tabs[0]?.getAttribute('tabindex')).toBe('0');
		expect(tabs[1]?.getAttribute('tabindex')).toBe('-1');
		expect(tabs[0]?.getAttribute('aria-controls')).toBe('panel-npm');
	});

	it('moves selection with the arrow keys and wraps around', async () => {
		const user = userEvent.setup();
		renderTabs();
		const tabs = screen.getAllByRole('tab');

		tabs[0]?.focus();
		await user.keyboard('{ArrowRight}');
		expect(screen.getAllByRole('tab')[1]?.getAttribute('aria-selected')).toBe('true');

		await user.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(screen.getAllByRole('tab')[2]?.getAttribute('aria-selected')).toBe('true');
	});

	it('selects a tab on click', async () => {
		const user = userEvent.setup();
		renderTabs();

		await user.click(screen.getByRole('tab', { name: 'pnpm' }));
		expect(screen.getByRole('tab', { name: 'pnpm' }).getAttribute('aria-selected')).toBe('true');
	});
});

describe('Tab', () => {
	it('renders its panel when no tab group is present', () => {
		render(Tab, { props: { label: 'npm', children: text('npm install acme') } });

		expect(screen.getByRole('tabpanel').textContent).toContain('npm install acme');
		expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('tab-npm');
	});
});

describe('Card', () => {
	it('is a link when it has a destination and a group otherwise', () => {
		const { unmount } = render(Card, {
			props: { title: 'Install', href: '/docs/install', children: text('Get going.') }
		});

		const link = screen.getByRole('link', { name: /Install/ });
		expect(link.getAttribute('href')).toBe('/docs/install');
		unmount();

		render(Card, { props: { title: 'Plain' } });
		expect(screen.getByRole('group').textContent).toContain('Plain');
	});
});

describe('Accordion', () => {
	it('renders a native disclosure that respects the open prop', () => {
		render(Accordion, { props: { title: 'Details', open: true, children: text('Body') } });

		const details = screen.getByText('Details').closest('details');
		expect(details?.open).toBe(true);
		expect(details?.textContent).toContain('Body');
	});
});

describe('Badge', () => {
	it('applies the requested tone', () => {
		render(Badge, { props: { tone: 'accent', children: text('New') } });

		expect(screen.getByText('New').closest('.docs-badge')?.className).toContain('docs-badge--accent');
	});
});

describe('FileTree', () => {
	it('renders a labelled tree with nested groups', () => {
		render(FileTree, {
			props: {
				tree: [
					{
						name: 'src',
						children: [{ name: 'index.md', comment: 'the home page' }]
					}
				]
			}
		});

		expect(screen.getByRole('tree', { name: 'File tree' })).toBeTruthy();
		expect(screen.getAllByRole('treeitem')).toHaveLength(2);
		expect(screen.getByText('the home page')).toBeTruthy();
	});
});

describe('TypeTable', () => {
	it('renders rows with headers and marks required properties', () => {
		render(TypeTable, {
			props: {
				rows: [
					{ name: 'title', type: 'string', required: true, description: 'Page title.' },
					{ name: 'order', type: 'number', default: '0' }
				]
			}
		});

		expect(screen.getByRole('columnheader', { name: 'Property' })).toBeTruthy();
		expect(screen.getByRole('rowheader', { name: /title/ }).textContent).toContain('*');
		expect(screen.getByText('Page title.')).toBeTruthy();
	});
});

describe('Columns', () => {
	it('lays children out in a reflowing grid', () => {
		const { container } = render(Columns, { props: { count: 3, children: text('a') } });
		const columns = container.querySelector('.docs-columns') as HTMLElement;

		expect(columns.style.getPropertyValue('--docs-columns-count')).toBe('3');
		expect(columns.style.getPropertyValue('--docs-columns-min')).toBe('14rem');
		expect(columns.textContent).toContain('a');
	});
});

describe('Frame', () => {
	it('renders a figure with an optional caption', () => {
		const { container, unmount } = render(Frame, {
			props: { caption: 'The dashboard', children: text('image') }
		});

		expect(container.querySelector('figure')).toBeTruthy();
		expect(screen.getByText('The dashboard').tagName).toBe('FIGCAPTION');
		unmount();

		const bare = render(Frame, { props: { padded: false, children: text('image') } });
		expect(bare.container.querySelector('figcaption')).toBeNull();
		expect(bare.container.querySelector('.docs-frame--padded')).toBeNull();
	});
});

describe('diffLines', () => {
	it('marks added, removed, and unchanged lines with their line numbers', () => {
		expect(diffLines('a\nb\nc', 'a\nB\nc')).toEqual([
			{ kind: 'unchanged', text: 'a', beforeLine: 1, afterLine: 1 },
			{ kind: 'removed', text: 'b', beforeLine: 2 },
			{ kind: 'added', text: 'B', afterLine: 2 },
			{ kind: 'unchanged', text: 'c', beforeLine: 3, afterLine: 3 }
		]);
	});

	it('handles pure insertions, deletions, and identical input', () => {
		expect(diffLines('a', 'a\nb').filter((line) => line.kind === 'added')).toHaveLength(1);
		expect(diffLines('a\nb', 'a').filter((line) => line.kind === 'removed')).toHaveLength(1);
		expect(diffLines('a\nb', 'a\nb').every((line) => line.kind === 'unchanged')).toBe(true);
		expect(diffLines('', '')).toEqual([
			{ kind: 'unchanged', text: '', beforeLine: 1, afterLine: 1 }
		]);
	});
});

describe('Diff', () => {
	it('renders every line with a marker, not colour alone', () => {
		const { container } = render(Diff, {
			props: { before: 'const a = 1;\nconst b = 2;', after: 'const a = 1;\nconst b = 3;' }
		});

		const lines = [...container.querySelectorAll('.docs-diff__line')];
		expect(lines).toHaveLength(3);
		expect(lines[1]?.className).toContain('docs-diff__line--removed');
		expect(lines[1]?.textContent).toContain('-');
		expect(lines[2]?.className).toContain('docs-diff__line--added');
		expect(lines[2]?.textContent).toContain('+');
		expect(container.querySelector('figure')?.getAttribute('aria-label')).toContain(
			'1 added and 1 removed'
		);
	});

	it('shows a title and optional line numbers', () => {
		const { container } = render(Diff, {
			props: { before: 'a', after: 'b', title: 'src/app.ts', lineNumbers: true }
		});

		expect(screen.getByText('src/app.ts')).toBeTruthy();
		expect(container.querySelector('.docs-diff__number')).toBeTruthy();
	});
});

describe('ImageZoom', () => {
	it('opens a labelled dialog and closes again', async () => {
		const user = userEvent.setup();
		const { container } = render(ImageZoom, {
			props: { src: '/diagram.png', alt: 'Architecture diagram', caption: 'How it fits together' }
		});
		const dialog = container.querySelector('dialog') as HTMLDialogElement;

		expect(dialog.open).toBe(false);
		expect(screen.getByText('How it fits together').tagName).toBe('FIGCAPTION');

		await user.click(screen.getByRole('button', { name: /Architecture diagram/ }));
		expect(dialog.open).toBe(true);
		expect(dialog.getAttribute('aria-label')).toBe('Architecture diagram');

		await user.click(screen.getByRole('button', { name: 'Close image' }));
		expect(dialog.open).toBe(false);
	});
});
