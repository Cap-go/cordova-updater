package app.capgo.cordova.updater;

import android.net.Uri;
import android.util.Log;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceResponse;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.webkit.WebViewAssetLoader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class UpdaterPathHandler implements WebViewAssetLoader.PathHandler {
    public static final String TAG = "CapgoCordovaUpdater";

    private final Object activeBundleDirLock = new Object();

    @Nullable
    private File activeBundleDir;

    public void setActiveBundleDir(@Nullable File dir) {
        synchronized (activeBundleDirLock) {
            this.activeBundleDir = dir;
        }
    }

    @Nullable
    public File getActiveBundleDir() {
        synchronized (activeBundleDirLock) {
            return activeBundleDir;
        }
    }

    @Override
    @Nullable
    public WebResourceResponse handle(@NonNull String path) {
        File baseDir;
        synchronized (activeBundleDirLock) {
            baseDir = activeBundleDir;
        }
        if (baseDir == null) {
            return null;
        }

        String resolvedPath = path;
        if (resolvedPath.startsWith("/")) {
            resolvedPath = resolvedPath.substring(1);
        }
        if (resolvedPath.isEmpty() || resolvedPath.endsWith("/")) {
            resolvedPath = resolvedPath + "index.html";
        }

        File file = new File(baseDir, resolvedPath);
        try {
            String canonicalBase = baseDir.getCanonicalPath();
            String canonicalFile = file.getCanonicalPath();
            if (!canonicalFile.equals(canonicalBase) && !canonicalFile.startsWith(canonicalBase + File.separator)) {
                return null;
            }
        } catch (IOException e) {
            return null;
        }

        if (!file.isFile()) {
            return null;
        }

        try {
            InputStream stream = new FileInputStream(file);
            String mimeType = guessMimeType(resolvedPath);
            return new WebResourceResponse(mimeType, null, stream);
        } catch (IOException e) {
            Log.e(TAG, "Failed to open bundle file: " + file.getAbsolutePath(), e);
            return null;
        }
    }

    private String guessMimeType(@NonNull String path) {
        if (path.endsWith(".js") || path.endsWith(".mjs")) {
            return "application/javascript";
        }
        if (path.endsWith(".wasm")) {
            return "application/wasm";
        }
        String extension = MimeTypeMap.getFileExtensionFromUrl(path);
        if (extension != null) {
            String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
            if (mime != null) {
                return mime;
            }
        }
        if (path.endsWith(".html") || path.endsWith(".htm")) {
            return "text/html";
        }
        return "application/octet-stream";
    }
}
