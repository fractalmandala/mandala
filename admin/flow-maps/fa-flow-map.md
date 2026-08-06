# repowiki-main structure map

- Mapping date: 2026-08-05
- Scope: CLI, project enablement, post-commit update, AI engine execution, wiki persistence
- Edge key: solid = containment/control flow; dashed = data/state/event flow

```mermaid
flowchart TD
  CLI["CLI dispatcher<br/>cmd/repowiki/main.go"]
  ENABLE["Enable command<br/>cmd/repowiki/enable.go"]
  UPDATE["Update command<br/>cmd/repowiki/update.go"]
  GENERATE["Generate command<br/>cmd/repowiki/generate.go"]
  HOOKCMD["Hook callback<br/>cmd/repowiki/hooks.go"]
  CONFIG["Config boundary<br/>internal/config/config.go"]
  GIT["Git boundary<br/>internal/git/git.go"]
  HOOK["Hook installer<br/>internal/hook/hook.go"]
  ENGINE["Engine adapter<br/>internal/wiki/engine.go"]
  ORCH["Wiki orchestrator<br/>internal/wiki/wiki.go"]
  DETECT["Change detector<br/>internal/wiki/detect.go"]
  PROMPT["Prompt builder<br/>internal/wiki/prompt.go"]
  LOCK["Process lock<br/>internal/lockfile/lockfile.go"]
  COMMIT["Wiki committer<br/>internal/wiki/commit.go"]
  OUTPUT["Generated wiki<br/>.qoder/repowiki/en/"]
  PROJECT["Configured project<br/>.repowiki/config.json + .git/hooks/post-commit"]

  CLI --> ENABLE
  CLI --> UPDATE
  CLI --> GENERATE
  CLI --> HOOKCMD
  ENABLE --> CONFIG
  ENABLE --> GIT
  ENABLE --> HOOK
  ENABLE --> ENGINE
  ENABLE --> PROJECT
  GENERATE --> CONFIG
  GENERATE --> GIT
  GENERATE --> ORCH
  UPDATE --> CONFIG
  UPDATE --> GIT
  UPDATE --> ORCH
  HOOKCMD --> GIT
  HOOKCMD --> CONFIG
  HOOKCMD --> LOCK
  HOOKCMD --> UPDATE
  ORCH --> LOCK
  ORCH --> DETECT
  ORCH --> PROMPT
  ORCH --> ENGINE
  ORCH --> COMMIT
  ENGINE --> OUTPUT
  COMMIT --> GIT
  COMMIT --> OUTPUT
  CONFIG -. config, threshold, exclusions .-> ORCH
  GIT -. changed files, HEAD, commit messages .-> UPDATE
  DETECT -. affected sections .-> PROMPT
  COMMIT -. sentinel and prefix prevent hook loop .-> HOOKCMD
  PROJECT -. commit event .-> HOOKCMD
```

## Evidence

- [README.md](file:///Users/amrit/mandala/repowiki-main/README.md)
- [CLAUDE.md](file:///Users/amrit/mandala/repowiki-main/CLAUDE.md)
- [main.go](file:///Users/amrit/mandala/repowiki-main/cmd/repowiki/main.go#L10-L39)
- [enable.go](file:///Users/amrit/mandala/repowiki-main/cmd/repowiki/enable.go#L25-L112)
- [update.go](file:///Users/amrit/mandala/repowiki-main/cmd/repowiki/update.go#L87-L120)
- [hooks.go](file:///Users/amrit/mandala/repowiki-main/cmd/repowiki/hooks.go#L16-L60)
- [wiki.go](file:///Users/amrit/mandala/repowiki-main/internal/wiki/wiki.go#L13-L77)
- [detect.go](file:///Users/amrit/mandala/repowiki-main/internal/wiki/detect.go#L22-L49)
- [engine.go](file:///Users/amrit/mandala/repowiki-main/internal/wiki/engine.go#L14-L39)
- [commit.go](file:///Users/amrit/mandala/repowiki-main/internal/wiki/commit.go#L25-L59)
