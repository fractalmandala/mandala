import base from './vitest.config';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(base, {
	test: {
		include: ['src/**/*.component.test.ts'],
	},
});
