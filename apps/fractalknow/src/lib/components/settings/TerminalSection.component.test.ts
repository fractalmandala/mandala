import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import TerminalSection from './TerminalSection.svelte';
import { shellPreferences } from '$lib/shell/preferences';

describe('TerminalSection component', () => {
	it('renders all terminal preferences controls and binds to store state', async () => {
		shellPreferences.update((prev) => ({
			...prev,
			terminalEnabled: true,
			autoApproveOkTools: true,
			terminalFontSize: 13,
			terminalFontFamily: 'Menlo',
			terminalScrollback: 1000,
			terminalCursorStyle: 'block',
			terminalCursorBlink: true,
			terminalShellPath: '',
		}));

		const { getByTestId } = render(TerminalSection);

		const toggle = getByTestId('settings-terminal-toggle') as HTMLInputElement;
		const autoApproveToggle = getByTestId('settings-terminal-autoapprove-toggle') as HTMLInputElement;
		const fontSizeInput = getByTestId('settings-terminal-font-size') as HTMLInputElement;
		const fontFamilyInput = getByTestId('settings-terminal-font-family') as HTMLInputElement;
		const scrollbackInput = getByTestId('settings-terminal-scrollback') as HTMLInputElement;
		const cursorStyleSelect = getByTestId('settings-terminal-cursor-style') as HTMLSelectElement;
		const cursorBlinkToggle = getByTestId('settings-terminal-cursor-blink') as HTMLInputElement;
		const shellPathInput = getByTestId('settings-terminal-shell-path') as HTMLInputElement;

		expect(toggle.checked).toBe(true);
		expect(autoApproveToggle.checked).toBe(true);
		expect(fontSizeInput.value).toBe('13');
		expect(fontFamilyInput.value).toBe('Menlo');
		expect(scrollbackInput.value).toBe('1000');
		expect(cursorStyleSelect.value).toBe('block');
		expect(cursorBlinkToggle.checked).toBe(true);
		expect(shellPathInput.value).toBe('');

		// Interact with controls
		await fireEvent.click(toggle);
		expect(get(shellPreferences).terminalEnabled).toBe(false);

		await fireEvent.change(fontSizeInput, { target: { value: '16' } });
		expect(get(shellPreferences).terminalFontSize).toBe(16);

		await fireEvent.change(shellPathInput, { target: { value: '/bin/bash' } });
		expect(get(shellPreferences).terminalShellPath).toBe('/bin/bash');

		await fireEvent.change(cursorStyleSelect, { target: { value: 'underline' } });
		expect(get(shellPreferences).terminalCursorStyle).toBe('underline');
	});
});
