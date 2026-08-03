#!/usr/bin/env python3
"""
Phase 0 measurement harness — recall probe runner.

This is the piece the July 15 FractalEngine SKAA-INTEGRATION-PLAN specified
(scripts/memory-probes.yaml + a runner) but which the July 29 audit found
had never actually been built. Run it after install, then weekly (or via
the CHECKLIST.md cadence) to track whether recall quality holds up as
smriti grows.

Usage:
    python scripts/run_probes.py                  # uses .skaa/smriti.db, memory-probes.yaml
    python scripts/run_probes.py --db path/to.db --probes path/to.yaml
    python scripts/run_probes.py --no-log          # print only, skip SMRITI-LOG.md append

Exit code is 0 if all "recall" probes pass, 1 otherwise — wire this into
CI or a cron job if you want a hard signal on recall regressions.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    print("This script needs PyYAML: pip install pyyaml", file=sys.stderr)
    raise SystemExit(1)

THIS_DIR = Path(__file__).resolve().parent
PACKAGE_ROOT = THIS_DIR.parent
sys.path.insert(0, str(PACKAGE_ROOT / "server"))

from skaa.db import SmritiStore  # noqa: E402


def load_probes(path: Path) -> list[dict]:
    data = yaml.safe_load(path.read_text())
    return [p for p in data.get("probes", []) if p.get("category") == "recall"]


def run(db_path: Path, probes_path: Path) -> tuple[list[dict], int, int]:
    store = SmritiStore(db_path)
    probes = load_probes(probes_path)
    results = []
    passed = 0
    for p in probes:
        hits = store.query(p["query"], top_k=p.get("top_k", 5))
        expect = p.get("expect_contains", "")
        ok = any(expect.lower() in (h["content"] or "").lower() for h in hits) if hits else False
        if ok:
            passed += 1
        results.append(
            {
                "id": p["id"],
                "description": p.get("description", ""),
                "query": p["query"],
                "expect_contains": expect,
                "ok": ok,
                "hit_count": len(hits),
                "top_hit_excerpt": (hits[0]["content"][:120] + "...") if hits else None,
            }
        )
    store.close()
    return results, passed, len(probes)


def append_to_log(log_path: Path, passed: int, total: int, db_entry_count: int) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    if not log_path.exists():
        log_path.write_text(
            "# Smrti Log\n\n"
            "Append one row per metrics/probe run. See docs/metrics/SMRITI-LOG.md "
            "template comments for column meaning.\n\n"
            "| Date | Total entries | Probe pass rate | Notes |\n"
            "|---|---|---|---|\n"
        )
    rate = f"{passed}/{total}" if total else "0/0"
    with log_path.open("a") as f:
        f.write(f"| {date.today().isoformat()} | {db_entry_count} | {rate} | run_probes.py |\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=".skaa/smriti.db")
    ap.add_argument("--probes", default=str(THIS_DIR / "memory-probes.yaml"))
    ap.add_argument("--log", default="docs/metrics/SMRITI-LOG.md")
    ap.add_argument("--no-log", action="store_true")
    args = ap.parse_args()

    db_path = Path(args.db)
    probes_path = Path(args.probes)
    if not probes_path.exists():
        print(f"No probes file at {probes_path}", file=sys.stderr)
        return 1

    results, passed, total = run(db_path, probes_path)

    print(f"SKAA recall probes: {passed}/{total} passed\n")
    for r in results:
        mark = "PASS" if r["ok"] else "FAIL"
        print(f"[{mark}] {r['id']} — {r['description'].strip()}")
        print(f"       query={r['query']!r} expect_contains={r['expect_contains']!r} hits={r['hit_count']}")
        if r["top_hit_excerpt"]:
            print(f"       top hit: {r['top_hit_excerpt']}")
        print()

    if not args.no_log:
        store = SmritiStore(db_path)
        count = store.count()
        store.close()
        append_to_log(Path(args.log), passed, total, count)
        print(f"Appended a row to {args.log}")

    return 0 if passed == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
