import { compress, decompress } from 'lzma1'
import { decodeFromBase64, encodeToBase64 } from './base64'

import './style.css'

const params = new URLSearchParams(window.location.search)
const pasteForm = document.getElementById('pasteForm') as HTMLFormElement
const pasteContainer = document.getElementById(
    'pasteContainer'
) as HTMLDivElement
const pasteFormContainer = document.getElementById(
    'pasteFormContainer'
) as HTMLDivElement

const pasteContents = params.get('paste')

if (pasteContents) {
    pasteFormContainer.style.display = 'none'
    pasteContainer.style.display = 'block'

    const paragraphEl = document.createElement('p')
    // const decodedBytes = decodeFromBase64(pasteContents)

    // paragraphEl.textContent = decompress(decodedBytes) as string
    paragraphEl.textContent = pasteContents
    pasteContainer.appendChild(paragraphEl)
}

pasteForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const passcode = prompt('Enter a passcode to derive the key from')

    if (!passcode) {
        alert('Passcode is required!')
        return
    }

    const formData = new FormData(pasteForm)
    const paste = formData.get('paste')

    if (!paste) return

    const compressedBytes = new Uint8Array(compress(paste.toString()))

    encrypt(compressedBytes, passcode).then((encryptedBytes) => {
        const encryptedBytesArray = new Uint8Array(encryptedBytes)
        const encodedString = encodeToBase64(encryptedBytesArray)

        const params = new URLSearchParams(window.location.search)
        params.set('paste', encodedString)

        window.location.search = params.toString()
    })
})

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

async function encrypt(plaintext: Uint8Array, passcode: string) {
    const keyMaterial = await getKeyMaterial(passcode)
    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
    )

    return window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
}
