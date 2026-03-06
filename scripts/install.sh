#!/usr/bin/env bash
#
# install.sh — Scaffold a project with Glen's Toolkit (project-level files only)
#
# Usage:
#   bash /path/to/GlensToolkit/scripts/install.sh [target-path]
#   claude-init [target-path]
#
# This installs project-level scaffolding (context templates, skills, CLAUDE.md).
# For universal commands, run install-toolkit.sh separately.
#
# Flags:
#   --force      Skip all confirmation prompts
#   --no-alias   Skip the alias setup offer at the end
#   --help       Show usage information
#

set -euo pipefail

# ── Colors (safe for non-tty) ────────────────────────────────────────────────

if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    RESET='\033[0m'
else
    RED='' GREEN='' YELLOW='' CYAN='' BOLD='' RESET=''
fi

# ── Helpers ──────────────────────────────────────────────────────────────────

info()  { printf "${CYAN}▸${RESET} %s\n" "$1"; }
ok()    { printf "${GREEN}✓${RESET} %s\n" "$1"; }
warn()  { printf "${YELLOW}⚠${RESET} %s\n" "$1"; }
err()   { printf "${RED}✗${RESET} %s\n" "$1" >&2; }

usage() {
    cat <<'USAGE'
Usage: install.sh [options] [target-path]

Scaffold a project with Glen's Toolkit files.
Installs project-level files only (context templates, skills, CLAUDE.md).

For universal commands (available in all projects), run:
  bash scripts/install-toolkit.sh

Arguments:
  target-path       Directory to install into (default: current directory)

Options:
  --force           Skip all confirmation prompts
  --no-alias        Skip the alias setup offer at the end
  --help            Show this help message

Examples:
  bash scripts/install.sh ~/my-project
  bash scripts/install.sh --force /tmp/test-target
  claude-init .
USAGE
}

# Portable realpath: resolve a path without readlink -f
resolve_path() {
    if [ -d "$1" ]; then
        (cd "$1" && pwd)
    elif [ -d "$(dirname "$1")" ]; then
        printf "%s/%s" "$(cd "$(dirname "$1")" && pwd)" "$(basename "$1")"
    else
        printf "%s" "$1"
    fi
}

# ── Parse arguments ──────────────────────────────────────────────────────────

FORCE=false
NO_ALIAS=false
TARGET_ARG=""

while [ $# -gt 0 ]; do
    case "$1" in
        --force)    FORCE=true ;;
        --no-alias) NO_ALIAS=true ;;
        --help)     usage; exit 0 ;;
        -*)         err "Unknown option: $1"; usage; exit 1 ;;
        *)
            if [ -n "$TARGET_ARG" ]; then
                err "Too many arguments. Only one target path allowed."
                usage
                exit 1
            fi
            TARGET_ARG="$1"
            ;;
    esac
    shift
done

# ── Resolve source and target ────────────────────────────────────────────────

# Source = directory containing this script's parent (the template repo root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Target = argument or current working directory
if [ -n "$TARGET_ARG" ]; then
    TARGET_DIR="$(resolve_path "$TARGET_ARG")"
else
    TARGET_DIR="$(pwd)"
fi

# ── Guards ───────────────────────────────────────────────────────────────────

# Guard: don't install into the template itself
SOURCE_RESOLVED="$(resolve_path "$SOURCE_DIR")"
TARGET_RESOLVED="$(resolve_path "$TARGET_DIR")"

if [ "$SOURCE_RESOLVED" = "$TARGET_RESOLVED" ]; then
    err "Target directory is the template repository itself."
    err "Please specify a different target: install.sh /path/to/project"
    exit 1
fi

# Guard: verify template has expected files
if [ ! -f "$SOURCE_DIR/CLAUDE.md" ] || [ ! -d "$SOURCE_DIR/.claude/commands" ]; then
    err "Template source does not look valid (missing CLAUDE.md or .claude/commands)."
    err "Source: $SOURCE_DIR"
    exit 1
fi

# Create target if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    info "Target directory does not exist. Creating: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# ── Conflict detection ───────────────────────────────────────────────────────

HAS_CONFLICTS=false

if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
    warn "CLAUDE.md already exists in target"
    HAS_CONFLICTS=true
fi

if [ -d "$TARGET_DIR/.claude" ]; then
    warn ".claude/ directory already exists in target"
    HAS_CONFLICTS=true
fi

if [ "$HAS_CONFLICTS" = true ] && [ "$FORCE" = false ]; then
    printf "\n"
    warn "Existing files will be overwritten."
    printf "  Continue? [y/N] "
    read -r REPLY
    if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
        info "Aborted."
        exit 0
    fi
fi

# ── Install summary ─────────────────────────────────────────────────────────

printf "\n"
printf "${BOLD}Glen's Toolkit — Project Scaffolding${RESET}\n"
printf "  Source:  %s\n" "$SOURCE_DIR"
printf "  Target:  %s\n" "$TARGET_DIR"
printf "\n"

if [ "$FORCE" = false ]; then
    printf "  Proceed? [Y/n] "
    read -r REPLY
    if [ "$REPLY" = "n" ] || [ "$REPLY" = "N" ]; then
        info "Aborted."
        exit 0
    fi
fi

printf "\n"

# ── File manifest ────────────────────────────────────────────────────────────
# Copy files explicitly — no glob, no rsync, maximum portability.

copy_file() {
    local rel="$1"
    local src="$SOURCE_DIR/$rel"
    local dst="$TARGET_DIR/$rel"

    if [ ! -f "$src" ]; then
        warn "Source file not found, skipping: $rel"
        return
    fi

    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    ok "  $rel"
}

COPIED=0

# Root files
info "Copying project files..."

copy_file "CLAUDE.md"
copy_file "shell-aliases.md"
COPIED=$((COPIED + 2))

# .claude/settings.local.json
copy_file ".claude/settings.local.json"
COPIED=$((COPIED + 1))

# .claude/skills/mcp-integration/
copy_file ".claude/skills/mcp-integration/SKILL.md"
copy_file ".claude/skills/mcp-integration/examples/http-server.json"
copy_file ".claude/skills/mcp-integration/examples/sse-server.json"
copy_file ".claude/skills/mcp-integration/examples/stdio-server.json"
copy_file ".claude/skills/mcp-integration/references/authentication.md"
copy_file ".claude/skills/mcp-integration/references/server-types.md"
copy_file ".claude/skills/mcp-integration/references/tool-usage.md"
COPIED=$((COPIED + 7))

# .claude/skills/skill-creator/
copy_file ".claude/skills/skill-creator/SKILL.md"
copy_file ".claude/skills/skill-creator/license.txt"
copy_file ".claude/skills/skill-creator/scripts/init_skill.py"
copy_file ".claude/skills/skill-creator/scripts/package_skill.py"
copy_file ".claude/skills/skill-creator/scripts/quick_validate.py"
COPIED=$((COPIED + 5))

# .claude/skills/site-audit/
copy_file ".claude/skills/site-audit/SKILL.md"
copy_file ".claude/skills/site-audit/references/seo-checklist.md"
copy_file ".claude/skills/site-audit/references/security-headers.md"
copy_file ".claude/skills/site-audit/references/wcag-checklist.md"
copy_file ".claude/skills/site-audit/references/lighthouse-scoring.md"
COPIED=$((COPIED + 5))

# context/ template files
copy_file "context/business-info.md"
copy_file "context/current-data.md"
copy_file "context/personal-info.md"
copy_file "context/strategy.md"
COPIED=$((COPIED + 4))

# ── Create empty directories ────────────────────────────────────────────────

info "Creating directories..."

for dir in plans outputs reference scripts; do
    mkdir -p "$TARGET_DIR/$dir"
    ok "  $dir/"
done

# ── Success summary ──────────────────────────────────────────────────────────

printf "\n"
printf "${GREEN}${BOLD}Project scaffolding complete!${RESET}\n"
printf "  Files copied:       %d\n" "$COPIED"
printf "  Directories created: 4\n"
printf "  Target: %s\n" "$TARGET_DIR"
printf "\n"

# Check if toolkit is installed
if [ ! -f "$HOME/.claude/commands/prime.md" ]; then
    printf "\n"
    warn "${BOLD}Toolkit not installed!${RESET}"
    printf "  Universal commands (/prime, /discover, /scope, etc.) are not yet available.\n"
    printf "  Run: ${BOLD}bash %s/scripts/install-toolkit.sh${RESET}\n" "$SOURCE_DIR"
    printf "\n"
fi

printf "  Next steps:\n"
printf "    1. cd %s\n" "$TARGET_DIR"
printf "    2. Edit context/ files with your info\n"
printf "    3. Run: claude \"/prime\"\n"
printf "\n"

# ── Offer alias setup ───────────────────────────────────────────────────────

if [ "$NO_ALIAS" = false ] && [ "$FORCE" = false ]; then
    printf "  Would you like to add a ${BOLD}claude-init${RESET} alias to your shell profile? [y/N] "
    read -r REPLY
    if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
        ALIAS_LINE="alias claude-init='bash \"$SOURCE_DIR/scripts/install.sh\"'"

        # Detect shell profile
        SHELL_PROFILE=""
        if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ]; then
            SHELL_PROFILE="$HOME/.zshrc"
        else
            SHELL_PROFILE="$HOME/.bashrc"
        fi

        if grep -qF "claude-init" "$SHELL_PROFILE" 2>/dev/null; then
            warn "claude-init alias already exists in $SHELL_PROFILE"
        else
            printf "\n%s\n" "$ALIAS_LINE" >> "$SHELL_PROFILE"
            ok "Added claude-init alias to $SHELL_PROFILE"
            info "Run: source $SHELL_PROFILE"
        fi
    fi
fi
