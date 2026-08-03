---
name: file-organizer
description: 'Organize files and folders by analyzing structure, finding duplicates, proposing cleaner layouts, and applying moves with user approval. Use for Downloads chaos, project tree cleanup, archive vs active separation, naming consistency, and storage hygiene — never delete without explicit confirmation.'
---

# File organizer

Personal and project filesystem hygiene. Reduce clutter without surprising destructive actions.

## When to use

- Messy Downloads, Desktop, or Documents
- Duplicate files wasting space
- Inconsistent project or archive layout
- Preparing a folder for backup or handoff
- Separating active work from cold archive

## When not to use

- Git history rewrite or branch cleanup → `git-workflow` / repo tools
- Code refactors that only rearrange modules → code/refactor skills
- Mass-delete of unknown trees without inventory

## Safety rules (non-negotiable)

1. **Propose before move.** Show a plan; wait for approval on non-trivial changes.
2. **Never delete without explicit yes** for each delete set (or a clear “delete all listed duplicates” confirmation).
3. **Prefer archive over delete** when uncertain.
4. **Log moves** so the user can undo.
5. **Avoid** system directories, secrets vaults, and paths the user marks off-limits.
6. **Stop** on unexpected conflicts (same name, permission errors) and ask.

## Workflow

### 1. Scope

Ask (or infer from the prompt):

- Target directory
- Main problem (findability, duplicates, structure, disk space)
- Aggressiveness (conservative vs comprehensive)
- Paths to leave alone

### 2. Analyze

```bash
# Overview
ls -la "$TARGET"
# Largest items
du -sh "$TARGET"/* 2>/dev/null | sort -rh | head -20
# Extension histogram
find "$TARGET" -type f 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -30
```

Summarize: file counts, types, size, age, obvious mess patterns.

### 3. Grouping strategies

Pick one primary strategy (or a clear hybrid):

| Strategy | Good for |
| --- | --- |
| By type | Downloads full of installers, PDFs, images |
| By purpose | Work vs personal; project vs reference |
| By date | Photos, archives, old exports |
| By project | Multi-client work folders |

### 4. Duplicates

When requested:

- Hash-based exact duplicates when feasible (`md5` / `shasum`)
- Same-name candidates with size + mtime
- Recommend keep (usually newest path in the “correct” folder)

Always list paths before any delete.

### 5. Plan template

```markdown
# Organization plan: <directory>

## Current state
- N files, M folders, size S
- Issues: …

## Proposed structure
<tree>

## Changes
1. Create folders: …
2. Moves: …
3. Renames: …
4. Deletes (needs confirm): …

## Needs your decision
- …
```

### 6. Execute

After approval: create folders, move with logging, rename consistently, skip or ask on conflicts.

Suggested naming:

- Folders: `kebab-case` or clear Title Case — stay consistent
- Important files: `YYYY-MM-DD-description.ext` when dates matter

### 7. Close out

Report what moved, what was archived, space freed, and a short maintenance habit (e.g. weekly Downloads sort).

## Example requests

- “Organize my Downloads; installers separate; archive files older than 90 days.”
- “Find duplicates under Documents and help me choose which to keep.”
- “Separate active vs archive projects under ~/Projects.”
- “Group photos by year/month.”

## Related skills

- `repo-scan` — code asset audit inside a repo (not personal file hygiene)
- `workspace-surface-audit` — agent/tooling surface audit

## Credit

**ASI** — https://github.com/plurigrid/asi
