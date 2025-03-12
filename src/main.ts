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

    const pasteParagraph = document.createElement('p')
    const decodedBytes = decodeFromBase64(pasteContents)

    pasteParagraph.textContent = decompress(decodedBytes) as string
    pasteContainer.appendChild(pasteParagraph)
}

pasteForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(pasteForm)
    const paste = formData.get('paste')

    if (!paste) return

    const compressedBytes = compress(paste.toString())
    const encodedCompressed = encodeToBase64(new Uint8Array(compressedBytes))

    const params = new URLSearchParams(window.location.search)
    params.set('paste', encodedCompressed)

    window.location.search = params.toString()
})
