import { splitDocsFrontmatter } from '@docs-kit/core/markdown';

export type DocsFrontmatterValue =
	| string
	| number
	| boolean
	| DocsFrontmatterValue[]
	| { [key: string]: DocsFrontmatterValue };

export interface ParsedDocsFrontmatter {
	data: Record<string, DocsFrontmatterValue>;
	body: string;
	/** Raw lines the conservative parser did not understand. Never discarded silently. */
	unparsed: Array<{ line: number; text: string }>;
}

function parseScalar(raw: string): DocsFrontmatterValue {
	const value = raw.trim();

	if (value === 'true' || value === 'false') {
		return value === 'true';
	}
	if (value !== '' && !Number.isNaN(Number(value)) && /^-?\d+(?:\.\d+)?$/.test(value)) {
		return Number(value);
	}
	if (/^\[.*\]$/.test(value)) {
		return value
			.slice(1, -1)
			.split(',')
			.map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
			.filter((entry) => entry !== '');
	}

	return value.replace(/^['"]|['"]$/g, '');
}

/**
 * Parses the YAML subset documentation frontmatter actually uses: scalars, inline arrays,
 * block sequences, and one level of nesting. Anything else is reported rather than dropped.
 */
export function parseDocsFrontmatter(source: string): ParsedDocsFrontmatter {
	const { frontmatter, body } = splitDocsFrontmatter(source);
	const data: Record<string, DocsFrontmatterValue> = {};
	const unparsed: Array<{ line: number; text: string }> = [];

	if (frontmatter === '') {
		return { data, body, unparsed };
	}

	const lines = frontmatter.split('\n');
	let currentKey: string | undefined;
	let nestedKey: string | undefined;

	lines.forEach((line, index) => {
		if (line.trim() === '' || line.trim().startsWith('#')) {
			return;
		}

		const indent = line.length - line.trimStart().length;
		const trimmed = line.trim();

		if (trimmed.startsWith('- ')) {
			const target = indent > 0 && nestedKey && currentKey ? nestedKey : currentKey;
			if (!target) {
				unparsed.push({ line: index + 1, text: line });
				return;
			}

			const container =
				indent > 0 && nestedKey && currentKey
					? ((data[currentKey] ??= {}) as Record<string, DocsFrontmatterValue>)
					: data;
			const existing = container[target];
			const list = Array.isArray(existing) ? existing : [];
			list.push(parseScalar(trimmed.slice(2)));
			container[target] = list;
			return;
		}

		const pair = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(trimmed);
		if (!pair?.[1]) {
			unparsed.push({ line: index + 1, text: line });
			return;
		}

		const key = pair[1];
		const rawValue = pair[2] ?? '';

		if (indent > 0 && currentKey) {
			const parent = (data[currentKey] ??= {}) as Record<string, DocsFrontmatterValue>;
			if (typeof parent !== 'object' || Array.isArray(parent)) {
				unparsed.push({ line: index + 1, text: line });
				return;
			}
			parent[key] = rawValue === '' ? {} : parseScalar(rawValue);
			nestedKey = key;
			return;
		}

		currentKey = key;
		nestedKey = undefined;
		data[key] = rawValue === '' ? {} : parseScalar(rawValue);
	});

	return { data, body, unparsed };
}

function serializeValue(value: DocsFrontmatterValue): string {
	if (Array.isArray(value)) {
		return `[${value.map((entry) => serializeValue(entry)).join(', ')}]`;
	}
	if (typeof value === 'object') {
		return `{${Object.entries(value)
			.map(([key, entry]) => `${key}: ${serializeValue(entry)}`)
			.join(', ')}}`;
	}
	if (typeof value === 'string') {
		return /^[\w./ -]*$/.test(value) && value !== '' ? value : `'${value.replace(/'/g, "''")}'`;
	}

	return String(value);
}

/** Serializes frontmatter with stable key order so migrations are reproducible. */
export function serializeDocsFrontmatter(data: Record<string, DocsFrontmatterValue>): string {
	const entries = Object.entries(data).filter(([, value]) => value !== undefined);
	if (entries.length === 0) {
		return '';
	}

	return `---\n${entries.map(([key, value]) => `${key}: ${serializeValue(value)}`).join('\n')}\n---\n`;
}
