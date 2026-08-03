"""
The data model SKAA entries are built from.

Two independent classification axes sit on top of a plain episodic log:

1. pramana — the means by which the karta (agent) came to know the content.
   This is NOT a quality/confidence score. It is an honesty requirement:
   every entry must say how it knows what it claims.

2. karaka roles — Panini's six karakas, i.e. "who did what, to what, with
   what instrument, for whose benefit, from what source, in what context."
   karta and karma are mandatory (SYS-02); the rest are optional detail.

dhatu_cluster is a free-text tag naming the *verbal root* of the action
(e.g. "kr" = to make/do, "jna" = to know, "smr" = to remember) rather than
the subject matter. It is intentionally not an enum — see SUTRAS.md SYS-05
for why, and docs/ARCHITECTURE.md for the suggested starter list.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Pramana(str, Enum):
    """The four classical means of knowledge (pramana) used to source a claim."""

    PRATYAKSA = "pratyaksa"  # direct perception — the agent did/saw this itself
    ANUMANA = "anumana"      # inference — concluded from other evidence
    SABDA = "sabda"          # testimony — reported by someone/something else
    UPAMANA = "upamana"      # analogy/comparison — known by likeness to a known thing

    @classmethod
    def values(cls) -> list[str]:
        return [p.value for p in cls]


# Ordinal used ONLY for the pramana_min recall filter (skaa_memory_query).
# This is an engineering convenience for "how directly did the agent know
# this", not a philosophical ranking of one pramana over another — see
# SUTRAS.md SYS-04.
PRAMANA_WEIGHT: dict[str, int] = {
    Pramana.PRATYAKSA.value: 4,
    Pramana.ANUMANA.value: 3,
    Pramana.UPAMANA.value: 2,
    Pramana.SABDA.value: 1,
}


class Karaka(str, Enum):
    """Panini's six karakas — the grammatical roles an entry's content can foreground."""

    KARTA = "karta"              # agent/doer
    KARMA = "karma"              # object/goal of the action
    KARANA = "karana"            # instrument
    SAMPRADANA = "sampradana"    # recipient/beneficiary
    APADANA = "apadana"          # point of departure/source
    ADHIKARANA = "adhikarana"    # locus/context


# A starter vocabulary for dhatu_cluster. Free text is allowed; this list
# exists so a new project doesn't have to invent root names from scratch.
SUGGESTED_DHATU_ROOTS: dict[str, str] = {
    "kr": "to make/do — general action, building, producing",
    "jna": "to know — analysis, audits, epistemic work",
    "dhr": "to hold/sustain — infrastructure, continuity, maintenance",
    "cit": "to perceive/think — design, ideation, conceptual work",
    "man": "to think/consider — planning, deliberation",
    "smr": "to remember — memory-system work itself, recall, logging",
    "dris": "to see — observation, review, QA, reading",
    "gam": "to go — navigation, traversal, search, routing",
    "vad": "to speak — communication, reporting, writing prose",
    "yaj": "to offer/worship — delivery, presenting finished work",
}


@dataclass
class SmritiEntry:
    """One row of smrti — a single remembered episode."""

    entry_id: str
    session_id: str
    created_at: str
    content: str
    pramana: str
    karta: str
    karma: str
    karana: str = ""
    sampradana: str = ""
    apadana: str = ""
    adhikarana: str = ""
    dhatu_cluster: str = ""
    karaka_role: str = ""
    tags: str = ""

    def as_dict(self) -> dict:
        return {
            "entry_id": self.entry_id,
            "session_id": self.session_id,
            "created_at": self.created_at,
            "content": self.content,
            "pramana": self.pramana,
            "karta": self.karta,
            "karma": self.karma,
            "karana": self.karana,
            "sampradana": self.sampradana,
            "apadana": self.apadana,
            "adhikarana": self.adhikarana,
            "dhatu_cluster": self.dhatu_cluster,
            "karaka_role": self.karaka_role,
            "tags": self.tags,
        }


@dataclass
class SamskaraProposal:
    """A candidate durable rule mined from a pattern in smrti.

    Per SYS-03, a proposal is inert until a human (or an explicit
    skaa_samskara_apply call naming its id) promotes it. Session close
    only ever creates proposals with status="pending".
    """

    proposal_id: str
    session_id: str
    rule: str
    domain: str
    notes: str
    status: str = "pending"  # pending | applied | rejected
    created_at: str = ""
    source_entry_ids: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {
            "proposal_id": self.proposal_id,
            "session_id": self.session_id,
            "rule": self.rule,
            "domain": self.domain,
            "notes": self.notes,
            "status": self.status,
            "created_at": self.created_at,
            "source_entry_ids": self.source_entry_ids,
        }
