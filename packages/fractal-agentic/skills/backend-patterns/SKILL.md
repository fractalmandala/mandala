---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, and server-side best practices for SvelteKit server routes, hooks, and form actions.
metadata:
  origin: ECC
---

# Backend Development Patterns

Server-side architecture patterns for SvelteKit applications — load functions, form actions, standalone endpoints, middleware, and data access.

## When to Activate

- Writing `+page.server.ts` / `+server.ts` / `hooks.server.ts`
- Designing APIs consumed by SvelteKit or external clients
- Structuring database access, validation, and error handling
- Reviewing server-side security and performance

## Layering in SvelteKit

```
src/
  hooks.server.ts          # middleware: auth, logging, locals setup
  routes/**/+page.server.ts # page-scoped loads + form actions
  routes/**/+server.ts      # standalone JSON/binary endpoints
  lib/server/               # data access, services, secrets — never importable client-side
  lib/schemas/              # Zod schemas shared by server and client
```

Rules:

- Anything touching secrets, the database, or the filesystem lives in `src/lib/server/` — the `server`/`client` module guards enforce this.
- `+page.server.ts` stays thin: parse input, call a service, return plain serializable data.
- Domain logic lives in `lib/server/` modules, testable without HTTP.

## Data Loading

### Server Load Functions

```typescript
// PASS: GOOD: typed, error-aware load
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	depends('entry:detail');
	const entry = await locals.entries.get(params.id);
	if (!entry) error(404, 'Entry not found');
	return { entry };
};
```

### Streaming Slow Work

```typescript
// PASS: GOOD: unresolved promises stream — fast shell first
export const load: PageServerLoad = async ({ locals }) => ({
	headline: await locals.entries.headline(),
	report: locals.entries.buildReport() // streamed
});
```

### Private vs Public Data

- Data returned from `+page.server.ts` `load` reaches the browser — strip secrets before returning.
- Use `+server.ts` endpoints for machine-to-machine APIs; add `export const prerender = false` where needed.

## Mutations via Form Actions

```typescript
// PASS: GOOD: validate, fail with context, redirect on success
import { fail, redirect } from '@sveltejs/kit';
import { entrySchema } from '$lib/schemas/entry';

export const actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const parsed = entrySchema.safeParse(Object.fromEntries(form));
		if (!parsed.success) {
			return fail(400, {
				values: Object.fromEntries(form),
				errors: parsed.error.flatten().fieldErrors
			});
		}
		const id = await locals.entries.create(parsed.data);
		redirect(303, `/entries/${id}`);
	}
};
```

- Always re-validate server-side; client validation is a convenience, not a gate.
- Return `fail()` with enough data to re-render the form with values and errors.
- Pair with `use:enhance` in the UI for SPA-style submissions that still work without JS.

## Middleware (`hooks.server.ts`)

```typescript
// PASS: GOOD: single funnel for auth + locals
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = await authenticate(event.cookies.get('session'));

	if (event.url.pathname.startsWith('/admin') && !event.locals.user) {
		return new Response(null, { status: 401 });
	}
	return resolve(event);
};
```

Keep hooks lean; push heavy work into per-route loads so every request doesn't pay for it.

## API Design (Standalone Endpoints)

```typescript
// src/routes/api/entries/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const entry = await locals.entries.get(params.id);
	if (!entry) error(404, 'Entry not found');
	return json(entry);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	await locals.entries.remove(params.id);
	return new Response(null, { status: 204 });
};
```

Conventions:

- REST resource naming: plural nouns, ids in paths (`/api/entries/:id`).
- Status codes: 200 read, 201 created, 204 no content, 400 validation, 401 authn, 403 authz, 404 missing, 409 conflict.
- Paginate lists: `?page=2&limit=50` with total in a header or envelope.
- Version breaking changes under `/api/v2/` rather than mutating v1.

## Error Handling

```typescript
// PASS: GOOD: expected errors via error(), unexpected via handleServerError
import { error } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error: err, event }) => {
	const id = crypto.randomUUID();
	console.error(id, err); // report to your logging sink
	return { message: 'Internal error', id }; // never leak stack traces
};
```

- 4xx: user-fixable, message safe to display.
- 5xx: log with correlation id; return a generic message.
- Never throw raw `Error` with sensitive detail across the wire.

## Database Access Patterns

- One service module per aggregate (`lib/server/entries.ts`) exposing typed methods.
- Parameterized queries only — no string interpolation.
- Index columns used in `WHERE`/`ORDER BY`; run `EXPLAIN` on anything touching large tables.
- Batch reads (`IN (...)`) instead of N+1 loops inside `load`.
- Transactions for multi-step writes.
- Connection pooling sized for serverless/server reality; close cleanly in dev shutdown hooks.

## Security Checklist

1. Secrets only in env vars, read inside `src/lib/server/` — never in `$lib` shared modules.
2. CSRF: SvelteKit form actions are protected by default; custom POST endpoints must check `Origin`.
3. Validate and type-coerce every input (form data, params, headers, JSON bodies).
4. Serialize only what the page needs — audit `load` return values for accidental leaks.
5. Set `Content-Security-Policy` in `hooks.server.ts`; keep it strict, allowlist-based.
6. Rate-limit auth endpoints; hash passwords with argon2/bcrypt.
7. Sanitize anything round-tripped through `{@html}`.

## Performance Checklist

| Lever | Action |
|---|---|
| Payload | Return page-shaped data, not full rows |
| Caching | `Cache-Control` for GET endpoints; `depends()` + `invalidate()` for targeted refetch |
| Prerender | Static marketing/help pages with `prerender = true` |
| Queries | Batch, index, paginate; avoid per-row awaits |
| Streaming | Return promises for slow aggregates |
