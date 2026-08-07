import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

const workspaceRoots = ['packages', 'apps', 'examples'];

const projects = workspaceRoots.flatMap((workspaceRoot) => {
	if (!existsSync(workspaceRoot)) {
		return [];
	}

	return readdirSync(workspaceRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(workspaceRoot, entry.name, 'vitest.config.ts'))
		.filter((configPath) => existsSync(configPath));
});

export default defineConfig({
	test: {
		passWithNoTests: true,
		...(projects.length > 0 ? { projects } : {})
	}
});
