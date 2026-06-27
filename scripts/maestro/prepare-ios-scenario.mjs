import fs from 'node:fs';
import path from 'node:path';
import { runCommand } from './command.mjs';
import {
  buildPluginVariableArgs,
  createScenarioEnv,
  ensurePluginDistBuilt,
  installLocalPluginSymlink,
  prepareExampleWebAssets,
  stripUpdaterPluginFromCordovaMetadata,
} from './prepare-cordova-scenario-shared.mjs';
import { exampleAppDir, getScenario, repoRoot } from './scenarios.mjs';

const scenarioId = process.argv[2];

if (!scenarioId) {
  throw new Error('Usage: bun scripts/maestro/prepare-ios-scenario.mjs <scenario-id>');
}

const scenario = getScenario(scenarioId);
const env = createScenarioEnv(scenario);

await prepareExampleWebAssets(exampleAppDir, repoRoot, env);

const iosPlatformDir = path.join(exampleAppDir, 'platforms', 'ios');
const pluginsRoot = path.join(exampleAppDir, 'plugins');
if (fs.existsSync(iosPlatformDir)) {
  fs.rmSync(iosPlatformDir, { recursive: true, force: true });
}
if (fs.existsSync(pluginsRoot)) {
  fs.rmSync(pluginsRoot, { recursive: true, force: true });
}

await stripUpdaterPluginFromCordovaMetadata(exampleAppDir);

await runCommand('npx', ['cordova', 'platform', 'add', 'ios', '--nosave'], {
  cwd: exampleAppDir,
  env,
});

await ensurePluginDistBuilt(repoRoot, env);
installLocalPluginSymlink(exampleAppDir, repoRoot);

const pluginDir = path.join(exampleAppDir, 'plugins', '@capgo', 'cordova-updater');
const pluginVariableArgs = buildPluginVariableArgs(env);
await runCommand(
  'npx',
  ['cordova', 'plugin', 'add', pluginDir, '--link', '--nosave', ...pluginVariableArgs],
  {
    cwd: exampleAppDir,
    env,
  },
);

await runCommand('npx', ['cordova', 'prepare', 'ios'], {
  cwd: exampleAppDir,
  env,
});

function iosPluginInstalled() {
  const candidates = [
    path.join(
      exampleAppDir,
      'platforms',
      'ios',
      'Updater Example',
      'Plugins',
      '@capgo',
      'cordova-updater',
      'CordovaUpdaterPlugin.swift',
    ),
    path.join(exampleAppDir, 'platforms', 'ios', 'CordovaUpdaterPlugin.swift'),
  ];

  return candidates.some((candidate) => fs.existsSync(candidate));
}

if (!iosPluginInstalled()) {
  throw new Error('CordovaUpdaterPlugin was not installed into the iOS platform project');
}
