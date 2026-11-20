import "server-only";
import { pbkdf2Sync, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** New hashes: scrypt$<salt>$<hex>. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

/** Accepts scrypt hashes and the pbkdf2 hashes made by the earlier Python version. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  let candidate: Buffer;
  let expected: Buffer;
  if (parts[0] === "scrypt" && parts.length === 3) {
    expected = Buffer.from(parts[2], "hex");
    candidate = scryptSync(password, parts[1], expected.length);
  } else if (parts[0] === "pbkdf2" && parts.length === 4) {
    expected = Buffer.from(parts[3], "hex");
    candidate = pbkdf2Sync(password, parts[2], Number(parts[1]), expected.length, "sha256");
  } else {
    return false;
  }
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
