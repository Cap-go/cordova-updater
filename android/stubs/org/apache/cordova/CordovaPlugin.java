package org.apache.cordova;

import android.content.Context;
import org.json.JSONArray;

public class CordovaPlugin {
    protected CordovaInterface cordova;
    protected CordovaWebView webView;

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        this.cordova = cordova;
        this.webView = webView;
    }

    protected void pluginInitialize() {}

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        return false;
    }

    public CordovaPluginPathHandler getPathHandler() {
        return null;
    }

    protected android.webkit.WebView getCordovaWebView() {
        return webView != null ? webView.getView() : null;
    }

    public void onActivityResult(int requestCode, int resultCode, android.content.Intent intent) {}

    public void onDestroy() {}
    public void onPause(boolean multitasking) {}
    public void onResume(boolean multitasking) {}
}
