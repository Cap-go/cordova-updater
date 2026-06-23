package app.capgo.cordova.updater.compat;

import org.json.JSONException;
import org.json.JSONObject;

public class JSObject extends JSONObject {
    public JSObject() {
        super();
    }

    public JSObject(JSONObject copy, String[] names) {
        super();
        for (String name : names) {
            if (copy != null && copy.has(name)) {
                try {
                    put(name, copy.get(name));
                } catch (org.json.JSONException ignored) {
                }
            }
        }
    }

    public JSObject(String json) throws JSONException {
        super(json);
    }

    @Override
    public JSObject put(String key, boolean value) {
        try {
            super.put(key, value);
        } catch (JSONException ignored) {
        }
        return this;
    }

    @Override
    public JSObject put(String key, int value) {
        try {
            super.put(key, value);
        } catch (JSONException ignored) {
        }
        return this;
    }

    @Override
    public JSObject put(String key, long value) {
        try {
            super.put(key, value);
        } catch (JSONException ignored) {
        }
        return this;
    }

    @Override
    public JSObject put(String key, double value) {
        try {
            super.put(key, value);
        } catch (JSONException ignored) {
        }
        return this;
    }

    @Override
    public JSObject put(String key, Object value) {
        try {
            super.put(key, value);
        } catch (JSONException ignored) {
        }
        return this;
    }

    public String getString(String key) {
        try {
            return super.getString(key);
        } catch (JSONException e) {
            return null;
        }
    }

    public boolean has(String key) {
        return super.has(key);
    }
}