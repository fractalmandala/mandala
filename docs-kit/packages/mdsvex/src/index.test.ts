import { describe, expect, it } from 'vitest';

import { transformDocsDirectives, transformDocsMarkdown } from './directives.js';
import { findDocsMath, renderDocsMath } from './math.js';
import { rehypeDocsHeadings } from './headings.js';
import { createDocsHighlighter, parseCodeMeta } from './highlight.js';
import { docsMarkdown, docsMdsvex } from './index.js';

describe('transformDocsDirectives', () => {
	it('converts callouts, including a bare title', () => {
		expect(transformDocsDirectives(':::warning{title="Careful"}\nBack up.\n:::')).toBe(
			'<Callout title="Careful" kind="warning">\n\nBack up.\n\n</Callout>'
		);
		expect(transformDocsDirectives(':::note{Before you begin}\nRead this.\n:::')).toContain(
			'<Callout title="Before you begin" kind="note">'
		);
	});

	it('converts tabs into labelled tab components', () => {
		const output = transformDocsDirectives(
			[':::tabs', '', '@tab npm', '', '```bash', 'npm i acme', '```', '', '@tab pnpm', '', 'pnpm add acme', '', ':::'].join('\n')
		);

		expect(output).toContain('<Tabs labels={["npm","pnpm"]}>');
		expect(output).toContain('<Tab label="npm">');
		expect(output).toContain('npm i acme');
		expect(output).toContain('<Tab label="pnpm">');
	});

	it('converts steps and nested cards', () => {
		const output = transformDocsDirectives(
			[
				':::steps',
				'',
				'## Install',
				'',
				'Install it.',
				'',
				':::',
				'',
				'::::cards',
				'',
				':::card{title="Install" href="/docs/install"}',
				'Get going.',
				':::',
				'',
				'::::'
			].join('\n')
		);

		expect(output).toContain('<Steps>');
		expect(output).toContain('## Install');
		expect(output).toContain('<Cards>');
		expect(output).toContain('<Card title="Install" href="/docs/install">');
	});

	it('never rewrites directive-looking text inside code fences', () => {
		const source = ['```md', ':::warning', 'not a directive', ':::', '```'].join('\n');

		expect(transformDocsDirectives(source)).toBe(source);
	});

	it('leaves unknown and unterminated directives as written', () => {
		expect(transformDocsDirectives(':::mystery\nbody\n:::')).toBe(':::mystery\nbody\n:::');
		expect(transformDocsDirectives(':::note\nunclosed')).toBe(':::note\nunclosed');
	});

	it('supports component overrides', () => {
		expect(
			transformDocsDirectives(':::note\nHi.\n:::', { components: { note: 'MyCallout' } })
		).toContain('<MyCallout kind="note">');
	});
});

describe('docsMarkdown preprocessor', () => {
	const preprocessor = docsMarkdown();

	it('only transforms Markdown and mdsvex files', async () => {
		expect((await preprocessor.markup({ content: ':::tip\nHi.\n:::', filename: 'a.md' }))?.code).toContain(
			'<Callout kind="tip">'
		);
		expect(
			await preprocessor.markup({ content: ':::tip\nHi.\n:::', filename: 'a.svelte' })
		).toBeUndefined();
		expect(await preprocessor.markup({ content: 'x' })).toBeUndefined();
	});
});

describe('rehypeDocsHeadings', () => {
	function heading(tagName: string, text: string) {
		return {
			type: 'element',
			tagName,
			properties: {},
			children: [{ type: 'text', value: text }]
		};
	}

	it('adds stable ids, deduplicates them, and appends permalinks', () => {
		const tree = {
			type: 'root',
			children: [heading('h2', 'Install'), heading('h2', 'Install'), heading('h5', 'Deep')]
		};

		rehypeDocsHeadings()(tree);

		expect(tree.children.map((node) => node.properties['id'])).toEqual([
			'install',
			'install-1',
			'deep'
		]);
		expect(tree.children[0]?.children.at(-1)).toMatchObject({
			tagName: 'a',
			properties: { href: '#install', class: 'docs-heading-anchor', 'aria-label': 'Link to Install' }
		});
		// h5 is outside the default anchor depths, so it gets an id but no permalink.
		expect(tree.children[2]?.children).toHaveLength(1);
	});

	it('can omit anchors entirely', () => {
		const tree = { type: 'root', children: [heading('h2', 'Install')] };
		rehypeDocsHeadings({ anchors: false })(tree);

		expect(tree.children[0]?.children).toHaveLength(1);
		expect(tree.children[0]?.properties['id']).toBe('install');
	});
});

describe('parseCodeMeta', () => {
	it('reads titles, highlighted ranges, and line numbers', () => {
		expect(parseCodeMeta('title="src/app.ts" {1,3-5} showLineNumbers')).toEqual({
			title: 'src/app.ts',
			highlightedLines: [1, 3, 4, 5],
			showLineNumbers: true
		});
		expect(parseCodeMeta(undefined)).toEqual({ highlightedLines: [], showLineNumbers: false });
	});
});

describe('createDocsHighlighter', () => {
	const highlight = createDocsHighlighter();

	it('emits both colour schemes, escapes Svelte syntax, and marks highlighted lines', async () => {
		const html = await highlight('const value = { a: 1 };\nconst other = 2;', 'ts', '{2}');

		expect(html).toContain('class="docs-code"');
		expect(html).toContain('data-language="ts"');
		expect(html).toContain('--shiki-dark');
		expect(html).toContain('docs-code__line--highlighted');
		expect(html).not.toMatch(/[^&]\{/);
	});

	it('renders a title, a copy button, and falls back to plain text for unknown languages', async () => {
		const titled = await highlight('echo hi', 'bash', 'title="deploy.sh"');
		expect(titled).toContain('<div class="docs-code__title">deploy.sh</div>');
		expect(titled).toContain('data-docs-copy');

		const unknown = await highlight('...', 'not-a-language');
		expect(unknown).toContain('data-language="text"');
	});
}, 60_000);

describe('docsMdsvex', () => {
	it('exposes the rehype heading plugin and a highlighter by default', () => {
		const pipeline = docsMdsvex();

		expect(pipeline.remarkPlugins).toEqual([]);
		expect(pipeline.rehypePlugins).toHaveLength(1);
		expect(typeof pipeline.highlight?.highlighter).toBe('function');
		expect(docsMdsvex({ syntaxHighlighting: false }).highlight).toBeUndefined();
	});
});

describe('component imports', () => {
	it('injects imports for exactly the components a document uses', async () => {
		const code = (
			await docsMarkdown().markup({
				content: '---\ntitle: A\n---\n\n:::tip\nHi.\n:::',
				filename: 'a.md'
			})
		)?.code;

		expect(code?.startsWith('---\ntitle: A\n---\n')).toBe(true);
		expect(code).toContain("import { Callout } from '@docs-kit/components';");
		expect(code).not.toContain('Tabs');
	});

	it('adds imports to an existing instance script rather than a second one', async () => {
		const code = (
			await docsMarkdown().markup({
				content: "<script lang=\"ts\">\n\tconst x = 1;\n</script>\n\n:::note\nHi.\n:::",
				filename: 'a.svx'
			})
		)?.code;

		expect(code?.match(/<script/g)).toHaveLength(1);
		expect(code).toContain("import { Callout } from '@docs-kit/components';");
	});

	it('leaves a plain document untouched and honours a custom module', async () => {
		expect((await docsMarkdown().markup({ content: '# Title', filename: 'a.md' }))?.code).toBe(
			'# Title'
		);
		expect(
			(
				await docsMarkdown({ componentsModule: '$lib/docs' }).markup({
					content: ':::tip\nHi.\n:::',
					filename: 'a.md'
				})
			)?.code
		).toContain("from '$lib/docs'");
	});
});

describe('layout directives', () => {
	it('converts columns and frames', () => {
		const output = transformDocsDirectives(
			[
				':::columns',
				'',
				'Left column.',
				'',
				':::',
				'',
				':::frame{caption="The dashboard"}',
				'',
				'![dashboard](/dashboard.png)',
				'',
				':::'
			].join('\n')
		);

		expect(output).toContain('<Columns>');
		expect(output).toContain('<Frame caption="The dashboard">');
		expect(output).toContain('![dashboard](/dashboard.png)');
	});
});

describe('math', () => {
	it('finds inline and block expressions outside code', () => {
		const source = [
			'Einstein wrote $E = mc^2$ in 1905.',
			'',
			'$$',
			'\\int_0^1 x^2 dx',
			'$$',
			'',
			'```bash',
			'echo $PATH',
			'```',
			'',
			'Inline code `$notmath$` stays put, and $5 costs money.'
		].join('\n');

		expect(findDocsMath(source)).toEqual([
			{ tex: '\\int_0^1 x^2 dx', display: true },
			{ tex: 'E = mc^2', display: false }
		]);
	});

	it('renders math to HTML at build time', async () => {
		const rendered = await renderDocsMath('Mass–energy: $E = mc^2$.\n\n$$a^2 + b^2 = c^2$$');

		expect(rendered).toContain('class="docs-math"');
		expect(rendered).toContain('class="docs-math docs-math--block"');
		expect(rendered).toContain('katex');
		// Svelte must not evaluate KaTeX's braces.
		expect(rendered).not.toMatch(/[^&]\{/);
	});

	it('leaves code and non-math dollars alone', async () => {
		const source = '```bash\necho $HOME\n```\n\nIt costs $5 and $10.';

		expect(await renderDocsMath(source)).toBe(source);
	});

	it('renders invalid TeX inline unless strict mode is on', async () => {
		expect(await renderDocsMath('$\\frac{1}$')).toContain('docs-math');
		await expect(renderDocsMath('$\\frac{1}$', { strict: true })).rejects.toThrow();
		expect(await renderDocsMath('$E = mc^2$', { enabled: false })).toBe('$E = mc^2$');
	});
});

describe('mermaid', () => {
	it('turns a mermaid fence into a component with the source as a prop', () => {
		const output = transformDocsMarkdown(
			['# Flow', '', '```mermaid', 'graph TD;', '  A-->B;', '```'].join('\n')
		);

		expect(output.code).toContain('<Mermaid chart={"graph TD;\\n  A-->B;"} />');
		expect(output.components).toEqual(['Mermaid']);
	});

	it('leaves other fences and unterminated blocks alone', () => {
		const plain = transformDocsMarkdown('```js\nconst a = 1;\n```');
		expect(plain.components).toEqual([]);
		expect(plain.code).toContain('const a = 1;');

		expect(transformDocsMarkdown('```mermaid\ngraph TD;').code).toContain('graph TD;');
	});

	it('is imported only by documents that use it', async () => {
		const withDiagram = await docsMarkdown().markup({
			content: '```mermaid\ngraph TD;\n```',
			filename: 'a.md'
		});
		const without = await docsMarkdown().markup({ content: '# Plain', filename: 'b.md' });

		expect(withDiagram?.code).toContain("import { Mermaid } from '@docs-kit/components';");
		expect(without?.code).not.toContain('Mermaid');
	});
});

describe('diff code blocks', () => {
	it('marks added and removed lines structurally', async () => {
		const html = await createDocsHighlighter()(
			['const a = 1;', '-const b = 2;', '+const b = 3;'].join('\n'),
			'diff'
		);

		expect(html).toContain('docs-code__line--removed');
		expect(html).toContain('docs-code__line--added');
		expect(html).toContain('data-language="diff"');
	});
});
