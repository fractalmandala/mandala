# Fracta user guide

## What Fracta is

Fracta is a desktop-first, local knowledge workspace. A project is an ordinary folder of Markdown, YAML frontmatter, assets, text files, CSV/TSV, JSON, DOCX, and PDF files. Fracta indexes and presents those files but does not move your content into a proprietary cloud format.

## Start a project

1. Open Fracta and choose **Project** in the navigator.
2. Select an existing folder or a new empty folder.
3. Use **New** for a Markdown document, **Folder** for a nested folder, or **Template** to create from a Markdown file under `templates/`.

The navigator mirrors the project recursively. File glyphs identify Markdown, text, CSV, JSON, DOCX, PDF, folders, and attachments. Fracta observes external changes and refreshes unchanged open files; it never overwrites an unsaved edit.

## Everyday file actions

With a file open, use the header actions to:

- **Save** the active editable file.
- **Rename**, **Duplicate**, or move folders from their context menu.
- **Trash** files or folders using the operating-system Trash.
- **Reveal** the selected file in the system file manager.
- **Open external** with the system default application.
- **Save as template** for Markdown documents.

Paths are project-relative. Fracta rejects paths that escape the selected project, including unsafe symlink escapes.

## Markdown and knowledge writing

Markdown (`.md` and `.mdx`) has three modes:

- **Write** provides a rich editor with headings, lists, tasks, links, tables, code blocks, and a slash menu.
- **Source** preserves normal Markdown and YAML frontmatter exactly as text.
- **Preview** renders the document for reading and PDF export.

The slash menu can insert callouts, footnotes, math, Mermaid blocks, media links, file blocks, wiki links/transclusions, tabs, and accordions. Use normal relative Markdown links when portability matters, or `[[note]]` for Fracta wiki links. The Inspector shows forward links, backlinks, dead links, related suggestions, hubs, and orphan information.

Local assets use content-relative paths. Images and local audio/video embeds render from local object URLs; nothing is sent to a rendering service.

## Text, CSV/TSV, and JSON

### Plain text

TXT files are edited as plain source. Use **Find** and **Wrap** in the source controls. Fracta preserves supported UTF-8/UTF-16 encodings and the original newline convention when saving.

### CSV and TSV

Choose **Grid** for a spreadsheet-like editor or **Raw CSV** for source. The grid supports cell editing, keyboard navigation, multi-cell paste, filtering, copy selection, header editing, and row/column insertion, deletion, and reordering. Operations work on the current selection.

Fracta detects common delimiters, quoting, BOMs, and newline style. If quoted CSV is malformed, it blocks grid rewrites and asks you to repair the raw source first.

Use **CSV → JSON** to create a new sibling JSON file. The first row becomes keys. Cells stay strings by default; explicitly choose type inference only when you want it. Empty or duplicate headers must be resolved first.

### JSON

Choose **Tree** to edit objects and arrays structurally, or **Source** for syntax-highlighted JSON. Tree mode supports add, rename, move, delete, type changes, and copying paths. **Format** and **Minify** reserialize valid JSON.

Invalid JSON cannot be saved, but Fracta preserves the unsaved invalid source locally until you correct it. **JSON → CSV** accepts a top-level array of objects and produces a new CSV sibling; nested values are encoded as compact JSON cell values.

## DOCX, PDF, and attachments

DOCX and PDF are read-only by design.

- DOCX renders extracted headings, paragraphs, lists, tables, links, and embedded images. A warning identifies unsupported Word features.
- PDF renders locally with page controls, local thumbnails, zoom, selectable text, and search. Its warning explains that scans, forms, annotations, and complex layout may not reproduce perfectly.
- Other attachments show file metadata in the Inspector and can be revealed or opened externally.

All extraction and PDF rendering stays on your device.

## Search, graph, and Ask

Enter a query in the navigator and press Enter or the search button. Fracta uses a local SQLite FTS5 index outside your project folder, ranking paths, titles, metadata, and extracted text. Use **Reindex** to rebuild it.

Ask can use:

- the active document;
- selected text;
- the active folder;
- the top search results.

Sources are labelled with local paths and the agent is instructed to cite those paths. Configure a compatible API provider in **Agent**, or load a local GGUF through `llama-server`. **Agent handoff** copies a ready-to-use local MCP configuration for a compatible installed agent. The docked **Terminal** runs an explicitly entered command in the selected project folder and stops it after two minutes.

## Export Markdown as PDF

Open a Markdown document, choose **Preview PDF**, review the rendered print surface, and select **Print / Save as PDF**. Fracta opens the platform print flow so you choose the destination. The exported surface includes the rendered document, optional frontmatter, local images, diagrams, hierarchy, tables, code, page numbering where supported, and a path/date footer. Tabs and accordions print as their static content.

## Keyboard and accessibility

Fracta provides keyboard-accessible controls, visible focus, focus trapping for sheets/dialogs, Escape-to-close with focus restoration, and a reduced-motion mode. Standard controls have at least a 40px target; primary send/save actions use 44px targets. Use the system reduced-motion preference to disable transforms and looping animation.
