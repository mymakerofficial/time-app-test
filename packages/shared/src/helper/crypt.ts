export abstract class Crypt {
  static async encrypt(data: ArrayBuffer, key: CryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data,
    )

    // combine iv and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength)
    result.set(iv, 0)
    result.set(new Uint8Array(encryptedData), iv.length)

    return result
  }

  static async decrypt(encryptedData: Uint8Array, key: CryptoKey) {
    const iv = encryptedData.slice(0, 12)
    const data = encryptedData.slice(12)

    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data,
    )
  }

  static async phraseToKey(input: string) {
    return await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(input),
      'PBKDF2',
      false,
      ['deriveKey'],
    )
  }

  static async deriveKey(
    keyMaterial: CryptoKey,
    salt: Uint8Array<ArrayBuffer>,
  ) {
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000, // Use high iteration count
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  static async generatePrivateKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  static generateSalt(length = 32) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
}
