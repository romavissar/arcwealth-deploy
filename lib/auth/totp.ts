import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from "crypto";
import { Secret, TOTP } from "otpauth";

const TOTP_ISSUER = "ArcWealth";

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters for TOTP encryption");
  }
  return scryptSync(secret, "arcwealth-totp-v1", 32);
}

/** AES-256-GCM; IV(12) + tag(16) + ciphertext, base64url. */
export function encryptTotpSecret(plainBase32: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plainBase32, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptTotpSecret(encrypted: string): string {
  const key = getEncryptionKey();
  const raw = Buffer.from(encrypted, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data, undefined, "utf8") + decipher.final("utf8");
}

/** New random Base32 secret for Google Authenticator–class apps. */
export function generateTotpSecretBase32(): string {
  return new Secret({ size: 20 }).base32;
}


export function buildTotp(secretBase32: string, accountLabel: string): TOTP {
  return new TOTP({
    issuer: TOTP_ISSUER,
    label: accountLabel,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function verifyTotpToken(secretBase32: string, token: string): boolean {
  const trimmed = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const totp = new TOTP({
    issuer: TOTP_ISSUER,
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
  return totp.validate({ token: trimmed, window: 1 }) !== null;
}

export function otpauthUri(secretBase32: string, accountLabel: string): string {
  return buildTotp(secretBase32, accountLabel).toString();
}

export function hashRecoveryCode(normalized: string): string {
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

export function normalizeRecoveryCodeInput(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
}

export function generateRecoveryCodes(count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const h = randomBytes(5).toString("hex");
    out.push(`${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 10)}`);
  }
  return out;
}
