#!/usr/bin/env bash
set -euo pipefail

# ─── colours ────────────────────────────────────────────────────────────────
BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

step()  { echo -e "\n${CYAN}${BOLD}▶ $1${RESET}"; }
ok()    { echo -e "${GREEN}✔ $1${RESET}"; }
info()  { echo -e "${DIM}  $1${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $1${RESET}"; }
fatal() { echo -e "${RED}${BOLD}✘ $1${RESET}" >&2; exit 1; }

# ─── banner ─────────────────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  ┌─────────────────────────────────────────────┐"
echo "  │      your-shop-here  •  sandbox bootstrap   │"
echo "  └─────────────────────────────────────────────┘"
echo -e "${RESET}"

# ─── preflight ──────────────────────────────────────────────────────────────
step "Preflight checks"

command -v b2c >/dev/null 2>&1 || fatal "b2c CLI not found — run 'npm install' first"

if [[ ! -f dw.json ]]; then
  if [[ -f dw.json.example ]]; then
    warn "dw.json not found — copying from dw.json.example"
    cp dw.json.example dw.json
    fatal "Fill in your credentials in dw.json and re-run this script"
  else
    fatal "dw.json not found and no dw.json.example to fall back to"
  fi
fi

HOSTNAME=$(node -e "const c=require('./dw.json'); process.stdout.write(c.hostname||'')" 2>/dev/null)
VERSION=$(node -e "const c=require('./dw.json'); process.stdout.write(c.version||'version1')" 2>/dev/null)

[[ -n "$HOSTNAME" ]] || fatal "dw.json is missing 'hostname'"
info "Instance : $HOSTNAME"
info "Version  : $VERSION"
ok "Preflight passed"

# ─── auth ───────────────────────────────────────────────────────────────────
step "Authenticating (unattended / client credentials)"
b2c auth client
ok "Authenticated"

# ─── data ───────────────────────────────────────────────────────────────────
step "Uploading and importing site data"
info "This runs the sfcc-site-archive-import job and waits for it to finish…"
b2c job import commerce-cloud-data/your-shop-here-data --wait --poll-interval 15
ok "Site data imported"

step "Running AfterDeploy job"
b2c job run AfterDeploy --wait --poll-interval 15
ok "AfterDeploy complete"

# ─── code ───────────────────────────────────────────────────────────────────
step "Deploying code ($VERSION)"
b2c code deploy commerce-cloud-code/
ok "Code uploaded"

step "Activating code version ($VERSION)"
TEMP_VERSION="version2"
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/placeholder_cartridge"
touch "$TEMP_DIR/placeholder_cartridge/.project"
info "Deploying placeholder version $TEMP_VERSION to enable reload…"
b2c code deploy "$TEMP_DIR/" -v "$TEMP_VERSION"
b2c code activate "$VERSION" --reload
rm -rf "$TEMP_DIR"
ok "Code version $VERSION is active"

# ─── done ───────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}${BOLD}  ✔ Bootstrap complete — $HOSTNAME is ready.${RESET}\n"
