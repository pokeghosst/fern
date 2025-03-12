import LZMA from 'lzma-web'
import { decodeFromBase64, encodeToBase64 } from './base64'

import './style.css'

const lzma = new LZMA()

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

    const pasteParagraph = document.createElement('p')
    const decodedBytes = decodeFromBase64(pasteContents)
    const decompressedString = await lzma.decompress(decodedBytes)

    if (typeof decompressedString !== 'string') {
        alert('Result is not a string. Is the paste a valid UTF-8 text?')
    } else {
        pasteParagraph.textContent = decompressedString
        pasteContainer.appendChild(pasteParagraph)
    }
}

pasteForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(pasteForm)
    const paste = formData.get('paste')

    if (!paste) return

    const compressedBytes = await lzma.compress(paste.toString())
    // APPARENTLY the result of `compress` is not `Uint8Array` since it has negative values.
    // That's why we need to convert it to actual `Uint8Array`
    const encodedPaste = encodeToBase64(new Uint8Array(compressedBytes))

    const params = new URLSearchParams(window.location.search)
    params.set('paste', encodedPaste)

    window.location.search = params.toString()
})
