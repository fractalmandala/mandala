---
description: Configure the local 48-hour wiki capture, ingest, writing, and scheduled-post pipeline.
---

# /essay-init

Configure the local scheduled essay pipeline.

Use this command when you want the 48-hour capture, wiki-ingest, and article loop to write into a specific local posts directory. The default setup for the Fractal Design site is:

~~~text
/Users/amrit/fractals/sites/fractaldesign/src/routes/posts
~~~

The command should ask for the wiki vault and any explicit memory or transcript paths, then run:

~~~sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-periodic-essay.sh" \
  --output-dir /Users/amrit/fractals/sites/fractaldesign/src/routes/posts \
  --wiki-root /absolute/path/to/wiki \
  --memory-path /absolute/path/to/memory
~~~

Ask whether the user wants the macOS launchd scheduler installed. Installing the scheduler is opt-in because each due run invokes the configured agent. The hook remains safe to install without the scheduler: it only marks due work.

See [Scheduled essays](../docs/scheduled-essays.md) for source-path configuration, writing contracts, and failure behavior.
