import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const tauriRoot = join(root, 'src-tauri');
const capabilityDirectory = join(tauriRoot, 'capabilities');

type Capability = {
	identifier?: string;
	permissions?: unknown;
	webviews?: unknown;
};

function readCapabilities(): Array<{ path: string; capability: Capability }> {
	return readdirSync(capabilityDirectory)
		.filter((name) => name.endsWith('.json'))
		.map((name) => {
			const path = join(capabilityDirectory, name);
			try {
				return { path, capability: JSON.parse(readFileSync(path, 'utf8')) as Capability };
			} catch (error) {
				throw new Error(`Security boundary violated: ${path.slice(root.length + 1)} must be valid capability JSON.`, { cause: error });
			}
		});
}

describe('native security configuration contracts', () => {
	it('keeps the Tauri CSP enabled and blocks script/object injection', () => {
		const config = JSON.parse(readFileSync(join(tauriRoot, 'tauri.conf.json'), 'utf8')) as {
			app?: { security?: { csp?: unknown } };
		};
		const csp = config.app?.security?.csp;

		expect(csp, 'Security boundary violated: Tauri CSP must be a non-null string.').toEqual(expect.any(String));
		const scriptSource = (csp as string).match(/(?:^|;)\s*script-src\s+([^;]+)/i)?.[1] ?? '';
		expect(scriptSource, 'Security boundary violated: script-src must allow only app-authored scripts via \'self\'.').toContain("'self'");
		expect(scriptSource, 'Security boundary violated: script-src must not allow unsafe inline scripts or eval.').not.toMatch(/'unsafe-(?:inline|eval)'/i);
		expect(csp, 'Security boundary violated: object-src must be set to \'none\'.').toMatch(/(?:^|;)\s*object-src\s+'none'(?:\s*;|$)/i);
	});

	it('keeps untrusted browser content and broad native grants out of capabilities', () => {
		const capabilities = readCapabilities();
		expect(capabilities, 'Security boundary violated: at least one Tauri capability file must exist.').not.toEqual([]);

		for (const { path, capability } of capabilities) {
			const label = path.slice(root.length + 1);
			const permissions = capability.permissions;
			expect(Array.isArray(permissions), `Security boundary violated: ${label} permissions must parse as an array.`).toBe(true);
			for (const permission of permissions as unknown[]) {
				expect(typeof permission, `Security boundary violated: ${label} contains a non-string permission.`).toBe('string');
				expect(permission as string, `Security boundary violated: ${label} grants shell command execution.`).not.toMatch(/^shell:.*(?:execute|spawn)/i);
				expect(permission as string, `Security boundary violated: ${label} grants filesystem access outside the native authorization gate.`).not.toMatch(/^fs:/i);
			}

			const webviews = capability.webviews;
			if (webviews !== undefined) {
				expect(Array.isArray(webviews), `Security boundary violated: ${label} webviews must parse as an array.`).toBe(true);
				expect(webviews as unknown[], `Security boundary violated: ${label} grants IPC to the untrusted browser-content webview.`).not.toContain('browser-content');
			}
		}
	});

	it('does not track credential fixtures in static or native sources', () => {
		const trackedFiles = execFileSync('git', ['ls-files', 'static', 'src-tauri'], {
			cwd: root,
			encoding: 'utf8'
		})
			.split('\n')
			.filter(Boolean);
		const credentialFixture = /bitwarden|passwords.*\.json|\.(?:pem|p12)$/i;
		const offenders = trackedFiles.filter((path) => credentialFixture.test(path));

		expect(offenders, 'Security boundary violated: tracked credential fixtures must not ship in static/ or src-tauri/.').toEqual([]);
	});

	it('retains the OS keychain dependency for secrets at rest', () => {
		const cargoToml = readFileSync(join(tauriRoot, 'Cargo.toml'), 'utf8');
		expect(cargoToml, 'Security boundary violated: Cargo.toml must retain the keyring dependency used for credential storage.').toMatch(/^keyring\s*=/m);
	});
});
