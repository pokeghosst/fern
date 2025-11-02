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

export function encodeToBase64(bytes: Uint8Array<ArrayBuffer>) {
    return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
}

export function decodeFromBase64(base64: string): Uint8Array<ArrayBuffer> {
    return new Uint8Array([...atob(base64)].map((char) => char.charCodeAt(0)))
}

if (import.meta.vitest) {
    const { describe, it, expect } = import.meta.vitest
    const { textToBytes, bytesToText } = await import('./text')

    describe('encodeToBase64', () => {
        it('should encode correctly', () => {
            const encoded = encodeToBase64(textToBytes('Hello'))

            expect(encoded).toBe('SGVsbG8=')
        })

        it('should encode empty array to empty string', () => {
            const bytes = new Uint8Array([])
            const encoded = encodeToBase64(bytes)

            expect(encoded).toBe('')
        })
    })

    describe('decodeFromBase64', () => {
        it('should decode base64 correctly', () => {
            const decoded = decodeFromBase64('SGVsbG8=')

            expect(bytesToText(decoded)).toBe('Hello')
        })

        it('should decode empty string to empty array', () => {
            const decoded = decodeFromBase64('')

            expect(decoded.length).toBe(0)
        })

        it('should throw error on invalid base64', () => {
            const invalidBase64 = 'not-valid-base64!!!'

            expect(() => decodeFromBase64(invalidBase64)).toThrow()
        })

        it('should handle base64 without padding', () => {
            const decoded = decodeFromBase64('SGVsbG8')

            expect(bytesToText(decoded)).toBe('Hello')
        })
    })

    describe('encodeToBase64/decodeFromBase64', () => {
        it('should encode and decode back', () => {
            const testCases = [
                'Hello, World!',
                '你好 🌏 café',
                '!@#$%^&*()',
                '1234567890',
                ' ',
                'Line\nbreaks\nand\ttabs',
            ]

            for (const original of testCases) {
                const bytes = textToBytes(original)
                const encoded = encodeToBase64(bytes)
                const decoded = decodeFromBase64(encoded)
                const result = bytesToText(decoded)

                expect(result).toBe(original)
            }
        })
    })
}
