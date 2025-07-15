import crypto from "crypto";

/**
 * AES-256-GCM 加解密工具
 * ‑ 使用 32 bytes 金鑰（環境變數 RESOURCE_PASS_KEY）
 * ‑ IV 隨機 12 bytes，密文格式：base64(iv + authTag + cipherText)
 *   |<-- 12B IV ‑->|<-- 16B TAG ‑->|<-- cipherText ‑->|
 */

const KEY = process.env.ENCRYPTION_KEY || process.env.RESOURCE_PASS_KEY;
if (!KEY || Buffer.byteLength(KEY) !== 32) {
  throw new Error("Invalid ENCRYPTION_KEY length, must be 32 bytes (32 characters).");
}

export function encrypt(text = "") {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(KEY), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(base64) {
  if (!base64) return "";
  const buf = Buffer.from(base64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const text = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(KEY), iv);
  decipher.setAuthTag(tag);
  return decipher.update(text, undefined, "utf8") + decipher.final("utf8");
}
