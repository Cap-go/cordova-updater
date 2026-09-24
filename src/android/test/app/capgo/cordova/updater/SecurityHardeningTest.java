package app.capgo.cordova.updater;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.content.SharedPreferences;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE)
public class SecurityHardeningTest {

    @Test
    public void testResolvePathInsideDirectoryRejectsAbsolutePaths() throws Exception {
        final Path base = Files.createTempDirectory("capgo-abs-path");
        base.toFile().deleteOnExit();

        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "/etc/passwd"));
    }

    @Test
    public void testResolvePathInsideDirectoryRejectsBackslashes() throws Exception {
        final Path base = Files.createTempDirectory("capgo-backslash-path");
        base.toFile().deleteOnExit();

        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "assets\\app.js"));
    }

    @Test
    public void testResolvePathInsideDirectoryRejectsNullBytes() throws Exception {
        final Path base = Files.createTempDirectory("capgo-null-path");
        base.toFile().deleteOnExit();

        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "assets\0app.js"));
    }

    @Test
    public void testResolvePathInsideDirectoryRejectsDotDotSegments() throws Exception {
        final Path base = Files.createTempDirectory("capgo-dotdot-path");
        base.toFile().deleteOnExit();

        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "assets/../../secret.js"));
        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "../secret.js"));
    }

    @Test
    public void testResolvePathInsideDirectoryRejectsDotAsBaseDirectory() throws Exception {
        final Path base = Files.createTempDirectory("capgo-dot-path");
        base.toFile().deleteOnExit();

        assertThrows(IOException.class, () -> CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "."));
    }

    @Test
    public void testResolvePathInsideDirectoryAllowsNestedRelativePath() throws Exception {
        final Path base = Files.createTempDirectory("capgo-nested-path");
        base.toFile().deleteOnExit();

        final File resolved = CapgoUpdater.resolvePathInsideDirectory(base.toFile(), "assets/app.js");

        assertEquals(base.resolve("assets").resolve("app.js").toFile().getCanonicalFile(), resolved);
    }

    @Test
    public void resolveBundleDirectoryRejectsAbsolutePath() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-abs");
        assertThrows(IOException.class, () -> CapgoUpdater.resolveBundleDirectory(tempDir.toFile(), "/tmp/evil"));
    }

    @Test
    public void resolveBundleDirectoryRejectsPathTraversal() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-traversal");
        assertThrows(IOException.class, () -> CapgoUpdater.resolveBundleDirectory(tempDir.toFile(), "../outside-target"));
    }

    @Test
    public void resolveBundleDirectoryRejectsDotAsBundleRoot() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-dot");
        assertThrows(IOException.class, () -> CapgoUpdater.resolveBundleDirectory(tempDir.toFile(), "."));
    }

    @Test
    public void deleteRejectsDotBundleId() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-dot-id");
        final CapgoUpdater updater = new CapgoUpdater(mock(Logger.class));
        updater.documentsDir = tempDir.toFile();

        assertFalse(Boolean.TRUE.equals(updater.delete(".", true)));
    }

    @Test
    public void resolveBundleDirectoryRejectsWindowsSeparators() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-windows");
        assertThrows(IOException.class, () -> CapgoUpdater.resolveBundleDirectory(tempDir.toFile(), "..\\outside-target"));
    }

    @Test
    public void deleteRejectsPathTraversalOutsideBundleRoot() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-escape");
        final Path outsideTarget = tempDir.resolve("outside-target");
        Files.createDirectories(outsideTarget);
        Files.write(outsideTarget.resolve("marker.txt"), "keep".getBytes(StandardCharsets.UTF_8));

        final CapgoUpdater updater = new CapgoUpdater(mock(Logger.class));
        updater.documentsDir = tempDir.toFile();
        updater.CAP_SERVER_PATH = "server-path";
        updater.prefs = mock(SharedPreferences.class);
        updater.editor = mock(SharedPreferences.Editor.class);
        updater.statsUrl = "";

        when(updater.prefs.getString(eq("server-path"), anyString())).thenReturn("public");
        when(updater.prefs.getString(eq("pastVersion"), anyString())).thenReturn(BundleInfo.ID_BUILTIN);
        when(updater.prefs.getString(eq("nextVersion"), isNull())).thenReturn(null);
        when(updater.prefs.getString(eq("previewFallbackVersion"), isNull())).thenReturn(null);

        assertFalse(Boolean.TRUE.equals(updater.delete("../outside-target", true)));
        assertTrue("Path outside bundle root must remain untouched", Files.exists(outsideTarget.resolve("marker.txt")));
    }

    @Test
    public void deleteRejectsAbsolutePathId() throws Exception {
        final Path tempDir = Files.createTempDirectory("capgo-delete-abs-id");
        final CapgoUpdater updater = new CapgoUpdater(mock(Logger.class));
        updater.documentsDir = tempDir.toFile();

        assertFalse(Boolean.TRUE.equals(updater.delete("/tmp/evil", true)));
    }

    @Test
    public void decryptAesFileRejectsNullKeyWithoutNpe() throws Exception {
        final Path dir = Files.createTempDirectory("capgo-aes-null-key");
        File file = dir.resolve("cipher.bin").toFile();
        byte[] iv = new byte[16];
        Files.write(file.toPath(), new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 });
        try {
            CryptoCipher.decryptAesFile(file, null, iv);
            fail("expected null session key to be rejected");
        } catch (NullPointerException e) {
            fail("null session key must not cause NPE");
        } catch (IOException e) {
            assertTrue(e.getMessage().contains("missing session key"));
        }
    }

    @Test
    public void decryptAesFileRejectsBadKeyWithoutNpe() throws Exception {
        final Path dir = Files.createTempDirectory("capgo-aes-bad-key");
        File file = dir.resolve("cipher.bin").toFile();
        byte[] iv = new byte[16];
        byte[] keyBytes = new byte[16];
        for (int i = 0; i < 16; i++) {
            iv[i] = (byte) i;
            keyBytes[i] = (byte) (31 - i);
        }
        javax.crypto.SecretKey encryptKey = new javax.crypto.spec.SecretKeySpec(keyBytes, "AES");
        javax.crypto.SecretKey decryptKey = new javax.crypto.spec.SecretKeySpec(new byte[16], "AES");
        byte[] plain = "capgo-aes-failure".getBytes(StandardCharsets.UTF_8);
        javax.crypto.Cipher enc = javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
        enc.init(javax.crypto.Cipher.ENCRYPT_MODE, encryptKey, new javax.crypto.spec.IvParameterSpec(iv));
        byte[] cipherBytes = enc.doFinal(plain);
        Files.write(file.toPath(), cipherBytes);
        byte[] originalCipher = Files.readAllBytes(file.toPath());
        try {
            CryptoCipher.decryptAesFile(file, decryptKey, iv);
            fail("expected AES decrypt failure");
        } catch (NullPointerException e) {
            fail("AES decrypt failure must not cause NPE");
        } catch (IOException e) {
            assertTrue(e.getMessage().contains("AES file decryption failed"));
            assertArrayEquals(originalCipher, Files.readAllBytes(file.toPath()));
        }
    }

    @Test
    public void decryptAESRejectsFailureWithoutNull() throws Exception {
        byte[] iv = new byte[16];
        byte[] keyBytes = new byte[16];
        javax.crypto.SecretKey key = new javax.crypto.spec.SecretKeySpec(keyBytes, "AES");
        try {
            CryptoCipher.decryptAES(new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 }, key, iv);
            fail("expected AES decrypt failure");
        } catch (java.security.GeneralSecurityException e) {
            assertTrue(e.getMessage() != null);
        }
    }
}
