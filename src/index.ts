import { exec } from './exec';
export * from './definitions';

export const Updater = {
  notifyAppReady: () => exec('notifyAppReady'),
  setUpdateUrl: (options?: unknown) => exec('setUpdateUrl', [options ?? {}]),
  setStatsUrl: (options?: unknown) => exec('setStatsUrl', [options ?? {}]),
  setChannelUrl: (options?: unknown) => exec('setChannelUrl', [options ?? {}]),
  download: (options?: unknown) => exec('download', [options ?? {}]),
  next: (options?: unknown) => exec('next', [options ?? {}]),
  set: (options?: unknown) => exec('set', [options ?? {}]),
  startPreviewSession: (options?: unknown) => exec('startPreviewSession', [options ?? {}]),
  listPreviews: () => exec('listPreviews'),
  setPreview: (options?: unknown) => exec('setPreview', [options ?? {}]),
  resetPreview: () => exec('resetPreview'),
  deletePreview: (options?: unknown) => exec('deletePreview', [options ?? {}]),
  checkPreviewUpdate: (options?: unknown) => exec('checkPreviewUpdate', [options ?? {}]),
  updatePreview: (options?: unknown) => exec('updatePreview', [options ?? {}]),
  delete: (options?: unknown) => exec('delete', [options ?? {}]),
  setBundleError: (options?: unknown) => exec('setBundleError', [options ?? {}]),
  list: () => exec('list'),
  reset: (options?: unknown) => exec('reset', [options ?? {}]),
  current: () => exec('current'),
  reload: () => exec('reload'),
  setMultiDelay: (options?: unknown) => exec('setMultiDelay', [options ?? {}]),
  cancelDelay: () => exec('cancelDelay'),
  triggerUpdateCheck: () => exec('triggerUpdateCheck'),
  getLatest: (options?: unknown) => exec('getLatest', [options ?? {}]),
  getMissingBundleFiles: (options?: unknown) => exec('getMissingBundleFiles', [options ?? {}]),
  getBundleDownloadSize: (options?: unknown) => exec('getBundleDownloadSize', [options ?? {}]),
  setChannel: (options?: unknown) => exec('setChannel', [options ?? {}]),
  unsetChannel: () => exec('unsetChannel'),
  getChannel: () => exec('getChannel'),
  listChannels: (options?: unknown) => exec('listChannels', [options ?? {}]),
  setCustomId: (options?: unknown) => exec('setCustomId', [options ?? {}]),
  getBuiltinVersion: () => exec('getBuiltinVersion'),
  getDeviceId: () => exec('getDeviceId'),
  getPluginVersion: () => exec('getPluginVersion'),
  isAutoUpdateEnabled: () => exec('isAutoUpdateEnabled'),
  isAutoUpdateAvailable: () => exec('isAutoUpdateAvailable'),
  getNextBundle: () => exec('getNextBundle'),
  getFailedUpdate: () => exec('getFailedUpdate'),
  setShakeMenu: (options?: unknown) => exec('setShakeMenu', [options ?? {}]),
  isShakeMenuEnabled: () => exec('isShakeMenuEnabled'),
  setShakeChannelSelector: (options?: unknown) => exec('setShakeChannelSelector', [options ?? {}]),
  isShakeChannelSelectorEnabled: () => exec('isShakeChannelSelectorEnabled'),
  getAppId: () => exec('getAppId'),
  setAppId: (options?: unknown) => exec('setAppId', [options ?? {}]),
  getAppUpdateInfo: () => exec('getAppUpdateInfo'),
  openAppStore: () => exec('openAppStore'),
  performImmediateUpdate: () => exec('performImmediateUpdate'),
  startFlexibleUpdate: () => exec('startFlexibleUpdate'),
  completeFlexibleUpdate: () => exec('completeFlexibleUpdate'),
  reportWebViewError: (options?: unknown) => exec('reportWebViewError', [options ?? {}]),
  addListener: (eventName: string, listener: (event: unknown) => void) => {
    const listenerId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
    void exec('addListener', [{ eventName, listenerId }]);
    const handler = (ev: Event) => listener((ev as CustomEvent).detail);
    document.addEventListener(`cordova-updater:${eventName}`, handler);
    return Promise.resolve({
      remove: async () => {
        document.removeEventListener(`cordova-updater:${eventName}`, handler);
        await exec('removeListener', [{ listenerId }]);
      },
    });
  },
  removeAllListeners: () => exec('removeAllListeners'),
};
