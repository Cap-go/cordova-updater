import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exampleAppDir } from './scenarios.mjs';

function readBooleanEnv(name, fallback = false) {
  const rawValue = process.env[name];
  if (rawValue == null) {
    return fallback;
  }
  return rawValue === 'true';
}

function readStringEnv(name, fallback = '') {
  const rawValue = process.env[name];
  return rawValue == null || rawValue === '' ? fallback : rawValue;
}

function readDirectUpdate() {
  return process.env.CAPGO_DIRECT_UPDATE ?? 'false';
}

function readAutoUpdate() {
  return process.env.CAPGO_AUTO_UPDATE === 'true' ? 'true' : 'off';
}

function escapeXmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
}

function readAppReadyTimeout() {
  const parsed = Number.parseInt(process.env.CAPGO_APP_READY_TIMEOUT ?? '20000', 10);
  return Number.isFinite(parsed) && parsed >= 1000 ? String(parsed) : '20000';
}

const preferences = {
  APP_ID: readStringEnv('CAPGO_APP_ID', readStringEnv('APP_ID', 'app.capgo.updater')),
  DEFAULT_CHANNEL: readStringEnv('CAPGO_DEFAULT_CHANNEL', readStringEnv('DEFAULT_CHANNEL', '')),
  UPDATE_URL: readStringEnv('CAPGO_UPDATE_URL', readStringEnv('UPDATE_URL', 'https://plugin.capgo.app/updates')),
  CHANNEL_URL: readStringEnv('CAPGO_CHANNEL_URL', readStringEnv('CHANNEL_URL', 'https://plugin.capgo.app/channel_self')),
  STATS_URL: readStringEnv('CAPGO_STATS_URL', readStringEnv('STATS_URL', 'https://plugin.capgo.app/stats')),
  AUTO_UPDATE: readStringEnv('AUTO_UPDATE', readAutoUpdate()),
  DIRECT_UPDATE: readStringEnv('DIRECT_UPDATE', readDirectUpdate()),
  PUBLIC_KEY: readStringEnv('CAPGO_PUBLIC_KEY', readStringEnv('PUBLIC_KEY', ' ')),
  APP_READY_TIMEOUT: readAppReadyTimeout(),
  ALLOW_MODIFY_URL: String(readBooleanEnv('CAPGO_ALLOW_MODIFY_URL', readBooleanEnv('ALLOW_MODIFY_URL', true))),
  ALLOW_MODIFY_APP_ID: String(readBooleanEnv('CAPGO_ALLOW_MODIFY_APP_ID', readBooleanEnv('ALLOW_MODIFY_APP_ID', true))),
  ALLOW_MANUAL_BUNDLE_ERROR: String(
    readBooleanEnv('CAPGO_ALLOW_MANUAL_BUNDLE_ERROR', readBooleanEnv('ALLOW_MANUAL_BUNDLE_ERROR', true)),
  ),
  ALLOW_SET_DEFAULT_CHANNEL: String(
    readBooleanEnv('CAPGO_ALLOW_SET_DEFAULT_CHANNEL', readBooleanEnv('ALLOW_SET_DEFAULT_CHANNEL', true)),
  ),
  PERSIST_CUSTOM_ID: String(readBooleanEnv('CAPGO_PERSIST_CUSTOM_ID', readBooleanEnv('PERSIST_CUSTOM_ID', true))),
  PERSIST_MODIFY_URL: String(readBooleanEnv('CAPGO_PERSIST_MODIFY_URL', readBooleanEnv('PERSIST_MODIFY_URL', true))),
  SHAKE_MENU: 'false',
  AUTO_SPLASHSCREEN: readDirectUpdate() !== 'false' ? 'true' : 'false',
  AndroidJavaSourceCompatibility: '21',
  AndroidJavaTargetCompatibility: '21',
};

const pluginVariableNames = [
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

function injectIosLocalNetworking(xml) {
  if (xml.includes('NSAllowsLocalNetworking')) {
    return xml;
  }

  const block = `    <platform name="ios">
        <preference name="SwiftVersion" value="5.0" />
        <preference name="deployment-target" value="13.0" />
        <edit-config file="*-Info.plist" mode="merge" target="NSAppTransportSecurity">
            <dict>
                <key>NSAllowsLocalNetworking</key>
                <true />
            </dict>
        </edit-config>
    </platform>`;

  return xml.replace('</widget>', `${block}\n</widget>`);
}

function injectAndroidCleartextTraffic(xml) {
  if (xml.includes('usesCleartextTraffic')) {
    return xml;
  }

  if (!xml.includes('xmlns:android=')) {
    xml = xml.replace(
      '<widget id="app.capgo.updater" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">',
      '<widget id="app.capgo.updater" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:android="http://schemas.android.com/apk/res/android">',
    );
  }

  const block = `    <platform name="android">
        <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application">
            <application android:usesCleartextTraffic="true" />
        </edit-config>
    </platform>`;

  return xml.replace('</widget>', `${block}\n</widget>`);
}

function syncPluginVariables(xml) {
  const variables = pluginVariableNames
    .map((name) => `        <variable name="${name}" value="${escapeXmlAttr(preferences[name])}" />`)
    .join('\n');

  const pluginBlock = `<plugin name="@capgo/cordova-updater" spec="..">\n${variables}\n    </plugin>`;

  if (xml.includes('<plugin name="@capgo/cordova-updater"')) {
    return xml.replace(/<plugin name="@capgo\/cordova-updater"[\s\S]*?<\/plugin>/m, pluginBlock);
  }

  return xml.replace('</widget>', `    ${pluginBlock}\n</widget>`);
}

async function syncConfigXml() {
  const configPath = path.join(exampleAppDir, 'config.xml');
  let xml = await readFile(configPath, 'utf8');

  for (const [name, value] of Object.entries(preferences)) {
    const safeValue = escapeXmlAttr(value);
    const preferencePattern = new RegExp(`(<preference\\s+name="${name}"\\s+value=")([^"]*)("\\s*/>)`, 'm');

    if (preferencePattern.test(xml)) {
      xml = xml.replace(preferencePattern, (_, prefix, __, suffix) => `${prefix}${safeValue}${suffix}`);
      continue;
    }

    const insertPoint = xml.indexOf('</widget>');
    if (insertPoint === -1) {
      throw new Error('config.xml is missing </widget>');
    }

    xml = xml.slice(0, insertPoint) + `    <preference name="${name}" value="${safeValue}" />\n` + xml.slice(insertPoint);
  }

  xml = syncPluginVariables(xml);
  xml = injectAndroidCleartextTraffic(xml);
  xml = injectIosLocalNetworking(xml);
  await writeFile(configPath, xml, 'utf8');
}

async function injectCordovaBootstrap(indexPath) {
  let html = await readFile(indexPath, 'utf8');
  if (html.includes('src="cordova.js"')) {
    return;
  }

  const cordovaTag = '<script src="cordova.js"></script>\n    ';
  if (html.includes('<script type="module"')) {
    html = html.replace('<script type="module"', `${cordovaTag}<script type="module"`);
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', `    ${cordovaTag}</body>`);
  } else {
    throw new Error(`Unable to inject cordova.js into ${indexPath}`);
  }

  await writeFile(indexPath, html, 'utf8');
}

async function syncWebAssets() {
  const distDir = path.join(exampleAppDir, 'dist');
  const wwwDir = path.join(exampleAppDir, 'www');
  await mkdir(wwwDir, { recursive: true });
  await cp(distDir, wwwDir, { recursive: true, force: true });
  await injectCordovaBootstrap(path.join(wwwDir, 'index.html'));
  await injectCordovaBootstrap(path.join(distDir, 'index.html'));
}


async function syncPackageJsonPlugins() {
  const packageJsonPath = path.join(exampleAppDir, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  packageJson.cordova = packageJson.cordova ?? {};
  packageJson.cordova.plugins = packageJson.cordova.plugins ?? {};
  packageJson.cordova.plugins['@capgo/cordova-updater'] = Object.fromEntries(
    pluginVariableNames.map((name) => [name, preferences[name]]),
  );
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}
`, 'utf8');
}

await syncConfigXml();
await syncPackageJsonPlugins();
await syncWebAssets();
console.log('[maestro] Cordova config.xml and www/ synced from build env');
