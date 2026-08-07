type ClassValue = string | false | null | undefined;

type TVVariants = Record<string, Record<string, string>>;

type TVConfig = {
	base?: string;
	variants?: TVVariants;
	defaultVariants?: Record<string, string | boolean | undefined>;
	compoundVariants?: Array<Record<string, unknown> & { class?: string | string[] }>;
};

type TVProps = Record<string, unknown> & {
	class?: ClassValue;
	className?: ClassValue;
};

function join(...parts: ClassValue[]): string {
	return parts.filter(Boolean).join(' ');
}

/**
 * Minimal stand-in for tailwind-variants `tv`.
 * Resolves base + variants + defaultVariants + class/className.
 * compoundVariants are applied in a simple best-effort way.
 */
export function tv(config: TVConfig) {
	const variants = config.variants ?? {};
	const defaults = config.defaultVariants ?? {};
	const compounds = config.compoundVariants ?? [];

	return (props: TVProps = {}) => {
		const classes: string[] = [];

		if (config.base) classes.push(config.base);

		// Resolve each variant slot
		for (const [key, mapping] of Object.entries(variants)) {
			const raw = props[key] !== undefined ? props[key] : defaults[key];
			if (raw === undefined || raw === null || raw === false) continue;
			const value = String(raw);
			if (mapping[value]) classes.push(mapping[value]);
		}

		// Best-effort compound variants
		for (const rule of compounds) {
			const { class: compoundClass, ...conditions } = rule;
			const match = Object.entries(conditions).every(([key, expected]) => {
				const raw = props[key] !== undefined ? props[key] : defaults[key];
				return String(raw) === String(expected);
			});
			if (match && compoundClass) {
				if (Array.isArray(compoundClass)) classes.push(...compoundClass.filter(Boolean));
				else classes.push(compoundClass);
			}
		}

		if (props.class) classes.push(String(props.class));
		if (props.className) classes.push(String(props.className));

		return join(...classes);
	};
}

/**
 * Stand-in for VariantProps<typeof x>.
 * Props accepted by a `tv()` result, minus class/className.
 */
export type VariantProps<T extends (...args: never[]) => unknown> = Omit<
	NonNullable<Parameters<T>[0]>,
	'class' | 'className'
>;