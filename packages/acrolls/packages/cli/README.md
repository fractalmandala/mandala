# @acrolls/cli

```bash
pnpm exec acrolls init
pnpm exec acrolls integrate --dry-run
pnpm exec acrolls onboard --docs-dir docs --base-href /docs
pnpm exec acrolls validate ./content/hello.md
pnpm exec acrolls validate ./docs --mode migration --on-invalid error-page --report acrolls-report.json
pnpm exec acrolls studio ./content/hello.md
```

`validate` accepts a file or directory. Directory runs aggregate all diagnostics and print a
summary such as `619 discovered · 590 ready · 20 normalized · 9 rejected`. Use `--mode authored`
for a strict authored corpus, or `--mode migration --on-invalid error-page` while adopting an
existing Markdown tree. JSON reports are suitable for CI and deployment agents.

`onboard` is a read-only, checkpointed terminal walkthrough for an existing SvelteKit host. It
prints the exact file path, code block, command, caution, and verification check for each step
from package installation through a deployed `/docs` URL. Use `--check` to rescan completed
files and `--json` to give the same manifest to a future modal or host UI.
