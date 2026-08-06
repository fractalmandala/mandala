import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const jobs = [
	['out-layout.html', 'v-layout.png', null],
	['out-system.html', 'v-system.png', null],
	['out-system.html', 'v-flow.png', 'flow'],
	['out-health.html', 'v-health.png', null],
	['out-boundary.html', 'v-boundary.png', null]
];
for (const [file, out, action] of jobs) {
	const p = await b.newPage({ viewportSize: { width: 1600, height: 980 } });
	const errs = [];
	p.on('console', m => m.type() === 'error' && errs.push(m.text()));
	p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
	await p.goto('file://' + process.cwd() + '/' + file);
	await p.waitForTimeout(3000);
	if (action === 'flow') {
		await p.click('.flow >> nth=0');
		await p.waitForTimeout(3000);
	}
	const c = await p.evaluate(() => ({
		boxes: document.querySelectorAll('.box').length,
		edges: document.querySelectorAll('.svelte-flow__edge').length,
		tiles: document.querySelectorAll('svg g.file').length,
		flows: document.querySelectorAll('.flow').length,
		notes: document.querySelectorAll('.note').length,
		steps: document.querySelectorAll('.stepno').length
	}));
	console.log(out.padEnd(16), JSON.stringify(c), errs.length ? 'ERRS:' + JSON.stringify(errs.slice(0, 3)) : '');
	await p.screenshot({ path: out });
	await p.close();
}
await b.close();