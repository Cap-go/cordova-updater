package app.capgo.cordova.updater.compat;

import androidx.annotation.Nullable;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONObject;

public class PluginCall {
    private final CallbackContext callbackContext;
    private final JSONArray args;
    private final CordovaPluginShim plugin;

    public interface CordovaPluginShim {
        void reject(PluginCall call, String message, @Nullable Exception exception);
    }

    public PluginCall(CallbackContext callbackContext, JSONArray args, CordovaPluginShim plugin) {
        this.callbackContext = callbackContext;
        this.args = args == null ? new JSONArray() : args;
        this.plugin = plugin;
    }

    public CallbackContext getCallbackContext() {
        return callbackContext;
    }

    @Nullable
    public String getString(String key) {
        return getString(key, null);
    }

    @Nullable
    public String getString(String key, @Nullable String defaultValue) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return defaultValue;
        }
        return obj.optString(key, defaultValue);
    }

    @Nullable
    public Boolean getBoolean(String key) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return null;
        }
        return obj.optBoolean(key);
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return defaultValue;
        }
        return obj.optBoolean(key, defaultValue);
    }

    public int getInt(String key, int defaultValue) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return defaultValue;
        }
        return obj.optInt(key, defaultValue);
    }

    public double getDouble(String key, double defaultValue) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return defaultValue;
        }
        return obj.optDouble(key, defaultValue);
    }

    @Nullable
    public JSObject getObject(String key) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return null;
        }
        Object value = obj.opt(key);
        if (value instanceof JSONObject) {
            JSObject copy = new JSObject();
            JSONObject source = (JSONObject) value;
            JSONArray names = source.names();
            if (names != null) {
                for (int i = 0; i < names.length(); i++) {
                    String name = names.optString(i);
                    copy.put(name, source.opt(name));
                }
            }
            return copy;
        }
        return null;
    }

    @Nullable
    public JSONArray getArray(String key) {
        JSONObject obj = firstObject();
        if (obj == null || !obj.has(key) || obj.isNull(key)) {
            return null;
        }
        return obj.optJSONArray(key);
    }

    @Nullable
    private JSONObject firstObject() {
        if (args.length() == 0) {
            return null;
        }
        Object first = args.opt(0);
        if (first instanceof JSONObject) {
            return (JSONObject) first;
        }
        return null;
    }

    public void resolve() {
        callbackContext.success();
    }

    public void resolve(JSObject data) {
        callbackContext.success(data);
    }

    public void resolve(String data) {
        callbackContext.success(data);
    }

    public void reject(String message) {
        plugin.reject(this, message, null);
    }


    public JSObject getData() {
        JSONObject obj = firstObject();
        if (obj == null) {
            return new JSObject();
        }
        JSObject copy = new JSObject();
        JSONArray names = obj.names();
        if (names != null) {
            for (int i = 0; i < names.length(); i++) {
                String name = names.optString(i);
                copy.put(name, obj.opt(name));
            }
        }
        return copy;
    }

    public void reject(String message, String code) {
        plugin.reject(this, message, null);
    }

    public void reject(String message, String code, @Nullable Exception exception, JSObject data) {
        plugin.reject(this, message, exception);
    }

    public void reject(String message, String code, @Nullable Exception exception) {
        plugin.reject(this, message, exception);
    }

    public void reject(String message, @Nullable Exception exception) {
        plugin.reject(this, message, exception);
    }
}
