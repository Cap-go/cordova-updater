#!/usr/bin/env node
/**
 * Cordova plugin release bump (package.json, plugin.xml, native pluginVersion).
 */

import { readFileSync } from "node:fs";
import standardVersion from "commit-and-tag-version";
import command from "commit-and-tag-version/command.js";
import merge from "merge-deep";

const ANDROID_PLUGIN = "./src/android/CordovaUpdaterPlugin.java";
const IOS_PLUGIN = "./src/ios/CordovaUpdaterPlugin.swift";
const PLUGIN_XML = "./plugin.xml";

const regexAndroid = /private\sfinal\sString\spluginVersion\s=\s"(.*)";/g;
const regexIos = /private\slet\spluginVersion:\sString\s=\s"(.*)"/g;
const regexPluginXml = /(<plugin\b[^>]*\sversion=")([^"]+)(")/;

const androidUpdater = {
  readVersion(contents) {
    const match = contents.match(regexAndroid);
    return match?.[0] ? match[0].replace(regexAndroid, "$1") : null;
  },
  writeVersion(contents, version) {
    return contents.replace(
      regexAndroid,
      `private final String pluginVersion = "${version}";`,
    );
  },
};

const iosUpdater = {
  readVersion(contents) {
    const match = contents.match(regexIos);
    return match?.[0] ? match[0].replace(regexIos, "$1") : null;
  },
  writeVersion(contents, version) {
    return contents.replace(
      regexIos,
      `private let pluginVersion: String = "${version}"`,
    );
  },
};

const pluginXmlUpdater = {
  readVersion(contents) {
    const match = contents.match(regexPluginXml);
    return match?.[2] ?? null;
  },
  writeVersion(contents, version) {
    return contents.replace(regexPluginXml, `$1${version}$3`);
  },
};

const baseConfig = {
  noVerify: true,
  tagPrefix: "",
  packageFiles: [{ filename: "./package.json", type: "json" }],
  bumpFiles: [
    { filename: ANDROID_PLUGIN, updater: androidUpdater },
    { filename: IOS_PLUGIN, updater: iosUpdater },
    { filename: PLUGIN_XML, updater: pluginXmlUpdater },
    { filename: "./package.json", type: "json" },
  ],
};

function assertReadableVersion(path, updater) {
  const contents = readFileSync(path, "utf8");
  const version = updater.readVersion(contents);
  if (!version) {
    throw new Error(`Could not read plugin version from ${path}`);
  }
}

try {
  assertReadableVersion(ANDROID_PLUGIN, androidUpdater);
  assertReadableVersion(IOS_PLUGIN, iosUpdater);
  assertReadableVersion(PLUGIN_XML, pluginXmlUpdater);

  const finalConfig = merge(command.argv, baseConfig);
  await standardVersion(finalConfig);
} catch (error) {
  console.error(error);
  process.exit(1);
}
