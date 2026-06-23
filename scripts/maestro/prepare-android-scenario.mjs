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
    const value = env[key] ?? env[`CAPGO_${key}`];
    if (value == null || value === '') {
      return [];
    }
    return [`--variable=${key}=${value}`];
  });
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

await runCommand('bun', ['run', 'build'], {
  cwd: exampleAppDir,
  env,
});


await runCommand('bun', ['scripts/maestro/sync-cordova-config.mjs'], {
  cwd: repoRoot,
  env,
});




// Avoid `cordova platform rm` — it runs `npm uninstall cordova-android`, which breaks when
// example-app deps were installed with bun (no package-lock.json).
const androidPlatformDir = path.join(exampleAppDir, 'platforms', 'android');
if (fs.existsSync(androidPlatformDir)) {
  fs.rmSync(androidPlatformDir, { recursive: true, force: true });
}

await runCommand('npx', ['cordova', 'platform', 'add', 'android'], {
  cwd: exampleAppDir,
  env,
});

await runCommand('npx', ['cordova', 'prepare', 'android'], {
  cwd: exampleAppDir,
  env,
});

await runCommandWithRetries('npx', ['cordova', 'build', 'android'], {
  cwd: exampleAppDir,
  env,
});
