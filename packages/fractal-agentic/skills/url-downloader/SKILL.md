---
title: Url Downloader
description: Downloads content from urls in structured markdown format, in a loop
---
# URL-to-Markdown Downloader

## Objective

Process every URL object in the json file you are pointed to, which has urls in this form:

```json
    {
        "id": 10236,
        "url": "https://yeun.github.io/open-color/",
        "title": "Open Color",
        "visit_count": 1,
        "typed_count": 0,
        "last_visit_time": 13423571551464648,
        "hidden": 0
    }
```

Download each page content, extract its useful article content, and save one Markdown file per URL. Continue through the list sequentially until all entries have been processed.

## Required runtime capabilities

The host agent must provide:

- Internet access through an HTTP fetch tool, such as `WebFetch`, `curl`, or Python `requests`.
- Browser automation, such as Puppeteer, Playwright, or browser-use, as a fallback for JavaScript-rendered or blocked pages.
- Permission to create and update local files.

The instruction file does not grant network access. If neither an HTTP fetch tool nor browser automation is available, stop and report that the runtime lacks internet access.

## Inputs

Read the JSON file as an array of objects. Each relevant object has at least:

```json
{
  "id": 10236,
  "url": "https://example.com/",
  "title": "Example",
  "visit_count": 1
}
```

Use the `url` field as the source URL. Preserve the original JSON order. Ignore entries whose `url` is missing, empty, or invalid, and record them as failures.

## Output

If you are not given an output folder, create a folder "vendors" in the project workspace root, or if it exist already, and save files in that.

Save one file per successfully processed URL using this format:

```markdown
---
title: "Page title"
description: "Page description"
source_url: "https://example.com/"
source_id: 10236
---

# Page title

Extracted article content converted to Markdown.
```

### Frontmatter rules

- `title`: Prefer `<title>`. If absent, use `og:title`, then the JSON object's `title`, then the URL.
- `description`: Prefer `<meta name="description" content="...">`. If absent, use `og:description`. If still absent, leave it as an empty string.
- Escape quotes, backslashes, and line breaks so the YAML remains valid.
- Include `source_url` and `source_id` to make every output traceable.
- Do not invent metadata.

### Filenames

Generate a safe deterministic filename:

1. Start with the JSON `id` when present.
2. Append a slug made from the page title or URL hostname.
3. Replace unsafe characters with hyphens.
4. Limit the slug to a reasonable length.
5. Always use the `.md` extension.

Example:

`10236-open-color.md`

If two entries produce the same filename, append a short stable suffix derived from the URL or use the source ID to prevent overwriting.

## Fetching strategy

Process URLs one at a time.

1. Try a normal HTTP request first.
2. Follow ordinary redirects.
3. Send a descriptive user agent.
4. Respect `robots.txt`, site terms, rate limits, and access controls.
5. Use a modest delay between requests; do not send concurrent bursts.
6. If the response is empty, clearly incomplete, blocked, or depends on JavaScript, retry with browser automation.
7. Do not bypass authentication, CAPTCHAs, paywalls, or other access controls.
8. If a page cannot be fetched after the available reasonable attempts, record the failure and continue.

Use the final resolved URL as contextual information, but preserve the original URL in `source_url`.

## HTML extraction

Parse the fetched HTML and extract:

1. The document `<title>` text.
2. The description meta tag, checking these forms in order:
   - `<meta name="description" content="...">`
   - `<meta property="og:description" content="...">`
3. The main `<article>` element.

If there is no `<article>`, choose the main content container using the extractor available in the runtime. Prefer semantic main content and avoid navigation, headers, footers, cookie notices, sidebars, advertisements, comments, share widgets, and repeated boilerplate.

If the page has no reliably extractable article body, save the metadata and a short note stating that the article content could not be extracted, then mark the item as partial rather than pretending the page was fully captured.

## HTML-to-Markdown conversion

Convert the selected article HTML to readable Markdown while preserving:

- Heading hierarchy
- Paragraphs
- Ordered and unordered lists
- Links
- Emphasis and code
- Blockquotes
- Tables when practical
- Image URLs when they are part of the article

Remove scripts, styles, tracking parameters where safe, inline event handlers, hidden elements, navigation, advertisements, and duplicate content. Normalize excessive whitespace without changing the meaning of the text.

Do not download binary assets unless explicitly requested. Keep external image links as Markdown links or image references when they are present in the article.

## Resume and duplicate handling

The process must be resumable.

- Before fetching an entry, check whether its expected output file already exists.
- Skip existing files by default, unless the user explicitly requests a refresh or overwrite.
- Maintain a progress log at:

  `/Users/amrit/100cabinet/01incoming/bravedesignurls-markdown/progress.jsonl`

- Append one JSON object per processed entry with `id`, `url`, `status`, `output_file`, `attempts`, and `error` when applicable.
- If the process stops, restart from the first uncompleted entry without deleting existing Markdown files.
- Never overwrite a file belonging to a different source URL.

Use these statuses:

- `downloaded`
- `partial`
- `skipped_existing`
- `invalid_url`
- `failed`

## Error handling

A failure for one URL must not stop the batch.

For each failed or partial entry:

- Record the URL and JSON ID.
- Record the HTTP status or concise failure reason when available.
- Continue to the next entry.
- Do not fabricate article text or metadata.

At the end, report totals for downloaded, partial, skipped, invalid, and failed entries, plus the location of the output directory and progress log.

## Completion criteria

The task is complete only when every JSON entry has either:

- A corresponding Markdown output file, or
- A progress-log record explaining why it was skipped, invalid, partial, or failed.

After processing, verify that:

- Every Markdown file has valid YAML frontmatter.
- Every output has `source_url` and `source_id`.
- No output file is empty unless the page itself contained no extractable content.
- The progress log is valid JSON Lines.
- The final summary counts match the progress log.

## Agent operating prompt

Start by reading the input JSON and inspecting the output directory and progress log. Then process entries sequentially using the fetching strategy above. Use the available HTTP or browser tool for internet access; never claim a page was downloaded without actually fetching it. Save each result immediately, append its progress record, and continue until the entire input list is accounted for.
