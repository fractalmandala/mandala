import type { MigrationReport } from './report.js';

export interface ConvertContentOptions {
	file: string;
	report: MigrationReport;
}

const calloutTypes: Record<string, string> = {
	note: 'note',
	info: 'note',
	tip: 'tip',
	success: 'tip',
	warn: 'warning',
	warning: 'warning',
	caution: 'warning',
	danger: 'danger',
	error: 'danger'
};

function lineOf(source: string, index: number): number {
	return source.slice(0, index).split('\n').length;
}

function attributes(raw: string): Record<string, string> {
	const result: Record<string, string> = {};
	for (const match of raw.matchAll(/([A-Za-z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\})/g)) {
		const key = match[1];
		if (key) {
			result[key] = match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
		}
	}
	return result;
}

function directiveAttributes(values: Record<string, string | undefined>): string {
	const entries = Object.entries(values).filter(([, value]) => value !== undefined && value !== '');
	return entries.length === 0
		? ''
		: `{${entries.map(([key, value]) => `${key}="${value}"`).join(' ')}}`;
}

/** Converts `<Callout type="warn">` style elements into framework directives. */
function convertCallouts(source: string): string {
	return source.replace(
		/<(Callout|Aside|Admonition)([^>]*)>([\s\S]*?)<\/\1>/g,
		(_match, _name, rawAttributes: string, body: string) => {
			const parsed = attributes(rawAttributes);
			const kind = calloutTypes[(parsed['type'] ?? 'note').toLowerCase()] ?? 'note';
			const title = parsed['title'];

			return `:::${kind}${directiveAttributes({ title })}\n${body.trim()}\n:::`;
		}
	);
}

/** Converts `<Tabs>` / `<Tab>` and `<TabItem>` elements into the tabs directive. */
function convertTabs(source: string): string {
	return source.replace(/<Tabs[^>]*>([\s\S]*?)<\/Tabs>/g, (_match, body: string) => {
		const tabs = [...body.matchAll(/<(Tab|TabItem)([^>]*)>([\s\S]*?)<\/\1>/g)].map((match) => {
			const parsed = attributes(match[2] ?? '');
			const label = parsed['label'] ?? parsed['value'] ?? parsed['title'] ?? 'Tab';
			return `@tab ${label}\n\n${(match[3] ?? '').trim()}`;
		});

		return tabs.length === 0 ? _match : `:::tabs\n\n${tabs.join('\n\n')}\n\n:::`;
	});
}

/** Converts `<Steps>` and `<Cards>` groups into their directives. */
function convertGroups(source: string): string {
	return source
		.replace(/<Steps[^>]*>([\s\S]*?)<\/Steps>/g, (_match, body: string) => {
			const steps = [...body.matchAll(/<Step([^>]*)>([\s\S]*?)<\/Step>/g)];
			if (steps.length === 0) {
				return `:::steps\n\n${body.trim()}\n\n:::`;
			}

			const rendered = steps
				.map((step) => {
					const parsed = attributes(step[1] ?? '');
					const title = parsed['title'] ?? 'Step';
					return `## ${title}\n\n${(step[2] ?? '').trim()}`;
				})
				.join('\n\n');

			return `:::steps\n\n${rendered}\n\n:::`;
		})
		.replace(/<Cards[^>]*>([\s\S]*?)<\/Cards>/g, (_match, body: string) => {
			const cards = [...body.matchAll(/<Card([^>]*?)(?:\/>|>([\s\S]*?)<\/Card>)/g)].map((card) => {
				const parsed = attributes(card[1] ?? '');
				return `::card${directiveAttributes({ title: parsed['title'], href: parsed['href'] ?? parsed['link'] })}\n${(
					card[2] ?? parsed['description'] ?? ''
				).trim()}\n::`;
			});

			return cards.length === 0 ? _match : `:::cards\n\n${cards.join('\n\n')}\n\n:::`;
		});
}

/** Converts Docusaurus and VitePress `::: type Title` containers. */
function convertContainers(source: string): string {
	return source.replace(/^:::[ \t]*([a-zA-Z]+)([^\n]*)$/gm, (match, kind: string, rest: string) => {
		const mapped = calloutTypes[kind.toLowerCase()];
		// A line that already carries directive attributes was produced by an earlier pass.
		if (!mapped || rest.trimStart().startsWith('{')) {
			return match;
		}

		const title = rest.trim().replace(/^\[|\]$/g, '');
		return `:::${mapped}${directiveAttributes({ title: title === '' ? undefined : title })}`;
	});
}

/** Converts MkDocs `!!! note "Title"` admonitions, including their indented bodies. */
function convertMkDocsAdmonitions(source: string): string {
	const lines = source.split('\n');
	const output: string[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] as string;
		const admonition = /^(\s*)(?:!!!|\?\?\?\+?)\s+([a-zA-Z]+)(?:\s+"([^"]*)")?\s*$/.exec(line);

		if (!admonition) {
			output.push(line);
			continue;
		}

		const kind = calloutTypes[(admonition[2] ?? '').toLowerCase()] ?? 'note';
		const body: string[] = [];
		let cursor = index + 1;

		while (cursor < lines.length) {
			const next = lines[cursor] as string;
			if (next.trim() === '') {
				body.push('');
				cursor += 1;
				continue;
			}
			if (!/^\s{4,}/.test(next)) {
				break;
			}
			body.push(next.replace(/^\s{4}/, ''));
			cursor += 1;
		}

		output.push(`:::${kind}${directiveAttributes({ title: admonition[3] })}`);
		output.push(...body.join('\n').trim().split('\n'));
		output.push(':::');
		index = cursor - 1;
	}

	return output.join('\n');
}

const unsupportedPatterns: Array<{ pattern: RegExp; message: string }> = [
	{
		pattern: /^import\s+.*\s+from\s+['"].*['"];?$/gm,
		message: 'Module import removed. Re-add it in a `.svx` file if the page needs a component.'
	},
	{
		pattern: /^export\s+(const|default|function)\b.*$/gm,
		message: 'MDX export removed. Move page metadata into frontmatter.'
	},
	{
		pattern: /\{\{#(include|playground|rustdoc_include)[^}]*\}\}/g,
		message: 'mdBook preprocessor directive is not supported. Inline the content manually.'
	},
	{
		pattern: /<[A-Z][A-Za-z0-9]*(?:\s[^>]*)?\/?>/g,
		message: 'Unconverted component. Map it to a directive or a Svelte component in a `.svx` file.'
	}
];

/**
 * Reports syntax a migration cannot convert.
 * The original text is kept in the output and echoed in the report, so a migration never
 * silently discards content.
 */
export function reportUnsupportedSyntax(
	source: string,
	options: ConvertContentOptions
): void {
	for (const { pattern, message } of unsupportedPatterns) {
		for (const match of source.matchAll(pattern)) {
			if (match.index === undefined) {
				continue;
			}

			options.report.add({
				severity: 'warning',
				code: 'UNSUPPORTED_SYNTAX',
				file: options.file,
				line: lineOf(source, match.index),
				message,
				snippet: match[0].slice(0, 200)
			});
		}
	}
}

export interface ConvertMarkdownOptions extends ConvertContentOptions {
	/** Convert MkDocs admonitions. Off unless the source project uses them. */
	mkdocsAdmonitions?: boolean;
	/** Strip MDX imports and exports. On for MDX-based sources. */
	stripMdxStatements?: boolean;
}

/** Runs every component conversion, then reports whatever remains unconverted. */
export function convertMarkdown(source: string, options: ConvertMarkdownOptions): string {
	let output = source;

	if (options.mkdocsAdmonitions) {
		output = convertMkDocsAdmonitions(output);
	}

	output = convertCallouts(output);
	output = convertTabs(output);
	output = convertGroups(output);
	output = convertContainers(output);

	if (options.stripMdxStatements) {
		reportUnsupportedSyntax(output, options);
		output = output
			.replace(/^import\s+.*\s+from\s+['"].*['"];?\n?/gm, '')
			.replace(/^export\s+(?:const|default|function)\b.*\n?/gm, '')
			.replace(/\n{3,}/g, '\n\n');
	} else {
		reportUnsupportedSyntax(output, options);
	}

	return output.trimStart();
}
