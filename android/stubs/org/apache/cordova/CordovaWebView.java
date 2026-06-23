package org.apache.cordova;

import android.webkit.WebView;

public interface CordovaWebView {
    WebView getView();
    void loadUrl(String url);
    void clearHistory();
}
