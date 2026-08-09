import type { Extensions } from '@tiptap/core';
import type { Doc as YDoc } from 'yjs';

export type CollabEditorOptions = {
	document: YDoc;
	fragmentName?: string;
	provider?: unknown;
	user?: { name: string; color: string };
};

export async function createBaseExtensions(): Promise<Extensions> {
	const [StarterKit, Placeholder, Link] = await Promise.all([
		import('@tiptap/starter-kit'),
		import('@tiptap/extension-placeholder'),
		import('@tiptap/extension-link'),
	]);

	return [
		StarterKit.default.configure({
			heading: { levels: [1, 2, 3, 4] },
			// Prefer the standalone Link package configuration below.
			link: false,
			codeBlock: {
				languageClassPrefix: 'language-',
			},
			bulletList: {
				keepMarks: true,
				keepAttributes: false,
			},
			orderedList: {
				keepMarks: true,
				keepAttributes: false,
			},
		}),
		Placeholder.default.configure({
			placeholder: 'Start writing…',
		}),
		Link.default.configure({
			openOnClick: false,
			autolink: true,
			linkOnPaste: true,
			HTMLAttributes: {
				rel: 'noopener noreferrer',
				target: '_blank',
			},
		}),
	];
}

export async function createCollaborativeExtensions(
	options: CollabEditorOptions,
): Promise<Extensions> {
	const [StarterKit, Placeholder, Link, Collaboration, CollaborationCaret] = await Promise.all([
		import('@tiptap/starter-kit'),
		import('@tiptap/extension-placeholder'),
		import('@tiptap/extension-link'),
		import('@tiptap/extension-collaboration'),
		import('@tiptap/extension-collaboration-caret'),
	]);

	// undoRedo conflicts with y-prosemirror undo; disable the local stack.
	const extensions: Extensions = [
		StarterKit.default.configure({
			undoRedo: false,
			link: false,
			heading: { levels: [1, 2, 3, 4] },
			codeBlock: {
				languageClassPrefix: 'language-',
			},
		}),
		Placeholder.default.configure({
			placeholder: 'Start writing…',
		}),
		Link.default.configure({
			openOnClick: false,
			autolink: true,
			linkOnPaste: true,
			HTMLAttributes: {
				rel: 'noopener noreferrer',
				target: '_blank',
			},
		}),
		Collaboration.default.configure({
			document: options.document,
			field: options.fragmentName ?? 'default',
		}),
	];

	if (options.provider) {
		extensions.push(
			CollaborationCaret.default.configure({
				provider: options.provider,
				user: options.user ?? { name: 'You', color: '#0f766e' },
				render: (user) => {
					const caret = document.createElement('span');
					caret.classList.add('collaboration-carets__caret');
					caret.style.borderColor = String(user.color ?? '#0f766e');
					const label = document.createElement('span');
					label.classList.add('collaboration-carets__label');
					label.style.backgroundColor = String(user.color ?? '#0f766e');
					label.textContent = String(user.name ?? 'User');
					caret.appendChild(label);
					return caret;
				},
			}),
		);
	}

	return extensions;
}
