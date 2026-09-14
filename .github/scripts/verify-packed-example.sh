#!/usr/bin/env bash
set -euo pipefail

platform="${1:-}"
case "$platform" in
  android | ios | web) ;;
  *)
    echo "Usage: $0 <android|ios|web>"
    exit 1
    ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_root="${RUNNER_TEMP:-$(mktemp -d)}"
pack_dir="$tmp_root/plugin-package"
test_app="$tmp_root/plugin-example-app"
skip_package_build="${CAPGO_VERIFY_PACKED_SKIP_BUILD:-0}"

cd "$repo_root"

if [[ "$skip_package_build" != "1" ]]; then
  bun run build
fi

rm -rf "$pack_dir" "$test_app"
mkdir -p "$pack_dir" "$test_app"
bun pm pack --destination "$pack_dir" --quiet

shopt -s nullglob
packed_packages=("$pack_dir"/*.tgz)
shopt -u nullglob
if [[ "${#packed_packages[@]}" -ne 1 ]]; then
  echo "Expected exactly one package tarball, found ${#packed_packages[@]}"
  exit 1
fi

plugin_name="$(bun -e 'console.log(require("./package.json").name)')"
cp -R example-app/. "$test_app/"
cd "$test_app"
bun remove "$plugin_name"
bun add "${packed_packages[0]}"
CAPGO_USE_PACKED_PLUGIN=1 bun run build

plugin_path="$(node -p "require('path').dirname(require.resolve('@capgo/cordova-updater/package.json'))")"
# Use %ENV so Perl does not treat @capgo in scoped package paths as an array.
PLUGIN_PATH="$plugin_path" perl -pi -e 's|spec="\.\."|spec="$ENV{PLUGIN_PATH}"|' config.xml

case "$platform" in
  android)
    if [[ ! -d platforms/android ]]; then
      bunx cordova platform add android
    fi
    bunx cordova prepare android
    cd platforms/android
    ./gradlew assembleDebug
    ;;
  ios)
    if [[ ! -d platforms/ios ]]; then
      bunx cordova platform add ios
    fi
    bunx cordova prepare ios
    (cd platforms/ios && pod install --repo-update)
    xcodebuild \
      -workspace "platforms/ios/Updater Example.xcworkspace" \
      -scheme "Updater Example" \
      -configuration Debug \
      -destination "generic/platform=iOS Simulator" \
      -derivedDataPath "$tmp_root/plugin-example-derived-data" \
      CODE_SIGNING_ALLOWED=NO \
      SWIFT_VERSION=5.0 \
      IPHONEOS_DEPLOYMENT_TARGET=15.0
    ;;
  web)
    ;;
esac
