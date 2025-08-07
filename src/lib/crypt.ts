export class CryptoManager {
  private key: CryptoKey | null = null

  async generateKey() {
    this.key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 128,
      },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  async exportKey() {
    if (!this.key) {
      return null
    }
    return (await window.crypto.subtle.exportKey('jwk', this.key)).k
  }

  async importKey(objectKey: string) {
    this.key = await window.crypto.subtle.importKey(
      'jwk',
      {
        k: objectKey,
        alg: 'A128GCM',
        ext: true,
        key_ops: ['encrypt', 'decrypt'],
        kty: 'oct',
      },
      { name: 'AES-GCM', length: 128 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  async encrypt(data: string) {
    if (!this.key) {
      throw new Error('Key not initialized')
    }
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      this.key,
      str2ab(data),
    )
    return ab2str(encrypted)
  }

  async decrypt(encrypted: string) {
    if (!this.key) {
      throw new Error('Key not initialized')
    }
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      this.key,
      str2ab(encrypted),
    )
    return ab2str(decrypted)
  }
}

export function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode(...new Uint8Array(buf))
}

export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export function Uint8Array2str(arr: Uint8Array) {
  return String.fromCharCode(...arr)
}

export function str2Uint8Array(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return bufView
}
