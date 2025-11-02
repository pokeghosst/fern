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

import { compressString, decompressString } from 'lzma1'
import { decodeFromBase64, encodeToBase64 } from '../util/base64'
import { decrypt, encrypt } from './crypto.service'
import {
    clearSearchParams,
    setPasteToSearchParams,
} from './searchparams.service'

export async function createAndSharePaste(
    content: string,
    passcode: string
): Promise<void> {
    const compressedBytes = new Uint8Array(compressString(content))
    const encryptedBytesArray = new Uint8Array(
        await encrypt(compressedBytes, passcode)
    )
    const ciphertext = encodeToBase64(encryptedBytesArray)

    setPasteToSearchParams(ciphertext)
}

export async function decryptPaste(
    encodedPaste: string,
    passcode: string
): Promise<string> {
    const decodedBytes = decodeFromBase64(encodedPaste)
    const plaintext = await decrypt(decodedBytes, passcode)
    return decompressString(plaintext) as string
}

export function clearPasteFromUrl(): void {
    clearSearchParams()
}
