"""
SQLite storage layer for SKAA smrti.

One database file per project (default: <project>/.skaa/smriti.db). This
is a deliberate change from the original sanskrit-harness, which scanned
per-session JSON files on disk for cross-session recall — that worked but
doesn't scale past a few hundred entries and can't be queried or measured
without loading every file. SQLite gives us both a stable schema and cheap
aggregate queries for the measurement harness (see scripts/smriti-metrics.sh
and scripts/run_probes.py). See docs/ADR-001-schema.md for the full
rationale and alternatives considered.
"""

from __future__ import annotations

import json
import re
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from .models import PRAMANA_WEIGHT, Pramana

SCHEMA = """
CREATE TABLE IF NOT EXISTS smriti (
    entry_id      TEXT PRIMARY KEY,
    session_id    TEXT NOT NULL,
    created_at    TEXT NOT NULL,
    content       TEXT NOT NULL,
    pramana       TEXT NOT NULL,
    karta         TEXT NOT NULL,
    karma         TEXT NOT NULL,
    karana        TEXT DEFAULT '',
    sampradana    TEXT DEFAULT '',
    apadana       TEXT DEFAULT '',
    adhikarana    TEXT DEFAULT '',
    dhatu_cluster TEXT DEFAULT '',
    karaka_role   TEXT DEFAULT '',
    tags          TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_smriti_session ON smriti(session_id);
CREATE INDEX IF NOT EXISTS idx_smriti_dhatu ON smriti(dhatu_cluster);
CREATE INDEX IF NOT EXISTS idx_smriti_created ON smriti(created_at);

CREATE TABLE IF NOT EXISTS samskara_proposals (
    proposal_id       TEXT PRIMARY KEY,
    session_id        TEXT NOT NULL,
    rule              TEXT NOT NULL,
    domain            TEXT NOT NULL,
    notes             TEXT DEFAULT '',
    status            TEXT NOT NULL DEFAULT 'pending',
    created_at        TEXT NOT NULL,
    source_entry_ids  TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS samskara_rules (
    rule_id      TEXT PRIMARY KEY,
    proposal_id  TEXT,
    domain       TEXT NOT NULL,
    rule         TEXT NOT NULL,
    applied_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id  TEXT PRIMARY KEY,
    started_at  TEXT NOT NULL,
    closed_at   TEXT
);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


class SmritiStore:
    """Thin synchronous wrapper around one project's smriti.db.

    Not thread-safe by design — SKAA is meant to run as a single MCP
    server process per project. If you need concurrent writers, put a
    queue in front of this, don't add locking here.
    """

    def __init__(self, db_path: str | Path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    @contextmanager
    def _cursor(self):
        cur = self._conn.cursor()
        try:
            yield cur
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise
        finally:
            cur.close()

    # ---- sessions -----------------------------------------------------

    def touch_session(self, session_id: str) -> None:
        with self._cursor() as cur:
            cur.execute(
                "INSERT OR IGNORE INTO sessions(session_id, started_at) VALUES (?, ?)",
                (session_id, now_iso()),
            )

    def close_session(self, session_id: str) -> None:
        with self._cursor() as cur:
            cur.execute(
                "UPDATE sessions SET closed_at = ? WHERE session_id = ?",
                (now_iso(), session_id),
            )

    # ---- smriti CRUD ----------------------------------------------------

    def write(
        self,
        *,
        session_id: str,
        content: str,
        pramana: str,
        karta: str,
        karma: str,
        karana: str = "",
        sampradana: str = "",
        apadana: str = "",
        adhikarana: str = "",
        dhatu_cluster: str = "",
        karaka_role: str = "",
        tags: str = "",
    ) -> dict:
        pramana = (pramana or "").strip().lower()
        if pramana not in Pramana.values():
            raise ValueError(
                f"pramana must be one of {Pramana.values()}, got {pramana!r}"
            )
        if not content or not content.strip():
            raise ValueError("content must not be empty")
        if not karta or not karta.strip():
            raise ValueError("karta is mandatory (SYS-02)")
        if not karma or not karma.strip():
            raise ValueError("karma is mandatory (SYS-02)")

        entry_id = new_id()
        created_at = now_iso()
        self.touch_session(session_id)
        with self._cursor() as cur:
            cur.execute(
                """
                INSERT INTO smriti (
                    entry_id, session_id, created_at, content, pramana,
                    karta, karma, karana, sampradana, apadana, adhikarana,
                    dhatu_cluster, karaka_role, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry_id, session_id, created_at, content.strip(), pramana,
                    karta.strip(), karma.strip(), karana, sampradana, apadana,
                    adhikarana, dhatu_cluster, karaka_role, tags,
                ),
            )
        return {"entry_id": entry_id, "created_at": created_at, "pramana": pramana}

    def _score(self, query_tokens: list[str], row: sqlite3.Row) -> int:
        haystack = f"{row['content']} {row['tags']} {row['karma']}".lower()
        return sum(1 for t in query_tokens if t in haystack)

    def query(
        self,
        query: str,
        *,
        dhatu_cluster: str = "",
        karaka_role: str = "",
        pramana_min: str = "",
        session_id: str | None = None,
        top_k: int = 10,
    ) -> list[dict]:
        sql = "SELECT * FROM smriti WHERE 1=1"
        params: list = []
        if session_id:
            sql += " AND session_id = ?"
            params.append(session_id)
        if dhatu_cluster:
            sql += " AND dhatu_cluster LIKE ?"
            params.append(f"%{dhatu_cluster}%")
        if karaka_role:
            sql += " AND karaka_role LIKE ?"
            params.append(f"%{karaka_role}%")
        min_weight = 0
        if pramana_min:
            pramana_min_norm = pramana_min.strip().lower()
            min_weight = PRAMANA_WEIGHT.get(pramana_min_norm, 0)

        with self._cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

        if min_weight:
            rows = [r for r in rows if PRAMANA_WEIGHT.get(r["pramana"], 0) >= min_weight]

        tokens = [t for t in re.findall(r"[a-zA-Z0-9']+", query.lower()) if t]
        scored = [(self._score(tokens, r) if tokens else 0, r["created_at"], r) for r in rows]
        # highest overlap score first, then most recent
        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)

        out = []
        for score, _, row in scored[: max(top_k, 0)]:
            d = dict(row)
            d["_match_score"] = score
            out.append(d)
        return out

    def get_by_id(self, entry_id: str) -> dict | None:
        with self._cursor() as cur:
            cur.execute("SELECT * FROM smriti WHERE entry_id = ?", (entry_id,))
            row = cur.fetchone()
        return dict(row) if row else None

    def all_entries(self, session_id: str | None = None) -> list[dict]:
        with self._cursor() as cur:
            if session_id:
                cur.execute(
                    "SELECT * FROM smriti WHERE session_id = ? ORDER BY created_at",
                    (session_id,),
                )
            else:
                cur.execute("SELECT * FROM smriti ORDER BY created_at")
            rows = cur.fetchall()
        return [dict(r) for r in rows]

    def count(self) -> int:
        with self._cursor() as cur:
            cur.execute("SELECT COUNT(*) AS n FROM smriti")
            return cur.fetchone()["n"]

    # ---- samskara -------------------------------------------------------

    def stage_proposal(
        self, *, session_id: str, rule: str, domain: str, notes: str,
        source_entry_ids: list[str],
    ) -> dict:
        proposal_id = new_id()
        created_at = now_iso()
        with self._cursor() as cur:
            cur.execute(
                """
                INSERT INTO samskara_proposals (
                    proposal_id, session_id, rule, domain, notes, status,
                    created_at, source_entry_ids
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
                """,
                (
                    proposal_id, session_id, rule, domain, notes, created_at,
                    json.dumps(source_entry_ids),
                ),
            )
        return {"proposal_id": proposal_id, "created_at": created_at}

    def list_proposals(self, status: str = "pending") -> list[dict]:
        with self._cursor() as cur:
            if status == "all":
                cur.execute("SELECT * FROM samskara_proposals ORDER BY created_at")
            else:
                cur.execute(
                    "SELECT * FROM samskara_proposals WHERE status = ? ORDER BY created_at",
                    (status,),
                )
            rows = cur.fetchall()
        out = []
        for r in rows:
            d = dict(r)
            d["source_entry_ids"] = json.loads(d["source_entry_ids"] or "[]")
            out.append(d)
        return out

    def apply_proposals(self, proposal_ids: list[str]) -> dict:
        applied, missing, already = [], [], []
        with self._cursor() as cur:
            for pid in proposal_ids:
                cur.execute(
                    "SELECT * FROM samskara_proposals WHERE proposal_id = ?", (pid,)
                )
                row = cur.fetchone()
                if not row:
                    missing.append(pid)
                    continue
                if row["status"] != "pending":
                    already.append(pid)
                    continue
                rule_id = new_id()
                applied_at = now_iso()
                cur.execute(
                    """
                    INSERT INTO samskara_rules (rule_id, proposal_id, domain, rule, applied_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (rule_id, pid, row["domain"], row["rule"], applied_at),
                )
                cur.execute(
                    "UPDATE samskara_proposals SET status = 'applied' WHERE proposal_id = ?",
                    (pid,),
                )
                applied.append({"proposal_id": pid, "rule_id": rule_id})
        return {"applied": applied, "already_resolved": already, "missing": missing}

    def list_rules(self) -> list[dict]:
        with self._cursor() as cur:
            cur.execute("SELECT * FROM samskara_rules ORDER BY applied_at")
            rows = cur.fetchall()
        return [dict(r) for r in rows]
