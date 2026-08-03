#!/usr/bin/env python3
"""Deterministic frontmatter scan/apply for fractalengine docs (docs/adr, docs/design, docs/routing).

Two subcommands, meant to be used together by an agent:

  scan <paths...>   Read each markdown file, parse any existing frontmatter, and emit
                     JSON with everything a human/agent needs to draft the content-derived
                     fields (title, summary, tags, relates_to, status) without re-parsing
                     YAML by hand. Never writes anything.

  apply <data.json>  Take a JSON object mapping file path -> field updates (the schema
                      fields below) and merge them into each file's frontmatter block,
                      preserving any existing fields not in the schema and leaving the
                      body untouched. Writes files and prints a per-file report.

  scan-registry       Walk agents/skills/* and agents/orchestrators/* (each subfolder is
                      one skill/agent), read its SKILL.md or AGENT.md, and emit JSON with
                      everything needed to draft a skills-and-agents.json registry entry
                      per folder (same field schema, type: skill|agent).

  apply-registry <data.json>  Take a JSON object mapping folder id -> field updates and
                      merge them into agents/skills-and-agents.json, preserving any
                      existing entries/fields not touched by this call.

Schema fields: id, title, type, tags, summary, relates_to, status (adr-only / optional
active|deprecated for skill|agent), source (routing-only / meta file path for skill|agent),
updated.

This script does NOT use PyYAML — the schema is flat enough (strings + inline lists)
that a small regex-based parser avoids an external dependency.
"""
import sys
import os
import re
import json
import glob as globmod
from datetime import date

DEFAULT_REGISTRY_PATH = "agents/skills-and-agents.json"

FIELD_ORDER = ["id", "title", "type", "tags", "summary", "relates_to", "status", "source", "updated"]


def split_frontmatter(text):
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end != -1:
            fm_block = text[4:end]
            body = text[end + 4:]
            if body.startswith("\n"):
                body = body[1:]
            return fm_block, body
    return None, text


def parse_value(raw):
    raw = raw.strip()
    if raw.startswith("[") and raw.endswith("]"):
        inner = raw[1:-1].strip()
        if not inner:
            return []
        return [i.strip().strip('"\'') for i in inner.split(",")]
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        return raw[1:-1]
    return raw


def parse_frontmatter_block(fm_block):
    data = {}
    if fm_block is None:
        return data
    for line in fm_block.split("\n"):
        if not line.strip() or line.strip().startswith("#"):
            continue
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$", line)
        if m:
            data[m.group(1)] = parse_value(m.group(2))
    return data


def _quote_if_needed(v):
    v = str(v)
    if any(c in v for c in [":", "#", '"']) or v != v.strip():
        return json.dumps(v)
    return v


def format_value(val):
    if isinstance(val, list):
        return "[" + ", ".join(_quote_if_needed(v) for v in val) + "]"
    return _quote_if_needed(val)


def render_frontmatter(data):
    lines = ["---"]
    for key in FIELD_ORDER:
        if key in data and data[key] not in (None, "", []):
            lines.append(f"{key}: {format_value(data[key])}")
    for key, val in data.items():
        if key not in FIELD_ORDER and val not in (None, "", []):
            lines.append(f"{key}: {format_value(val)}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def doc_type_from_path(path):
    norm = path.replace("\\", "/")
    if "/docs/adr/" in norm or norm.startswith("docs/adr/"):
        return "adr"
    if "/docs/design/" in norm or norm.startswith("docs/design/"):
        return "design"
    if "/docs/routing/" in norm or norm.startswith("docs/routing/"):
        return "routing"
    return None


def decode_routing_source(stem):
    # routing filenames encode the source path with `--` replacing `/`,
    # e.g. src--lib--components--AIChat.svelte -> src/lib/components/AIChat.svelte
    if "--" in stem:
        return stem.replace("--", "/")
    return None


def derive_id(path, doc_type):
    base = os.path.basename(path)
    stem = base[:-3] if base.endswith(".md") else base
    if doc_type == "adr":
        m = re.match(r"^(ADR-\d+)", stem)
        return m.group(1) if m else stem
    if doc_type == "routing":
        return decode_routing_source(stem) or stem
    return stem  # design docs: filename stem is already the slug


def first_h1(body):
    for line in body.split("\n"):
        m = re.match(r"^#\s+(.*)$", line.strip())
        if m:
            return m.group(1).strip()
    return None


def first_paragraph(body):
    for p in re.split(r"\n\s*\n", body.strip()):
        p = p.strip()
        if p and not p.startswith("#") and not p.startswith("|") and not p.startswith("-"):
            return re.sub(r"\s+", " ", p)[:400]
    return None


def collect_files(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            files.extend(sorted(globmod.glob(os.path.join(p, "**", "*.md"), recursive=True)))
        elif any(ch in p for ch in "*?["):
            files.extend(sorted(globmod.glob(p, recursive=True)))
        else:
            files.append(p)
    return [f for f in files if f.endswith(".md")]


def scan_file(path):
    text = open(path, "r", encoding="utf-8").read()
    fm_block, body = split_frontmatter(text)
    existing = parse_frontmatter_block(fm_block)
    doc_type = existing.get("type") or doc_type_from_path(path)
    result = {
        "path": path,
        "type": doc_type,
        "has_frontmatter": fm_block is not None,
        "existing_frontmatter": existing,
        "derived_id": derive_id(path, doc_type) if doc_type else None,
        "h1_title": first_h1(body),
        "first_paragraph": first_paragraph(body),
    }
    if doc_type == "routing":
        result["derived_source"] = decode_routing_source(os.path.basename(path)[:-3])
    if doc_type == "adr":
        m = re.search(r"(?i)\b(proposed|accepted|superseded)\b", body)
        result["status_hint"] = m.group(1).lower() if m else None
    return result


def cmd_scan(paths):
    files = collect_files(paths)
    print(json.dumps([scan_file(f) for f in files], indent=2))


def cmd_apply(data_path):
    with open(data_path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    report = []
    for path, updates in payload.items():
        text = open(path, "r", encoding="utf-8").read()
        fm_block, body = split_frontmatter(text)
        existing = parse_frontmatter_block(fm_block)
        merged = dict(existing)
        filled = []
        for key in FIELD_ORDER:
            if key in updates and updates[key] not in (None, "", []):
                if key not in existing or existing[key] != updates[key]:
                    filled.append(key)
                merged[key] = updates[key]
        merged["updated"] = updates.get("updated") or str(date.today())
        new_text = render_frontmatter(merged) + "\n" + body.lstrip("\n")
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_text)
        report.append({
            "path": path,
            "action": "updated" if fm_block else "created",
            "fields_filled_or_changed": filled,
            "fields_kept_as_is": [k for k in existing if k not in filled],
        })
    print(json.dumps(report, indent=2))


def find_meta_file(dir_path):
    for name in ("SKILL.md", "AGENT.md"):
        p = os.path.join(dir_path, name)
        if os.path.isfile(p):
            return p
    return None


def scan_registry_dir(root, type_label):
    entries = []
    if not os.path.isdir(root):
        return entries
    for name in sorted(os.listdir(root)):
        sub = os.path.join(root, name)
        if not os.path.isdir(sub):
            continue
        meta_path = find_meta_file(sub)
        if not meta_path:
            continue
        text = open(meta_path, "r", encoding="utf-8").read()
        fm_block, body = split_frontmatter(text)
        fm = parse_frontmatter_block(fm_block)
        entries.append({
            "id": name,
            "type": type_label,
            "meta_path": meta_path,
            "frontmatter_name": fm.get("name"),
            "frontmatter_description": fm.get("description"),
            "h1_title": first_h1(body),
            "first_paragraph": first_paragraph(body),
        })
    return entries


def cmd_scan_registry(skills_root, orchestrators_root, registry_path):
    existing = {}
    if registry_path and os.path.isfile(registry_path):
        with open(registry_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
    result = {
        "registry_path": registry_path,
        "existing_registry_ids": sorted(existing.keys()),
        "skills": scan_registry_dir(skills_root, "skill"),
        "agents": scan_registry_dir(orchestrators_root, "agent"),
    }
    print(json.dumps(result, indent=2))


def cmd_apply_registry(data_path, registry_path):
    with open(data_path, "r", encoding="utf-8") as f:
        updates = json.load(f)  # dict: id -> field updates
    registry = {}
    if os.path.isfile(registry_path):
        with open(registry_path, "r", encoding="utf-8") as f:
            registry = json.load(f)
    report = []
    for entry_id, fields in updates.items():
        was_present = entry_id in registry
        existing_entry = registry.get(entry_id, {})
        merged = dict(existing_entry)
        changed = []
        for key in FIELD_ORDER:
            if key in fields and fields[key] not in (None, "", []):
                if key not in existing_entry or existing_entry[key] != fields[key]:
                    changed.append(key)
                merged[key] = fields[key]
        merged["updated"] = fields.get("updated") or str(date.today())
        registry[entry_id] = merged
        report.append({
            "id": entry_id,
            "action": "updated" if was_present else "created",
            "fields_filled_or_changed": changed,
            "fields_kept_as_is": [k for k in existing_entry if k not in changed],
        })
    os.makedirs(os.path.dirname(registry_path) or ".", exist_ok=True)
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(registry.items())), f, indent=2)
        f.write("\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            "usage:\n"
            "  frontmatter_tool.py scan <paths...>\n"
            "  frontmatter_tool.py apply <data.json>\n"
            "  frontmatter_tool.py scan-registry [--skills-root DIR] [--orchestrators-root DIR] [--registry FILE]\n"
            "  frontmatter_tool.py apply-registry <data.json> [--registry FILE]",
            file=sys.stderr,
        )
        sys.exit(1)

    cmd = sys.argv[1]
    rest = sys.argv[2:]

    def flag(name, default):
        if name in rest:
            i = rest.index(name)
            return rest[i + 1]
        return default

    if cmd == "scan":
        cmd_scan(rest)
    elif cmd == "apply":
        cmd_apply(rest[0])
    elif cmd == "scan-registry":
        cmd_scan_registry(
            flag("--skills-root", "agents/skills"),
            flag("--orchestrators-root", "agents/orchestrators"),
            flag("--registry", DEFAULT_REGISTRY_PATH),
        )
    elif cmd == "apply-registry":
        cmd_apply_registry(rest[0], flag("--registry", DEFAULT_REGISTRY_PATH))
    else:
        print(f"unknown command: {cmd}", file=sys.stderr)
        sys.exit(1)
