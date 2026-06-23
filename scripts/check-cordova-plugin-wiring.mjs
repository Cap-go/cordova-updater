#!/usr/bin/env node
/**
 * Cordova plugin wiring checker.
 *
 * Verifies plugin.xml lists every Swift/Java source file under src/android and src/ios.
 */

import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".build",
  ".gradle",
  ".git",
]);

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function walkFiles(rootDir, extensions) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name === "test") continue;
        stack.push(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        out.push(path.join(dir, entry.name));
      }
    }
  }
  return out.sort();
}

function parseArgs(argv) {
  const out = { dir: process.cwd() };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") {
      out.dir = path.resolve(argv[++i] || ".");
      continue;
    }
  }
  return out;
}

const { dir: pluginDir } = parseArgs(process.argv);
const pluginXmlPath = path.join(pluginDir, "plugin.xml");
if (!exists(pluginXmlPath)) {
  console.error(`[wiring] ERROR: missing plugin.xml in ${pluginDir}`);
  process.exit(2);
}

const pluginXml = readText(pluginXmlPath);
const androidRoot = path.join(pluginDir, "src/android");
const iosRoot = path.join(pluginDir, "src/ios");

const androidFiles = exists(androidRoot)
  ? walkFiles(androidRoot, [".java"]).map((file) => path.relative(pluginDir, file))
  : [];
const iosFiles = exists(iosRoot)
  ? walkFiles(iosRoot, [".swift"]).map((file) => path.relative(pluginDir, file))
  : [];

const missing = [];
for (const file of [...androidFiles, ...iosFiles]) {
  const posix = file.split(path.sep).join("/");
  if (!pluginXml.includes(`src="${posix}"`)) {
    missing.push(posix);
  }
}

if (missing.length) {
  console.error("[wiring] ERROR: plugin.xml is missing source-file entries:");
  for (const file of missing) {
    console.error(`  - ${file}`);
  }
  process.exit(1);
}

console.log(
  `[wiring] OK: plugin.xml lists ${androidFiles.length} Android and ${iosFiles.length} iOS source files`,
);
