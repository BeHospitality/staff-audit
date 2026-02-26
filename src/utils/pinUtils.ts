/**
 * PIN hashing and verification utilities.
 * PINs are never stored raw — always salted + SHA-256 hashed.
 */

export function generatePin(): string {
  // 4-digit PIN, range 1000-9999 (no leading zeros)
  return (1000 + Math.floor(Math.random() * 9000)).toString();
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
