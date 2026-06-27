/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

declare const cordova: {
  exec: (
    success: (result: unknown) => void,
    error: (err: unknown) => void,
    service: string,
    action: string,
    args: unknown[],
  ) => void;
};

export const SERVICE_NAME = 'Updater';

/** Cordova resolves no-arg native success as `''` instead of `null`/`undefined`. */
export function normalizeEmptyCordovaResult<T>(result: unknown): T | null {
  if (result == null || result === '') {
    return null;
  }

  if (typeof result === 'object' && !Array.isArray(result)) {
    const record = result as Record<string, unknown>;
    if (!('bundle' in record) && !('id' in record) && Object.keys(record).length === 0) {
      return null;
    }
  }

  return result as T;
}

export function exec<T = unknown>(action: string, args: unknown[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    cordova.exec(
      (result: unknown) => resolve(result as T),
      (error: unknown) => reject(error),
      SERVICE_NAME,
      action,
      args,
    );
  });
}
