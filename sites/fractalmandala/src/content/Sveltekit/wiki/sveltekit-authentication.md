---
title: SvelteKit Authentication
description: Authentication patterns in SvelteKit — session cookies, JWT, OAuth, Lucia auth, hook-based session validation, protected routes, and server-side authentication architecture.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - authentication
  - authorization
  - sessions
  - oauth
  - jwt
  - lucia
sources:
  - Authentication-Architecture-with
  - Authentication-Patterns-in
  - SvelteKit-Authentication-with
  - svelteDocs-34-auth
related:
  - SvelteKit-Hooks-Server
  - SvelteKit-Data-Loading
  - SvelteKit-Form-Actions
  - SvelteKit-TypeScript
timestamp: 2026-06-21
source: Wiki repo
---

Authentication in SvelteKit is typically implemented in hooks and load functions, leveraging the server runtime for session management and route protection.

## Common Approaches

### Session Cookie Auth

The most common pattern — store a session token in an HTTP-only cookie:

1. User logs in via form action, server validates credentials
2. Server creates a session, stores it in DB, sets a cookie
3. `hooks.server.js` reads the cookie, looks up the session, sets `event.locals.user`
4. Load functions check `locals.user` to protect routes

```js
// hooks.server.js
export const handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session')
  event.locals.user = sessionId ? await db.getUserBySession(sessionId) : null
  return resolve(event)
}
```

### JWT Auth

Stateless authentication using signed tokens:

```js
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export const handle = async ({ event, resolve }) => {
  const token = event.cookies.get('token')
  event.locals.user = token ? jwt.verify(token, SECRET) : null
  return resolve(event)
}
```

### OAuth / Social Login

Use `handleFetch` or server-side OAuth flow with providers like GitHub, Google, or Discord. The `lucia-auth` library provides a comprehensive auth framework.

## Protecting Routes

Check user authentication in load functions:

```js
export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login')
  return { user: locals.user }
}
```

Use layout load functions to protect entire route groups.

## Best Practices

- Never store sensitive data in client-side state
- Use HTTP-only cookies for sessions
- Validate sessions on every request via hooks
- Type `App.Locals` in `app.d.ts` for full type safety
- Use form actions for login/register flows
- Implement CSRF protection for form submissions

## See Also
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — where auth middleware is implemented
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — where auth data is consumed
- [SvelteKit Form Actions](SvelteKit-Form-Actions) — handling login/register form submissions
- [SvelteKit TypeScript](SvelteKit-TypeScript) — typing App.Locals and App.PageData
