---
title: Auth in Sveltekit through Github
tags:
  - sveltekit
  - github
group: web-development-sveltekit
description: Using auth.js to set up a Github auth flow inside Sveltekit.
date: 2023-12-16
supergroup: webdev
---

##### 1. Install auth.js in sveltekit

```bash
npm install @auth/sveltekit
```

##### 2. Set up Github OAuth app

- go to https://github.com/settings/developers
- click on "New OAuth App"
- give a name, set URL where you'll move this auth into production
- add authorization callback URL - https://example.com/api/auth/callback/github
- register application
- copy and paste the client ID and client secret into .env file in sveltekit as GITHUB_ID and GITHUB_SECRET respectively
- also set AUTH_SECRET by generating it from here - https://generate-secret.vercel.app/32

##### 3. Set up Hooks

- create hooks.server.ts in the src directory and add below code:

```js
import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/core/providers/github"
import type { Handle } from "@sveltejs/kit";
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET } from "$env/static/private"

export const handle = SvelteKitAuth(async() => {
  const authOptions = {
    providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
    secret: AUTH_SECRET,
    trustHost: true
  }
  return authOptions
}) satisfies Handle;
```

##### 4. Create root +layout.server.ts file and add code:

```js
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.getSession()
  };
};
```

##### 5. Now in the root +layout.svelte file, we need to do the following:

- in the script tag:

```js
import { page } from '$app/stores'
import { signIn, signOut } from '@auth/sveltekit/client'
```

##### 6. Login/logout Buttons

anywhere in the layout.svelte file, add these 2 buttons:

```html
  {#if $page.data.session?.user}
  <button class="blank" on:click={() => signOut}>Logout</button>
  {:else}
  <button class="blank" on:click={() => signIn('github')}>Login</button>
  {/if}
```

##### and your're all set!