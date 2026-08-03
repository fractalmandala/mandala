# /essay-status

Inspect the scheduled essay pipeline without starting an agent.

Run:

~~~sh
node /Users/amrit/fractal-agentic/plugin/scripts/periodic-essay-runner.js status
~~~

Report the enabled state, 48-hour due state, output directory, wiki root, configured agent, last completed run, next due time, last output path, and any retained error.

Do not trigger a capture, ingest, or writing run from this command.

