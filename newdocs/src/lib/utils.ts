/** Compatible with bits-ui / clsx ClassValue (includes bigint & dictionaries). */
export type ClassValue =
	| string
	| number
	| bigint
	| boolean
	| null
	| undefined
	| ClassValue[]
	| Record<string, unknown>;

export function clsx(...inputs: ClassValue[]): string {
	const out: string[] = [];

	for (const input of inputs) {
		if (!input && input !== 0) continue;

		if (Array.isArray(input)) {
			const inner = clsx(...input);
			if (inner) out.push(inner);
			continue;
		}

		if (typeof input === 'object') {
			for (const [key, value] of Object.entries(input)) {
				if (value) out.push(key);
			}
			continue;
		}

		out.push(String(input));
	}

	return out.join(' ');
}

export function twMerge(...inputs: string[]): string {
	return inputs.filter(Boolean).join(' ');
}

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(...inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };