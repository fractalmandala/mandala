#!/bin/sh
# Worktree helper for the mandala monorepo — admin/repo-management.md §3/§5.
#
# The persistent main worktree is the repo checkout itself; throwaway task
# worktrees live under $MANDALA_WT_ROOT (default ~/src/mandala), one folder
# per branch, grouped by branch type.
#
#   scripts/wt.sh add feat/fracta-export   # worktree at ~/src/mandala/feat/fracta-export
#   scripts/wt.sh list                     # git worktree list
#   scripts/wt.sh rm feat/fracta-export    # remove worktree + branch, prune
#   scripts/wt.sh rm --force <branch>      # abandoned prototype path
#
# Branch names must match §2: <type>/<scope>-<thing>, type in
# feat fix refactor experiment chore docs test perf ci.

set -eu

WT_ROOT="${MANDALA_WT_ROOT:-$HOME/src/mandala}"

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
	echo "wt: not inside a git repo" >&2
	exit 1
}

usage() {
	cat >&2 <<EOF
usage: scripts/wt.sh <command> [args]

  add <branch>            create branch + worktree at $WT_ROOT/<type>/<name> off main
  list                    list all worktrees
  rm [--force] <branch>   remove the branch's worktree, delete the branch, prune
                          (--force: dirty worktree + unmerged branch, §3 abandoned path)
EOF
	exit 2
}

valid_branch() {
	printf '%s\n' "$1" | grep -Eq '^(feat|fix|refactor|experiment|chore|docs|test|perf|ci)/[a-z0-9][a-z0-9-]*$'
}

worktree_path_for() {
	git -C "$repo_root" worktree list --porcelain | awk -v b="refs/heads/$1" '
		/^worktree / { wt = substr($0, 10) }
		$1 == "branch" && $2 == b { print wt; exit }
	'
}

cmd_add() {
	[ $# -eq 1 ] || usage
	branch="$1"
	if ! valid_branch "$branch"; then
		echo "wt: '$branch' does not match <type>/<scope>-<thing> (admin/repo-management.md §2)." >&2
		echo "wt: types: feat fix refactor experiment chore docs test perf ci" >&2
		exit 1
	fi
	type="${branch%%/*}"
	name="${branch#*/}"
	path="$WT_ROOT/$type/$name"
	if [ -e "$path" ]; then
		echo "wt: $path already exists" >&2
		exit 1
	fi
	mkdir -p "$WT_ROOT/$type"
	git -C "$repo_root" worktree add -b "$branch" "$path" main
	echo "wt: worktree ready at $path"
	echo "wt: next — cd $path && pnpm install"
}

cmd_list() {
	git -C "$repo_root" worktree list
}

cmd_rm() {
	force=""
	if [ "${1:-}" = "--force" ]; then
		force=1
		shift
	fi
	[ $# -eq 1 ] || usage
	branch="$1"

	path=$(worktree_path_for "$branch")
	if [ -n "$path" ]; then
		if [ -n "$force" ]; then
			git -C "$repo_root" worktree remove --force "$path"
		else
			git -C "$repo_root" worktree remove "$path"
		fi
	else
		echo "wt: no worktree for branch '$branch' (already removed?)" >&2
	fi

	if [ -n "$force" ]; then
		git -C "$repo_root" branch -D "$branch"
	else
		git -C "$repo_root" branch -d "$branch"
	fi
	git -C "$repo_root" worktree prune
	echo "wt: removed $branch"
}

[ $# -ge 1 ] || usage
command="$1"
shift
case "$command" in
	add) cmd_add "$@" ;;
	list) cmd_list "$@" ;;
	rm) cmd_rm "$@" ;;
	*) usage ;;
esac
