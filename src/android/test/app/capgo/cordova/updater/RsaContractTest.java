package app.capgo.cordova.updater;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.PublicKey;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(manifest = Config.NONE)
public class RsaContractTest {

    private static JSONObject contract;

    @BeforeClass
    public static void setUpClass() throws Exception {
        CryptoCipher.setLogger(new Logger("RsaContractTest", new Logger.Options(Logger.LogLevel.silent)));
        contract = new JSONObject(new String(Files.readAllBytes(contractFile()), StandardCharsets.UTF_8));
    }

    private static Path contractFile() throws IOException {
        Path current = Path.of(System.getProperty("user.dir")).toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve("native-contract-tests/crypto-rsa.json");
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        throw new IOException("native-contract-tests/crypto-rsa.json not found");
    }

    private static byte[] hexToBytes(String hex) {
        final byte[] out = new byte[hex.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    private static String bytesToHex(byte[] bytes) {
        final StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            builder.append(String.format("%02x", value));
        }
        return builder.toString();
    }

    @Test
    public void rsaPublicDecryptMatchesNativeContract() throws Exception {
        final PublicKey publicKey = CryptoCipher.stringToPublicKey(contract.getString("publicKeyPem"));
        final JSONArray cases = contract.getJSONArray("rsaPublicDecrypt");
        for (int index = 0; index < cases.length(); index++) {
            final JSONObject testCase = cases.getJSONObject(index);
            final String id = testCase.getString("id");
            final JSONObject input = testCase.getJSONObject("input");
            final JSONObject expect = testCase.getJSONObject("expect");
            final byte[] ciphertext = hexToBytes(input.getString("ciphertextHex"));
            final byte[] expected = hexToBytes(expect.getString("plaintextHex"));
            final byte[] decrypted = CryptoCipher.decryptRSA(ciphertext, publicKey);
            assertArrayEquals(id, expected, decrypted);
        }
    }

    @Test
    public void decryptChecksumMatchesNativeContract() throws Exception {
        final String publicKey = contract.getString("publicKeyPem");
        final JSONArray cases = contract.getJSONArray("decryptChecksum");
        for (int index = 0; index < cases.length(); index++) {
            final JSONObject testCase = cases.getJSONObject(index);
            final String id = testCase.getString("id");
            final JSONObject input = testCase.getJSONObject("input");
            final JSONObject expect = testCase.getJSONObject("expect");
            final String result = CryptoCipher.decryptChecksum(input.getString("checksumHex"), publicKey);
            assertEquals(id, expect.getString("decryptedHex"), result);
        }
    }

    @Test
    public void decryptChecksumInvalidMatchesNativeContract() throws Exception {
        final String publicKey = contract.getString("publicKeyPem");
        final JSONArray cases = contract.getJSONArray("decryptChecksumInvalid");
        for (int index = 0; index < cases.length(); index++) {
            final JSONObject testCase = cases.getJSONObject(index);
            final String id = testCase.getString("id");
            final JSONObject input = testCase.getJSONObject("input");
            final boolean shouldThrow = testCase.getJSONObject("expect").getBoolean("throws");
            try {
                CryptoCipher.decryptChecksum(input.getString("checksumHex"), publicKey);
                if (shouldThrow) {
                    fail(id + " expected IOException");
                }
            } catch (IOException e) {
                if (!shouldThrow) {
                    fail(id + " unexpected IOException: " + e.getMessage());
                }
            }
        }
    }

    @Test
    public void calcKeyIdMatchesNativeContract() throws Exception {
        final JSONArray cases = contract.getJSONArray("calcKeyId");
        for (int index = 0; index < cases.length(); index++) {
            final JSONObject testCase = cases.getJSONObject(index);
            final String id = testCase.getString("id");
            final JSONObject input = testCase.getJSONObject("input");
            final JSONObject expect = testCase.getJSONObject("expect");
            assertEquals(id, expect.getString("keyId"), CryptoCipher.calcKeyId(input.getString("publicKeyPem")));
        }
    }

    @Test
    public void rsaPublicKeyLoadMatchesNativeContract() throws Exception {
        final JSONArray cases = contract.getJSONArray("rsaPublicKeyLoad");
        for (int index = 0; index < cases.length(); index++) {
            final JSONObject testCase = cases.getJSONObject(index);
            final String id = testCase.getString("id");
            final String publicKeyPem = testCase.getJSONObject("input").getString("publicKeyPem");
            final boolean shouldLoad = testCase.getJSONObject("expect").getBoolean("loads");
            boolean loaded = false;
            try {
                CryptoCipher.stringToPublicKey(publicKeyPem);
                loaded = true;
            } catch (GeneralSecurityException ignored) {
                loaded = false;
            }
            assertEquals(id, shouldLoad, loaded);
        }
    }
}
