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

import {
    clearPaste,
    createAndSharePaste,
    decryptPaste,
} from '../services/paste.service'
import { PasteDisplayView } from './PasteDisplayView'
import { PasteFormView } from './PasteFormView'

export class UIController {
    #formView: PasteFormView
    #displayView: PasteDisplayView

    constructor(paste?: string | null) {
        this.#formView = new PasteFormView()
        this.#displayView = new PasteDisplayView()

        this.#registerHandlers()

        if (paste) this.#showPaste(paste)
    }

    #registerHandlers() {
        this.#formView.onSubmit(this.#encryptPaste.bind(this))
        this.#displayView.onDecrypt(this.#decryptPaste.bind(this))
        this.#displayView.onClear(this.#clearPaste.bind(this))
    }

    async #encryptPaste(e: Event) {
        e.preventDefault()

        const passcode = prompt('Enter a passcode to derive the key from')

        if (!passcode) {
            alert('Passcode is required!')
            return
        }

        const paste = this.#formView.getPasteContent()

        if (!paste) {
            alert('Nothing to encrypt!')
            return
        }

        createAndSharePaste(paste, passcode)
    }

    async #decryptPaste() {
        const passcode = prompt('Enter a passcode to derive the key from')

        if (!passcode) {
            alert('Passcode is required!')
            return
        }

        try {
            const ciphertextPaste = this.#displayView.getContent()
            const plaintextPaste = await decryptPaste(ciphertextPaste, passcode)

            this.#displayView.setContent(plaintextPaste)
        } catch (error) {
            alert(
                'Could not decrypt. Please, check your password and try again.'
            )
            console.error('Decryption error', error)
        }
    }

    #showPaste(paste: string) {
        this.#formView.hide()
        this.#displayView.show()
        this.#displayView.setContent(paste)
    }

    #clearPaste() {
        this.#displayView.hide()
        this.#displayView.clearContent()
        this.#formView.show()

        clearPaste()
    }
}
