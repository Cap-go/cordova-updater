#!/usr/bin/env bash
# Typecheck the non-SwiftPM (Cordova plugin) iOS sources against cordova-ios 7
# headers. This covers plugin.xml's engine ">=7.0.0" without a full example build.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_root="${RUNNER_TEMP:-$(mktemp -d)}"
work="$tmp_root/cordova-ios-7-headers"
rm -rf "$work"
mkdir -p "$work"
cd "$work"

npm pack cordova-ios@7.1.1 --silent
tar -xzf cordova-ios-*.tgz

include_dir="$work/package/CordovaLib/include"
if [[ ! -f "$include_dir/Cordova/CDVPluginResult.h" ]]; then
  echo "Expected cordova-ios 7 headers at $include_dir/Cordova/CDVPluginResult.h"
  exit 1
fi

header="$work/Cordova-Bridging-Header.h"
cat > "$header" <<'HDR'
#import <Cordova/CDV.h>
HDR

SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"

# Do not define SWIFT_PACKAGE so the #else (Cordova plugin) branch is compiled.
xcrun swiftc -typecheck \
  -sdk "$SDK" \
  -target arm64-apple-ios15.0-simulator \
  -import-objc-header "$header" \
  -Xcc -I"$include_dir" \
  -module-name CordovaUpdaterPlugin \
  "$repo_root/src/ios/CordovaCompat.swift" \
  "$repo_root/src/ios/CordovaPluginCall.swift"

echo "OK: Cordova plugin sources typecheck against cordova-ios 7.1.1 headers"
