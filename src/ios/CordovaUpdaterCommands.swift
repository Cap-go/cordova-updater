#if SWIFT_PACKAGE
import Cordova
#endif

extension CordovaUpdaterPlugin {
    @objc(reportWebViewError:)
    func reportWebViewErrorCommand(_ command: CDVInvokedUrlCommand) {
        reportWebViewError(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setUpdateUrl:)
    func setUpdateUrlCommand(_ command: CDVInvokedUrlCommand) {
        setUpdateUrl(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setStatsUrl:)
    func setStatsUrlCommand(_ command: CDVInvokedUrlCommand) {
        setStatsUrl(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setChannelUrl:)
    func setChannelUrlCommand(_ command: CDVInvokedUrlCommand) {
        setChannelUrl(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getBuiltinVersion:)
    func getBuiltinVersionCommand(_ command: CDVInvokedUrlCommand) {
        getBuiltinVersion(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getDeviceId:)
    func getDeviceIdCommand(_ command: CDVInvokedUrlCommand) {
        getDeviceId(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getPluginVersion:)
    func getPluginVersionCommand(_ command: CDVInvokedUrlCommand) {
        getPluginVersion(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(download:)
    func downloadCommand(_ command: CDVInvokedUrlCommand) {
        download(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(reload:)
    func reloadCommand(_ command: CDVInvokedUrlCommand) {
        reload(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(next:)
    func nextCommand(_ command: CDVInvokedUrlCommand) {
        next(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(set:)
    func setCommand(_ command: CDVInvokedUrlCommand) {
        set(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(startPreviewSession:)
    func startPreviewSessionCommand(_ command: CDVInvokedUrlCommand) {
        startPreviewSession(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(listPreviews:)
    func listPreviewsCommand(_ command: CDVInvokedUrlCommand) {
        listPreviews(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setPreview:)
    func setPreviewCommand(_ command: CDVInvokedUrlCommand) {
        setPreview(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(resetPreview:)
    func resetPreviewCommand(_ command: CDVInvokedUrlCommand) {
        resetPreview(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(deletePreview:)
    func deletePreviewCommand(_ command: CDVInvokedUrlCommand) {
        deletePreview(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(checkPreviewUpdate:)
    func checkPreviewUpdateCommand(_ command: CDVInvokedUrlCommand) {
        checkPreviewUpdate(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(updatePreview:)
    func updatePreviewCommand(_ command: CDVInvokedUrlCommand) {
        updatePreview(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(delete:)
    func deleteCommand(_ command: CDVInvokedUrlCommand) {
        delete(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setBundleError:)
    func setBundleErrorCommand(_ command: CDVInvokedUrlCommand) {
        setBundleError(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(list:)
    func listCommand(_ command: CDVInvokedUrlCommand) {
        list(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getLatest:)
    func getLatestCommand(_ command: CDVInvokedUrlCommand) {
        getLatest(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getMissingBundleFiles:)
    func getMissingBundleFilesCommand(_ command: CDVInvokedUrlCommand) {
        getMissingBundleFiles(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getBundleDownloadSize:)
    func getBundleDownloadSizeCommand(_ command: CDVInvokedUrlCommand) {
        getBundleDownloadSize(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(triggerUpdateCheck:)
    func triggerUpdateCheckCommand(_ command: CDVInvokedUrlCommand) {
        triggerUpdateCheck(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(unsetChannel:)
    func unsetChannelCommand(_ command: CDVInvokedUrlCommand) {
        unsetChannel(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setChannel:)
    func setChannelCommand(_ command: CDVInvokedUrlCommand) {
        setChannel(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getChannel:)
    func getChannelCommand(_ command: CDVInvokedUrlCommand) {
        getChannel(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(listChannels:)
    func listChannelsCommand(_ command: CDVInvokedUrlCommand) {
        listChannels(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setCustomId:)
    func setCustomIdCommand(_ command: CDVInvokedUrlCommand) {
        setCustomId(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(reset:)
    func resetCommand(_ command: CDVInvokedUrlCommand) {
        reset(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(current:)
    func currentCommand(_ command: CDVInvokedUrlCommand) {
        current(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(notifyAppReady:)
    func notifyAppReadyCommand(_ command: CDVInvokedUrlCommand) {
        notifyAppReady(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setMultiDelay:)
    func setMultiDelayCommand(_ command: CDVInvokedUrlCommand) {
        setMultiDelay(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(cancelDelay:)
    func cancelDelayCommand(_ command: CDVInvokedUrlCommand) {
        cancelDelay(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(isAutoUpdateEnabled:)
    func isAutoUpdateEnabledCommand(_ command: CDVInvokedUrlCommand) {
        isAutoUpdateEnabled(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(isAutoUpdateAvailable:)
    func isAutoUpdateAvailableCommand(_ command: CDVInvokedUrlCommand) {
        isAutoUpdateAvailable(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getNextBundle:)
    func getNextBundleCommand(_ command: CDVInvokedUrlCommand) {
        getNextBundle(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getFailedUpdate:)
    func getFailedUpdateCommand(_ command: CDVInvokedUrlCommand) {
        getFailedUpdate(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setShakeMenu:)
    func setShakeMenuCommand(_ command: CDVInvokedUrlCommand) {
        setShakeMenu(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(isShakeMenuEnabled:)
    func isShakeMenuEnabledCommand(_ command: CDVInvokedUrlCommand) {
        isShakeMenuEnabled(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setShakeChannelSelector:)
    func setShakeChannelSelectorCommand(_ command: CDVInvokedUrlCommand) {
        setShakeChannelSelector(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(isShakeChannelSelectorEnabled:)
    func isShakeChannelSelectorEnabledCommand(_ command: CDVInvokedUrlCommand) {
        isShakeChannelSelectorEnabled(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getAppId:)
    func getAppIdCommand(_ command: CDVInvokedUrlCommand) {
        getAppId(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(setAppId:)
    func setAppIdCommand(_ command: CDVInvokedUrlCommand) {
        setAppId(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(getAppUpdateInfo:)
    func getAppUpdateInfoCommand(_ command: CDVInvokedUrlCommand) {
        getAppUpdateInfo(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(openAppStore:)
    func openAppStoreCommand(_ command: CDVInvokedUrlCommand) {
        openAppStore(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(performImmediateUpdate:)
    func performImmediateUpdateCommand(_ command: CDVInvokedUrlCommand) {
        performImmediateUpdate(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(startFlexibleUpdate:)
    func startFlexibleUpdateCommand(_ command: CDVInvokedUrlCommand) {
        startFlexibleUpdate(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(completeFlexibleUpdate:)
    func completeFlexibleUpdateCommand(_ command: CDVInvokedUrlCommand) {
        completeFlexibleUpdate(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(addListener:)
    func addListenerCommand(_ command: CDVInvokedUrlCommand) {
        addListener(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(removeListener:)
    func removeListenerCommand(_ command: CDVInvokedUrlCommand) {
        removeListener(CordovaPluginCall(command: command, plugin: self))
    }

    @objc(removeAllListeners:)
    func removeAllListenersCommand(_ command: CDVInvokedUrlCommand) {
        removeAllListeners(CordovaPluginCall(command: command, plugin: self))
    }
}
