---
title: "Scheduled essays"
description: "Configure a local 48-hour knowledge capture, wiki ingest, and essay publishing loop."
type: guide
---

# Scheduled essays

Fractal Agentic can maintain a small local publishing loop for you. Every 48 hours, the loop asks a configured coding agent to capture recent knowledge into the continuous wiki, ingest the raw episode into structured wiki pages, choose a grounded topic, and write one finished essay.

The final post is written by the runner, not by the agent. That boundary keeps the output contract stable:

~~~yaml
---
title: "..."
tags:
  - "..."
  - "..."
group: scheduledpost
description: "..."
date: YYYY-MM-DD
---
~~~

The default destination for this setup is:

~~~text
/Users/amrit/fractals/sites/fractaldesign/src/routes/posts
~~~

## Setup

Run the installer with the destination and your wiki vault:

~~~sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-periodic-essay.sh" \
  --output-dir /Users/amrit/fractals/sites/fractaldesign/src/routes/posts \
  --wiki-root /absolute/path/to/your/wiki \
  --memory-path /absolute/path/to/memory
~~~

The installer writes a user-level configuration at `~/.config/fractal-agentic/periodic-essay.json`. It enables the pipeline, but it does not make an agent call during setup.

To install the macOS launchd scheduler as well:

~~~sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-periodic-essay.sh" \
  --output-dir /Users/amrit/fractals/sites/fractaldesign/src/routes/posts \
  --wiki-root /absolute/path/to/your/wiki \
  --memory-path /absolute/path/to/memory \
  --install-scheduler
~~~

The scheduler wakes every 15 minutes and checks the persisted 48-hour state. It does not run an agent when the interval is not due. If the computer was asleep or offline, the next wake catches up once.

## Source paths

The wiki is included automatically when `include_wiki` is true. Chat history and memory locations are intentionally explicit because hosts store them differently and a hook must never scan private home-directory data by guesswork.

Add paths in `~/.config/fractal-agentic/periodic-essay.json`:

~~~json
{
  "sources": {
    "paths": [
      "/absolute/path/to/project/notes"
    ],
    "memory_paths": [
      "/absolute/path/to/memory"
    ],
    "transcript_paths": [
      "/absolute/path/to/exported/chat-history"
    ],
    "include_wiki": true
  }
}
~~~

The capture prompt tells the agent to read those paths, create one append-only `raw/fractal` episode, and ingest unprocessed material. It also tells the agent to record when no transcript or memory path is configured rather than inventing chat history.

## Writing contracts

The writer receives both contracts before it writes:

- grand-writer supplies the primary Amrit voice and the technology/dystopia register for technical subjects.
- human-writing removes generic AI phrasing and preserves a natural, specific voice.

The runner asks for structured article data, validates title, description, tags, body length, and then emits the exact YAML frontmatter. It also forces the run date into YYYY-MM-DD, validates the completed Markdown, and refuses to publish a malformed result.

## Safety and failure behavior

The pipeline fails closed around public output: an incomplete capture, malformed article, or competing run leaves the state due and writes no partial post.

- The hook is due-only. It marks pending work and never starts an agent.
- The scheduler uses an atomic lock, so two wakeups cannot publish twice at the same time.
- Raw wiki capture is a prerequisite by default. If capture or ingest is not confirmed, no public essay is written.
- Agent failures leave the state due with a visible last_error; the next scheduler wake retries.
- Existing post files are never overwritten. A collision receives a numeric suffix.
- Credentials and unnecessary private data are excluded by instruction, but source paths should still be chosen carefully.
- The automation is local and opt-in. It does not publish to a remote CMS or push Git changes.

## Commands

Use these commands to configure, inspect, or manually trigger the pipeline:

~~~text
/essay-init       Set the output directory, wiki root, and agent command
/essay-status     Inspect cadence, last run, next due time, and errors
/essay-run        Run immediately or only when the 48-hour interval is due
~~~

The equivalent shell commands are:

~~~sh
node "$FRACTAL_AGENTIC_ROOT/scripts/periodic-essay-runner.js" status
node "$FRACTAL_AGENTIC_ROOT/scripts/periodic-essay-runner.js" run --if-due
node "$FRACTAL_AGENTIC_ROOT/scripts/periodic-essay-runner.js" run --force
~~~

To remove the macOS scheduler while retaining configuration:

~~~sh
sh "$FRACTAL_AGENTIC_ROOT/scripts/install-periodic-essay.sh" --remove-scheduler
~~~

## Next steps

After setup, run [/essay-status](../commands/essay-status.md) to confirm the resolved wiki and output paths. Add a transcript path if the first capture reports that chat history is unavailable, then let the next due run create the first post.
