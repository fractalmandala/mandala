//! A deliberately small local MCP stdio bridge.
//!
//! Run `fracta-mcp --vault /absolute/path/to/vault`; it never infers a vault and all
//! file arguments continue through Fracta's containment checks.

use fracta_lib::workspace;
use serde_json::{json, Value};
use std::env;
use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};

fn main() {
    let root = match vault_arg() {
        Ok(root) => root,
        Err(error) => {
            eprintln!("fracta-mcp: {error}");
            std::process::exit(2);
        }
    };
    for line in io::stdin().lock().lines() {
        let Ok(line) = line else { break };
        let response = match serde_json::from_str::<Value>(&line) {
            Ok(request) => handle(&root, request),
            Err(error) => {
                json!({"jsonrpc":"2.0","error":{"code":-32700,"message":error.to_string()},"id":null})
            }
        };
        println!("{response}");
        let _ = io::stdout().flush();
    }
}

fn vault_arg() -> Result<PathBuf, String> {
    let args = env::args().collect::<Vec<_>>();
    let path = args
        .windows(2)
        .find(|pair| pair[0] == "--vault")
        .map(|pair| pair[1].clone())
        .or_else(|| env::var("FRACTA_VAULT").ok())
        .ok_or_else(|| "pass --vault /absolute/path or FRACTA_VAULT".to_string())?;
    let root = PathBuf::from(path)
        .canonicalize()
        .map_err(|error| format!("invalid vault: {error}"))?;
    if !root.is_dir() {
        return Err("vault must be a directory".to_string());
    }
    Ok(root)
}

fn handle(root: &Path, request: Value) -> Value {
    let id = request.get("id").cloned().unwrap_or(Value::Null);
    let method = request.get("method").and_then(Value::as_str).unwrap_or("");
    let params = request.get("params").cloned().unwrap_or_else(|| json!({}));
    let result = match method {
        "initialize" => Ok(
            json!({"protocolVersion":"2024-11-05","serverInfo":{"name":"fracta-mcp","version":"0.1.0"},"capabilities":{"tools":{}}}),
        ),
        "tools/list" => Ok(json!({"tools":[
            tool("workspace_list", "List safe project-relative workspace items.", json!({})),
            tool("workspace_search", "Search local project paths and readable text without leaving the selected vault.", json!({"query":{"type":"string"}})),
            tool("workspace_read", "Read an editable workspace file or attachment metadata.", json!({"path":{"type":"string"}})),
            tool("workspace_preview", "Extract local PDF or DOCX text for read-only retrieval.", json!({"path":{"type":"string"}})),
            tool("workspace_write", "Write Markdown, TXT, CSV/TSV, or valid JSON.", json!({"path":{"type":"string"},"content":{"type":"string"}})),
            tool("document_create", "Create a Markdown document at a project-relative path.", json!({"path":{"type":"string"},"content":{"type":"string"}})),
            tool("template_create", "Create or update a Markdown template under templates/.", json!({"path":{"type":"string"},"content":{"type":"string"}})),
            tool("template_apply", "Create a Markdown document from a local template, replacing {{title}} and {{date}}.", json!({"template":{"type":"string"},"path":{"type":"string"}})),
            tool("workspace_create_folder", "Create a project-relative folder.", json!({"path":{"type":"string"}})),
            tool("workspace_move", "Rename or move a project item without overwriting.", json!({"from":{"type":"string"},"to":{"type":"string"}})),
            tool("workspace_duplicate", "Duplicate a workspace file with a collision-safe name.", json!({"path":{"type":"string"}})),
            tool("workspace_trash", "Move a project item to the operating system Trash.", json!({"path":{"type":"string"}})),
            tool("asset_write", "Create or replace an opaque attachment from byte values (0–255).", json!({"path":{"type":"string"},"bytes":{"type":"array","items":{"type":"integer","minimum":0,"maximum":255}}})),
            tool("asset_metadata", "Read safe metadata for a project attachment.", json!({"path":{"type":"string"}})),
            tool("workspace_links", "Inspect forward links, backlinks, and dead wiki links.", json!({"path":{"type":"string"}})),
            tool("workspace_graph", "Return local graph nodes, edges, hubs, and orphans.", json!({})),
            tool("csv_to_json", "Convert CSV text to JSON without implicit typing by default.", json!({"content":{"type":"string"},"delimiter":{"type":"string"},"inferTypes":{"type":"boolean"}})),
            tool("json_to_csv", "Convert an array of JSON objects to CSV.", json!({"content":{"type":"string"},"delimiter":{"type":"string"}}))
            , tool("validate_structured_file", "Validate JSON or CSV/TSV source without writing a file.", json!({"kind":{"type":"string","enum":["json","csv","tsv"]},"content":{"type":"string"}}))
            , tool("workflow_daily_note", "Open or create today's local Markdown daily note. An optional path prefix defaults to Daily/.", json!({"directory":{"type":"string"}}))
            , tool("workflow_link_health", "Collect dead links, orphan documents, hubs, and local link suggestions for maintenance workflows.", json!({}))
        ]})),
        "tools/call" => call_tool(root, &params),
        "notifications/initialized" => Ok(json!({})),
        _ => Err(format!("Unknown MCP method: {method}")),
    };
    match result {
        Ok(value) => json!({"jsonrpc":"2.0","result":value,"id":id}),
        Err(message) => json!({"jsonrpc":"2.0","error":{"code":-32602,"message":message},"id":id}),
    }
}

fn tool(name: &str, description: &str, properties: Value) -> Value {
    json!({"name":name,"description":description,"inputSchema":{"type":"object","properties":properties}})
}

fn call_tool(root: &Path, params: &Value) -> Result<Value, String> {
    let name = params
        .get("name")
        .and_then(Value::as_str)
        .ok_or_else(|| "Tool name is required.".to_string())?;
    let args = params
        .get("arguments")
        .cloned()
        .unwrap_or_else(|| json!({}));
    let string = |name: &str| {
        args.get(name)
            .and_then(Value::as_str)
            .map(str::to_string)
            .ok_or_else(|| format!("{name} is required."))
    };
    let result = match name {
        "workspace_list" => {
            serde_json::to_value(workspace::list(root)?).map_err(|error| error.to_string())?
        }
        "workspace_search" => search_workspace(root, &string("query")?)?,
        "workspace_read" => serde_json::to_value(workspace::read(root, &string("path")?)?)
            .map_err(|error| error.to_string())?,
        "workspace_preview" => serde_json::to_value(workspace::preview(root, &string("path")?)?)
            .map_err(|error| error.to_string())?,
        "workspace_write" => serde_json::to_value(workspace::write(
            root,
            &string("path")?,
            &string("content")?,
        )?)
        .map_err(|error| error.to_string())?,
        "document_create" => {
            let path = string("path")?;
            if !path.to_ascii_lowercase().ends_with(".md")
                && !path.to_ascii_lowercase().ends_with(".mdx")
            {
                return Err("document_create requires a .md or .mdx path.".to_string());
            }
            serde_json::to_value(workspace::write(
                root,
                &path,
                args.get("content").and_then(Value::as_str).unwrap_or(""),
            )?)
            .map_err(|error| error.to_string())?
        }
        "template_create" => {
            let requested = string("path")?;
            let path = if requested.starts_with("templates/") {
                requested
            } else {
                format!("templates/{requested}")
            };
            if !path.to_ascii_lowercase().ends_with(".md")
                && !path.to_ascii_lowercase().ends_with(".mdx")
            {
                return Err("template_create requires a .md or .mdx path.".to_string());
            }
            serde_json::to_value(workspace::write(root, &path, &string("content")?)?)
                .map_err(|error| error.to_string())?
        }
        "template_apply" => {
            let template = string("template")?;
            let path = string("path")?;
            let source = workspace::read(root, &template)?
                .content
                .ok_or_else(|| "Template is not readable text.".to_string())?;
            let title = path
                .rsplit('/')
                .next()
                .unwrap_or("Untitled")
                .trim_end_matches(".md")
                .trim_end_matches(".mdx")
                .replace(['-', '_'], " ");
            let content = source
                .replace("{{title}}", &title)
                .replace("{{date}}", &chrono_date());
            serde_json::to_value(workspace::write(root, &path, &content)?)
                .map_err(|error| error.to_string())?
        }
        "workspace_create_folder" => {
            workspace::create_folder(root, &string("path")?)?;
            json!({"ok":true})
        }
        "workspace_move" => {
            workspace::move_path(root, &string("from")?, &string("to")?)?;
            json!({"ok":true})
        }
        "workspace_duplicate" => json!({"path":workspace::duplicate_path(root, &string("path")?)?}),
        "workspace_trash" => {
            workspace::delete_path(root, &string("path")?)?;
            json!({"ok":true})
        }
        "asset_write" => serde_json::to_value(workspace::write_asset(
            root,
            &string("path")?,
            &byte_values(&args)?,
        ))
        .map_err(|error| error.to_string())?,
        "asset_metadata" => {
            let file = workspace::read(root, &string("path")?)?;
            if file.kind != workspace::FileKind::Asset {
                return Err("asset_metadata requires an unsupported attachment path.".to_string());
            }
            serde_json::to_value(file).map_err(|error| error.to_string())?
        }
        "workspace_links" => serde_json::to_value(workspace::links(root, &string("path")?)?)
            .map_err(|error| error.to_string())?,
        "workspace_graph" => {
            serde_json::to_value(workspace::graph(root)?).map_err(|error| error.to_string())?
        }
        "csv_to_json" => {
            let delimiter = args
                .get("delimiter")
                .and_then(Value::as_str)
                .and_then(|value| value.bytes().next())
                .unwrap_or(b',');
            serde_json::to_value(workspace::csv_to_json(
                &string("content")?,
                delimiter,
                args.get("inferTypes")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
            )?)
            .map_err(|error| error.to_string())?
        }
        "json_to_csv" => {
            let delimiter = args
                .get("delimiter")
                .and_then(Value::as_str)
                .and_then(|value| value.bytes().next())
                .unwrap_or(b',');
            serde_json::to_value(workspace::json_to_csv(&string("content")?, delimiter)?)
                .map_err(|error| error.to_string())?
        }
        "validate_structured_file" => {
            let kind = string("kind")?;
            let content = string("content")?;
            match kind.as_str() {
                "json" => {
                    serde_json::from_str::<Value>(&content)
                        .map_err(|error| format!("Invalid JSON: {error}"))?;
                }
                "csv" => {
                    workspace::csv_to_json(&content, b',', false)?;
                }
                "tsv" => {
                    workspace::csv_to_json(&content, b'\t', false)?;
                }
                _ => return Err("kind must be json, csv, or tsv.".to_string()),
            }
            json!({"valid":true, "kind":kind})
        }
        "workflow_daily_note" => {
            let directory = args
                .get("directory")
                .and_then(Value::as_str)
                .unwrap_or("Daily")
                .trim_matches('/');
            if directory.is_empty() {
                return Err("directory cannot be empty.".to_string());
            }
            let date = chrono_date();
            let path = format!("{directory}/{date}.md");
            let file = match workspace::read(root, &path) {
                Ok(file) => file,
                Err(_) => workspace::write(root, &path, &format!("# {date}\n\n"))?,
            };
            serde_json::to_value(file).map_err(|error| error.to_string())?
        }
        "workflow_link_health" => {
            let graph = workspace::graph(root)?;
            let mut dead = Vec::new();
            let mut suggestions = Vec::new();
            for item in workspace::list(root)?
                .into_iter()
                .filter(|item| item.kind == workspace::FileKind::Markdown)
            {
                let report = workspace::links(root, &item.path)?;
                dead.extend(
                    report
                        .dead
                        .into_iter()
                        .map(|target| json!({"from":item.path, "to":target})),
                );
                suggestions.extend(
                    report
                        .suggestions
                        .into_iter()
                        .map(|target| json!({"from":item.path, "to":target})),
                );
            }
            json!({"dead":dead, "orphans":graph.orphans, "hubs":graph.hubs, "suggestions":suggestions})
        }
        _ => return Err(format!("Unknown tool: {name}")),
    };
    Ok(
        json!({"content":[{"type":"text","text":serde_json::to_string_pretty(&result).unwrap_or_default()}]}),
    )
}

fn byte_values(args: &Value) -> Result<Vec<u8>, String> {
    args.get("bytes")
        .and_then(Value::as_array)
        .ok_or_else(|| "bytes must be an array of integers from 0 to 255.".to_string())?
        .iter()
        .map(|value| {
            value
                .as_u64()
                .and_then(|value| u8::try_from(value).ok())
                .ok_or_else(|| "bytes must contain only integers from 0 to 255.".to_string())
        })
        .collect()
}

fn chrono_date() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    // Civil-date conversion adapted from the public-domain Gregorian algorithm;
    // keep the local stdio binary dependency-free.
    let days = (SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        / 86_400) as i64;
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    let year = year + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

fn search_workspace(root: &Path, query: &str) -> Result<Value, String> {
    let needle = query.trim().to_lowercase();
    if needle.is_empty() {
        return Ok(json!([]));
    }

    let mut hits = Vec::new();
    for item in workspace::list(root)? {
        if item.kind == workspace::FileKind::Folder {
            continue;
        }
        let content = match item.kind {
            workspace::FileKind::Pdf | workspace::FileKind::Docx => {
                workspace::preview(root, &item.path)
                    .map(|preview| preview.text)
                    .unwrap_or_default()
            }
            _ => workspace::read(root, &item.path)
                .ok()
                .and_then(|file| file.content)
                .unwrap_or_default(),
        };
        let haystack = format!("{}\n{}", item.path, content).to_lowercase();
        if haystack.contains(&needle) {
            hits.push(json!({
                "path": item.path,
                "kind": item.kind,
                "name": item.name,
                "excerpt": excerpt_for(&content),
            }));
        }
        if hits.len() == 50 {
            break;
        }
    }
    Ok(json!(hits))
}

fn excerpt_for(content: &str) -> String {
    let excerpt = content
        .chars()
        .take(220)
        .collect::<String>()
        .replace('\n', " ");
    if content.chars().count() > 220 {
        format!("{excerpt}…")
    } else {
        excerpt
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    static TEMPORARY_VAULT_SEQUENCE: AtomicU64 = AtomicU64::new(0);

    fn temporary_vault() -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock")
            .as_nanos();
        let sequence = TEMPORARY_VAULT_SEQUENCE.fetch_add(1, Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!("fracta-mcp-{nonce}-{sequence}"));
        fs::create_dir_all(&path).expect("create temporary vault");
        path
    }

    fn request(method: &str, params: Value) -> Value {
        json!({"jsonrpc":"2.0", "id": 7, "method":method, "params":params})
    }

    fn call(root: &Path, name: &str, arguments: Value) -> Value {
        handle(
            root,
            request("tools/call", json!({"name":name, "arguments":arguments})),
        )
    }

    #[test]
    fn mcp_contract_supports_workspace_lifecycle_and_link_inspection() {
        let root = temporary_vault();
        let initialized = handle(&root, request("initialize", json!({})));
        assert_eq!(initialized["result"]["serverInfo"]["name"], "fracta-mcp");
        let listed = handle(&root, request("tools/list", json!({})));
        assert!(listed["result"]["tools"]
            .as_array()
            .is_some_and(|tools| tools.iter().any(|tool| tool["name"] == "workspace_write")));
        assert!(listed["result"]["tools"]
            .as_array()
            .is_some_and(|tools| tools.iter().any(|tool| tool["name"] == "template_apply")));
        assert!(listed["result"]["tools"]
            .as_array()
            .is_some_and(|tools| tools
                .iter()
                .any(|tool| tool["name"] == "workflow_link_health")));

        let write = call(
            &root,
            "workspace_write",
            json!({"path":"notes/one.md", "content":"# One\n\n[[two]]"}),
        );
        assert!(write.get("result").is_some());
        call(
            &root,
            "workspace_write",
            json!({"path":"notes/two.md", "content":"# Two\nneedle"}),
        );
        let read = call(&root, "workspace_read", json!({"path":"notes/two.md"}));
        assert!(read["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("needle")));
        let links = call(&root, "workspace_links", json!({"path":"notes/one.md"}));
        assert!(links["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("notes/two.md")));
        let search = call(&root, "workspace_search", json!({"query":"needle"}));
        assert!(search["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("notes/two.md")));
        call(
            &root,
            "template_create",
            json!({"path":"daily.md", "content":"# {{title}}\n{{date}}"}),
        );
        let applied = call(
            &root,
            "template_apply",
            json!({"template":"templates/daily.md", "path":"notes/today.md"}),
        );
        assert!(applied.get("result").is_some());
        call(
            &root,
            "asset_write",
            json!({"path":"attachments/blob.bin", "bytes":[0, 1, 255]}),
        );
        let asset = call(
            &root,
            "asset_metadata",
            json!({"path":"attachments/blob.bin"}),
        );
        assert!(asset["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("asset")));
        let daily = call(&root, "workflow_daily_note", json!({"directory":"Journal"}));
        assert!(daily["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("Journal/") && text.contains(".md")));
        let health = call(&root, "workflow_link_health", json!({}));
        assert!(health["result"]["content"][0]["text"]
            .as_str()
            .is_some_and(|text| text.contains("dead") && text.contains("hubs")));
        fs::remove_dir_all(root).expect("remove temporary vault");
    }

    #[test]
    fn mcp_contract_rejects_vault_escape_and_invalid_structured_source() {
        let root = temporary_vault();
        let escape = call(&root, "workspace_read", json!({"path":"../outside.md"}));
        assert_eq!(escape["error"]["code"], -32602);
        let invalid_json = call(
            &root,
            "validate_structured_file",
            json!({"kind":"json", "content":"{"}),
        );
        assert_eq!(invalid_json["error"]["code"], -32602);
        fs::remove_dir_all(root).expect("remove temporary vault");
    }
}
