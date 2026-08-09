import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import {
	createTemplate,
	deleteTemplate,
	parseTemplateFiles,
	parseTemplateTitle,
	projectTemplates,
	renameTemplate,
	sanitizeTemplateName,
} from './templates';

describe('templates store and file parsing', () => {
	it('sanitizes template names and parses titles correctly', () => {
		expect(sanitizeTemplateName('My Template')).toBe('My Template.md');
		expect(sanitizeTemplateName('My Template.md')).toBe('My Template.md');
		expect(sanitizeTemplateName('  ')).toBe('Untitled Template.md');

		expect(parseTemplateTitle('My Template.md')).toBe('My Template');
		expect(parseTemplateTitle('Note.MD')).toBe('Note');
	});

	it('filters template files from project file listings', () => {
		const files = [
			{ path: '/content/Doc.md', name: 'Doc.md', kind: 'file' },
			{ path: '/.ok/templates/Sprint Plan.md', name: 'Sprint Plan.md', kind: 'file' },
			{ path: '/.ok/templates/sub', name: 'sub', kind: 'folder' },
		];

		const templateNames = parseTemplateFiles(files);
		expect(templateNames).toHaveLength(1);
		expect(templateNames[0]).toBe('Sprint Plan.md');
	});

	it('performs in-memory template CRUD operations fallback', async () => {
		projectTemplates.set([]);

		const created = await createTemplate(null, 'Meeting Notes', '# Meeting Notes\n', 'Custom notes');
		expect(created.title).toBe('Meeting Notes');
		expect(get(projectTemplates)).toHaveLength(1);
		expect(get(projectTemplates)[0].name).toBe('Meeting Notes.md');

		await renameTemplate(null, 'Meeting Notes.md', 'Weekly Sync');
		expect(get(projectTemplates)[0].title).toBe('Weekly Sync');

		await deleteTemplate(null, 'Weekly Sync.md');
		expect(get(projectTemplates)).toHaveLength(0);
	});
});
