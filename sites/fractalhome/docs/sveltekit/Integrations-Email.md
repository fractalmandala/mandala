---
title: Integrations and Email
description: Integration patterns in Svelte 5 and SvelteKit — Nodemailer for email sending, advanced email templates, ad campaign integrations, and general third-party integration approaches.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - sveltekit
  - email
  - nodemailer
  - integrations
  - templates
sources:
  - Nodemailer-in-Svelte-5-Complete
  - Advanced-Email-Templates-in
  - Ad-Campaigns-—-Integrations
  - Email-—-Integrations
  - Integrations
related:
  - SvelteKit-Form-Actions
  - SvelteKit-Data-Loading
  - SvelteKit-Hooks-Server
  - SvelteKit-Authentication
timestamp: 2026-06-21
source: Wiki repo
---

Send emails from server load functions or form actions using Nodemailer:

```js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

export const actions = {
  contact: async ({ request }) => {
    const data = await request.formData()
    await transporter.sendMail({
      to: 'admin@example.com',
      subject: `Contact from ${data.get('name')}`,
      html: `<p>${data.get('message')}</p>`
    })
    return { success: true }
  }
}
```

### Best Practices

- Use `$env/static/private` or `$env/dynamic/private` for SMTP credentials
- Create email templates as reusable components rendered to HTML
- Queue emails for better performance (async processing)
- Handle email failures gracefully with error states

## Advanced Email Templates

Render Svelte components as email HTML using `svelte/server`'s `render()`:

```svelte
<!-- EmailTemplate.svelte -->
<h1>Welcome, {name}!</h1>
<p>Thanks for signing up.</p>
```

```js
import { render } from 'svelte/server'
import EmailTemplate from './EmailTemplate.svelte'

const { body } = render(EmailTemplate, { props: { name: 'Alice' } })
await transporter.sendMail({ html: body })
```

## Ad Campaigns

Integration patterns for ad campaign platforms (Google Ads, Meta Ads, etc.) via server-side API calls in load functions or dedicated server routes.

## General Integration Patterns

- **Webhooks:** Use `+server.js` endpoints to receive webhooks
- **Third-party APIs:** Call from server load functions or actions
- **OAuth flows:** Use handle hooks for token management
- **Background jobs:** Process integrations asynchronously using queue systems

## See Also
- [SvelteKit Form Actions](SvelteKit-Form-Actions) — form submission patterns that integrate with email
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — middleware for auth tokens
- [SvelteKit Environment and Modules](SvelteKit-Environment-Modules) — environment variables for API keys
