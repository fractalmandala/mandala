/**
 * Permanent Markdown round-trip / fuzz suite.
 *
 * For every fixture we assert the strongest guarantee the pipeline actually
 * provides:
 *
 *   byte-faithful — parse→serialize returns the input unchanged (and is
 *                   therefore idempotent).
 *   stable        — the first trip may normalize, but parse→serialize
 *                   converges: roundTrip(roundTrip(x)) === roundTrip(x).
 *
 * Known, intentional limitations (documented in docs/document-serialization.md):
 *   - The StarterKit schema has no Image/Table/TaskList nodes, so images and
 *     tables are dropped by the *rich editor* flow even though the
 *     HTML↔Markdown bridge round-trips them (asserted here at bridge level).
 *     Task lists survive the editor as literal `[ ]`/`[x]` text.
 *   - Code fence info strings normalize to their first word (marked keeps
 *     only the language class); tilde fences normalize to backticks.
 *   - Autolinks `<https://…>` normalize to `[https://…](https://…)`.
 *   - Trailing-double-space hard breaks collapse to plain newlines.
 *   - Block content (code, extra paragraphs) inside list items is flattened.
 */
import { describe, expect, it } from 'vitest';
import {
	markdownToTiptapJson,
	roundTripMarkdown,
	tiptapJsonToMarkdown,
} from './serialization';

function expectByteFaithful(source: string): void {
	const once = roundTripMarkdown(source);
	expect(once, `byte-faithful round trip of ${JSON.stringify(source)}`).toBe(source);
	expect(roundTripMarkdown(once)).toBe(once);
}

function expectStable(source: string): void {
	const once = roundTripMarkdown(source);
	const twice = roundTripMarkdown(once);
	expect(twice, `stable round trip of ${JSON.stringify(source)}`).toBe(once);
}

function expectJsonBridgeStable(source: string): void {
	const once = tiptapJsonToMarkdown(markdownToTiptapJson(source));
	const twice = tiptapJsonToMarkdown(markdownToTiptapJson(once));
	expect(twice, `stable JSON bridge of ${JSON.stringify(source)}`).toBe(once);
}

describe('markdown round-trip fuzz fixtures', () => {
	describe('nested lists', () => {
		it('simple nested bullet lists are byte-faithful', () => {
			expectByteFaithful('- a\n  - b\n    - c\n');
		});

		it('mixed ordered/bullet nesting is byte-faithful at marker width', () => {
			expectByteFaithful('1. one\n   - sub\n   - sub two\n2. two\n');
		});

		it('over-indented nesting normalizes once, then stabilizes', () => {
			expectStable('1. one\n      - deep\n2. two\n');
		});

		it('block content inside list items is flattened but stable (documented limitation)', () => {
			expectStable('- item\n\n  ```js\n  code\n  ```\n');
		});
	});

	describe('yaml frontmatter', () => {
		it('simple frontmatter is byte-faithful', () => {
			expectByteFaithful('---\ntitle: Hello\n---\n\n# Body\n');
		});

		it('arrays, booleans and quoted values survive', () => {
			expectByteFaithful(
				'---\ntitle: "Quoted: value"\ntags: [a, b]\ndraft: false\nweight: 3\n---\n\nText.\n',
			);
		});

		it('frontmatter-only documents survive', () => {
			expectByteFaithful('---\ntitle: Only\n---\n');
		});

		it('a thematic break immediately after frontmatter is preserved', () => {
			expectByteFaithful('---\nt: 1\n---\n\n---\n');
		});

		it('closing fences are never re-interpreted as setext headings', () => {
			const once = roundTripMarkdown('---\ntitle: Hello\n---\n\nBody.\n');
			expect(once).not.toContain('## ');
			expect(once).toContain('---\ntitle: Hello\n---');
		});
	});

	describe('mdx-ish content', () => {
		it('import/export lines and JSX survive as literal text and stabilize', () => {
			const source = 'import X from "./x"\n\n<Callout tone="info">hi</Callout>\n';
			const once = roundTripMarkdown(source);
			expect(once).toContain('import X from "./x"');
			expect(once).toContain('<Callout tone="info">hi</Callout>');
			expectStable(source);
		});
	});

	describe('code blocks with odd info strings', () => {
		it('plain and language-tagged fences are byte-faithful', () => {
			expectByteFaithful('```\nplain\n```\n');
			expectByteFaithful('```typescript\nconst x: number = 1\n```\n');
		});

		it('backticks inside fences are byte-faithful', () => {
			expectByteFaithful('```md\n`inline` and ``` nested\n```\n');
		});

		it('extra info-string words normalize to the language, then stabilize', () => {
			const once = roundTripMarkdown('```js {1-2}\ncode\n```\n');
			expect(once).toBe('```js\ncode\n```\n');
			expectStable('```js {1-2}\ncode\n```\n');
		});

		it('tilde fences normalize to backticks, then stabilize', () => {
			expect(roundTripMarkdown('~~~ruby\nputs 1\n~~~\n')).toBe('```ruby\nputs 1\n```\n');
		});
	});

	describe('images', () => {
		it('images are byte-faithful through the bridge', () => {
			expectByteFaithful('![alt text](/assets/hero.webp)\n');
			expectByteFaithful('Before ![inline](/i.png) after.\n');
		});

		// LIMITATION: StarterKit has no Image node, so the *rich editor* flow
		// (markdownToEditorHtml → TipTap schema parse → getHTML) drops images.
		// The bridge-level guarantee above is what paste/preview rely on.
	});

	describe('tables', () => {
		it('GFM tables round-trip through the bridge', () => {
			const source = '| a | b |\n| --- | --- |\n| 1 | 2 |\n';
			const once = roundTripMarkdown(source);
			expect(once).toContain('| a | b |');
			expect(once).toContain('| 1 | 2 |');
			expectStable(source);
		});

		// LIMITATION: StarterKit has no Table nodes, so the rich editor flow
		// drops tables on load/save. See docs/document-serialization.md.
	});

	describe('inline html', () => {
		it('inline HTML is preserved byte-faithfully as literal text', () => {
			expectByteFaithful('<div class="x">hi</div>\n');
			expectByteFaithful('Text with <span>inline</span> markup.\n');
		});
	});

	describe('malformed markdown', () => {
		it('unclosed fences gain a closing fence once, then stabilize', () => {
			const once = roundTripMarkdown('```js\ncode\n');
			expect(once).toBe('```js\ncode\n```\n');
			expectStable('```js\ncode\n');
		});

		it('unmatched brackets are escaped once, then stabilize', () => {
			const once = roundTripMarkdown('[not a link\n');
			expect(once).toBe('\\[not a link\n');
			expectStable('[not a link\n');
		});

		it('a lone thematic break survives', () => {
			expectByteFaithful('---\n');
		});

		it('garbage input does not throw and stabilizes', () => {
			for (const junk of ['>\u0000<', '```', '* _ **', '| |', '\\', '[](', '> ', '#']) {
				expectStable(junk);
			}
		});
	});

	describe('unicode and emoji', () => {
		it('unicode text is byte-faithful', () => {
			expectByteFaithful('# 你好 🎉\n\nEmoji 👍 and ünïcödé — 日本語。\n');
		});

		it('emoji inside lists and code survives', () => {
			expectByteFaithful('- 🚀 ship it\n\n```\n✅ done\n```\n');
		});
	});

	describe('task lists', () => {
		it('checked state survives byte-faithfully', () => {
			expectByteFaithful('- [ ] todo\n- [x] done\n');
		});
	});

	describe('blockquotes', () => {
		it('multi-line and multi-paragraph quotes are byte-faithful', () => {
			expectByteFaithful('> line one\n> line two\n');
			expectByteFaithful('> a\n>\n> b\n');
		});

		it('nested quotes are byte-faithful', () => {
			expectByteFaithful('> outer\n> > inner\n');
		});
	});

	describe('normalizations (documented, stable)', () => {
		it('autolinks normalize to explicit links', () => {
			const once = roundTripMarkdown('<https://example.com>\n');
			expect(once).toBe('[https://example.com](https://example.com)\n');
			expectStable('<https://example.com>\n');
		});

		it('trailing-double-space hard breaks collapse (documented limitation)', () => {
			expect(roundTripMarkdown('a  \nb\n')).toBe('a\nb\n');
			expectStable('a  \nb\n');
		});

		it('intra-word underscores are escaped once, then stabilize', () => {
			expect(roundTripMarkdown('a_b_c\n')).toBe('a\\_b\\_c\n');
			expectStable('a_b_c\n');
		});
	});

	describe('tiptap JSON bridge', () => {
		const fixtures = [
			'---\ntitle: Hello\ntags: [a, b]\n---\n\n# Body\n\nText.\n',
			'- [ ] todo\n- [x] done\n',
			'\\*stars\\* literal\n',
			'> a\n>\n> b\n',
			'1. one\n   - sub\n2. two\n',
			'```js\nconst x = 1\n```\n',
			'# 你好 🎉\n',
		];

		it('is stable across the fixture set', () => {
			for (const fixture of fixtures) {
				expectJsonBridgeStable(fixture);
			}
		});
	});
});
