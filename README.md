# @capgo/cordova-updater

Cordova plugin for [Capgo](https://capgo.app) live updates (OTA). Mirrors the `@capgo/capacitor-updater` API for Cordova apps.

## Install

```bash
cordova plugin add @capgo/cordova-updater --variable APP_ID=<your-capgo-app-id>
```

### Plugin variables

| Variable | Default | Description |
| --- | --- | --- |
| `APP_ID` | (empty) | Capgo app ID |
| `DEFAULT_CHANNEL` | (empty) | Default update channel |
| `UPDATE_URL` | `https://plugin.capgo.app/updates` | Update check endpoint |
| `CHANNEL_URL` | `https://plugin.capgo.app/channel_self` | Channel API endpoint |
| `STATS_URL` | `https://plugin.capgo.app/stats` | Stats endpoint |
| `AUTO_UPDATE` | `atBackground` | Auto-update mode |
| `PUBLIC_KEY` | (empty) | RSA public key for signed bundles |
| `APP_READY_TIMEOUT` | `10000` | Rollback timeout (ms) |

See `plugin.xml` for the full list of preferences (aligned with the Capacitor updater).

## Usage

The plugin exposes `cordova.plugins.Updater` after `deviceready`:

```javascript
document.addEventListener('deviceready', async () => {
  const { Updater } = cordova.plugins;

  await Updater.notifyAppReady();

  const { bundles } = await Updater.list();
  console.log('Downloaded bundles', bundles);

  const { bundle } = await Updater.current();
  console.log('Current bundle', bundle);
});
```

TypeScript types ship with the npm package:

```typescript
import type { UpdaterPlugin } from '@capgo/cordova-updater';

declare const cordova: { plugins: { Updater: UpdaterPlugin } };
```

## WebView requirements

Cordova Android ≥13 and iOS ≥7 serve the WebView via custom schemes (`https://localhost/` and `app://localhost/`). The plugin hooks `CordovaPluginPathHandler` (Android) and `CDVPluginSchemeHandler` (iOS) to serve downloaded bundles.

Do **not** use `cordova-plugin-ionic-webview` — it bypasses Cordova's scheme handlers and OTA bundles will not apply.

## Development

```bash
bun install
bun run build
bun run verify          # Android tests + iOS compile + TypeScript build
bun run native:contract # Native contract tests (shared with capacitor-updater)
```

### Example app

```bash
bun run build
cd example-app
npm install
npx cordova build android   # or cordova build ios
```

The example links the plugin from the repo root (`spec=".."` in `config.xml`). Cordova injects `cordova.plugins.Updater` via `plugin.xml` — no manual script tag needed in `www/index.html`.

Maestro E2E flows live under `.maestro/` (copied from `capacitor-updater`; adapt `scripts/maestro/*` once you run the example on device/simulator).

## License

MPL-2.0
