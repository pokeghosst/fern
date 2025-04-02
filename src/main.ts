import { compress, decompress } from 'lzma1'

import { decodeFromBase64, encodeToBase64 } from './base64'
import { decrypt, encrypt } from './crypto'

import './style.css'

const params = new URLSearchParams(window.location.search)
const pasteForm = document.getElementById('pasteForm') as HTMLFormElement
const pasteContainer = document.getElementById(
    'pasteContainer'
) as HTMLDivElement
const pasteFormContainer = document.getElementById(
    'pasteFormContainer'
) as HTMLDivElement
const pasteActionsContainer = document.getElementById(
    'pasteActions'
) as HTMLDivElement
const decryptButton = document.getElementById(
    'decryptButton'
) as HTMLButtonElement
const clearPasteButton = document.getElementById(
    'clearButton'
) as HTMLButtonElement

const pasteContents = params.get('paste')

if (pasteContents) {
    pasteFormContainer.style.display = 'none'
    pasteContainer.style.display = 'block'
    pasteActionsContainer.style.display = 'flex'

    pasteContainer.innerText = pasteContents
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

decryptButton.addEventListener('click', () => {
    const passcode = prompt('Enter a passcode to derive the key from')

    if (!passcode) {
        alert('Passcode is required!')
        return
    }

    const encodedString = pasteContainer.innerText
    const decodedBytes = decodeFromBase64(encodedString)

    decrypt(decodedBytes, passcode).then((plaintext) => {
        pasteContainer.innerText = decompress(plaintext) as string
    })
})

clearPasteButton.addEventListener('click', () => {
    pasteFormContainer.style.display = 'block'
    pasteContainer.style.display = 'none'
    pasteActionsContainer.style.display = 'none'

    pasteContainer.innerText = ''

    const params = new URLSearchParams(window.location.search)
    params.delete('paste')
    window.location.search = params.toString()
})
