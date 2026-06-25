import fs from 'node:fs';
import path from 'node:path';
import { runCommand } from './command.mjs';
import { createBuildEnv, exampleAppDir, repoRoot, getScenario } from './scenarios.mjs';

async function runCommandWithRetries(command, args, options, maxAttempts = 3) {
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      await runCommand(command, args, options);
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.warn(
        `[maestro] ${command} ${args.join(' ')} failed on attempt ${attempt}/${maxAttempts}: ${error.message}`,
      );
      console.warn('[maestro] Retrying after a short delay...');
      await Bun.sleep(attempt * 5000);
      attempt += 1;
    }
  }
}


function buildPluginVariableArgs(env) {
  const keys = [
    'APP_ID',
    'DEFAULT_CHANNEL',
    'UPDATE_URL',
    'CHANNEL_URL',
    'STATS_URL',
    'AUTO_UPDATE',
    'DIRECT_UPDATE',
    'PUBLIC_KEY',
    'APP_READY_TIMEOUT',
    'ALLOW_MODIFY_URL',
    'ALLOW_MODIFY_APP_ID',
    'ALLOW_MANUAL_BUNDLE_ERROR',
    'ALLOW_SET_DEFAULT_CHANNEL',
    'PERSIST_CUSTOM_ID',
    'PERSIST_MODIFY_URL',
    'SHAKE_MENU',
    'AUTO_SPLASHSCREEN',
  ];

  return keys.flatMap((key) => {
    const rawValue = env[`CAPGO_${key}`] ?? env[key];
    if (rawValue == null || rawValue === '') {
      return [];
    }
    const value = String(rawValue).trim();
    if (!value) {
      return [];
    }
    return [`--variable=${key}=${value}`];
  });
}




function installLocalPluginSymlink() {
  const pluginsRoot = path.join(exampleAppDir, 'plugins');
  const scopedPluginsDir = path.join(pluginsRoot, '@capgo');
  const pluginDir = path.join(scopedPluginsDir, 'cordova-updater');
  if (fs.existsSync(pluginsRoot)) {
    fs.rmSync(pluginsRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(scopedPluginsDir, { recursive: true });
  fs.symlinkSync(path.resolve(repoRoot), pluginDir, 'dir');
}


async function stripUpdaterPluginFromCordovaMetadata() {
  const configPath = path.join(exampleAppDir, 'config.xml');
  let xml = fs.readFileSync(configPath, 'utf8');
  xml = xml.replace(/\s*<plugin name="@capgo\/cordova-updater"[\s\S]*?<\/plugin>\s*/m, '\n');
  fs.writeFileSync(configPath, xml, 'utf8');

  const packageJsonPath = path.join(exampleAppDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.cordova = packageJson.cordova ?? {};
  packageJson.cordova.plugins = packageJson.cordova.plugins ?? {};
  delete packageJson.cordova.plugins['@capgo/cordova-updater'];
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
}


const scenarioId = process.argv[2];

if (!scenarioId) {
  throw new Error('Usage: bun scripts/maestro/prepare-android-scenario.mjs <scenario-id>');
}

const scenario = getScenario(scenarioId);

const env = {
  ...createBuildEnv({
    scenarioId: scenario.id,
    directUpdate: scenario.directUpdate,
    appLabel: scenario.builtinLabel,
    autoUpdate: scenario.autoUpdate,
    extraEnv: scenario.env ?? {},
  }),
  CAPGO_DIRECT_UPDATE: scenario.directUpdate,
};

await runCommand('npm', ['ci'], {
  cwd: exampleAppDir,
  env,
});

await runCommand('npm', ['run', 'build'], {
  cwd: exampleAppDir,
  env,
});

await runCommand('bun', ['scripts/maestro/sync-cordova-config.mjs'], {
  cwd: repoRoot,
  env,
});


// Avoid `cordova platform rm` — it runs `npm uninstall cordova-android`, which breaks when
// example-app deps were installed with bun (no package-lock.json).
const platformsDir = path.join(exampleAppDir, 'platforms');
const androidPlatformDir = path.join(platformsDir, 'android');
const iosPlatformDir = path.join(platformsDir, 'ios');
if (fs.existsSync(androidPlatformDir)) {
  fs.rmSync(androidPlatformDir, { recursive: true, force: true });
}
if (fs.existsSync(iosPlatformDir)) {
  fs.rmSync(iosPlatformDir, { recursive: true, force: true });
}

// Installing the plugin during `platform add` uses npm `file:..` and can hit ENAMETOOLONG on CI.
await stripUpdaterPluginFromCordovaMetadata();

await runCommand('npx', ['cordova', 'platform', 'add', 'android', '--nosave'], {
  cwd: exampleAppDir,
  env,
});

const pluginPath = path.resolve(repoRoot);
const pluginJsPath = path.join(pluginPath, 'dist', 'plugin.js');
if (!fs.existsSync(pluginJsPath)) {
  await runCommand('bun', ['run', 'build'], {
    cwd: repoRoot,
    env,
  });
}

installLocalPluginSymlink();

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
