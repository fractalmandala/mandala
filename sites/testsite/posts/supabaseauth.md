---
title: Supabase Auth and Sveltekit
tags:
  - supabase
  - sveltekit
group: web-development-sveltekit
description: A comprehensive guide on integrating Supabase user authentication with SvelteKit, including setup, configuration, and the creation of essential auth components.
date: 2022-07-28
supergroup: webdev
---
There’s no end to how delightful Supabase is, and how simple it is to set its functionalities up to work in Sveltekit. Integrating their user auth with Sveltekit is further helped by dedicated helpers by Supabase. We begin with some setup on the Supabase side.

User auth at the Supabase end is mostly good-to-go at outset. In the authentication settings, roll over to ‘Providers’ to make sure that “Email” is enabled by default. You can enable other auth types here such as phone, Google and others. I have auth by email and Google in my setup.

Then, go to “URL Configuration” and setup your base URL. This is where users will be redirected to when they confirm signup emails. You can configure additional redirect URLs, for example the post-authentication redirect URL.
##### The above done, it’s time to set up Sveltekit

1. Install Supabase auth helpers:
```shell
npm install @supabase/auth-helpers-sveltekit
```

2. Create file ‘+hooks.server.ts’ in the root ‘src’ folder (not the ‘routes’ folder) and use the following code:
```javascript
// src/+hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
event.locals.supabase = createSupabaseServerClient({
supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
event
});

event.locals.getSession = async () => {
const {
data: { session }
} = await event.locals.supabase.auth.getSession();
return session;
};

return resolve(event, {
filterSerializedResponseHeaders(name) {
return name === 'content-range';
}
});
};
```

Note that we must create a Supabase client here event if we have an existing client setup elsewhere in our project. For example, you may have a client setup for fetching and rendering data from tables in your Supabase database. In the hooks file here, we create a ‘serverClient’ using the auth-helpers, while the regular client uses supabase-js to create a ‘Client.’ For both cases though we can use the same environment variables.

3. Now create file ‘+layout.server.ts’ in the ‘routes’ folder. This file gets the session information that our hooks file acquires, and passes it on to child files aka throughout our project. As with most things Sveltekit, a detailed breakdown of data flow in Sveltekit is available in a [Joy of Code guide.](https://joyofcode.xyz/sveltekit-data-flow)
```javascript
// routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
return {
session: getSession()
};
};
```

4. Create ‘+layout.ts’ with this code:
```javascript
// routes/+layout.ts
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, url, depends }) => {
depends('supabase:auth');

const supabase = createSupabaseLoadClient({
supabaseUrl: PUBLIC_SUPABASE_URL,
supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
event: { fetch },
serverSession: data.session
});

const { pathname } = url
const {
data: { session }
} = await supabase.auth.getSession();

return { supabase, session, pathname };
};
```

5. Then, a ‘+page.ts’ file:
```javascript
// routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
const { session, supabase } = await parent();
if (!session) {
return {
//you can return variables here, or you can also import redirect from @sveltejs/kit to redirect users who are not authenticated
}
}

const { data: testTable } = await supabase.from('test').select('*');
return {
//there are many variables you can return in case of successful auth, like session.user and session
};
};
```

With this your auth is essential set up. What we need now is:

- a login component
- a signup component
- a signout component (all three could be a single component/page)
- a mechanism to allow specific pages, or show specific components, only to logged in users.
