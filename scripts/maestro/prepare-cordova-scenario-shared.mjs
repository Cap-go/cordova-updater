import fs from 'node:fs';
import path from 'node:path';
import { runCommand } from './command.mjs';
import { createBuildEnv } from './scenarios.mjs';

export async function runCommandWithRetries(command, args, options, maxAttempts = 3) {
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

export function buildPluginVariableArgs(env) {
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

export function installLocalPluginSymlink(exampleAppDir, repoRoot) {
  const pluginsRoot = path.join(exampleAppDir, 'plugins');
  const scopedPluginsDir = path.join(pluginsRoot, '@capgo');
  const pluginDir = path.join(scopedPluginsDir, 'cordova-updater');
  if (fs.existsSync(pluginsRoot)) {
    fs.rmSync(pluginsRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(scopedPluginsDir, { recursive: true });
  fs.symlinkSync(path.resolve(repoRoot), pluginDir, 'dir');
}

export async function stripUpdaterPluginFromCordovaMetadata(exampleAppDir) {
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

export async function ensurePluginDistBuilt(repoRoot, env) {
  const pluginJsPath = path.join(repoRoot, 'dist', 'plugin.js');
  if (!fs.existsSync(pluginJsPath)) {
    await runCommand('bun', ['run', 'build'], {
      cwd: repoRoot,
      env,
    });
  }
}

export function createScenarioEnv(scenario) {
  return {
    ...createBuildEnv({
      scenarioId: scenario.id,
      directUpdate: scenario.directUpdate,
      appLabel: scenario.builtinLabel,
      autoUpdate: scenario.autoUpdate,
      extraEnv: scenario.env ?? {},
    }),
    CAPGO_DIRECT_UPDATE: scenario.directUpdate,
  };
}

export async function prepareExampleWebAssets(exampleAppDir, repoRoot, env) {
  await ensurePluginDistBuilt(repoRoot, env);

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
}
