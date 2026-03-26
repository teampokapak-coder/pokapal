#!/bin/bash
set -euo pipefail

echo "==> Xcode Cloud post-clone: preparing Capacitor workspace"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Working directory: $REPO_ROOT"

if ! command -v node >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not available in this Xcode Cloud environment."
  exit 1
fi

echo "==> Node version: $(node -v)"
echo "==> NPM version: $(npm -v)"

echo "==> Installing JavaScript dependencies"
npm ci

echo "==> Building web assets"
npm run build

echo "==> Syncing Capacitor iOS project"
npx cap sync ios

echo "==> Post-clone setup completed"
