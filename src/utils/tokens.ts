import { createHash, randomBytes } from "crypto";

export function generateSessionToken() {
  return randomBytes(64).toString("base64");
}

export function hashSessionToken(sessionToken: string) {
  const hash = createHash("sha512");
  hash.update(sessionToken);
  return hash.digest().toString("base64");
}
