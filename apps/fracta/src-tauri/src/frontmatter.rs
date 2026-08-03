//! YAML frontmatter for entry files.
//!
//! Deliberately hand-rolled rather than pulling in a YAML crate: the schema is fixed
//! at a small fixed set of keys, and a full YAML parser would
//! accept — and then silently rewrite — documents far outside that shape. The parser
//! here is permissive on read and strict on write.

use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Meta {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub created_at: u64,
    #[serde(default)]
    pub updated_at: u64,
}

#[derive(Debug, Default, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Document {
    #[serde(flatten)]
    pub meta: Meta,
    /// Markdown body with the frontmatter block stripped.
    pub body: String,
}

/// Splits a raw file into its frontmatter block and body.
///
/// A frontmatter block must start on the very first line with `---` and end at the
/// next line that is exactly `---`. Anything else means "no frontmatter", and the
/// whole file is treated as body — a document whose first line happens to be a
/// horizontal rule must not lose its content.
fn split(raw: &str) -> (Option<&str>, &str) {
    let rest = match raw.strip_prefix("---\n") {
        Some(rest) => rest,
        // Tolerate a leading BOM and CRLF, which arrive via clipboard on Windows.
        None => match raw
            .strip_prefix('\u{feff}')
            .unwrap_or(raw)
            .strip_prefix("---\r\n")
        {
            Some(rest) => rest,
            None => return (None, raw),
        },
    };

    // Find a line that is exactly the closing delimiter.
    let mut offset = 0usize;
    for line in rest.split_inclusive('\n') {
        let trimmed = line.trim_end_matches(['\n', '\r']);
        if trimmed == "---" {
            let body = &rest[offset + line.len()..];
            return (Some(&rest[..offset]), body);
        }
        offset += line.len();
    }
    // Unterminated block — not frontmatter.
    (None, raw)
}

/// Unwraps a scalar, honouring single and double quotes so that a title containing
/// `: ` or a leading `#` round-trips.
fn scalar(value: &str) -> String {
    let value = value.trim();
    for quote in ['"', '\''] {
        if value.len() >= 2 && value.starts_with(quote) && value.ends_with(quote) {
            let inner = &value[1..value.len() - 1];
            return if quote == '"' {
                inner.replace("\\\"", "\"").replace("\\\\", "\\")
            } else {
                inner.replace("''", "'")
            };
        }
    }
    value.to_string()
}

/// Splits a flow-sequence body on commas that sit outside any quoted run, so a tag
/// containing its own comma (`"a, b"`) stays intact.
fn split_flow(inner: &str) -> Vec<String> {
    let mut items = Vec::new();
    let mut current = String::new();
    let mut quote: Option<char> = None;
    for ch in inner.chars() {
        match quote {
            Some(q) => {
                current.push(ch);
                if ch == q {
                    quote = None;
                }
            }
            None => match ch {
                '"' | '\'' => {
                    quote = Some(ch);
                    current.push(ch);
                }
                ',' => {
                    items.push(std::mem::take(&mut current));
                }
                _ => current.push(ch),
            },
        }
    }
    items.push(current);
    items
        .iter()
        .map(|s| scalar(s))
        .filter(|t| !t.is_empty())
        .collect()
}

fn parse_tags(value: &str, following: &[&str]) -> Vec<String> {
    let value = value.trim();
    // Flow sequence: tags: [a, b]
    if let Some(inner) = value.strip_prefix('[').and_then(|v| v.strip_suffix(']')) {
        return split_flow(inner);
    }
    // Block sequence: tags:\n  - a\n  - b
    if value.is_empty() {
        return following
            .iter()
            .map_while(|line| line.trim().strip_prefix("- "))
            .map(scalar)
            .filter(|t| !t.is_empty())
            .collect();
    }
    // Bare single value.
    let single = scalar(value);
    if single.is_empty() {
        vec![]
    } else {
        vec![single]
    }
}

fn timestamp(value: &str) -> u64 {
    scalar(value).parse::<u64>().unwrap_or(0)
}

pub fn parse(raw: &str) -> Document {
    let (block, body) = split(raw);
    let Some(block) = block else {
        return Document {
            meta: Meta::default(),
            body: body.to_string(),
        };
    };

    let lines: Vec<&str> = block.lines().collect();
    let mut meta = Meta::default();
    for (index, line) in lines.iter().enumerate() {
        // Only top-level keys; indented lines belong to a block sequence.
        if line.starts_with([' ', '\t']) || line.trim().is_empty() {
            continue;
        }
        let Some((key, value)) = line.split_once(':') else {
            continue;
        };
        match key.trim() {
            "title" => meta.title = scalar(value),
            "category" => meta.category = scalar(value),
            "tags" => meta.tags = parse_tags(value, &lines[index + 1..]),
            "created_at" => meta.created_at = timestamp(value),
            "updated_at" => meta.updated_at = timestamp(value),
            _ => {}
        }
    }

    Document {
        meta,
        body: body.to_string(),
    }
}

/// Quotes a scalar only when leaving it bare would change how YAML reads it.
fn emit_scalar(value: &str) -> String {
    let needs_quotes = value.is_empty()
        || value.trim() != value
        || value.starts_with([
            '#', '&', '*', '!', '|', '>', '\'', '"', '%', '@', '`', '[', ']', '{', '}', ',', '?',
            '-',
        ])
        || value.contains(": ")
        || value.ends_with(':')
        // A comma is a separator inside the `tags: [...]` flow sequence, so any value
        // carrying one must be quoted or it splits into two on the next read.
        || value.contains(',')
        || value.contains('\n')
        // Bare words YAML would coerce to a non-string.
        || matches!(
            value.to_ascii_lowercase().as_str(),
            "true" | "false" | "null" | "yes" | "no" | "on" | "off" | "~"
        )
        || value.parse::<f64>().is_ok();

    if needs_quotes {
        format!("\"{}\"", value.replace('\\', "\\\\").replace('"', "\\\""))
    } else {
        value.to_string()
    }
}

/// Serializes a document back to file text. Empty optional fields are omitted rather
/// than written as blanks, so a file never accumulates `category:` with nothing after it.
pub fn serialize(doc: &Document) -> String {
    let mut out = String::from("---\n");
    out.push_str(&format!("title: {}\n", emit_scalar(&doc.meta.title)));
    if doc.meta.created_at > 0 {
        out.push_str(&format!("created_at: {}\n", doc.meta.created_at));
    }
    if doc.meta.updated_at > 0 {
        out.push_str(&format!("updated_at: {}\n", doc.meta.updated_at));
    }
    if !doc.meta.category.is_empty() {
        out.push_str(&format!("category: {}\n", emit_scalar(&doc.meta.category)));
    }
    let tags: Vec<&String> = doc.meta.tags.iter().filter(|t| !t.is_empty()).collect();
    if !tags.is_empty() {
        let rendered: Vec<String> = tags.iter().map(|t| emit_scalar(t)).collect();
        out.push_str(&format!("tags: [{}]\n", rendered.join(", ")));
    }
    out.push_str("---\n");

    let body = doc.body.trim_start_matches('\n');
    if !body.is_empty() {
        out.push('\n');
        out.push_str(body);
        if !out.ends_with('\n') {
            out.push('\n');
        }
    }
    out
}

/// Derives a title from the first non-empty line of markdown, stripping heading
/// markers, emphasis and list bullets. Used when the user never supplies one.
fn cleaned_title_source(body: &str) -> String {
    let line = body
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty() && *line != "---")
        .unwrap_or("");

    let line = line
        .trim_start_matches('#')
        .trim_start_matches(['>', '-', '*', '+'])
        .trim();
    // Strip inline emphasis/code markers a pasted heading often carries.
    let cleaned: String = line.replace("**", "").replace("__", "").replace('`', "");
    cleaned.trim().to_string()
}

pub fn derive_title(body: &str) -> String {
    let cleaned = cleaned_title_source(body);
    // Keep generated titles compact: 37 body characters, then an ellipsis.
    const LIMIT: usize = 37;
    const ELLIPSIS: &str = "...";
    if cleaned.chars().count() <= LIMIT {
        return cleaned.to_string();
    }
    let head: String = cleaned.chars().take(LIMIT).collect();
    format!("{}{}", head.trim_end(), ELLIPSIS)
}

/// True for titles written by older auto-title rules, so they can be migrated to
/// the current compact auto-title without touching genuinely custom titles.
pub fn looks_like_auto_title(title: &str, body: &str) -> bool {
    let title = title.trim();
    if title.is_empty() {
        return true;
    }
    let cleaned = cleaned_title_source(body);
    if title == cleaned || title == derive_title(body) {
        return true;
    }
    const LEGACY_LIMIT: usize = 80;
    if cleaned.chars().count() <= LEGACY_LIMIT {
        return false;
    }
    let truncated: String = cleaned.chars().take(LEGACY_LIMIT).collect();
    match truncated.rsplit_once(' ') {
        Some((head, _)) if head.chars().count() > LEGACY_LIMIT / 2 => title == head,
        _ => title == truncated.trim_end(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_full_frontmatter() {
        let doc = parse("---\ntitle: Hello\ncreated_at: 10\nupdated_at: 20\ncategory: Notes\ntags: [a, b]\n---\n\nBody text\n");
        assert_eq!(doc.meta.title, "Hello");
        assert_eq!(doc.meta.created_at, 10);
        assert_eq!(doc.meta.updated_at, 20);
        assert_eq!(doc.meta.category, "Notes");
        assert_eq!(doc.meta.tags, vec!["a", "b"]);
        assert_eq!(doc.body, "\nBody text\n");
    }

    #[test]
    fn parses_block_sequence_tags() {
        let doc = parse("---\ntitle: T\ntags:\n  - one\n  - two\n---\nbody\n");
        assert_eq!(doc.meta.tags, vec!["one", "two"]);
    }

    #[test]
    fn treats_leading_rule_as_body_not_frontmatter() {
        // An unterminated `---` must not swallow the document.
        let raw = "---\njust a horizontal rule and prose\n";
        let doc = parse(raw);
        assert_eq!(doc.meta, Meta::default());
        assert_eq!(doc.body, raw);
    }

    #[test]
    fn file_without_frontmatter_keeps_all_content() {
        let doc = parse("# Heading\n\ntext");
        assert_eq!(doc.body, "# Heading\n\ntext");
        assert_eq!(doc.meta.title, "");
    }

    #[test]
    fn round_trips_colon_and_hash_titles() {
        for title in [
            "Notes: on speed",
            "#1 priority",
            "true",
            "42",
            "- dashed",
            "quote \" inside",
            "",
        ] {
            let doc = Document {
                meta: Meta {
                    title: title.to_string(),
                    ..Default::default()
                },
                body: "body\n".to_string(),
            };
            let reparsed = parse(&serialize(&doc));
            assert_eq!(
                reparsed.meta.title, title,
                "title {title:?} did not survive"
            );
        }
    }

    #[test]
    fn round_trips_tags_needing_quotes() {
        let doc = Document {
            meta: Meta {
                title: "T".into(),
                category: "C: sub".into(),
                tags: vec!["a, b".into(), "no".into()],
                ..Default::default()
            },
            body: "x\n".into(),
        };
        let reparsed = parse(&serialize(&doc));
        assert_eq!(reparsed.meta.category, "C: sub");
        assert_eq!(reparsed.meta.tags, vec!["a, b", "no"]);
    }

    #[test]
    fn omits_empty_optional_fields() {
        let out = serialize(&Document {
            meta: Meta {
                title: "T".into(),
                ..Default::default()
            },
            body: String::new(),
        });
        assert_eq!(out, "---\ntitle: T\n---\n");
        assert!(!out.contains("category"));
        assert!(!out.contains("tags"));
    }

    #[test]
    fn derives_title_from_first_meaningful_line() {
        assert_eq!(derive_title("# Hello world\n\nrest"), "Hello world");
        assert_eq!(derive_title("\n\n- **bold** item"), "bold item");
        assert_eq!(derive_title("plain text here"), "plain text here");
        assert_eq!(derive_title(""), "");
        assert_eq!(derive_title("   \n\n  > quoted"), "quoted");
    }

    #[test]
    fn derived_title_is_capped_with_ellipsis() {
        let long =
            "I'll port the Sidebar component following the skill. Let me start with Step 0 —";
        let title = derive_title(long);
        assert_eq!(title, "I'll port the Sidebar component follo...");
        assert_eq!(title.chars().count(), 40);
        assert!(!title.ends_with(' '));
        assert!(title.ends_with("..."));
    }

    #[test]
    fn recognizes_current_and_legacy_auto_titles() {
        let body = "# I'll port the Sidebar component following the skill. Let me start with Step 0 —\n\nbody";
        assert!(looks_like_auto_title(
            "I'll port the Sidebar component following the skill. Let me start with Step 0 —",
            body
        ));
        assert!(looks_like_auto_title(
            "I'll port the Sidebar component follo...",
            body
        ));
        assert!(!looks_like_auto_title("My custom long title", body));
    }

    #[test]
    fn crlf_frontmatter_is_recognised() {
        let doc = parse("---\r\ntitle: Windows\r\n---\r\nbody\r\n");
        assert_eq!(doc.meta.title, "Windows");
    }
}
