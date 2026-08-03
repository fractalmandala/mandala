import { Context } from 'runed';
import type { ReadableBoxedValues, WritableBoxedValues } from 'svelte-toolbelt';
import type { CodeRootProps } from './types.js';
import { highlightCode, plainCodeHtml } from '$lib/highlight/index.js';

type CodeOverflowStateProps = WritableBoxedValues<{
	collapsed: boolean;
}>;

type CodeRootStateProps = ReadableBoxedValues<{
	code: string;
	lang: NonNullable<CodeRootProps['lang']>;
	hideLines: boolean;
	highlight: CodeRootProps['highlight'];
}>;

class CodeOverflowState {
	constructor(readonly opts: CodeOverflowStateProps) {
		this.toggleCollapsed = this.toggleCollapsed.bind(this);
	}

	toggleCollapsed() {
		this.opts.collapsed.current = !this.opts.collapsed.current;
	}

	get collapsed() {
		return this.opts.collapsed.current;
	}
}

class CodeRootState {
	/** Async-highlighted HTML; plain fallback until ready. */
	private _html = $state('');
	private _gen = 0;

	constructor(
		readonly opts: CodeRootStateProps,
		readonly overflow?: CodeOverflowState
	) {
		// Reactive re-highlight
		$effect(() => {
			const code = this.opts.code.current;
			const lang = this.opts.lang.current;
			const hideLines = this.opts.hideLines.current;
			const highlight = this.opts.highlight.current;
			const gen = ++this._gen;
			this._html = plainCodeHtml(code, lang);
			highlightCode(code, {
				lang,
				hideLines,
				highlightLines: highlight,
				sanitize: true
			}).then((html) => {
				if (gen === this._gen) this._html = html;
			});
		});
	}

	get code() {
		return this.opts.code.current;
	}

	get highlighted() {
		return this._html;
	}
}

function within(num: number, range: CodeRootProps['highlight']) {
	if (!range) return false;
	for (const r of range) {
		if (typeof r === 'number') {
			if (num === r) return true;
			continue;
		}
		if (r[0] <= num && num <= r[1]) return true;
	}
	return false;
}

// keep within exported for tests if needed
export { within };

class CodeCopyButtonState {
	constructor(readonly root: CodeRootState) {}

	get code() {
		return this.root.opts.code.current;
	}
}

const overflowCtx = new Context<CodeOverflowState>('code-overflow-state');
const ctx = new Context<CodeRootState>('code-root-state');

export function useCodeOverflow(props: CodeOverflowStateProps) {
	return overflowCtx.set(new CodeOverflowState(props));
}

export function useCode(props: CodeRootStateProps) {
	return ctx.set(new CodeRootState(props, overflowCtx.getOr(undefined)));
}

export function useCodeCopyButton() {
	return new CodeCopyButtonState(ctx.get());
}
