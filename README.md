# cordova-updater

Update cordova app withtout store review.

WIP => This module is not ready yet.

Only the documentation is ready. Not the code.

You have 3 ways possible :
- use [capgo.app](https://capgo.app) a full featured auto update system in 5 min Setup, to manage version, update, revert and see stats.
- use your own server update with auto update system
- use manual methods to zip, upload, download, from JS to do it when you want.


## Community
Join the [discord](https://discord.gg/VnYRvBfgA6) to get help.

## Documentation
I maintain a more user friendly [documentation](https://doc.capgo.app).
## Install Auto update 
Create account in [capgo.app](https://capgo.app)
- Download the CLI `npm i -g capgo`
- Add app from CLI `capgo add -a API_KEY`
- Upload app `capgo upload -a API_KEY`
- Edit your `capacitor.config.json` 
- add the url you got in [capgo.app](https://capgo.app) select your app with the right channel to get it.

```json
// capacitor.config.json
{
	"appId": "**.***.**",
	"appName": "Name",
	"plugins": {
		"CapacitorUpdater": {
			"autoUpdateUrl": "https://capgo.app/api/latest?appid=**.****.***&channel=dev"
		}
	}
}
```
- Add to your main code
```javascript
  import { CordovaUpdater } from 'cordova-updater'
  CordovaUpdater.notifyAppReady()
  // To let auto update know you app boot well.
```

- Do `npm run build && npx cordova prepare` to copy the build to cordova.
- Run the app and see app auto update after each backgrounding.
- If update fail it will roolback to previous version.

See more there in the [Auto update](
https://doc.capgo.app/Auto-update-2cf9edda70484d7fa57111ab9c435d08) documentation.


## Install Manual

Download app update from url when user enter the app
install it when user background the app.

```bash
npm install cordova-updater
npx cap sync
```
Add in your main code 

```javascript
  import { CordovaUpdater } from 'cordova-updater'


  let version = ""
  document.addEventListener("pause", async () => {
    await CapacitorUpdater.set(version)
    console.log("Version set")
  }), false);
  document.addEventListener("resume", async () => {
      version = await CapacitorUpdater.download({
        url: 'https://github.com/Forgr-ee/Mimesis/releases/download/0.0.1/dist.zip',
      })
  }), false);

  // or do it when click on button
  const updateNow = async () => {
    const version = await CapacitorUpdater.download({
      url: 'https://github.com/Forgr-ee/Mimesis/releases/download/0.0.1/dist.zip',
    })
    // show the splashscreen to let the update happen
    SplashScreen.show()
    await CapacitorUpdater.set(version)
    SplashScreen.hide() // in case the set fail, otherwise the new app will have to hide it
  }
```

*Be extra carufull for your update* if you send a broken update, the app will crash until the user reinstalls it.


You can list the version and manage it with the command below.

## Packaging `dist.zip`

Whatever you choose to name the file you download from your release/update server URL, the zip file should contain the full contents of your production Capacitor build output folder, usually `{project directory}/dist/` or `{project directory}/www/`. This is where `index.html` will be located, and it should also contain all bundled JavaScript, CSS, and web resources necessary for your app to run.

Do not password encrypt this file, or it will fail to unpack.

## API

<docgen-index>

* [`download(...)`](#download)
* [`set(...)`](#set)
* [`delete(...)`](#delete)
* [`list()`](#list)
* [`reset(...)`](#reset)
* [`current()`](#current)
* [`reload()`](#reload)
* [`versionName()`](#versionname)
* [`notifyAppReady()`](#notifyappready)
* [`delayUpdate()`](#delayupdate)
* [`cancelDelay()`](#canceldelay)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### download(...)

```typescript
download(options: { url: string; }) => Promise<{ version: string; }>
```

Download a new version from the provided URL, it should be a zip file, with files inside or with a unique folder inside with all your files

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

--------------------


### set(...)

```typescript
set(options: { version: string; versionName?: string; }) => Promise<void>
```

Set version as current version, set will return an error if there are is no index.html file inside the version folder. `versionName` is optional and it's a custom value that will be saved for you

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code>{ version: string; versionName?: string; }</code> |

--------------------


### delete(...)

```typescript
delete(options: { version: string; }) => Promise<void>
```

Delete version in storage

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ version: string; }</code> |

--------------------


### list()

```typescript
list() => Promise<{ versions: string[]; }>
```

Get all available versions

**Returns:** <code>Promise&lt;{ versions: string[]; }&gt;</code>

--------------------


### reset(...)

```typescript
reset(options: { toAutoUpdate?: boolean; }) => Promise<void>
```

Set the `builtin` version (the one sent to Apple store / Google play store ) as current version

| Param         | Type                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ toAutoUpdate?: boolean; }</code> |

--------------------


### current()

```typescript
current() => Promise<{ current: string; }>
```

Get the current version, if none are set it returns `builtin`

**Returns:** <code>Promise&lt;{ current: string; }&gt;</code>

--------------------


### reload()

```typescript
reload() => Promise<void>
```

Reload the view

--------------------


### versionName()

```typescript
versionName() => Promise<{ versionName: string; }>
```

Get the version name, if it was set during the set phase

**Returns:** <code>Promise&lt;{ versionName: string; }&gt;</code>

--------------------


### notifyAppReady()

```typescript
notifyAppReady() => Promise<void>
```

Notify native plugin that the update is working, only in auto-update

--------------------


### delayUpdate()

```typescript
delayUpdate() => Promise<void>
```

Skip updates in the next time the app goes into the background, only in auto-update

--------------------


### cancelDelay()

```typescript
cancelDelay() => Promise<void>
```

allow update in the next time the app goes into the background, only in auto-update

--------------------

</docgen-api>

### Listen to download events

```javascript
  import { CapacitorUpdater } from 'capacitor-updater';

CapacitorUpdater.addListener('download', (info: any) => {
  console.log('download was fired', info.percent);
});
```

On iOS, Apple don't allow you to show a message when the app is updated, so you can't show a progress bar.

### Inspiration

- [capacitor-updater](https://github.dev/Capgo/capacitor-updater)
