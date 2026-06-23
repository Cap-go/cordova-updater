/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Updater } from './index';

const api = { ...Updater };

document.addEventListener('deviceready', () => {
  const win = window as Window & {
    cordova?: { plugins?: Record<string, unknown> };
  };
  win.cordova = win.cordova || {};
  win.cordova.plugins = win.cordova.plugins || {};
  win.cordova.plugins.Updater = api;
});

export { api as Updater };
