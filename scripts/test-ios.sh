#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"
TRIPLE="arm64-apple-ios16.0-simulator"

if [[ -n "${SIMULATOR_ID:-}" ]]; then
  xcodebuild test -scheme CapgoCordovaUpdater -destination "id=${SIMULATOR_ID}" "$@"
else
  SIMULATOR_ID="$(xcrun simctl list devices available 2>/dev/null | awk -F '[()]' '/iPhone/{print $2; exit}')"
  if [[ -n "${SIMULATOR_ID}" ]]; then
    xcodebuild test -scheme CapgoCordovaUpdater -destination "id=${SIMULATOR_ID}" "$@"
  else
    echo "No iPhone simulator available; compiling iOS tests with swift build." >&2
    swift build --sdk "$SDK" --triple "$TRIPLE" --target CordovaUpdaterPluginTests
  fi
fi
