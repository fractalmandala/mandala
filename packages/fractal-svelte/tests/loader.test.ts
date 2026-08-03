import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { Loader } from '../src/lib/components/motion/loader/index.js';

const variants = ['spinner','dots','bars','dot-matrix','dither','ascii','ascii-line','ascii-braille','ascii-blocks','ascii-bounce','morph','comet','scramble','metaballs','newton','helix','percent'] as const;

describe('Loader', () => {
	it.each(variants)('renders a distinct %s visual part', (variant) => {
		const { container } = render(Loader, { props: { variant, size: 36, label: `${variant} loading` } });
		const root = container.querySelector('[role="status"]') as HTMLElement;
		expect(root.getAttribute('aria-label')).toBe(`${variant} loading`);
		expect(root.querySelector(`[data-part="${variant.startsWith('ascii') ? 'ascii' : variant}"]`)).not.toBeNull();
		expect(root.style.getPropertyValue('--loader-size')).toBe('36px');
	});
});
