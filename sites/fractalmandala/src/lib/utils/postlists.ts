// src/lib/utils/posts.ts
type Post = { slug: string; title: string; linkpath: string; [key: string]: any };

export async function listPosts(
    bank: string,
    view: string,
    route: string,
): Promise<Post[]> {
    const modules = import.meta.glob<{ metadata: Record<string, any>; default: unknown }>(
        '/src/content/*/*/*.md'
    );

    const prefix = `/src/content/${bank}/${view}/`;
    const posts: Post[] = [];

    for (const [path, loader] of Object.entries(modules)) {
        if (!path.startsWith(prefix)) continue;
        if (!path.endsWith('.md')) continue;
        const slug = path.slice(prefix.length, -3);
        const mod = await loader();
        posts.push({
            ...mod.metadata,
            slug,
            title: mod.metadata?.title ?? slug,
            linkpath: `/${route}/${slug}`
        });
    }

    return posts;
}

export async function writingsWiki() {
  const posts = import.meta.glob('/src/content/Writings/wiki/*.md')
  const allfiles = { ...posts };
  const filed = Object.entries(allfiles)
  
  const eachfiled = await Promise.all(
    filed.map(async ([path, resolver]) => {
      // Exclude INDEX.md files
      if (path.endsWith('/INDEX.md')) {
        return null;
      }

      // @ts-expect-error//why
      const { metadata } = await resolver()
      const pathitem = path.slice(11, -3)
      return {
        meta: metadata,
        linkpath: pathitem
      };
    })
  )
  
  // The existing filter cleanly drops the null values returned above
  const validPosts = eachfiled.filter((post): post is NonNullable<typeof post> => post !== null);
  return validPosts.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export interface AllPostItem {
    title: string;
    description: string;
    tags: string[];
    slug: string;
    linkpath: string;
    bank: string;
    view: string;
}

export async function getAllPosts(): Promise<AllPostItem[]> {
    const modules = import.meta.glob<{ metadata: Record<string, any>; default: unknown }>(
        '/src/content/*/*/*.md'
    );

    const allowedRoutes = [
        { bank: 'Archaeology', view: 'wiki', route: 'archaeology' },
        { bank: 'Civilization', view: 'wiki', route: 'civilization' },
        { bank: 'Comparative Civilization', view: 'wiki', route: 'comparative-civilization' },
        { bank: 'History', view: 'wiki', route: 'history' },
        { bank: 'Karmic Streams', view: 'wiki', route: 'karmic-streams' },
        { bank: 'Shri Ram Swarup and Shri Sita Ram Goel', view: 'wiki', route: 'srg-srs' },
        { bank: 'Sveltekit', view: 'wiki', route: 'sveltekit' },
        { bank: 'Writings', view: 'wiki', route: 'writings' },
        { bank: 'Writings', view: 'raw', route: 'writings/blog' }
    ];

    const tasks = Object.entries(modules).map(async ([path, loader]) => {
        if (path.endsWith('/INDEX.md')) return null;

        // Find if this path matches one of our allowed routes
        const matched = allowedRoutes.find(({ bank, view }) => 
            path.startsWith(`/src/content/${bank}/${view}/`)
        );

        if (!matched) return null;

        const { bank, view, route } = matched;
        const prefix = `/src/content/${bank}/${view}/`;
        const slug = path.slice(prefix.length, -3);

        try {
            const mod = await loader();
            return {
                title: mod.metadata?.title ?? slug,
                description: mod.metadata?.description ?? '',
                tags: Array.isArray(mod.metadata?.tags) ? mod.metadata.tags : [],
                slug,
                linkpath: `/${route}/${slug}`,
                bank,
                view
            };
        } catch (e) {
            console.error(`Failed to load markdown module at ${path}`, e);
            return null;
        }
    });

    const results = await Promise.all(tasks);
    return results.filter((p): p is AllPostItem => p !== null);
}

export async function getPostsByGroup(group: string): Promise<Post[]> {
    const modules = import.meta.glob<{ metadata: Record<string, any>; default: unknown }>(
        '/src/content/Writings/raw/*.md'
    );

    const posts: Post[] = [];

    for (const [path, loader] of Object.entries(modules)) {
        if (path.endsWith('/CONTENTS.md')) continue;
        try {
            const mod = await loader();
            if (mod.metadata?.group === group) {
                const slug = path.split('/').pop()?.slice(0, -3) ?? '';
                posts.push({
                    ...mod.metadata,
                    slug,
                    title: mod.metadata?.title ?? slug,
                    linkpath: `/writings/blog/${slug}`
                });
            }
        } catch (e) {
            console.error(`Failed to load markdown module at ${path} in getPostsByGroup`, e);
        }
    }

    return posts;
}