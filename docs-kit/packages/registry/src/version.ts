interface SemanticVersion {
	major: number;
	minor: number;
	patch: number;
}

function parseVersion(value: string): SemanticVersion | undefined {
	const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value.trim().replace(/^v/, ''));
	if (!match) {
		return undefined;
	}

	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3])
	};
}

function compare(left: SemanticVersion, right: SemanticVersion): number {
	return (
		left.major - right.major || left.minor - right.minor || left.patch - right.patch
	);
}

/**
 * Evaluates the range subset registry items are allowed to declare: `*`, an exact version,
 * `^`, `~`, and comparison operators, optionally space-separated as an AND list.
 *
 * The subset is deliberate: a registry item that cannot state its compatibility in these
 * terms should publish a new item rather than rely on complex ranges.
 */
export function satisfiesFrameworkVersion(version: string, range: string): boolean {
	const target = parseVersion(version);
	if (!target) {
		return false;
	}

	return range
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.every((expression) => {
			if (expression === '*' || expression === 'x') {
				return true;
			}

			const operator = /^(>=|<=|>|<|\^|~|=)?\s*(.+)$/.exec(expression);
			const bound = parseVersion(operator?.[2] ?? '');
			if (!bound) {
				return false;
			}

			switch (operator?.[1]) {
				case '>':
					return compare(target, bound) > 0;
				case '>=':
					return compare(target, bound) >= 0;
				case '<':
					return compare(target, bound) < 0;
				case '<=':
					return compare(target, bound) <= 0;
				case '^':
					return (
						compare(target, bound) >= 0 &&
						(bound.major > 0
							? target.major === bound.major
							: target.major === 0 && target.minor === bound.minor)
					);
				case '~':
					return (
						compare(target, bound) >= 0 &&
						target.major === bound.major &&
						target.minor === bound.minor
					);
				default:
					return compare(target, bound) === 0;
			}
		});
}
