import {
  ab2str,
  str2ab,
  uInt8Array2ab,
} from '@time-app-test/shared/helper/binary.ts'

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
      throw new Error('Key not initialized')
    }
    const { k } = await window.crypto.subtle.exportKey('jwk', this.key)
    if (!k) {
      throw new Error('Failed to export key')
    }
    return k
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
    return new Uint8Array(encrypted)
  }

  async decrypt(encrypted: Uint8Array) {
    if (!this.key) {
      throw new Error('Key not initialized')
    }
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(12) },
      this.key,
      uInt8Array2ab(encrypted),
    )
    return ab2str(decrypted)
  }
}
