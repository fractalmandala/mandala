type ClassValue =
	| string
	| number
	| null
	| undefined
	| false
	| Record<string, boolean>
	| ClassValue[];

/** Join class names, filtering falsy values. Accepts strings, arrays, and
 * record maps (keys with truthy values win). No tailwind-merge: CUBE
 * bracket groups are order-independent in this system. */
export function cn(...inputs: ClassValue[]): string {
	const out: string[] = [];
	const push = (value: ClassValue) => {
		if (!value) return;
		if (typeof value === 'string' || typeof value === 'number') {
			out.push(String(value));
		} else if (Array.isArray(value)) {
			value.forEach(push);
		} else {
			for (const [key, active] of Object.entries(value)) {
				if (active) out.push(key);
			}
		}
	};
	inputs.forEach(push);
	return out.join(' ');
}
