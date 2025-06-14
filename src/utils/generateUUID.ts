/**
 * Generates a v4 UUID. Uses `crypto.randomUUID` if available, otherwise falls back to a
 * simple (non-cryptographically secure) implementation.
 * @returns A new UUID string.
 */
export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Basic fallback for non-secure contexts.
  // Not RFC4122 compliant but should be unique enough for this app.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
