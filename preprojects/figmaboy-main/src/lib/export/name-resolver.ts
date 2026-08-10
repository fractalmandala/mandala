import type { DesignNode, PageDocument } from "$lib/domain";
import type { NamingStrategy } from "./types";

const SLUG_CHARS = /[^a-z0-9]+/g;

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(SLUG_CHARS, "-")
		.replace(/^-+|-+$/g, "") || "element";
}

export function isValidCssIdentStart(char: string): boolean {
	return /[a-z_]/i.test(char);
}

export function ensureValidCssIdent(raw: string): string {
	if (!raw) return "element";
	let result = raw;
	if (!isValidCssIdentStart(result[0])) result = `_${result}`;
	return result.replace(/[^a-z0-9_-]/gi, "-");
}

export class NameResolver {
	private usedNames = new Map<string, number>();
	private assignments = new Map<string, string>();
	private strategy: NamingStrategy;
	private prefix: string;

	constructor(strategy: NamingStrategy, prefix: string) {
		this.strategy = strategy;
		this.prefix = prefix;
	}

	resolve(nodeId: string, nodeName: string): string {
		const existing = this.assignments.get(nodeId);
		if (existing) return existing;

		let base: string;
		if (this.strategy === "prefix" || !nodeName || nodeName === "Untitled") {
			base = `${this.prefix || "el"}-${nodeId.slice(-6)}`;
		} else {
			const slug = slugify(nodeName);
			base = this.prefix ? `${this.prefix}-${slug}` : slug;
		}

		base = ensureValidCssIdent(base);

		const count = this.usedNames.get(base) ?? 0;
		const final = count === 0 ? base : `${base}-${count + 1}`;
		this.usedNames.set(base, count + 1);
		this.assignments.set(nodeId, final);
		return final;
	}
}

export function resolveAllNames(
	document: PageDocument,
	strategy: NamingStrategy,
	prefix: string
): Map<string, string> {
	const resolver = new NameResolver(strategy, prefix);
	const result = new Map<string, string>();

	function walk(ids: string[]) {
		for (const id of ids) {
			const node = document.nodes[id];
			if (!node) continue;
			const className = resolver.resolve(node.id, node.name);
			result.set(node.id, className);
			if (node.type === "frame" || node.type === "group") {
				walk(node.childIds);
			}
		}
	}

	walk(document.rootIds);
	return result;
}
