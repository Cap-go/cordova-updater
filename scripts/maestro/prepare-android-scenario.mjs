import fs from 'node:fs';
import path from 'node:path';
import { runCommand } from './command.mjs';
import {
  buildPluginVariableArgs,
  createScenarioEnv,
  ensurePluginDistBuilt,
  installLocalPluginSymlink,
  prepareExampleWebAssets,
  runCommandWithRetries,
  stripUpdaterPluginFromCordovaMetadata,
} from './prepare-cordova-scenario-shared.mjs';
import { exampleAppDir, getScenario, repoRoot } from './scenarios.mjs';

const scenarioId = process.argv[2];

if (!scenarioId) {
  throw new Error('Usage: bun scripts/maestro/prepare-android-scenario.mjs <scenario-id>');
}

const scenario = getScenario(scenarioId);
const env = createScenarioEnv(scenario);

await prepareExampleWebAssets(exampleAppDir, repoRoot, env);

const platformsDir = path.join(exampleAppDir, 'platforms');
const androidPlatformDir = path.join(platformsDir, 'android');
const iosPlatformDir = path.join(platformsDir, 'ios');
if (fs.existsSync(androidPlatformDir)) {
  fs.rmSync(androidPlatformDir, { recursive: true, force: true });
}
if (fs.existsSync(iosPlatformDir)) {
  fs.rmSync(iosPlatformDir, { recursive: true, force: true });
}

await stripUpdaterPluginFromCordovaMetadata(exampleAppDir);

await runCommand('npx', ['cordova', 'platform', 'add', 'android', '--nosave'], {
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

await runCommand('npx', ['cordova', 'prepare', 'android'], {
  cwd: exampleAppDir,
  env,
});

const nativeConfigPath = path.join(exampleAppDir, 'platforms', 'android', 'app', 'src', 'main', 'res', 'xml', 'config.xml');
const nativePluginSource = path.join(exampleAppDir, 'platforms', 'android', 'app', 'src', 'main', 'java', 'CordovaUpdaterPlugin.java');
if (
  !fs.existsSync(nativePluginSource) ||
  !fs.readFileSync(nativeConfigPath, 'utf8').includes('CordovaUpdaterPlugin')
) {
  throw new Error('CordovaUpdaterPlugin was not installed into the Android platform project');
}

await runCommandWithRetries('npx', ['cordova', 'build', 'android'], {
  cwd: exampleAppDir,
  env,
});
