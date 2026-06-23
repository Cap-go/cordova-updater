package org.apache.cordova;

import org.json.JSONArray;
import org.json.JSONObject;

public class CallbackContext {
    public void success() {}
    public void success(String message) {}
    public void success(JSONObject message) {}
    public void success(JSONArray message) {}
    public void error(String message) {}
    public void sendPluginResult(PluginResult pluginResult) {}
}
