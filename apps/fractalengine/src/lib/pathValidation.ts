export function validateLeafName(name: string): string {
	const trimmed = name.trim();
	if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) {
		throw new Error('Use a single name without slashes or parent-directory segments.');
	}
	return trimmed;
}
