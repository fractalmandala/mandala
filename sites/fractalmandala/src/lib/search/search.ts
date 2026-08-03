import FlexSearch from 'flexsearch';

export type SearchResult = {
  title: string;
  description: string;
  slug: string;
  linkpath: string;
  bank: string;
  view: string;
  tags: string[];
};

export type DisplayResult = {	
	item:  SearchResult[];
	title: string;
	description: string;
};

let postsIndex: any;
let posts: SearchResult[];

export async function createPostsIndex(data: SearchResult[]) {
	// @ts-ignore
	postsIndex = new FlexSearch.Index({ tokenize: 'forward' });
	posts = data;
	await Promise.all(
		data.map((item, i) => {
			const content = `${item.title} ${item.description}`;
			return postsIndex.add(i, content);
		})
	);
}

export async function searchAll(
  term: string,
): Promise<SearchResult[]> {
  if (!term?.trim() || !postsIndex) return [];

  // Pass the raw term to FlexSearch — it tokenizes internally.
  const matches = await postsIndex.search(term, { limit: 200 });
  return matches
    .map((idx: any) => posts[idx as number])
    .filter((it: SearchResult | undefined): it is SearchResult => !!it)
    .map((it: SearchResult) => ({
      ...it,
      title: highlight(it.title, term),
      description: highlight(it.description, term)
    }));
}

export function highlight(text: string, m: string): string {
  if (!text) return '';
  if (!m?.trim()) return text;
  // Escape regex metacharacters so queries like "(" or "." don't throw.
  const escaped = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replaceAll(new RegExp(escaped, 'gi'), (s) => `<mark>${s}</mark>`);
}

export function searchPostsIndex(searchTerm: string) {
	if (!postsIndex) return [];
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const results = postsIndex.search(match);
	return results
		.map((index: any) => posts[index as number])
		.map(({ linkpath, title, description }: any) => {
			return {
				linkpath,
				title: replaceTextWithMarker(title, match),
				content: getMatches(description, match),
			};
		});
}

function getMatches(text: string, searchTerm: string, limit = 1) {
	const regex = new RegExp(searchTerm, 'gi');
	const indexes = [];
	let matches = 0;
	let match;

	while ((match = regex.exec(text)) !== null && matches < limit) {
		indexes.push(match.index);
		matches++;
	}

	return indexes.map((index) => {
		const start = index - 20;
		const end = index + 80;
		const excerpt = text.substring(start, end).trim();
		return `...${replaceTextWithMarker(excerpt, searchTerm)}...`;
	});
}

function replaceTextWithMarker(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	return text.replaceAll(regex, (match) => `<mark>${match}</mark>`);
}