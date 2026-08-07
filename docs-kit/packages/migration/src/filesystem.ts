import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

/** The read-only view a migrator has of the source project. */
export interface MigrationFileSystem {
	exists(path: string): Promise<boolean>;
	read(path: string): Promise<string | undefined>;
	/** Lists files recursively below `directory`, as project-relative POSIX paths. */
	list(directory: string): Promise<string[]>;
}

function toPosix(path: string): string {
	return path.replace(/\\/g, '/');
}

/** Reads from a real project directory. Migration never writes through this interface. */
export function createNodeMigrationFileSystem(root: string): MigrationFileSystem {
	const rootPath = resolve(root);

	const within = (path: string): string => {
		const target = resolve(rootPath, path);
		const relativePath = relative(rootPath, target);
		if (relativePath.startsWith('..')) {
			throw new Error(`Refusing to read outside the source project: ${path}`);
		}
		return target;
	};

	return {
		async exists(path) {
			try {
				await stat(within(path));
				return true;
			} catch {
				return false;
			}
		},
		async read(path) {
			try {
				return await readFile(within(path), 'utf8');
			} catch {
				return undefined;
			}
		},
		async list(directory) {
			const base = within(directory);
			const files: string[] = [];

			const walk = async (current: string): Promise<void> => {
				let entries;
				try {
					entries = await readdir(current, { withFileTypes: true });
				} catch {
					return;
				}

				for (const entry of entries) {
					if (entry.name.startsWith('.') || entry.name === 'node_modules') {
						continue;
					}

					const path = join(current, entry.name);
					if (entry.isDirectory()) {
						await walk(path);
					} else if (entry.isFile()) {
						files.push(toPosix(relative(rootPath, path)));
					}
				}
			};

			await walk(base);
			return files.sort();
		}
	};
}

/** In-memory project, used by fixtures and tests. */
export function createMemoryMigrationFileSystem(
	files: Record<string, string>
): MigrationFileSystem {
	const normalized = new Map(Object.entries(files).map(([path, content]) => [toPosix(path), content]));

	return {
		async exists(path) {
			const key = toPosix(path);
			return normalized.has(key) || [...normalized.keys()].some((file) => file.startsWith(`${key}/`));
		},
		async read(path) {
			return normalized.get(toPosix(path));
		},
		async list(directory) {
			const prefix = directory === '' || directory === '.' ? '' : `${toPosix(directory)}/`;
			return [...normalized.keys()].filter((file) => file.startsWith(prefix)).sort();
		}
	};
}
