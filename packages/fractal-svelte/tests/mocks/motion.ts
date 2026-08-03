import { readable } from 'svelte/store';
import Motion from './motion.svelte';

export const useReducedMotion = () => readable(false);

export const AnimatePresence = Motion;

const tags = ['div', 'button', 'span', 'a', 'li', 'ul', 'nav', 'img', 'svg', 'path', 'section', 'header', 'footer', 'main', 'aside', 'article', 'form', 'input', 'textarea', 'select', 'label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'figure', 'figcaption', 'blockquote', 'hr', 'br', 'circle', 'rect', 'line', 'polygon', 'polyline', 'g', 'defs', 'clipPath', 'mask', 'pattern', 'text', 'tspan'];

export const motion = Object.fromEntries(tags.map((tag) => [tag, Motion])) as Record<string, typeof Motion>;
