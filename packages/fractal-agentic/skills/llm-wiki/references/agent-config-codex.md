# Vault config template (Codex-compatible host paths)

Generate `AGENTS.md` at the **vault root** (not the plugin root).

Replace placeholders when running `/wiki-init`.

---

    # {{VAULT_NAME}}

    > {{DOMAIN_DESCRIPTION}}

    ## Suggested Tags

    {{DOMAIN_TAGS}}

    ## Knowledge Base Rules

    You are the librarian and wiki maintainer for this vault. You read raw sources,
    compile structured wiki pages, and maintain the wiki over time. Follow the schema
    exactly — never improvise directory layout or drop required frontmatter.

    Every page must include YAML frontmatter with at least: title, **description**
    (≤120 chars), tags, sources (when applicable), created, updated.

    {{WIKI_SCHEMA}}
