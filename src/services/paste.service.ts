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

import { compress, decompress } from 'lzma1'
import { decodeFromBase64, encodeToBase64 } from '../util/base64'
import { decrypt, encrypt } from './crypto.service'

export async function createEncryptedPaste(content: string, passcode: string) {
    const compressedBytes = new Uint8Array(compress(content))
    const encryptedBytes = await encrypt(compressedBytes, passcode)
    const encryptedBytesArray = new Uint8Array(encryptedBytes)

    return encodeToBase64(encryptedBytesArray)
}

export async function decryptPaste(encodedPaste: string, passcode: string) {
    const decodedBytes = decodeFromBase64(encodedPaste)
    const plaintext = await decrypt(decodedBytes, passcode)
    return decompress(plaintext) as string
}
