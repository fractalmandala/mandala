# /essay-run

Run the scheduled essay pipeline.

Default behavior is due-only:

~~~sh
node /Users/amrit/fractal-agentic/plugin/scripts/periodic-essay-runner.js run --if-due
~~~

This performs wiki capture, wiki ingest, topic selection, Grand Writer and Human Writing passes, frontmatter validation, and an atomic Markdown write. If the interval is not due, it exits without calling the agent.

For an intentional immediate run, use:

~~~sh
node /Users/amrit/fractal-agentic/plugin/scripts/periodic-essay-runner.js run --force
~~~

Use force only when the user explicitly wants a new essay before the next 48-hour boundary. A failed capture or ingest never produces a public post.

