export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonSegment = string | number;

function atPath(root: JsonValue, path: JsonSegment[]): JsonValue {
	return path.reduce<JsonValue>((current, segment) => (current as Record<string, JsonValue>)[segment], root);
}

/** Return a formatted JSON document after moving an object key or array item one
 * place. JSON object insertion order is meaningful in a writing workspace, even
 * though it does not affect JSON value equality. */
export function moveJsonNode(content: string, path: JsonSegment[], direction: -1 | 1): string {
	if (!path.length) return content;
	const root = JSON.parse(content) as JsonValue;
	const parent = atPath(root, path.slice(0, -1));
	const segment = path.at(-1)!;
	if (Array.isArray(parent)) {
		const index = Number(segment);
		const next = index + direction;
		if (!Number.isInteger(index) || next < 0 || next >= parent.length) return content;
		[parent[index], parent[next]] = [parent[next], parent[index]];
	} else if (parent !== null && typeof parent === 'object') {
		const object = parent as Record<string, JsonValue>;
		const entries = Object.entries(object);
		const index = entries.findIndex(([key]) => key === segment);
		const next = index + direction;
		if (index < 0 || next < 0 || next >= entries.length) return content;
		[entries[index], entries[next]] = [entries[next], entries[index]];
		for (const key of Object.keys(object)) delete object[key];
		for (const [key, value] of entries) object[key] = value;
	} else return content;
	return JSON.stringify(root, null, 2);
}
