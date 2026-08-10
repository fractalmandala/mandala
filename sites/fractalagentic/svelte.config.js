import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			runtime: 'nodejs24.x'
		}),
		prerender: {
			handleHttpError: ({ status }) => {
				// Non-404 errors (50x, etc.) still fail the build.
				if (status !== 404) return 'fail';
				// This site links to many offline/internal plugin resources
				// (templates, models, references, skill docs) that aren't
				// published routes. Warn instead of failing so deploys aren't
				// blocked by known gaps.
				return 'warn';
			}
		},
		paths: {
			base: process.env.BASE_PATH?.startsWith('/') ? (process.env.BASE_PATH) : ''
		}
	}
};

export default config;
