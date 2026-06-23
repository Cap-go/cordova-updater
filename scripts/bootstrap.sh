#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${CAPACITOR_UPDATER_SOURCE:-/Users/martindonadieu/Projects/capgo_all/capgo_plugins/capacitor-updater}"

echo "Bootstrapping @capgo/cordova-updater from ${SOURCE_DIR}"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Source capacitor-updater not found at ${SOURCE_DIR}" >&2
  exit 1
fi

export CAPACITOR_UPDATER_SOURCE="${SOURCE_DIR}"
export CORDOVA_UPDATER_TARGET="${ROOT_DIR}"

python3 "${ROOT_DIR}/scripts/bootstrap-generate.py"

echo "Bootstrap complete. Next: bun install && bun run build"
