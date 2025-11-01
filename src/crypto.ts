const SALT_SIZE = 16
const IV_SIZE = 12
const PBKDF2_ITERATIONS = 100000
const KEY_SIZE = 256

export async function getKeyMaterial(passcode: string): Promise<CryptoKey> {
    const enc = new TextEncoder()
    return await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passcode),
        'PBKDF2',
        false,
        ['deriveKey']
    )
}

export async function encrypt(plaintext: Uint8Array, passcode: string) {
    const keyMaterial = await getKeyMaterial(passcode)
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE))
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE))

    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_SIZE },
        true,
        ['encrypt']
    )

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
    )

    return new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)])
}

export async function decrypt(encryptedBytes: Uint8Array, passcode: string) {
    const keyMaterial = await getKeyMaterial(passcode)
    const salt = encryptedBytes.slice(0, SALT_SIZE)
    const iv = encryptedBytes.slice(SALT_SIZE, SALT_SIZE + IV_SIZE)
    const ciphertext = encryptedBytes.slice(SALT_SIZE + IV_SIZE)

    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_SIZE },
        true,
        ['decrypt']
    )

    const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    )

    return new Uint8Array(plaintext)
}
