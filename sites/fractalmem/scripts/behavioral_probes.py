#!/usr/bin/env python3
"""
Weekly behavioral probes — the three tests named in the original Phase 0
plan: duplicate-work, convention-recall, conflict. Where run_probes.py
checks "does a specific query return the expected content", this script
checks whole-store *properties* that don't need you to write out a query
in advance.

Usage:
    python scripts/behavioral_probes.py                # uses .skaa/smriti.db
    python scripts/behavioral_probes.py --db path.db --log docs/metrics/SMRITI-LOG.md
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

THIS_DIR = Path(__file__).resolve().parent
PACKAGE_ROOT = THIS_DIR.parent
sys.path.insert(0, str(PACKAGE_ROOT / "server"))

from skaa.db import SmritiStore  # noqa: E402
from skaa.samskara import duplicate_candidates, find_conflicts  # noqa: E402


def convention_recall_from_probes(store: SmritiStore, probes_path: Path) -> dict:
    """Runs only the convention-recall-tagged probes from memory-probes.yaml, if any."""
    try:
        import yaml
    except ImportError:
        return {"skipped": "PyYAML not installed"}
    if not probes_path.exists():
        return {"skipped": f"no probes file at {probes_path}"}
    data = yaml.safe_load(probes_path.read_text())
    probes = [p for p in data.get("probes", []) if p.get("category") == "convention-recall"]
    if not probes:
        return {"skipped": "no convention-recall probes defined yet — add some to memory-probes.yaml"}
    passed = 0
    for p in probes:
        hits = store.query(p["query"], top_k=p.get("top_k", 5))
        expect = p.get("expect_contains", "").lower()
        if hits and any(expect in (h["content"] or "").lower() for h in hits):
            passed += 1
    return {"passed": passed, "total": len(probes)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=".skaa/smriti.db")
    ap.add_argument("--probes", default=str(THIS_DIR / "memory-probes.yaml"))
    ap.add_argument("--log", default="docs/metrics/SMRITI-LOG.md")
    ap.add_argument("--dup-threshold", type=float, default=0.6)
    ap.add_argument("--no-log", action="store_true")
    args = ap.parse_args()

    store = SmritiStore(Path(args.db))

    dupes = duplicate_candidates(store, threshold=args.dup_threshold)
    conflicts = find_conflicts(store)
    conv = convention_recall_from_probes(store, Path(args.probes))
    total_entries = store.count()
    store.close()

    print("SKAA weekly behavioral probes")
    print("=" * 40)
    print(f"\n1. Duplicate-work check (token-overlap >= {args.dup_threshold}):")
    if dupes:
        for d in dupes:
            print(f"   - [{d['karma_prefix']}] overlap={d['overlap']} entries {d['entry_a'][:8]}.. / {d['entry_b'][:8]}..")
        print(f"   -> {len(dupes)} likely duplicate-work pair(s) found. Recall should have caught these.")
    else:
        print("   -> none found — no evidence of duplicate work in current smriti.")

    print("\n2. Convention-recall check (from memory-probes.yaml, category=convention-recall):")
    if "skipped" in conv:
        print(f"   -> skipped: {conv['skipped']}")
    else:
        print(f"   -> {conv['passed']}/{conv['total']} convention probes recalled correctly")

    print("\n3. Conflict check (opposing standing preferences in the same domain):")
    if conflicts:
        for c in conflicts:
            print(f"   - [{c['karma_prefix']}] {c['pattern']}")
        print(f"   -> {len(conflicts)} potential conflict(s) — review manually, this script does not adjudicate.")
    else:
        print("   -> none of the known negation patterns found in conflict.")

    if not args.no_log:
        log_path = Path(args.log)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        if not log_path.exists():
            log_path.write_text(
                "# Smrti Log\n\n"
                "| Date | Total entries | Probe pass rate | Notes |\n"
                "|---|---|---|---|\n"
            )
        conv_note = f"conv {conv['passed']}/{conv['total']}" if "passed" in conv else "conv skipped"
        with log_path.open("a") as f:
            f.write(
                f"| {date.today().isoformat()} | {total_entries} | n/a | "
                f"behavioral_probes.py: {len(dupes)} dup-candidates, {conv_note}, "
                f"{len(conflicts)} conflicts |\n"
            )
        print(f"\nAppended a row to {log_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
