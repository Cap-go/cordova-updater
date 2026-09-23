# @capgo/cordova-updater

<a href="https://capgo.app/"><img src="https://capgo.app/readme-banner.svg?repo=Cap-go/cordova-updater" alt="Capgo - Cordova Updater - Instant updates for Cordova" /></a>

[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.com/invite/VnYRvBfgA6)

[![npm](https://img.shields.io/npm/dm/@capgo/cordova-updater)](https://www.npmjs.com/package/@capgo/cordova-updater)
[![GitHub latest commit](https://badgen.net/github/last-commit/Cap-go/cordova-updater/main)](https://github.com/Cap-go/cordova-updater/commit/)
[![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Cap-go_cordova-updater&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Cap-go_cordova-updater)
[![Open Bounties](https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2FCapgo%2Fbounties%3Fstatus%3Dopen)](https://console.algora.io/org/Capgo/bounties?status=open)
[![Rewarded Bounties](https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2FCapgo%2Fbounties%3Fstatus%3Dcompleted)](https://console.algora.io/org/Capgo/bounties?status=completed)

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin_cordova_updater"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin_cordova_updater"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

Cordova plugin for [Capgo](https://capgo.app) live updates (OTA). Ship JavaScript, HTML, and CSS updates to Cordova Android and iOS apps without waiting on app store review.

Already using `@capgo/capacitor-updater`? This plugin mirrors the same JavaScript API and uses the same Capgo Cloud backend, channels, and bundle signing model — adapted for Cordova.

## Why Cordova Updater?

Cordova apps still need fast web asset delivery between store releases. `@capgo/cordova-updater` brings Capgo's rollback-safe OTA model to Cordova without migrating to Capacitor first.

- **Same API** — Call `notifyAppReady()`, `download()`, `next()`, channel APIs, and stats hooks with the same surface as `@capgo/capacitor-updater`
- **Native scheme support** — Hooks Cordova's path and scheme handlers so downloaded bundles replace WebView content on modern Cordova Android and iOS
- **Capgo Cloud ready** — Upload bundles with `@capgo/cli`, roll out by channel, and monitor adoption from the same dashboard you use for Capacitor apps
- **Rollback protection** — Automatically revert broken updates to keep your app stable
- **Delta updates** — Only download changed files for faster updates
- **Open source** — Self-host or use [Capgo Cloud](https://capgo.app/), with full control over your update infrastructure

Perfect for fixing bugs immediately, A/B testing features, and maintaining control over your release schedule on legacy Cordova stacks.

## Documentation

The most complete doc is available here: https://capgo.app/docs/plugins/cordova-updater/

## Compatibility

| Platform | Minimum version |
| --- | --- |
| Cordova | 12+ |
| Cordova Android | 13+ |
| Cordova iOS | 7+ |

> **Note:** The JavaScript API mirrors [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater). Web is not supported — desktop/Electron apps should use [`@capgo/electron-updater`](https://github.com/Cap-go/electron-updater).

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
