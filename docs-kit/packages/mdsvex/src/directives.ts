/** Directive name → component name. Overriding a mapping swaps the component. */
export type DocsDirectiveComponents = Record<string, string>;

export const defaultDirectiveComponents: DocsDirectiveComponents = {
	note: 'Callout',
	info: 'Callout',
	tip: 'Callout',
	warning: 'Callout',
	danger: 'Callout',
	tabs: 'Tabs',
	tab: 'Tab',
	steps: 'Steps',
	cards: 'Cards',
	card: 'Card',
	codegroup: 'CodeGroup',
	columns: 'Columns',
	frame: 'Frame',
	mermaid: 'Mermaid'
};

const calloutKinds = new Set(['note', 'info', 'tip', 'warning', 'danger']);

export interface TransformDocsDirectivesOptions {
	components?: DocsDirectiveComponents;
}

interface Attributes {
	[key: string]: string;
}

function parseAttributes(raw: string): Attributes {
	const attributes: Attributes = {};
	if (raw.trim() === '') {
		return attributes;
	}

	const body = raw.trim().replace(/^\{|\}$/g, '');
	for (const match of body.matchAll(/([A-Za-z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
		const key = match[1];
		if (key) {
			attributes[key] = match[2] ?? match[3] ?? '';
		}
	}

	// A bare value, as in `:::warning{Before you begin}`, becomes the title.
	const bare = /^\{([^}=]+)\}$/.exec(raw.trim());
	if (bare?.[1] && Object.keys(attributes).length === 0) {
		attributes['title'] = bare[1].trim();
	}

	return attributes;
}

function escapeAttribute(value: string): string {
	return value.replace(/"/g, '&quot;');
}

function renderAttributes(attributes: Attributes): string {
	return Object.entries(attributes)
		.filter(([, value]) => value !== '')
		.map(([key, value]) => ` ${key}="${escapeAttribute(value)}"`)
		.join('');
}

interface TransformState {
	/** Component names the transform emitted, so imports can be injected for exactly these. */
	used: Set<string>;
}

interface Block {
	marker: string;
	name: string;
	attributes: Attributes;
	body: string[];
}

function isFence(line: string): string | undefined {
	return /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]?.[0];
}

/** Splits a `:::tabs` body into `@tab Label` sections. */
function splitTabs(body: readonly string[]): Array<{ label: string; lines: string[] }> {
	const sections: Array<{ label: string; lines: string[] }> = [];
	let fenceMarker: string | undefined;

	for (const line of body) {
		const fence = isFence(line);
		if (fence) {
			fenceMarker = fenceMarker === undefined ? fence : fenceMarker === fence ? undefined : fenceMarker;
		}

		const header = fenceMarker === undefined ? /^@tab\s+(.+?)\s*$/.exec(line) : undefined;
		if (header?.[1]) {
			sections.push({ label: header[1], lines: [] });
			continue;
		}

		sections.at(-1)?.lines.push(line);
	}

	return sections;
}

/**
 * Renders a tab group.
 *
 * Labels are passed to the group as a prop rather than registered by each child, so no
 * component mutates its parent's state during render.
 */
function renderTabGroup(
	block: Block,
	component: string,
	components: DocsDirectiveComponents,
	state: TransformState
): string[] {
	const tabComponent = components['tab'] ?? 'Tab';
	state.used.add(component);
	state.used.add(tabComponent);
	const sections = splitTabs(block.body);

	if (sections.length === 0) {
		return [`<${component}>`, '', ...trimBlankEdges(block.body), '', `</${component}>`];
	}

	const labels = JSON.stringify(sections.map((section) => section.label));
	return [
		`<${component} labels={${labels}}>`,
		'',
		...sections.flatMap((section) => [
			`<${tabComponent} label="${escapeAttribute(section.label)}">`,
			'',
			...trimBlankEdges(transformLines(section.lines, components, state)),
			'',
			`</${tabComponent}>`,
			''
		]),
		`</${component}>`
	];
}

function trimBlankEdges(lines: readonly string[]): string[] {
	const output = [...lines];
	while (output.length > 0 && (output[0] ?? '').trim() === '') {
		output.shift();
	}
	while (output.length > 0 && (output.at(-1) ?? '').trim() === '') {
		output.pop();
	}
	return output;
}

function renderBlock(
	block: Block,
	components: DocsDirectiveComponents,
	state: TransformState
): string[] {
	const component = components[block.name] ?? defaultDirectiveComponents[block.name];
	if (component === undefined) {
		// An unknown directive is left exactly as written rather than silently dropped.
		return [`${block.marker}${block.name}${renderRawAttributes(block.attributes)}`, ...block.body, block.marker];
	}

	const attributes: Attributes = { ...block.attributes };
	if (calloutKinds.has(block.name)) {
		attributes['kind'] = block.name;
	}

	if (block.name === 'tabs' || block.name === 'codegroup') {
		return renderTabGroup(block, component, components, state);
	}

	state.used.add(component);
	const body = trimBlankEdges(transformLines(block.body, components, state));
	return [`<${component}${renderAttributes(attributes)}>`, '', ...body, '', `</${component}>`];
}

function renderRawAttributes(attributes: Attributes): string {
	const entries = Object.entries(attributes);
	return entries.length === 0
		? ''
		: `{${entries.map(([key, value]) => `${key}="${value}"`).join(' ')}}`;
}

function transformLines(
	lines: readonly string[],
	components: DocsDirectiveComponents,
	state: TransformState
): string[] {
	const output: string[] = [];
	let fenceMarker: string | undefined;
	let block: Block | undefined;

	for (const line of lines) {
		const fence = isFence(line);
		if (fence && block === undefined) {
			fenceMarker = fenceMarker === undefined ? fence : fenceMarker === fence ? undefined : fenceMarker;
			output.push(line);
			continue;
		}
		if (fenceMarker !== undefined && block === undefined) {
			output.push(line);
			continue;
		}

		const opening = /^(:{2,})([a-zA-Z][\w-]*)\s*(\{[^\n]*\})?\s*$/.exec(line);
		const closing = /^(:{2,})\s*$/.exec(line);

		if (block === undefined) {
			if (opening?.[1] && opening[2]) {
				block = {
					marker: opening[1],
					name: opening[2].toLowerCase(),
					attributes: parseAttributes(opening[3] ?? ''),
					body: []
				};
				continue;
			}

			output.push(line);
			continue;
		}

		if (closing?.[1] === block.marker) {
			output.push(...renderBlock(block, components, state));
			block = undefined;
			continue;
		}

		block.body.push(line);
	}

	if (block !== undefined) {
		// An unterminated block keeps its original text so nothing is lost.
		output.push(`${block.marker}${block.name}${renderRawAttributes(block.attributes)}`, ...block.body);
	}

	return output;
}

/**
 * Rewrites the directive grammar into component markup before mdsvex compiles the file.
 *
 * The transform runs on the source rather than the mdast tree because mdsvex pins remark 8,
 * which the modern directive plugins are not compatible with. It is fence-aware, so
 * directive-looking text inside a code block is never rewritten.
 */
export function transformDocsDirectives(
	source: string,
	options: TransformDocsDirectivesOptions = {}
): string {
	return transformDocsMarkdown(source, options).code;
}

export interface TransformedDocsMarkdown {
	code: string;
	/** Component names the output references, in deterministic order. */
	components: string[];
}

/**
 * Rewrites ```mermaid fences into a component.
 *
 * The diagram source is passed as a prop rather than left in the document, so the Mermaid
 * runtime is imported only by pages that contain a diagram.
 */
function transformMermaidFences(
	lines: readonly string[],
	component: string,
	state: TransformState
): string[] {
	const output: string[] = [];
	let fence: { marker: string; body: string[] } | undefined;

	for (const line of lines) {
		const opening = /^\s{0,3}(`{3,}|~{3,})mermaid\s*(?:\{([^}]*)\})?\s*$/.exec(line);

		if (fence === undefined) {
			if (opening?.[1]) {
				fence = { marker: opening[1], body: [] };
				continue;
			}
			output.push(line);
			continue;
		}

		if (new RegExp(`^\\s{0,3}${fence.marker[0]}{3,}\\s*$`).test(line)) {
			state.used.add(component);
			output.push(
				`<${component} chart={${JSON.stringify(fence.body.join('\n'))}} />`
			);
			fence = undefined;
			continue;
		}

		fence.body.push(line);
	}

	if (fence !== undefined) {
		// An unterminated fence keeps its original text.
		output.push(`${fence.marker}mermaid`, ...fence.body);
	}

	return output;
}

/** Transforms directives and reports which components the result needs in scope. */
export function transformDocsMarkdown(
	source: string,
	options: TransformDocsDirectivesOptions = {}
): TransformedDocsMarkdown {
	const components = { ...defaultDirectiveComponents, ...(options.components ?? {}) };
	const state: TransformState = { used: new Set() };
	const withDiagrams = transformMermaidFences(
		source.split('\n'),
		components['mermaid'] ?? 'Mermaid',
		state
	);
	const code = transformLines(withDiagrams, components, state).join('\n');

	return { code, components: [...state.used].sort() };
}
