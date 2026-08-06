#!/usr/bin/env bash
# verify-port.sh — verify a ported shadcn component (or whole lib) is Tailwind-free and type-checks.
# Usage: verify-port.sh <libRoot> [componentDir]
#   libRoot       SvelteKit project root containing package.json (e.g. fractals-ui)
#   componentDir  optional; defaults to <libRoot>/src/lib/components/ui
set -u

LIB_ROOT="${1:?usage: verify-port.sh <libRoot> [componentDir]}"
TARGET="${2:-$LIB_ROOT/src/lib/components/ui}"
fail=0

echo "== Tailwind dependency check =="
if grep -ris 'tailwind' "$LIB_ROOT/package.json" "$TARGET" --include='*' 2>/dev/null; then
	echo "FAIL: tailwind references found"
	fail=1
else
	echo "OK"
fi

echo "== Tailwind utility class check =="
if grep -rEn 'class="[^"]*\b(px-|py-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|bg-|text-(xs|sm|base|lg|xl)|rounded-(sm|md|lg|xl|full)|border-input|size-[0-9]|flex |grid |space-[xy]-|ring-|shadow-(sm|md|lg)|w-full|h-full|items-|justify-|font-(medium|semibold|bold))' \
	"$TARGET" --include='*.svelte' --include='*.ts' 2>/dev/null; then
	echo "FAIL: tailwind utility classes found"
	fail=1
else
	echo "OK"
fi

echo "== Forbidden imports check =="
if grep -rEn "from ['\"](tailwind-merge|tailwind-variants|tw-animate-css)" "$TARGET" -r 2>/dev/null; then
	echo "FAIL: forbidden tailwind-adjacent imports found"
	fail=1
else
	echo "OK"
fi

echo "== SASS min()/max()/clamp() trap check =="
if grep -rEn '[^#{"]\b(min|max|clamp)\(var\(--' "$TARGET" "$LIB_ROOT/src/lib/styles" --include='*.sass' 2>/dev/null | grep -v '#{"'; then
	echo "FAIL: unquoted min/max/clamp with var() — interpolate: #{\"min(var(--x), N)\"}"
	fail=1
else
	echo "OK"
fi

echo "== Adjacent compound selector check =="
if grep -rEn '> \*[a-z]' "$LIB_ROOT/src/lib/styles" "$TARGET" --include='*.sass' 2>/dev/null; then
	echo "FAIL: invalid adjacent compound selector (e.g. '> *svg')"
	fail=1
else
	echo "OK"
fi

if [ -f "$LIB_ROOT/package.json" ]; then
	echo "== svelte-check =="
	(cd "$LIB_ROOT" && npm run --silent check) || fail=1
fi

if [ "$fail" -eq 0 ]; then
	echo "ALL CHECKS PASSED"
else
	echo "CHECKS FAILED"
fi
exit "$fail"
