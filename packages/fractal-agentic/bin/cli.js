#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const HOME = os.homedir();
const ROOT_DIR = path.resolve(__dirname, '..');
const PLUGIN_SRC = path.join(ROOT_DIR, 'plugin');

function printUsage() {
  console.log(`
Fractal Agentic Plugin Installer

Usage:
  npx fractal-agentic [command] [options]

Commands:
  install     Install Fractal Agentic for detected AI coding agent hosts (default)
  verify      Run verification suite on local plugin installation
  help        Show this help message

Options:
  --target=<host>   Target specific host: antigravity, claude, codex, or all (default: all)
  --project         Inject AGENTS snippet into the current project directory
`);
}

function installAntigravity() {
  const destDir = path.join(HOME, '.gemini', 'config', 'plugins', 'fractal-agentic');
  try {
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.cpSync(PLUGIN_SRC, destDir, { recursive: true });
    console.log(`[Antigravity] Installed plugin to: ${destDir}`);
  } catch (err) {
    console.error(`[Antigravity] Failed to install: ${err.message}`);
  }
}

function installClaude() {
  try {
    // Attempt official marketplace add & install if claude CLI is in PATH
    execSync(`claude plugin marketplace add "${ROOT_DIR}"`, { stdio: 'pipe' });
    execSync(`claude plugin install fractal-agentic@fractal-agentic`, { stdio: 'pipe' });
    console.log(`[Claude Code] Successfully registered and installed plugin via Claude Marketplace.`);
  } catch (err) {
    // Fallback: Copy directly to Claude plugin directory
    const claudePluginDir = path.join(HOME, '.claude', 'plugins', 'cache', 'fractal-agentic');
    try {
      fs.mkdirSync(path.dirname(claudePluginDir), { recursive: true });
      fs.cpSync(PLUGIN_SRC, claudePluginDir, { recursive: true });
      console.log(`[Claude Code] Installed plugin to cache directory: ${claudePluginDir}`);
    } catch (fallbackErr) {
      console.error(`[Claude Code] Failed to install: ${fallbackErr.message}`);
    }
  }
}

function installCodex() {
  const codexPluginDir = path.join(HOME, '.codex', 'plugins', 'cache', 'fractal-agentic');
  try {
    fs.mkdirSync(path.dirname(codexPluginDir), { recursive: true });
    fs.cpSync(PLUGIN_SRC, codexPluginDir, { recursive: true });
    console.log(`[Codex] Installed plugin to cache directory: ${codexPluginDir}`);
  } catch (err) {
    console.error(`[Codex] Failed to install: ${err.message}`);
  }
}

function injectProjectSnippet(cwd) {
  const snippetPath = path.join(PLUGIN_SRC, 'project-integration', 'AGENTS-SNIPPET.md');
  const targetAgentsMd = path.join(cwd, 'AGENTS.md');
  if (fs.existsSync(snippetPath)) {
    const snippetContent = fs.readFileSync(snippetPath, 'utf8');
    if (fs.existsSync(targetAgentsMd)) {
      const existing = fs.readFileSync(targetAgentsMd, 'utf8');
      if (!existing.includes('Fractal Agentic')) {
        fs.writeFileSync(targetAgentsMd, snippetContent + '\n\n' + existing);
        console.log(`[Project] Prepended AGENTS snippet to: ${targetAgentsMd}`);
      } else {
        console.log(`[Project] AGENTS snippet already present in: ${targetAgentsMd}`);
      }
    } else {
      fs.writeFileSync(targetAgentsMd, snippetContent);
      console.log(`[Project] Created: ${targetAgentsMd}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'install';

  if (command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  if (command === 'verify') {
    try {
      execSync(`sh "${path.join(PLUGIN_SRC, 'scripts', 'verify.sh')}"`, { stdio: 'inherit' });
    } catch (err) {
      process.exit(1);
    }
    return;
  }

  const targetArg = args.find(a => a.startsWith('--target='));
  const target = targetArg ? targetArg.split('=')[1] : 'all';
  const isProject = args.includes('--project');

  console.log('🤖 Fractal Agentic — Installer\n');

  if (target === 'all' || target === 'antigravity') {
    installAntigravity();
  }
  if (target === 'all' || target === 'claude') {
    installClaude();
  }
  if (target === 'all' || target === 'codex') {
    installCodex();
  }

  if (isProject) {
    injectProjectSnippet(process.cwd());
  }

  console.log('\n✨ Installation finished! Please restart your AI coding assistant session.');
}

main();
