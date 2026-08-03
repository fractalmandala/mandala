import { watch } from 'runed';
import { setContext, getContext } from 'svelte';

const STICK_TO_BOTTOM_CONTEXT_KEY = Symbol('stick-to-bottom-context');

export type StickToBottomOptions = {
	/** Scroll behavior used when the content element is first attached. */
	initial?: ScrollBehavior;
	/** Scroll behavior used when the container resizes while pinned to bottom. */
	resize?: ScrollBehavior;
	/** Distance from the bottom (px) that still counts as “at bottom”. */
	threshold?: number;
};

class StickToBottomContext {
	#element: HTMLElement | null = $state(null);
	#isAtBottom = $state(true);
	#resizeObserver: ResizeObserver | null = null;
	#mutationObserver: MutationObserver | null = null;
	#intersectionObserver: IntersectionObserver | null = null;
	#sentinel: HTMLElement | null = null;
	#userHasScrolled = $state(false);
	#initial: ScrollBehavior;
	#resize: ScrollBehavior;
	#threshold: number;

	isAtBottom = $derived(this.#isAtBottom);

	get debugInfo() {
		if (!this.#element) return null;
		const { scrollTop, scrollHeight, clientHeight } = this.#element;
		return {
			scrollTop,
			scrollHeight,
			clientHeight,
			isAtBottom: this.#isAtBottom,
			userHasScrolled: this.#userHasScrolled,
			hasElement: !!this.#element,
			hasSentinel: !!this.#sentinel
		};
	}

	constructor(options: StickToBottomOptions = {}) {
		this.#initial = options.initial ?? 'smooth';
		this.#resize = options.resize ?? 'smooth';
		this.#threshold = options.threshold ?? 200;

		watch(
			() => this.#element,
			() => {
				if (this.#element) {
					this.#setupObservers();
					return () => this.#cleanup();
				}
			}
		);
	}

	setElement(element: HTMLElement) {
		this.#element = element;
	}

	scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
		if (!this.#element) return;

		this.#userHasScrolled = false;
		this.#element.scrollTo({
			top: this.#element.scrollHeight,
			behavior
		});
	};

	/** Scroll used when the content mounts. */
	scrollInitial = () => this.scrollToBottom(this.#initial);

	/** Scroll used when the container resizes while at bottom. */
	scrollOnResize = () => this.scrollToBottom(this.#resize);

	#handleScroll = () => {
		if (!this.#element) return;

		const { scrollTop, scrollHeight, clientHeight } = this.#element;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - this.#threshold;

		this.#isAtBottom = isAtBottom;

		if (!isAtBottom) {
			this.#userHasScrolled = true;
		} else if (isAtBottom && this.#userHasScrolled) {
			this.#userHasScrolled = false;
		}
	};

	#setupObservers() {
		if (!this.#element) return;

		this.#createSentinel();

		this.#intersectionObserver = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					this.#isAtBottom = true;
					this.#userHasScrolled = false;
				}
			},
			{
				threshold: 0,
				root: this.#element
			}
		);

		if (this.#sentinel) {
			this.#intersectionObserver.observe(this.#sentinel);
		}

		this.#element.addEventListener('scroll', this.#handleScroll, {
			passive: true
		});

		this.#resizeObserver = new ResizeObserver(() => {
			this.#checkScrollPosition();
			if (this.#isAtBottom && !this.#userHasScrolled) {
				// Resize while pinned: use resize behavior (often "auto" for streaming).
				this.scrollToBottom(this.#resize === 'smooth' ? 'auto' : this.#resize);
			}
		});

		this.#resizeObserver.observe(this.#element);

		this.#mutationObserver = new MutationObserver(() => {
			requestAnimationFrame(() => {
				const shouldAutoScroll = this.#isAtBottom && !this.#userHasScrolled;
				this.#checkScrollPosition();
				if (shouldAutoScroll) {
					this.scrollToBottom('smooth');
				}
			});
		});

		this.#mutationObserver.observe(this.#element, {
			childList: true,
			subtree: true,
			characterData: true
		});

		this.#checkScrollPosition();
	}

	#createSentinel() {
		if (!this.#element) return;

		this.#sentinel = document.createElement('div');
		this.#sentinel.style.height = '1px';
		this.#sentinel.style.width = '100%';
		this.#sentinel.style.pointerEvents = 'none';
		this.#sentinel.style.opacity = '0';
		this.#sentinel.setAttribute('data-stick-to-bottom-sentinel', '');
		this.#sentinel.setAttribute('data-slot', 'conversation-sentinel');

		this.#element.appendChild(this.#sentinel);
	}

	#checkScrollPosition() {
		if (!this.#element) return;

		const { scrollTop, scrollHeight, clientHeight } = this.#element;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - this.#threshold;

		this.#isAtBottom = isAtBottom;
	}

	#cleanup() {
		this.#resizeObserver?.disconnect();
		this.#mutationObserver?.disconnect();
		this.#intersectionObserver?.disconnect();

		if (this.#element) {
			this.#element.removeEventListener('scroll', this.#handleScroll);
		}

		if (this.#sentinel && this.#element?.contains(this.#sentinel)) {
			this.#element.removeChild(this.#sentinel);
		}

		this.#resizeObserver = null;
		this.#mutationObserver = null;
		this.#intersectionObserver = null;
		this.#sentinel = null;
	}
}

export function setStickToBottomContext(
	options: StickToBottomOptions = {}
): StickToBottomContext {
	const context = new StickToBottomContext(options);
	setContext(STICK_TO_BOTTOM_CONTEXT_KEY, context);
	return context;
}

export function getStickToBottomContext(): StickToBottomContext {
	const context = getContext<StickToBottomContext>(STICK_TO_BOTTOM_CONTEXT_KEY);
	if (!context) {
		throw new Error('StickToBottomContext must be used within a Conversation component');
	}
	return context;
}

export { StickToBottomContext };
