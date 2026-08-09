/** fractals-styler — shared table-of-contents store.
 *
 * A single reactive source of truth for the on-this-page navigation rendered
 * in `.sidebarright`. A page registers its article element; the layout renders
 * the store. Both sites import the same instance — no per-page TOC plumbing.
 *
 *   // in a post page
 *   import { toc } from 'fractals-styler/lib';
 *   let article = $state<HTMLElement | null>(null);
 *   $effect(() => {
 *     if (!article) return;
 *     toc.setHeadings(article);
 *     const stop = toc.observe(article);
 *     return () => { stop(); toc.clear(); };
 *   });
 */

export interface TocItem {
	id: string;
	text: string;
	/** heading level, e.g. 2 for <h2>, 3 for <h3> */
	level: number;
}

/** GitHub-style slug — mirrors fractalmandala's original heading logic. */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

class Toc {
	items = $state<TocItem[]>([]);
	activeId = $state<string | null>(null);

	/**
	 * Scan `root` for headings, assign stable (deduped) ids in place, and
	 * publish them as the current table of contents. Returns the items.
	 */
	setHeadings(root: HTMLElement, selector = 'h2, h3'): TocItem[] {
		const seen = new Map<string, number>();
		const items: TocItem[] = Array.from(root.querySelectorAll(selector)).map((el) => {
			const text = el.textContent ?? '';
			const base = slugify(text);
			const count = seen.get(base) ?? 0;
			seen.set(base, count + 1);
			const id = count === 0 ? base : `${base}-${count}`;
			el.id = id;
			return { id, text, level: Number(el.tagName[1]) };
		});
		this.items = items;
		this.activeId = items[0]?.id ?? null;
		return items;
	}

	/** Clear the TOC (call on page teardown). */
	clear(): void {
		this.items = [];
		this.activeId = null;
	}

	/**
	 * Scroll-spy: observe the registered headings and keep `activeId` in sync
	 * with what's on screen. Returns a cleanup function.
	 */
	observe(root: HTMLElement, selector = 'h2[id], h3[id]', rootMargin = '-80px 0px -70% 0px'): () => void {
		if (typeof IntersectionObserver === 'undefined') return () => {};
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) this.activeId = entry.target.id;
				}
			},
			{ rootMargin }
		);
		// Query the DOM (not this.items) so callers can invoke this inside the
		// same $effect that populates the store without creating a read→write
		// reactive loop.
		for (const el of root.querySelectorAll(selector)) observer.observe(el);
		return () => observer.disconnect();
	}

	/** Smooth-scroll to a heading and mark it active. */
	goTo(id: string): void {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
			this.activeId = id;
		}
	}
}

/** Shared singleton — import this, don't construct your own. */
export const toc = new Toc();
