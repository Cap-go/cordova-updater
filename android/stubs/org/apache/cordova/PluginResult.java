package org.apache.cordova;

import org.json.JSONObject;

public class PluginResult {
    public static final int Status_OK = 0;
    public static final int Status_ERROR = 1;
    public static final int Status_NO_RESULT = 2;

    public PluginResult(int status) {}
    public PluginResult(int status, JSONObject message) {}
    public void setKeepCallback(boolean b) {}
}
