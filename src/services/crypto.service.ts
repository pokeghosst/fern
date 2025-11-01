/*
fern -- Frugal Ethereal encRypted pastebiN in a single HTML file
Copyright (C) 2025 pokeghost.

fern is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

fern is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const SALT_SIZE = 16
const IV_SIZE = 12
const PBKDF2_ITERATIONS = 100000
const KEY_SIZE = 256

export async function encrypt(
    plaintext: Uint8Array<ArrayBuffer>,
    passcode: string
) {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE))
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE))
    const key = await deriveKey(passcode, salt, 'encrypt')

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
    )

    return new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)])
}

export async function decrypt(encryptedBytes: Uint8Array, passcode: string) {
    const salt = encryptedBytes.slice(0, SALT_SIZE)
    const iv = encryptedBytes.slice(SALT_SIZE, SALT_SIZE + IV_SIZE)
    const ciphertext = encryptedBytes.slice(SALT_SIZE + IV_SIZE)

    const key = await deriveKey(passcode, salt, 'decrypt')

    const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    )

    return new Uint8Array(plaintext)
}

async function deriveKey(
    passcode: string,
    salt: Uint8Array<ArrayBuffer>,
    keyUsage: Extract<KeyUsage, 'encrypt' | 'decrypt'>
) {
    const keyMaterial = await getKeyMaterial(passcode)

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
        [keyUsage]
    )

    return key
}

async function getKeyMaterial(passcode: string): Promise<CryptoKey> {
    const enc = new TextEncoder()
    return await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passcode),
        'PBKDF2',
        false,
        ['deriveKey']
    )
}
