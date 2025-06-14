/**
 * Generates a v4 UUID with cryptographically secure random values.
 * @returns A new UUID string.
 */
export const generateUUID = (): string => {
  // Node.js環境: crypto.randomUUID()を使用
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // ブラウザ環境: crypto.getRandomValues()を使用
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // UUID v4フォーマットに変換
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant bits

    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // フォールバック: Date.now()とMath.random()を組み合わせ（非推奨）
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).substring(2);
  return `${timestamp.padStart(8, "0")}-${randomPart.substring(0, 4)}-4${randomPart.substring(4, 7)}-${((Math.random() * 4) | 8).toString(16)}${randomPart.substring(7, 10)}-${randomPart.substring(10, 22).padEnd(12, "0")}`;
};
