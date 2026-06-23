package app.capgo.cordova.updater;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;
import androidx.annotation.Nullable;

public class CordovaUpdaterConfig {
    private final Context context;
    private final SharedPreferences preferences;

    public CordovaUpdaterConfig(Context context) {
        this.context = context.getApplicationContext();
        this.preferences = this.context.getSharedPreferences("CapgoCordovaUpdaterConfig", Context.MODE_PRIVATE);
    }

    @Nullable
    public String getString(String key, @Nullable String defaultValue) {
        String fromPrefs = preferences.getString(prefKey(key), null);
        if (fromPrefs != null && !fromPrefs.trim().isEmpty()) {
            return fromPrefs.trim();
        }
        int resId = context.getResources().getIdentifier(stringResName(key), "string", context.getPackageName());
        if (resId != 0) {
            String value = context.getString(resId);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return defaultValue;
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        String value = getString(key, null);
        if (value == null) return defaultValue;
        return Boolean.parseBoolean(value);
    }

    public int getInt(String key, int defaultValue) {
        String value = getString(key, null);
        if (value == null) return defaultValue;
        try { return Integer.parseInt(value.trim()); } catch (NumberFormatException e) { return defaultValue; }
    }

    private String prefKey(String key) {
        return "capgo_updater_" + key;
    }

    private String stringResName(String key) {
        return "capgo_updater_" + camelToSnake(key);
    }

    private String camelToSnake(String input) {
        return input.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
}
