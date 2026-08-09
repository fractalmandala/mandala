//! Project scaffolding: create a real project folder with a starter
//! README, content directory, and gitignore so the user can begin editing
//! immediately.

use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTemplate {
    pub name: String,
    pub files: Vec<TemplateFile>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TemplateFile {
    pub path: String,
    pub body: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreatedProject {
    pub path: String,
    pub files: Vec<String>,
}

pub fn default_template(project_name: &str) -> ProjectTemplate {
    ProjectTemplate {
        name: project_name.to_string(),
        files: vec![
            TemplateFile {
                path: "README.md".to_string(),
                body: format!(
                    "# {project_name}\n\nThis project was scaffolded by FractalKnow. Add your markdown\ncontent under `content/` and configure validation, sync, and\nagent settings in `.fractalknow/config.json`.\n"
                ),
            },
            TemplateFile {
                path: "content/Welcome.md".to_string(),
                body: format!(
                    "---\ntitle: Welcome to {project_name}\n---\n\n# Welcome\n\nStart writing your content here. FractalKnow will index this\ndocument, validate links, and surface diagnostics in the editor.\n"
                ),
            },
            TemplateFile {
                path: ".fractalknow/config.json".to_string(),
                body: "{\n  \"validateOnSave\": true,\n  \"validateLinksOnSave\": true,\n  \"validateMetadataOnSave\": true\n}\n".to_string(),
            },
            TemplateFile {
                path: ".gitignore".to_string(),
                body: ".fractalknow/cache/\nnode_modules/\n".to_string(),
            },
        ],
    }
}

pub fn create(root: &Path, template: &ProjectTemplate) -> Result<CreatedProject, String> {
    if root.exists() {
        let entries = fs::read_dir(root).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err(format!(
                "Project folder already exists and is not empty: {}",
                root.display()
            ));
        }
    } else {
        fs::create_dir_all(root).map_err(|e| e.to_string())?;
    }

    let mut created = Vec::new();
    for file in &template.files {
        let path = root.join(&file.path);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&path, &file.body).map_err(|e| e.to_string())?;
        created.push(file.path.clone());
    }

    Ok(CreatedProject {
        path: root.to_string_lossy().to_string(),
        files: created,
    })
}

pub fn resolve_target_path(target: &str) -> PathBuf {
    let expanded = if let Some(stripped) = target.strip_prefix("~/") {
        if let Some(home) = std::env::var_os("HOME") {
            PathBuf::from(home).join(stripped)
        } else {
            PathBuf::from(target)
        }
    } else {
        PathBuf::from(target)
    };
    expanded
}
