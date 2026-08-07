import { describe, expect, it } from 'vitest';
import { validateLeafName } from '$lib/pathValidation';

describe('workspace leaf-name validation', () => {
	it.each(['../escape', '..\\escape', '..', '.', '/absolute', 'nested/file', 'nul\0byte'])('rejects %s', (value) => {
		expect(() => validateLeafName(value)).toThrow();
	});

	it('trims and accepts a normal filename', () => {
		expect(validateLeafName('  notes.md  ')).toBe('notes.md');
	});
});
