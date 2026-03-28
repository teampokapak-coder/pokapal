#!/bin/sh
set -e

# Xcode Cloud sets this to the cloned repository root. Always use it when present so
# npm install / cap sync run in the same tree xcodebuild uses for SPM local packages
# (node_modules/@capacitor/* paths in ios/App/CapApp-SPM/Package.swift).
if [ -n "${CI_PRIMARY_REPOSITORY_PATH:-}" ]; then
  cd "$CI_PRIMARY_REPOSITORY_PATH"
else
  cd "$(dirname "$0")/.."
fi

echo "==> ci_post_clone: $(pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node not found on PATH"
  exit 1
fi

echo "==> node $(node -v) | npm $(npm -v)"

echo "==> Installing JavaScript dependencies"
# Prefer npm ci when lockfile is in sync; fall back to npm install (matches common Xcode Cloud guides)
if ! npm ci; then
  echo "==> npm ci failed, running npm install"
  npm install
fi

echo "==> Building web assets (required for cap copy to ios/App/App/public)"
npm run build

echo "==> Syncing Capacitor iOS (updates SPM + copies www)"
npx cap sync ios

for pkg in app browser push-notifications; do
  if [ ! -d "node_modules/@capacitor/$pkg" ]; then
    echo "ERROR: missing node_modules/@capacitor/$pkg after install"
    exit 1
  fi
done

echo "==> ci_post_clone: done"
