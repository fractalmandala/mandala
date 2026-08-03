import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { NotFound, NotFoundGlitch, NotFoundMagnetic, NotFoundSpotlight, NotFoundStacked, NotFoundTerminal } from '../src/lib/components/blocks/not-found/index.js';
describe('NotFound', () => {
	it.each([['glitch', NotFoundGlitch], ['magnetic', NotFoundMagnetic], ['spotlight', NotFoundSpotlight], ['stacked', NotFoundStacked], ['terminal', NotFoundTerminal]])('renders the %s style with accessible recovery links', (variant, Component) => { const { container, unmount } = render(Component); expect(container.querySelector('[data-slot="not-found"]')?.getAttribute('data-variant')).toBe(variant); expect(screen.getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe('/'); unmount(); });
	it('supports custom content and links', () => { render(NotFound, { props: { variant: 'terminal', code: '410', title: 'Gone', homeHref: '/start', browseLabel: 'Search' } }); expect(screen.getByText('Gone')).toBeTruthy(); expect(screen.getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe('/start'); expect(screen.getByRole('link', { name: 'Search' })).toBeTruthy(); });
});
