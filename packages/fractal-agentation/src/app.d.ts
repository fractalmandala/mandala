declare global {
	namespace App {}

	/** Minimal Node-style `process` used by dev-only warn guards in browser builds. */
	var process: { env?: { NODE_ENV?: string } } | undefined;
}

export {};