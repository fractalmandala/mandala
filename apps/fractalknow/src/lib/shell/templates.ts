import { get, writable } from 'svelte/store';
import type { OkDesktopBridge } from '$lib/desktop';
import { projectState } from './projects';

export type ProjectTemplateItem = {
	id: string;
	name: string;
	title: string;
	description: string;
	path: string;
	content: string;
};

export const defaultTemplates: ProjectTemplateItem[] = [
	{
		id: 'blank',
		name: 'Blank Document.md',
		title: 'Blank Document',
		description: 'Create a document without starter content.',
		path: '.ok/templates/Blank Document.md',
		content: '# Untitled\n\n',
	},
	{
		id: 'docs',
		name: 'Documentation Set.md',
		title: 'Documentation Set',
		description: 'Seed docs, assets, and architecture pages.',
		path: '.ok/templates/Documentation Set.md',
		content: '# Documentation\n\n## Overview\n\nDescribe your project architecture here.\n',
	},
	{
		id: 'research',
		name: 'Research Notebook.md',
		title: 'Research Notebook',
		description: 'Create notes, references, and review folders.',
		path: '.ok/templates/Research Notebook.md',
		content: '# Research Notes\n\n## References\n\n- Key reference 1\n',
	},
];

export const projectTemplates = writable<ProjectTemplateItem[]>([]);

export function sanitizeTemplateName(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) return 'Untitled Template.md';
	return trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
}

export function parseTemplateTitle(filename: string): string {
	return filename.replace(/\.md$/i, '').trim();
}

/**
 * Pure function helper for parsing listed template entries into ProjectTemplateItem array.
 */
export function parseTemplateFiles(
	files: { path: string; name: string; kind: string }[],
): string[] {
	return files
		.filter((f) => f.kind === 'file' && (f.path.startsWith('/.ok/templates/') || f.path.startsWith('.ok/templates/')))
		.map((f) => f.name);
}

export async function loadProjectTemplates(bridge: OkDesktopBridge | null): Promise<ProjectTemplateItem[]> {
	if (!bridge || bridge.runtime !== 'tauri') {
		projectTemplates.set(defaultTemplates);
		return defaultTemplates;
	}

	try {
		const { listProjectFiles, createProjectPath, readProjectPath } = await import('$lib/editor/project-files');
		const files = await listProjectFiles();
		const templateFiles = files.filter(
			(f: { kind: string; path: string }) =>
				f.kind === 'file' &&
				(f.path.startsWith('/.ok/templates/') || f.path.startsWith('.ok/templates/')),
		);

		if (templateFiles.length === 0) {
			// Seed default templates to disk
			for (const tpl of defaultTemplates) {
				await createProjectPath(tpl.path, 'file', tpl.content);
			}
			projectTemplates.set(defaultTemplates);
			return defaultTemplates;
		}

		const items: ProjectTemplateItem[] = [];
		for (const file of templateFiles) {
			let content = '# Template\n';
			try {
				const res = await readProjectPath(file.path);
				if (res && 'content' in res && typeof res.content === 'string') {
					content = res.content;
				}
			} catch {
				// use default content fallback
			}
			const title = parseTemplateTitle(file.name);
			items.push({
				id: file.name,
				name: file.name,
				title,
				description: `Stored at .ok/templates/${file.name}`,
				path: file.path,
				content,
			});
		}

		items.sort((a, b) => a.title.localeCompare(b.title));
		projectTemplates.set(items);
		return items;
	} catch {
		projectTemplates.set(defaultTemplates);
		return defaultTemplates;
	}
}

export async function createTemplate(
	bridge: OkDesktopBridge | null,
	title: string,
	content: string,
	description?: string,
): Promise<ProjectTemplateItem> {
	const name = sanitizeTemplateName(title);
	const path = `.ok/templates/${name}`;
	const formattedTitle = parseTemplateTitle(name);

	const item: ProjectTemplateItem = {
		id: name,
		name,
		title: formattedTitle,
		description: description || `Stored at ${path}`,
		path,
		content: content || `# ${formattedTitle}\n\n`,
	};

	if (bridge && bridge.runtime === 'tauri') {
		const { createProjectPath } = await import('$lib/editor/project-files');
		await createProjectPath(path, 'file', item.content);
		await loadProjectTemplates(bridge);
	} else {
		projectTemplates.update((current) => [...current.filter((t) => t.name !== name), item]);
	}

	return item;
}

export async function deleteTemplate(
	bridge: OkDesktopBridge | null,
	name: string,
): Promise<void> {
	const path = `.ok/templates/${name}`;
	if (bridge && bridge.runtime === 'tauri') {
		const { deleteProjectPath } = await import('$lib/editor/project-files');
		await deleteProjectPath(path);
		await loadProjectTemplates(bridge);
	} else {
		projectTemplates.update((current) => current.filter((t) => t.name !== name));
	}
}

export async function renameTemplate(
	bridge: OkDesktopBridge | null,
	oldName: string,
	newTitle: string,
): Promise<void> {
	const newName = sanitizeTemplateName(newTitle);
	const fromPath = `.ok/templates/${oldName}`;
	const toPath = `.ok/templates/${newName}`;

	if (bridge && bridge.runtime === 'tauri') {
		const { renameProjectPath } = await import('$lib/editor/project-files');
		await renameProjectPath(fromPath, toPath);
		await loadProjectTemplates(bridge);
	} else {
		projectTemplates.update((current) =>
			current.map((t) =>
				t.name === oldName
					? { ...t, name: newName, title: parseTemplateTitle(newName), path: toPath }
					: t,
			),
		);
	}
}
