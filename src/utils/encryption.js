import CryptoJS from 'crypto-js'

const KEY = import.meta.env.VITE_ENCRYPTION_KEY

if (!KEY || KEY.trim() === '') {
  console.warn(
    '[MeeStay] VITE_ENCRYPTION_KEY is not set. Encryption features will not work. ' +
    'Add it to your .env file: VITE_ENCRYPTION_KEY=your-32-char-secret'
  )
}

/**
 * Encrypts a plaintext string using AES-256-CBC (crypto-js default).
 * The AES key is read from VITE_ENCRYPTION_KEY.
 *
 * @param {string} plaintext - The value to encrypt (e.g. mobile number, Aadhaar)
 * @returns {string} Base64-encoded ciphertext
 */
export function encryptField(plaintext) {
  if (plaintext === null || plaintext === undefined) return plaintext
  return CryptoJS.AES.encrypt(String(plaintext), KEY).toString()
}

/**
 * Decrypts a Base64-encoded AES ciphertext back to plaintext.
 * Use this when displaying encrypted values (e.g. mobile, Aadhaar) from the API.
 *
 * @param {string} ciphertext - Base64-encoded AES ciphertext
 * @returns {string} Decrypted plaintext
 */
export function decryptField(ciphertext) {
  if (ciphertext === null || ciphertext === undefined) return ciphertext
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (err) {
    console.error('[MeeStay] decryptField failed:', err)
    return ciphertext // return as-is if decryption fails (e.g. already plaintext)
  }
}
