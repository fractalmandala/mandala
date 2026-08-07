// Mechanical rebuild of docs/INDEX.md from existing frontmatter + agents/skills-and-agents.json.
//
// This module deliberately does NOT generate frontmatter content (title/summary/tags/relates_to) —
// that requires judgment about what a doc/skill is actually for, which belongs to whichever agent
// authored it (see agents/skills/doc-frontmatter). This module only re-renders the index table rows
// from whatever frontmatter already exists on disk, and flags files that have none yet so an agent
// can fill them in later. It's invoked lazily from the frontend on an idle timer — see
// ide.svelte.ts's docs-index watcher — never on app startup.

use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

#[derive(Serialize, Debug, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DocsIndexReport {
    pub adr_count: usize,
    pub design_count: usize,
    pub routing_count: usize,
    pub areas_count: usize,
    pub guides_count: usize,
    pub plans_count: usize,
    pub archive_count: usize,
    pub skill_count: usize,
    pub agent_count: usize,
    pub missing_frontmatter: Vec<String>,
    pub unregistered_skills_or_agents: Vec<String>,
}

#[derive(Debug, Default, Clone)]
struct FrontMatter {
    id: Option<String>,
    title: Option<String>,
    tags: Vec<String>,
    summary: Option<String>,
    relates_to: Vec<String>,
    status: Option<String>,
    source: Option<String>,
}

fn parse_value(raw: &str) -> (Option<String>, Vec<String>) {
    let raw = raw.trim();
    if raw.starts_with('[') && raw.ends_with(']') {
        let inner = &raw[1..raw.len().saturating_sub(1)];
        let items: Vec<String> = inner
            .split(',')
            .map(|s| s.trim().trim_matches('"').trim_matches('\'').to_string())
            .filter(|s| !s.is_empty())
            .collect();
        (None, items)
    } else if raw.is_empty() {
        (None, vec![])
    } else {
        (
            Some(raw.trim_matches('"').trim_matches('\'').to_string()),
            vec![],
        )
    }
}

// Parses a flat YAML-ish frontmatter block (the schema doc-frontmatter writes: scalar strings and
// inline `[a, b]` lists, no nesting). Returns None if the file has no `---` frontmatter block.
fn parse_frontmatter(text: &str) -> Option<FrontMatter> {
    if !text.starts_with("---\n") {
        return None;
    }
    let rest = &text[4..];
    let end = rest.find("\n---")?;
    let block = &rest[..end];

    let mut fm = FrontMatter::default();
    for line in block.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some(idx) = line.find(':') {
            let key = line[..idx].trim();
            let val = &line[idx + 1..];
            let (scalar, list) = parse_value(val);
            match key {
                "id" => fm.id = scalar,
                "title" => fm.title = scalar,
                "tags" => fm.tags = list,
                "summary" => fm.summary = scalar,
                "relates_to" => fm.relates_to = list,
                "status" => fm.status = scalar,
                "source" => fm.source = scalar,
                _ => {}
            }
        }
    }
    // A doc with a frontmatter block but no id is treated as not-yet-indexed — same convention
    // as the doc-frontmatter Python tool.
    if fm.id.is_some() {
        Some(fm)
    } else {
        None
    }
}

fn scan_docs_dir(root: &Path, sub: &str) -> (Vec<(String, FrontMatter)>, Vec<String>) {
    let dir = root.join(sub);
    let mut rows = Vec::new();
    let mut missing = Vec::new();
    let mut entries: Vec<_> = match fs::read_dir(&dir) {
        Ok(rd) => rd.filter_map(|e| e.ok()).collect(),
        Err(_) => return (rows, missing),
    };
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        let rel = format!("{}/{}", sub, path.file_name().unwrap().to_string_lossy());
        let text = match fs::read_to_string(&path) {
            Ok(t) => t,
            Err(_) => continue,
        };
        match parse_frontmatter(&text) {
            Some(fm) => rows.push((rel, fm)),
            None => missing.push(rel),
        }
    }
    (rows, missing)
}

fn md_cell(s: &str) -> String {
    s.replace('|', "\\|")
}

fn render_adr_table(rows: &[(String, FrontMatter)]) -> String {
    let mut sorted = rows.to_vec();
    sorted.sort_by(|a, b| a.1.id.cmp(&b.1.id));
    let mut out = String::from(
        "| ID | Title | Status | Tags | Relates To | File |\n|---|---|---|---|---|---|\n",
    );
    for (path, fm) in &sorted {
        out.push_str(&format!(
            "| {} | {} | {} | {} | {} | [{}]({}) |\n",
            fm.id.as_deref().unwrap_or(""),
            md_cell(fm.title.as_deref().unwrap_or("")),
            fm.status.as_deref().unwrap_or(""),
            fm.tags.join(", "),
            fm.relates_to.join(", "),
            path,
            path
        ));
    }
    out
}

fn render_simple_table(rows: &[(String, FrontMatter)]) -> String {
    let mut sorted = rows.to_vec();
    sorted.sort_by(|a, b| a.1.id.cmp(&b.1.id));
    let mut out =
        String::from("| ID | Title | Tags | Relates To | File |\n|---|---|---|---|---|\n");
    for (path, fm) in &sorted {
        out.push_str(&format!(
            "| {} | {} | {} | {} | [{}]({}) |\n",
            fm.id.as_deref().unwrap_or(""),
            md_cell(fm.title.as_deref().unwrap_or("")),
            fm.tags.join(", "),
            fm.relates_to.join(", "),
            path,
            path
        ));
    }
    out
}

fn render_plans_table(rows: &[(String, FrontMatter)]) -> String {
    let mut sorted = rows.to_vec();
    sorted.sort_by(|a, b| a.1.id.cmp(&b.1.id));
    let mut out = String::from(
        "| ID | Title | Status | Tags | Relates To | File |\n|---|---|---|---|---|---|\n",
    );
    for (path, fm) in &sorted {
        out.push_str(&format!(
            "| {} | {} | {} | {} | {} | [{}]({}) |\n",
            fm.id.as_deref().unwrap_or(""),
            md_cell(fm.title.as_deref().unwrap_or("")),
            fm.status.as_deref().unwrap_or(""),
            fm.tags.join(", "),
            fm.relates_to.join(", "),
            path,
            path
        ));
    }
    out
}

fn render_routing_table(rows: &[(String, FrontMatter)]) -> String {
    let mut sorted = rows.to_vec();
    sorted.sort_by(|a, b| {
        let sa =
            a.1.source
                .clone()
                .unwrap_or_else(|| a.1.id.clone().unwrap_or_default());
        let sb =
            b.1.source
                .clone()
                .unwrap_or_else(|| b.1.id.clone().unwrap_or_default());
        sa.cmp(&sb)
    });
    let mut out =
        String::from("| Source | Title | Tags | Relates To | Doc File |\n|---|---|---|---|---|\n");
    for (path, fm) in &sorted {
        let src = fm
            .source
            .as_deref()
            .unwrap_or_else(|| fm.id.as_deref().unwrap_or(""));
        out.push_str(&format!(
            "| `{}` | {} | {} | {} | [{}]({}) |\n",
            src,
            md_cell(fm.title.as_deref().unwrap_or("")),
            fm.tags.join(", "),
            fm.relates_to.join(", "),
            path,
            path
        ));
    }
    out
}

fn registry_field<'a>(v: &'a serde_json::Value, key: &str) -> &'a str {
    v.get(key).and_then(|x| x.as_str()).unwrap_or("")
}

fn registry_list(v: &serde_json::Value, key: &str) -> String {
    v.get(key)
        .and_then(|x| x.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|i| i.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        })
        .unwrap_or_default()
}

fn render_registry_table(
    registry: &BTreeMap<String, serde_json::Value>,
    type_filter: &str,
    with_status: bool,
) -> String {
    let mut out = String::new();
    if with_status {
        out.push_str("| ID | Title | Tags | Summary | Relates To | Status | Source |\n|---|---|---|---|---|---|---|\n");
    } else {
        out.push_str(
            "| ID | Title | Tags | Summary | Relates To | Source |\n|---|---|---|---|---|---|\n",
        );
    }
    for (id, v) in registry {
        if registry_field(v, "type") != type_filter {
            continue;
        }
        let title = registry_field(v, "title");
        let title = if title.is_empty() { id.as_str() } else { title };
        let tags = registry_list(v, "tags");
        let summary = registry_field(v, "summary");
        let relates_to = registry_list(v, "relates_to");
        let source = registry_field(v, "source");
        if with_status {
            let status = registry_field(v, "status");
            out.push_str(&format!(
                "| {} | {} | {} | {} | {} | {} | [{}]({}) |\n",
                id,
                md_cell(title),
                tags,
                md_cell(summary),
                relates_to,
                status,
                source,
                source
            ));
        } else {
            out.push_str(&format!(
                "| {} | {} | {} | {} | {} | [{}]({}) |\n",
                id,
                md_cell(title),
                tags,
                md_cell(summary),
                relates_to,
                source,
                source
            ));
        }
    }
    out
}

fn find_unregistered(
    root: &Path,
    sub: &str,
    registry: &BTreeMap<String, serde_json::Value>,
) -> Vec<String> {
    let dir = root.join(sub);
    let mut missing = Vec::new();
    let entries = match fs::read_dir(&dir) {
        Ok(rd) => rd.filter_map(|e| e.ok()).collect::<Vec<_>>(),
        Err(_) => return missing,
    };
    for entry in entries {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        let has_meta = path.join("SKILL.md").is_file() || path.join("AGENT.md").is_file();
        if has_meta && !registry.contains_key(&name) {
            missing.push(format!("{}/{}", sub, name));
        }
    }
    missing
}

pub fn rebuild(root_path: &str) -> Result<DocsIndexReport, String> {
    let root = Path::new(root_path);

    let (adr_rows, mut missing) = scan_docs_dir(root, "docs/adr");
    let (design_rows, design_missing) = scan_docs_dir(root, "docs/design");
    let routing_rows: Vec<(String, FrontMatter)> = Vec::new();
    let (areas_rows, areas_missing) = scan_docs_dir(root, "docs/areas");
    let (guides_rows, guides_missing) = scan_docs_dir(root, "docs/guides");
    let (plans_rows, plans_missing) = scan_docs_dir(root, "docs/plans");
    let (archive_rows, archive_missing) = scan_docs_dir(root, "docs/archive");

    missing.extend(design_missing);
    missing.extend(areas_missing);
    missing.extend(guides_missing);
    missing.extend(plans_missing);
    missing.extend(archive_missing);

    let registry_path = root.join("agents/skills-and-agents.json");
    let registry: BTreeMap<String, serde_json::Value> = match fs::read_to_string(&registry_path) {
        Ok(text) => serde_json::from_str(&text).map_err(|e| e.to_string())?,
        Err(_) => BTreeMap::new(),
    };

    let skill_count = registry
        .values()
        .filter(|v| registry_field(v, "type") == "skill")
        .count();
    let agent_count = registry
        .values()
        .filter(|v| registry_field(v, "type") == "agent")
        .count();

    let mut unregistered = find_unregistered(root, "agents/skills", &registry);
    unregistered.extend(find_unregistered(root, "agents/orchestrators", &registry));

    let mut body = String::new();
    body.push_str("# Docs & Agents Index\n\n");
    body.push_str("Single manifest over `docs/adr/`, `docs/design/`, `docs/routing/`, and `agents/skills-and-agents.json`.\n");
    body.push_str("Read **this file** to find the relevant doc/skill/agent before opening any individual file — see the directive in AGENTS.md.\n\n");

    // Total count calculation line
    let total_docs_desc = if routing_rows.is_empty() {
        format!(
            "_{} ADRs · {} design docs · {} areas · {} guides · {} plans · {} archive docs · {} skills · {} agents · mechanically rebuilt by `rebuild_docs_index` (frontmatter authored by `agents/skills/doc-frontmatter`)_\n\n",
            adr_rows.len(), design_rows.len(), areas_rows.len(), guides_rows.len(), plans_rows.len(), archive_rows.len(), skill_count, agent_count
        )
    } else {
        format!(
            "_{} ADRs · {} design docs · {} routing docs · {} areas · {} guides · {} plans · {} archive docs · {} skills · {} agents · mechanically rebuilt by `rebuild_docs_index` (frontmatter authored by `agents/skills/doc-frontmatter`)_\n\n",
            adr_rows.len(), design_rows.len(), routing_rows.len(), areas_rows.len(), guides_rows.len(), plans_rows.len(), archive_rows.len(), skill_count, agent_count
        )
    };
    body.push_str(&total_docs_desc);

    body.push_str("## ADRs (`docs/adr/`)\n\n");
    body.push_str(&render_adr_table(&adr_rows));
    body.push('\n');

    body.push_str("## Design Docs (`docs/design/`)\n\n");
    body.push_str(&render_simple_table(&design_rows));
    body.push('\n');

    if !routing_rows.is_empty() {
        body.push_str("## Routing Docs (`docs/routing/`)\n\n");
        body.push_str("Each row documents one `src/lib/` component/module — `id`/`source` is the repo-relative path to that source file.\n\n");
        body.push_str(&render_routing_table(&routing_rows));
        body.push('\n');
    }

    if !areas_rows.is_empty() {
        body.push_str("## Areas (`docs/areas/`)\n\n");
        body.push_str(&render_simple_table(&areas_rows));
        body.push('\n');
    }

    if !guides_rows.is_empty() {
        body.push_str("## Guides (`docs/guides/`)\n\n");
        body.push_str(&render_simple_table(&guides_rows));
        body.push('\n');
    }

    if !plans_rows.is_empty() {
        body.push_str("## Plans (`docs/plans/`)\n\n");
        body.push_str(&render_plans_table(&plans_rows));
        body.push('\n');
    }

    if !archive_rows.is_empty() {
        body.push_str("## Archive (`docs/archive/`)\n\n");
        body.push_str(&render_simple_table(&archive_rows));
        body.push('\n');
    }

    body.push_str("## Skills (`agents/skills/`)\n\n");
    body.push_str(&render_registry_table(&registry, "skill", true));
    body.push('\n');

    body.push_str("## Agents / Orchestrators (`agents/orchestrators/`)\n\n");
    body.push_str(&render_registry_table(&registry, "agent", false));
    body.push('\n');

    if !missing.is_empty() || !unregistered.is_empty() {
        body.push_str("## Needs Attention (not yet reflected above)\n\n");
        if !missing.is_empty() {
            body.push_str("Files with no/invalid frontmatter — run `agents/skills/doc-frontmatter` on these:\n\n");
            for m in &missing {
                body.push_str(&format!("- `{}`\n", m));
            }
            body.push('\n');
        }
        if !unregistered.is_empty() {
            body.push_str("Skill/agent folders missing from `agents/skills-and-agents.json` — run `doc-frontmatter`'s `scan-registry`/`apply-registry`:\n\n");
            for m in &unregistered {
                body.push_str(&format!("- `{}`\n", m));
            }
            body.push('\n');
        }
    }

    let index_path = root.join("docs/INDEX.md");
    fs::write(&index_path, body).map_err(|e| e.to_string())?;

    Ok(DocsIndexReport {
        adr_count: adr_rows.len(),
        design_count: design_rows.len(),
        routing_count: routing_rows.len(),
        areas_count: areas_rows.len(),
        guides_count: guides_rows.len(),
        plans_count: plans_rows.len(),
        archive_count: archive_rows.len(),
        skill_count,
        agent_count,
        missing_frontmatter: missing,
        unregistered_skills_or_agents: unregistered,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rebuilds_against_real_repo() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
        let report = rebuild(root.to_str().unwrap()).expect("rebuild should succeed");
        println!("{:?}", report);
        assert!(report.adr_count > 0);
        assert!(report.design_count > 0);
        assert!(report.skill_count > 0);
    }
}
