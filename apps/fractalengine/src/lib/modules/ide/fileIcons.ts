/**
 * Filetype-aware icon mapping for the Sidebar explorer.
 * Maps file extensions and specific filenames to icons from /static/iconset/.
 */

// Specific filenames that should match regardless of extension
const filenameMap: Record<string, string> = {
	'Makefile': 'makefile.svg',
	'makefile': 'makefile.svg',
	'Dockerfile': 'welcomeDockerFallback.svg',
	'Cargo.toml': 'cargo.svg',
	'Cargo.lock': 'cargoLock.svg',
	'.gitignore': 'gitignore.svg',
	'package.json': 'npm.svg',
	'package-lock.json': 'npm.svg',
	'yarn.lock': 'yarn.svg',
	'pnpm-lock.yaml': 'yarn.svg',
	'tsconfig.json': 'json.svg',
	'svelte.config.js': 'configFile.svg',
	'vite.config.ts': 'configFile.svg',
	'vite.config.js': 'configFile.svg',
};

// Extension-based mapping (without the dot)
const extensionMap: Record<string, string> = {
	// Rust
	'rs': 'rustFile.svg',

	// Go
	'go': 'go.svg',
	'work': 'goWork.svg',
	'sum': 'goSum.svg',
	'mod': 'goMod.svg',

	// Python
	'py': 'python.svg',
	'pyc': 'pythonClosed.svg',
	'pyo': 'pythonClosed.svg',
	'pyd': 'pythonClosed.svg',
	'pyw': 'python.svg',
	'ipynb': 'jupyter.svg',

	// JavaScript
	'js': 'js.svg',
	'mjs': 'js.svg',
	'cjs': 'js.svg',
	'jsx': 'jsx.svg',

	// TypeScript
	'ts': 'typeScript.svg',
	'tsx': 'tsx.svg',
	'mts': 'typeScript.svg',
	'cts': 'typeScript.svg',

	// Web
	'html': 'html.svg',
	'htm': 'html.svg',
	'css': 'css.svg',
	'scss': 'sass.svg',
	'sass': 'sass.svg',
	'less': 'less.svg',
	'styl': 'stylus.svg',
	'svelte': 'svelte.svg',

	// Data / markup
	'json': 'json.svg',
	'xml': 'xml.svg',
	'xsd': 'xml.svg',
	'xsl': 'xml.svg',
	'yaml': 'yaml.svg',
	'yml': 'yaml.svg',
	'toml': 'toml.svg',
	'md': 'markdown.svg',
	'mdx': 'markdown.svg',
	'csv': 'csv.svg',

	// Shell / scripts
	'sh': 'shell.svg',
	'bash': 'shell.svg',
	'zsh': 'shell.svg',
	'fish': 'shell.svg',

	// Java ecosystem
	'java': 'javaClass.svg',
	'class': 'java.svg',
	'jar': 'archive.svg',
	'kt': 'kotlin.svg',
	'kts': 'kotlin.svg',
	'gradle': 'gradle.svg',

	// C/C++
	'c': 'c.svg',
	'h': 'h.svg',
	'cpp': 'cpp.svg',
	'cc': 'cpp.svg',
	'cxx': 'cpp.svg',
	'hpp': 'h.svg',
	'hxx': 'h.svg',

	// Dart
	'dart': 'dart.svg',

	// SQL / DB
	'sql': 'sqlFile.svg',
	'db': 'database.svg',
	'sqlite': 'database.svg',
	'sqlite3': 'database.svg',

	// GraphQL
	'graphql': 'graphql.svg',
	'gql': 'graphql.svg',

	// Image files
	'png': 'image.svg',
	'jpg': 'image.svg',
	'jpeg': 'image.svg',
	'gif': 'image.svg',
	'svg': 'image.svg',
	'ico': 'image.svg',
	'webp': 'image.svg',
	'bmp': 'image.svg',

	// Archive / compression
	'zip': 'archive.svg',
	'tar': 'archive.svg',
	'gz': 'archive.svg',
	'rar': 'archive.svg',
	'7z': 'archive.svg',

	// Config / misc
	'env': 'configFile.svg',
	'editorconfig': 'configFile.svg',
	'prettierrc': 'configFile.svg',
	'eslintrc': 'eslint.svg',

	// General text
	'txt': 'fileUnread.svg',
	'log': 'documentation.svg',

	// Docker / k8s
	'proto': 'idl.svg',
	'wasm': 'wasmPack.svg',
};

/**
 * Returns the icon path for a file based on its name and extension.
 * Falls back to fileUnread.svg for unknown file types.
 */
export function getFileIcon(name: string): string {
	// 1. Try exact filename match first
	if (filenameMap[name]) {
		return `/iconset/${filenameMap[name]}`;
	}

	// 2. Try extension-based match
	const dotIndex = name.lastIndexOf('.');
	if (dotIndex > 0) {
		const ext = name.slice(dotIndex + 1).toLowerCase();
		if (extensionMap[ext]) {
			return `/iconset/${extensionMap[ext]}`;
		}
	}

	// 3. Check for dotfiles (like .eslintrc, .prettierrc — no extension after dot)
	// If it starts with a dot, look it up by stripping the leading dot
	if (name.startsWith('.') && name.length > 1) {
		const dotfileName = name.slice(1).toLowerCase();
		if (extensionMap[dotfileName]) {
			return `/iconset/${extensionMap[dotfileName]}`;
		}
	}

	// 4. Fallback
	return '/iconset/fileUnread.svg';
}
