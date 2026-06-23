#!/usr/bin/env python3
"""Regenerate Cordova updater plugin artifacts from capacitor-updater."""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

SOURCE = Path(os.environ.get("CAPACITOR_UPDATER_SOURCE", "/Users/martindonadieu/Projects/capgo_all/capgo_plugins/capacitor-updater"))
TARGET = Path(os.environ.get("CORDOVA_UPDATER_TARGET", Path(__file__).resolve().parents[1]))
OLD_PKG = "ee.forgr.capacitor_updater"
NEW_PKG = "app.capgo.cordova.updater"

def main() -> int:
    if not SOURCE.is_dir():
        print(f"Missing source: {SOURCE}", file=sys.stderr)
        return 1

    print(f"Source: {SOURCE}")
    print(f"Target: {TARGET}")

    # Re-run is handled by maintaining generated files in-repo.
    # This script re-copies volatile upstream native/TS payloads.
    (TARGET / "src").mkdir(parents=True, exist_ok=True)
    for name in ("definitions.ts", "history.ts"):
        shutil.copy2(SOURCE / "src" / name, TARGET / "src" / name)

    for name in ("LICENSE", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md"):
        shutil.copy2(SOURCE / name, TARGET / name)

    for d in (".github", ".maestro", "native-contract-tests"):
        dst = TARGET / d
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(SOURCE / d, dst)

    scripts_dst = TARGET / "scripts"
    for item in (SOURCE / "scripts").iterdir():
        if item.name in {"bootstrap.sh", "bootstrap-generate.py"}:
            continue
        dst = scripts_dst / item.name
        if item.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(item, dst)
        else:
            shutil.copy2(item, dst)

    android_src = SOURCE / "android/src/main/java" / OLD_PKG.replace(".", "/")
    android_dst = TARGET / "src/android" / NEW_PKG.replace(".", "/")
    android_dst.mkdir(parents=True, exist_ok=True)
    for jf in android_src.glob("*.java"):
        if jf.name == "CapacitorUpdaterPlugin.java":
            continue
        content = jf.read_text()
        content = content.replace(f"package {OLD_PKG};", f"package {NEW_PKG};")
        content = content.replace("CapacitorUpdaterPlugin", "CordovaUpdaterPlugin")
        content = content.replace("import com.getcapacitor.BridgeActivity;\n", "")
        content = content.replace("import com.getcapacitor.Bridge;\n", "")
        content = content.replace("import com.getcapacitor.JSArray;\n", "import org.json.JSONArray;\n")
        content = content.replace("import com.getcapacitor.JSObject;\n", "import org.json.JSONObject;\n")
        content = content.replace("JSObject", "JSONObject").replace("JSArray", "JSONArray")
        (android_dst / jf.name).write_text(content)

    ios_src = SOURCE / "ios/Sources/CapacitorUpdaterPlugin"
    ios_dst = TARGET / "src/ios"
    ios_dst.mkdir(parents=True, exist_ok=True)
    for sf in ios_src.glob("*.swift"):
        if sf.name == "CapacitorUpdaterPlugin.swift":
            continue
        (ios_dst / sf.name).write_text(sf.read_text().replace("CapacitorUpdaterPlugin", "CordovaUpdaterPlugin"))

    print("Copied upstream payloads. Cordova bridge files are maintained in-repo.")
    print("Run: bun install && bun run build")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
