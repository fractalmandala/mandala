import { describe, it, expect } from 'vitest';
import {
	EASE_OUT,
	EASE_IN_OUT,
	SPRING_PRESS,
	SPRING_SWAP,
	SPRING_PANEL,
	SPRING_LAYOUT,
	SPRING_MOUSE,
	SPRING_GLIDE
} from '../src/lib/ease.js';

describe('ease presets', () => {
	it('exports cubic bezier arrays', () => {
		expect(EASE_OUT).toEqual([0.16, 1, 0.3, 1]);
		expect(EASE_IN_OUT).toEqual([0.77, 0, 0.175, 1]);
	});

	it('SPRING_PRESS has expected properties', () => {
		expect(SPRING_PRESS.type).toBe('spring');
		expect(SPRING_PRESS.stiffness).toBe(500);
		expect(SPRING_PRESS.damping).toBe(30);
	});

	it('SPRING_LAYOUT has expected properties', () => {
		expect(SPRING_LAYOUT.type).toBe('spring');
		expect(SPRING_LAYOUT.stiffness).toBe(360);
	});

	it('SPRING_MOUSE has no type (uses defaults)', () => {
		expect(SPRING_MOUSE.stiffness).toBe(200);
		expect(SPRING_MOUSE.damping).toBe(15);
	});

	it('exports all 6 spring presets', () => {
		const springs = [SPRING_PRESS, SPRING_SWAP, SPRING_PANEL, SPRING_LAYOUT, SPRING_MOUSE, SPRING_GLIDE];
		expect(springs).toHaveLength(6);
		springs.forEach(s => {
			expect(s.stiffness).toBeGreaterThan(0);
			expect(s.damping).toBeGreaterThan(0);
		});
	});
});
