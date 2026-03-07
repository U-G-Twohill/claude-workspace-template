#!/usr/bin/env bash
#
# install-toolkit.sh — Install/update universal Claude commands to ~/.claude/
#
# Usage:
#   bash /path/to/GlensToolkit/scripts/install-toolkit.sh
#   claude-toolkit
#
# Flags:
#   --force      Skip all confirmation prompts
#   --help       Show usage information
#   --no-alias   Skip the alias setup offer at the end
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
Usage: install-toolkit.sh [options]

Install or update universal Claude commands to ~/.claude/commands/.
These commands become available in every project.

Options:
  --force           Skip all confirmation prompts
  --no-alias        Skip the alias setup offer at the end
  --help            Show this help message

Commands installed:
  prime.md              Session initialization
  create-plan.md        Create implementation plans
  implement.md          Execute implementation plans
  discover.md           Audit project for undocumented context
  scope.md              Discovery-to-prototype scoping pipeline
  sync-toolkit.md       Sync commands between project and toolkit
  harden.md             Find bugs, security issues, and edge cases
  frontend-design.md    Screenshot-driven frontend UI development
  site-audit.md         Website SEO, performance, and security audits
  deploy-draft.md       Deploy static sites to Netlify for client review
  autopilot.md          Run full toolkit pipeline unattended
  create-tests.md       Auto-generate test suites from code analysis
  audit-deps.md         Dependency security and freshness audit
  prepare-deploy.md     Production readiness and CI/CD setup
  proposal.md           Generate client proposals from briefs/RFPs
  client-report.md      Automated client-facing reports
  competitive-intel.md  Competitor analysis and intelligence
  setup-hooks.md        Configure quality enforcement hooks
  document.md           Auto-generate project documentation
  connect.md            MCP server integration setup
  onboard-client.md     Client onboarding package generation
  meeting-actions.md    Meeting notes to action items
  sync-docs.md          Audit and update all documentation
  bootstrap.md          Build prototype from business document unattended
  hub-projects.md       Query Project Hub for project info and health
  hub-keys.md           Look up API keys from hub vault
  hub-report.md         Generate daily planning briefing from hub
  hub-export.md         Export hub context as MASTER_CONTEXT.md

Examples:
  bash scripts/install-toolkit.sh
  bash scripts/install-toolkit.sh --force
  claude-toolkit
USAGE
}

# ── Parse arguments ──────────────────────────────────────────────────────────

FORCE=false
NO_ALIAS=false

while [ $# -gt 0 ]; do
    case "$1" in
        --force)    FORCE=true ;;
        --no-alias) NO_ALIAS=true ;;
        --help)     usage; exit 0 ;;
        -*)         err "Unknown option: $1"; usage; exit 1 ;;
        *)          err "Unexpected argument: $1"; usage; exit 1 ;;
    esac
    shift
done

# ── Resolve source ───────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_COMMANDS="$SOURCE_DIR/.claude/commands"
TARGET_COMMANDS="$HOME/.claude/commands"

# ── Guards ───────────────────────────────────────────────────────────────────

if [ ! -d "$SOURCE_COMMANDS" ]; then
    err "Source commands directory not found: $SOURCE_COMMANDS"
    err "Are you running this from the correct template repo?"
    exit 1
fi

# ── Command manifest ─────────────────────────────────────────────────────────
# Explicit list of commands to install (toolkit-layer only)

COMMANDS=(
    "prime.md"
    "create-plan.md"
    "implement.md"
    "discover.md"
    "scope.md"
    "sync-toolkit.md"
    "harden.md"
    "frontend-design.md"
    "site-audit.md"
    "deploy-draft.md"
    "autopilot.md"
    "create-tests.md"
    "audit-deps.md"
    "prepare-deploy.md"
    "proposal.md"
    "client-report.md"
    "competitive-intel.md"
    "setup-hooks.md"
    "document.md"
    "connect.md"
    "onboard-client.md"
    "meeting-actions.md"
    "sync-docs.md"
    "bootstrap.md"
    "hub-projects.md"
    "hub-keys.md"
    "hub-report.md"
    "hub-export.md"
)

# ── Diff detection ───────────────────────────────────────────────────────────

NEW_COUNT=0
UPDATED_COUNT=0
UNCHANGED_COUNT=0

printf "\n"
printf "${BOLD}Glen's Toolkit — Install Commands${RESET}\n"
printf "  Source:  %s\n" "$SOURCE_COMMANDS"
printf "  Target:  %s\n" "$TARGET_COMMANDS"
printf "\n"

info "Checking command status..."

for cmd in "${COMMANDS[@]}"; do
    src="$SOURCE_COMMANDS/$cmd"
    dst="$TARGET_COMMANDS/$cmd"

    if [ ! -f "$src" ]; then
        warn "Source not found, skipping: $cmd"
        continue
    fi

    if [ ! -f "$dst" ]; then
        printf "  ${GREEN}NEW${RESET}       %s\n" "$cmd"
        NEW_COUNT=$((NEW_COUNT + 1))
    elif diff -q "$src" "$dst" > /dev/null 2>&1; then
        printf "  ${CYAN}CURRENT${RESET}   %s\n" "$cmd"
        UNCHANGED_COUNT=$((UNCHANGED_COUNT + 1))
    else
        printf "  ${YELLOW}UPDATE${RESET}    %s\n" "$cmd"
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
    fi
done

# Check for deprecated commands to clean up
DEPRECATED=("setup-workspace.md")
DEPRECATED_FOUND=()

for cmd in "${DEPRECATED[@]}"; do
    if [ -f "$TARGET_COMMANDS/$cmd" ]; then
        DEPRECATED_FOUND+=("$cmd")
        printf "  ${RED}REMOVE${RESET}    %s (deprecated)\n" "$cmd"
    fi
done

printf "\n"

INSTALL_COUNT=$((NEW_COUNT + UPDATED_COUNT))

if [ "$INSTALL_COUNT" -eq 0 ] && [ "${#DEPRECATED_FOUND[@]}" -eq 0 ]; then
    ok "All commands are up to date. Nothing to do."
    exit 0
fi

printf "  New: %d  |  Updated: %d  |  Current: %d  |  Remove: %d\n" \
    "$NEW_COUNT" "$UPDATED_COUNT" "$UNCHANGED_COUNT" "${#DEPRECATED_FOUND[@]}"
printf "\n"

# ── Confirm ──────────────────────────────────────────────────────────────────

if [ "$FORCE" = false ]; then
    printf "  Proceed? [Y/n] "
    read -r REPLY
    if [ "$REPLY" = "n" ] || [ "$REPLY" = "N" ]; then
        info "Aborted."
        exit 0
    fi
fi

printf "\n"

# ── Install ──────────────────────────────────────────────────────────────────

mkdir -p "$TARGET_COMMANDS"

INSTALLED=0

info "Installing commands..."

for cmd in "${COMMANDS[@]}"; do
    src="$SOURCE_COMMANDS/$cmd"
    dst="$TARGET_COMMANDS/$cmd"

    if [ ! -f "$src" ]; then
        continue
    fi

    # Skip if identical
    if [ -f "$dst" ] && diff -q "$src" "$dst" > /dev/null 2>&1; then
        continue
    fi

    cp "$src" "$dst"
    ok "  $cmd"
    INSTALLED=$((INSTALLED + 1))
done

# Remove deprecated commands
for cmd in "${DEPRECATED_FOUND[@]}"; do
    rm -f "$TARGET_COMMANDS/$cmd"
    ok "  Removed $cmd (deprecated)"
done

# ── Success summary ──────────────────────────────────────────────────────────

printf "\n"
printf "${GREEN}${BOLD}Toolkit install complete!${RESET}\n"
printf "  Commands installed/updated: %d\n" "$INSTALLED"
if [ "${#DEPRECATED_FOUND[@]}" -gt 0 ]; then
    printf "  Deprecated commands removed: %d\n" "${#DEPRECATED_FOUND[@]}"
fi
printf "  Location: %s\n" "$TARGET_COMMANDS"
printf "\n"
printf "  These commands are now available in every project.\n"
printf "  Run /prime in any project to start a session.\n"
printf "\n"

# ── Offer alias setup ───────────────────────────────────────────────────────

if [ "$NO_ALIAS" = false ] && [ "$FORCE" = false ]; then
    printf "  Would you like to add a ${BOLD}claude-toolkit${RESET} alias to your shell profile? [y/N] "
    read -r REPLY
    if [ "$REPLY" = "y" ] || [ "$REPLY" = "Y" ]; then
        ALIAS_LINE="alias claude-toolkit='bash \"$SOURCE_DIR/scripts/install-toolkit.sh\"'"

        # Detect shell profile
        SHELL_PROFILE=""
        if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ]; then
            SHELL_PROFILE="$HOME/.zshrc"
        else
            SHELL_PROFILE="$HOME/.bashrc"
        fi

        if grep -qF "claude-toolkit" "$SHELL_PROFILE" 2>/dev/null; then
            warn "claude-toolkit alias already exists in $SHELL_PROFILE"
        else
            printf "\n%s\n" "$ALIAS_LINE" >> "$SHELL_PROFILE"
            ok "Added claude-toolkit alias to $SHELL_PROFILE"
            info "Run: source $SHELL_PROFILE"
        fi
    fi
fi
