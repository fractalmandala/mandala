import { fireEvent, render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { BUNDLED_SKILLS, skillsStore, skillTargetsStore } from '$lib/shell/skills';
import SkillsSection from './SkillsSection.svelte';

describe('SkillsSection component', () => {
	it('lists skills from the pipeline and renders target pickers', async () => {
		skillsStore.set([
			...BUNDLED_SKILLS,
			{
				id: 'project:custom-refactor',
				name: 'custom-refactor',
				description: 'Refactor project code safely',
				scope: 'project',
				enabled: true,
				path: '/.ok/skills/custom-refactor/SKILL.md',
			},
		]);

		const { getByTestId } = render(SkillsSection);

		expect(getByTestId('settings-skills-section')).toBeTruthy();
		expect(getByTestId('skill-targets-picker')).toBeTruthy();
		expect(getByTestId('skills-group-bundled')).toBeTruthy();
		expect(getByTestId('skills-group-project')).toBeTruthy();

		expect(getByTestId('skill-row-antigravity-guide')).toBeTruthy();
		expect(getByTestId('skill-row-project:custom-refactor')).toBeTruthy();

		const claudeTarget = getByTestId('skill-target-claude') as HTMLInputElement;
		expect(claudeTarget.checked).toBe(true);

		await fireEvent.click(claudeTarget);
		expect(get(skillTargetsStore).claude).toBe(false);

		const metaToggle = getByTestId('skill-meta-toggle-antigravity-guide');
		await fireEvent.click(metaToggle);
		expect(getByTestId('skill-meta-details-antigravity-guide')).toBeTruthy();
	});
});
