# acrolls

The installable Acrolls command-line entrypoint.

```bash
pnpm add -D acrolls
pnpm exec acrolls onboard --docs-dir docs --base-href /docs
pnpm exec acrolls validate ./docs --mode migration --on-invalid error-page
```

`acrolls` delegates to `@acrolls/cli`, so the command name stays stable while the CLI
implementation remains versioned with the Acrolls workspace. The interactive onboarding flow
shows one checkpoint at a time; use `--non-interactive` or `--json` for agents and CI.
