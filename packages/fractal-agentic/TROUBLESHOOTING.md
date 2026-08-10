# Troubleshooting

Operator runbook for Fractal Agentic. Full detail lives in:

**[`docs/troubleshooting.md`](./docs/troubleshooting.md)**

## Quick links

| Topic | Where |
|---|---|
| Multi-host install | [`docs/02-install.md`](./docs/02-install.md) |
| Non-blocking pins | [`docs/progression.md`](./docs/progression.md) |
| Identity | [`SOUL.md`](./SOUL.md) |
| Hooks | [`hooks/README.md`](./hooks/README.md) |
| Wiki | [`docs/wiki/setup.md`](./docs/wiki/setup.md) |

## 30-second health

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/mandala/packages/fractal-agentic   # this directory
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-armory.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-nonblocking-policy.sh"
```

**Rule:** missing pins, hooks, or wiki never block product work — fall back and continue.
