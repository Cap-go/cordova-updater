#!/usr/bin/env bun
/**
 * Generates native-contract-tests/crypto-rsa.json using Node.js crypto.privateEncrypt,
 * matching Capgo bundle encryption (RSA PKCS#1 + public decrypt on device).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'native-contract-tests', 'crypto-rsa.json');

// Fixed non-secret test key pair so --check and committed fixtures stay stable across runs.
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDdDrXZSvJElZe
AcI24jzE5rm/gpRnLom19du/SWyhjETygyCoTSMWQHasdwyg7dVLt8uuKx5hQDdR
b4LcHt1ZMb1roqxDv3cA66vFm/RhNTGrL53xia7I9WzyXtkAwGQmE8p7tH5DImgG
op6jG99Xh7nBzi06GfxvCwP8AyLPUTCA2ePANfB34SqQRe5DbzqjnUPho3zqb10g
uhde6/pOdthf48NMTkqECEwt4nZTFVMbF9WbstYYgUN9VMcb+vYKh77mQdn5kCM+
d7zyhRxuBP+KaKbqMDHa2qEkWpj3tYmfDTl0DZb9ZRP8vEOLLMkayO42fTcFNJ4B
SIcCnsTLAgMBAAECggEAKNwQ+vty8ldrh759X+TeyFjlhuQg6wsfDdOGa1BJreH5
fessthJeHeY/COHgWXoux2P2aAQqlzEJ/3O82xB2vJE55Jj+wzDxC1e5MpfeOD4b
EorjTV23lNo9utNaMR6HMTCc+UxrwtQcBBsV58pJX+6HRj04VjedfodCf3oWWllk
POSFsw6x7nYFgBPIFtnbyhN1bE/nW+UvwmOtSdjkIo57XAhls9RQFLpIrelRj+Bg
oicKyLlbr6utxxnffflPOTwF1ubI5WWHe4lwuCDGE8NY4OExa4Ord9emLSyDodxw
XafxGtwRNyzLlfy5VJO4JoJtkUf8f1UdPdNh7WZqYQKBgQD2xOGzItMyqQLeVU9B
y2bPeN5kQvV9JI78UQZUr5mPaqNdGw1+HiEQalwvz2HTaA1Z47rAixBWtQ8LTzxo
me79Oy/yxzkoOkz6046nprhfLkv5pvZx7qvAgzPw1j0NX6J8YXphlycTWBeafMIH
RhnDTZLZubeGioFfPHKrx4VcKwKBgQDKw/F9TGLhvL6NSo0imutqis/si4yMiMFp
2op7I0fN9g+YHA9/1tAEKfpW1Q/Lo66QPahGEmqjnnd4lWUXAs/ZCNVfHJo/mCVP
ZOxZLdZ4dS7oJ9oqzexVjCx55XuQk3eVpHzAjBLE8mOmPKhI0iE88CbNoNWJ7N2+
bdMC7qHJ4QKBgQCEpEFZQ7/YPEahcaOfjxCdNq/7no5MDQmakIbhoF3fXAehtTfk
cZd+Nl2FCWjg9M4wYhtxAY7vvHTwtE+ZPhzbGyRj0Dhl6iiUroDAlvoFl2IZOGjB
xvOlECEsNEwu0xgI2XCp4lCLsk9FqAe3VzPj6d+kjpIajHqL0Xcl5KJHbwKBgHB6
n8S1EglNTZtNZttyevNgS5VZmD8BQeG5lKZYXOW5AM+NiV+OR1h3/OIcUSXTB+wF
+Ane/38CUh33KdvI+InZ55taX4q1mMThJGcYEWhDASFRsimaj+ao2qdIEPKTi3vc
gkPBsEvGdlbqQSQcRMnsImphNPPNDPktLSfsPp2hAoGBANJVAeJz4ubi3VSgeywy
aDJOyKqCb0G/x2nrl1xgMB6hSqNknqy4KK8HvOOC363ZhDH1d7tif9S9txt2PWzy
BewKzcgKZBLE1ztscN0yIFfhb151Ps8rG2wt5jGIXKK8kVsfIpKtCyKTAmbQc3Wo
ulKhlUZxJCI5rAsPTrPrh6fC
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAw3Q612UryRJWXgHCNuI8xOa5v4KUZy6JtfXbv0lsoYxE8oMgqE0j
FkB2rHcMoO3VS7fLriseYUA3UW+C3B7dWTG9a6KsQ793AOurxZv0YTUxqy+d8Ymu
yPVs8l7ZAMBkJhPKe7R+QyJoBqKeoxvfV4e5wc4tOhn8bwsD/AMiz1EwgNnjwDXw
d+EqkEXuQ286o51D4aN86m9dILoXXuv6TnbYX+PDTE5KhAhMLeJ2UxVTGxfVm7LW
GIFDfVTHG/r2Coe+5kHZ+ZAjPne88oUcbgT/imim6jAx2tqhJFqY97WJnw05dA2W
/WUT/LxDiyzJGsjuNn03BTSeAUiHAp7EywIDAQAB
-----END RSA PUBLIC KEY-----`;

function privateEncrypt(plaintext) {
  return crypto.privateEncrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    plaintext,
  );
}

function toHex(buffer) {
  return buffer.toString('hex');
}

const sessionKeyPlaintext = Buffer.alloc(16, 0xab);
const checksumPlaintext = Buffer.from(
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'hex',
);

const sessionKeyCiphertext = privateEncrypt(sessionKeyPlaintext);
const checksumCiphertext = privateEncrypt(checksumPlaintext);

if (sessionKeyCiphertext.length !== 256 || checksumCiphertext.length !== 256) {
  throw new Error(`Expected 256-byte RSA ciphertext, got ${sessionKeyCiphertext.length}`);
}

const cleanedKey = publicKey
  .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
  .replace(/-----END RSA PUBLIC KEY-----/g, '')
  .replace(/\s+/g, '');

const fixture = {
  version: 1,
  description:
    'RSA public-decrypt contract vectors generated with crypto.privateEncrypt (PKCS#1), matching Capgo CLI encryption.',
  publicKeyPem: publicKey.trim(),
  rsaPublicDecrypt: [
    {
      id: 'session-key-16-bytes',
      input: { ciphertextHex: toHex(sessionKeyCiphertext) },
      expect: { plaintextHex: toHex(sessionKeyPlaintext) },
    },
    {
      id: 'checksum-sha256-32-bytes',
      input: { ciphertextHex: toHex(checksumCiphertext) },
      expect: { plaintextHex: toHex(checksumPlaintext) },
    },
  ],
  decryptChecksum: [
    {
      id: 'hex-encoded-rsa-ciphertext',
      input: { checksumHex: toHex(checksumCiphertext) },
      expect: { decryptedHex: toHex(checksumPlaintext) },
    },
  ],
  calcKeyId: [
    {
      id: 'fixture-public-key',
      input: { publicKeyPem: publicKey.trim() },
      expect: { keyId: cleanedKey.slice(0, 20) },
    },
  ],
  rsaPublicKeyLoad: [
    {
      id: 'valid-pkcs1-pem',
      input: { publicKeyPem: publicKey.trim() },
      expect: { loads: true },
    },
    {
      id: 'invalid-pem',
      input: { publicKeyPem: 'not-a-key' },
      expect: { loads: false },
    },
  ],
  decryptChecksumInvalid: [
    {
      id: 'wrong-size-255-bytes',
      input: { checksumHex: '00'.repeat(255) },
      expect: { throws: true },
    },
  ],
};

if (process.argv.includes('--check')) {
  const existing = fs.readFileSync(outputPath, 'utf8');
  const generated = `${JSON.stringify(fixture, null, 2)}\n`;
  if (existing !== generated) {
    console.error('crypto-rsa.json is out of date; run bun scripts/generate-rsa-contract-fixtures.mjs');
    process.exit(1);
  }
  console.log('crypto-rsa.json is up to date');
  process.exit(0);
}

fs.writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
