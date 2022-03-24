var exec = require('cordova/exec');

exports.coolMethod = function (arg0, success, error) {
    exec(success, error, 'CordovaUpdater', 'coolMethod', [arg0]);
    exec(success, error, 'CordovaUpdater', 'download', [arg0]);
    exec(success, error, 'CordovaUpdater', 'set', [arg0]);
    exec(success, error, 'CordovaUpdater', 'delete', [arg0]);
    exec(success, error, 'CordovaUpdater', 'list', [arg0]);
    exec(success, error, 'CordovaUpdater', 'reset', [arg0]);
    exec(success, error, 'CordovaUpdater', 'current', [arg0]);
    exec(success, error, 'CordovaUpdater', 'reload', [arg0]);
    exec(success, error, 'CordovaUpdater', 'versionName', [arg0]);
    exec(success, error, 'CordovaUpdater', 'notifyAppReady', [arg0]);
    exec(success, error, 'CordovaUpdater', 'delayUpdate', [arg0]);
    exec(success, error, 'CordovaUpdater', 'cancelDelay', [arg0]);
};
