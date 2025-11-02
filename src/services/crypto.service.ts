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

if (import.meta.vitest) {
    const { describe, it, expect } = import.meta.vitest
    const { textToBytes, bytesToText } = await import('../util/text')

    const AES_GCM_TAG_SIZE = 16
    const ENC_METADATA_SIZE = SALT_SIZE + IV_SIZE + AES_GCM_TAG_SIZE

    const passcode = 'foobar'
    const originalText = 'Foo bar baz'
    const plaintext = textToBytes(originalText)

    describe('encrypt', () => {
        it('should encrypt plaintext and return Uint8Array with correct structure', async () => {
            const encrypted = await encrypt(plaintext, passcode)

            expect(encrypted).toBeInstanceOf(Uint8Array)
            expect(encrypted.length).toBe(plaintext.length + ENC_METADATA_SIZE) // salt + iv + ciphertext + auth tag
        })

        it('should produce different ciphertext with random IV and salt', async () => {
            const encrypted1 = await encrypt(plaintext, passcode)
            const encrypted2 = await encrypt(plaintext, passcode)

            expect(encrypted1).not.toEqual(encrypted2)
        })

        it('should encrypt empty plaintext', async () => {
            const plaintext = new Uint8Array(0)

            const encrypted = await encrypt(plaintext, passcode)

            expect(encrypted).toBeInstanceOf(Uint8Array)
            expect(encrypted.length).toBe(ENC_METADATA_SIZE)
        })

        it('should encrypt unicode in plaintext', async () => {
            const plaintext = textToBytes('Hello 世界 🌍 émoji')

            const encrypted = await encrypt(plaintext, passcode)

            expect(encrypted).toBeInstanceOf(Uint8Array)
            expect(encrypted.length).toBe(plaintext.length + ENC_METADATA_SIZE)
        })

        it('should allow non-alphanumeric passcodes', async () => {
            const passcodes = [
                'a',
                'a-very-long-passcode-with-many-characters-123456789',
                '密碼',
                'p@ssw0rd!#$%',
                '   spaces   ',
            ]

            for (const passcode of passcodes) {
                const encrypted = await encrypt(plaintext, passcode)
                expect(encrypted).toBeInstanceOf(Uint8Array)
                expect(encrypted.length).toBe(
                    plaintext.length + ENC_METADATA_SIZE
                )
            }
        })
    })

    describe('decrypt', () => {
        it('should decrypt data encrypted with the same passcode', async () => {
            const encrypted = await encrypt(plaintext, passcode)
            const decrypted = await decrypt(encrypted, passcode)

            expect(decrypted).toEqual(plaintext)
            expect(bytesToText(decrypted)).toBe(originalText)
        })

        it('should throw error when decrypting with wrong passcode', async () => {
            const wrongPasscode = 'wrong-password'

            const encrypted = await encrypt(plaintext, passcode)

            await expect(decrypt(encrypted, wrongPasscode)).rejects.toThrow()
        })

        it('should fail on corrupted ciphertext', async () => {
            const encrypted = await encrypt(plaintext, passcode)

            const corrupted = new Uint8Array(encrypted)
            corrupted[SALT_SIZE + IV_SIZE + 5] ^= 0xff

            await expect(decrypt(corrupted, passcode)).rejects.toThrow()
        })

        it('should decrypt empty plaintext', async () => {
            const plaintext = new Uint8Array(0)

            const encrypted = await encrypt(plaintext, passcode)
            const decrypted = await decrypt(encrypted, passcode)

            expect(decrypted).toEqual(plaintext)
            expect(decrypted.length).toBe(0)
        })
    })

    describe('encrypt/decrypt', () => {
        it('should preserve text data', async () => {
            const testCases = [
                'foo bar baz',
                '你好 🌏 café',
                '!@#$%^&*()[]{}',
                '',
                "I'm baby four loko kogi subway tile meh quinoa. Mumblecore cray pabst. Drinking vinegar yr taxidermy salvia, vegan semiotics deep v shabby chic squid. Cupping swag hoodie sriracha literally fam readymade JOMO.",
            ]

            for (const testCase of testCases) {
                const plaintext = textToBytes(testCase)
                const encrypted = await encrypt(plaintext, passcode)
                const decrypted = await decrypt(encrypted, passcode)

                expect(bytesToText(decrypted)).toBe(testCase)
            }
        })

        it('should handle passcode reuse correctly', async () => {
            const encrypted1 = await encrypt(plaintext, passcode)
            const encrypted2 = await encrypt(plaintext, passcode)

            expect(encrypted1).not.toEqual(encrypted2)

            const decrypted1 = await decrypt(encrypted1, passcode)
            const decrypted2 = await decrypt(encrypted2, passcode)

            expect(decrypted1).toEqual(plaintext)
            expect(decrypted2).toEqual(plaintext)
        })

        it('should produce different ciphertext for different passcodes', async () => {
            const passcode1 = 'password-one'
            const passcode2 = 'password-two'

            const encrypted1 = await encrypt(plaintext, passcode1)
            const encrypted2 = await encrypt(plaintext, passcode2)

            expect(encrypted1).not.toEqual(encrypted2)
        })
    })
}
