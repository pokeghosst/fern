import { decompress } from 'lzma1'
import { createEncryptedPaste, decryptPaste } from './services/paste.service'

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

pasteForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const passcode = prompt('Enter a passcode to derive the key from')

    if (!passcode) {
        alert('Passcode is required!')
        return
    }

    const formData = new FormData(pasteForm)
    const paste = formData.get('paste')

    if (!paste) return

    try {
        const encodedString = await createEncryptedPaste(
            paste.toString(),
            passcode
        )

        const params = new URLSearchParams(window.location.search)
        params.set('paste', encodedString)

        window.location.search = params.toString()
    } catch (error) {
        alert('Encryption failed. Please try again.')
        console.error('Encryption error:', error)
    }
})

decryptButton.addEventListener('click', async () => {
    const passcode = prompt('Enter a passcode to derive the key from')

    if (!passcode) {
        alert('Passcode is required!')
        return
    }

    try {
        const encodedString = pasteContainer.innerText

        const plaintext = await decryptPaste(encodedString, passcode)
        pasteContainer.innerText = decompress(plaintext) as string
    } catch (error) {
        alert('Could not decrypt. Please, check your password and try again.')
        console.error('Decryption error', error)
    }
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
