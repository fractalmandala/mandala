// Extracts a display-safe message from a caught value of unknown type — used across catch
// blocks so `unknown` can replace `any` without repeating the same instanceof/String dance
// at every call site.
export function errorMessage(e: unknown): string {
	if (e instanceof Error) return e.message;
	if (typeof e === 'string') return e;
	return String(e);
}
