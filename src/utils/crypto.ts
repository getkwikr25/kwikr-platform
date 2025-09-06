// Secure password hashing utilities for Cloudflare Workers
// Uses Web Crypto API for PBKDF2 hashing

export class PasswordUtils {
  // Generate a random salt
  static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16))
  }

  // Hash password with PBKDF2
  static async hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string, salt: string }> {
    if (!salt) {
      salt = this.generateSalt()
    }

    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // 100k iterations for security
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 32 bytes
    )

    // Convert to base64 for storage
    const hashArray = new Uint8Array(derivedBits)
    const hashBase64 = btoa(String.fromCharCode(...hashArray))
    const saltBase64 = btoa(String.fromCharCode(...salt))

    return {
      hash: hashBase64,
      salt: saltBase64
    }
  }

  // Verify password against stored hash
  static async verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
    try {
      // Convert salt back to Uint8Array
      const saltArray = new Uint8Array(
        atob(storedSalt).split('').map(char => char.charCodeAt(0))
      )

      // Hash the provided password with the stored salt
      const { hash } = await this.hashPassword(password, saltArray)

      // Compare hashes
      return hash === storedHash
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  // Legacy base64 verification for existing users
  static verifyLegacyPassword(password: string, storedHash: string): boolean {
    return btoa(password) === storedHash
  }

  // Check if password hash is legacy (base64) format
  static isLegacyHash(hash: string): boolean {
    // Legacy hashes are typically shorter and contain readable characters when decoded
    try {
      const decoded = atob(hash)
      // If it decodes to readable ASCII, it's likely legacy base64
      return decoded.split('').every(char => char.charCodeAt(0) < 128)
    } catch {
      return false
    }
  }
}