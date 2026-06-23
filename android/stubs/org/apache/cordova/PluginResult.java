package org.apache.cordova;

import org.json.JSONObject;

public class PluginResult {
    public enum Status {
        NO_RESULT,
        OK,
        CLASS_NOT_FOUND_EXCEPTION,
        ILLEGAL_ACCESS_EXCEPTION,
        INSTANTIATION_EXCEPTION,
        MALFORMED_URL_EXCEPTION,
        IO_EXCEPTION,
        INVALID_ACTION,
        JSON_EXCEPTION,
        ERROR
    }

    public PluginResult(Status status) {}

    public PluginResult(Status status, JSONObject message) {}

    public void setKeepCallback(boolean keepCallback) {}
}
