#!/usr/bin/env bash
# If Xcode shows "There is no XCFramework found at ... capacitor-swift-pm/...",
# SPM may have downloaded .zip artifacts without extracting them. This script
# unzips Capacitor + Cordova xcframeworks under DerivedData for any App-* project.
set -euo pipefail

DD_ROOT="${HOME}/Library/Developer/Xcode/DerivedData"
if [[ ! -d "$DD_ROOT" ]]; then
  echo "No DerivedData at $DD_ROOT"
  exit 0
fi

unzip_pair() {
  local base="$1"
  local name="$2"
  local z="${base}/${name}/${name}.xcframework.zip"
  local x="${base}/${name}/${name}.xcframework"
  if [[ -f "$z" ]] && [[ ! -d "$x" ]]; then
    echo "Extracting ${z}"
    (cd "${base}/${name}" && unzip -qo "${name}.xcframework.zip")
  fi
}

found=0
for appdir in "$DD_ROOT"/App-*/SourcePackages/artifacts/capacitor-swift-pm; do
  if [[ -d "$appdir" ]]; then
    found=1
    unzip_pair "$appdir" Capacitor
    unzip_pair "$appdir" Cordova
  fi
done

if [[ "$found" -eq 0 ]]; then
  echo "No capacitor-swift-pm artifacts under ${DD_ROOT}/App-*/... (open the project in Xcode once, or run: swift package resolve in ios/App/CapApp-SPM)"
fi
