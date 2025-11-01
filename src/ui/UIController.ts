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

import { createEncryptedPaste, decryptPaste } from '../services/paste.service'
import {
    clearSearchParams,
    setPasteToSearchParams,
} from '../services/searchparams.service'

export class UIController {
    #pasteForm: HTMLFormElement
    #pasteContainer: HTMLDivElement
    #pasteFormContainer: HTMLDivElement
    #pasteActions: HTMLDivElement
    #decryptButton: HTMLButtonElement
    #clearButton: HTMLButtonElement

    constructor() {
        this.#pasteForm = this.getRequiredElement('pasteForm', HTMLFormElement)
        this.#pasteContainer = this.getRequiredElement(
            'pasteContainer',
            HTMLDivElement
        )
        this.#pasteFormContainer = this.getRequiredElement(
            'pasteFormContainer',
            HTMLDivElement
        )
        this.#pasteActions = this.getRequiredElement(
            'pasteActions',
            HTMLDivElement
        )
        this.#decryptButton = this.getRequiredElement(
            'decryptButton',
            HTMLButtonElement
        )
        this.#clearButton = this.getRequiredElement(
            'clearButton',
            HTMLButtonElement
        )

        this.init()
    }

    private init() {
        this.#registerHandlers()
    }

    #registerHandlers() {
        this.#pasteForm.addEventListener(
            'submit',
            this.#encryptPaste.bind(this)
        )
        this.#decryptButton.addEventListener(
            'click',
            this.#decryptPaste.bind(this)
        )
        this.#clearButton.addEventListener('click', this.clearPaste.bind(this))
    }

    async #encryptPaste(e: Event) {
        e.preventDefault()

        const passcode = prompt('Enter a passcode to derive the key from')

        if (!passcode) {
            alert('Passcode is required!')
            return
        }

        const paste = new FormData(this.#pasteForm).get('paste')?.toString()

        if (!paste) {
            alert('Nothing to encrypt!')
            return
        }

        const encrypted = await createEncryptedPaste(paste, passcode)

        setPasteToSearchParams(encrypted)
    }

    async #decryptPaste() {
        const passcode = prompt('Enter a passcode to derive the key from')

        if (!passcode) {
            alert('Passcode is required!')
            return
        }

        try {
            this.#pasteContainer.textContent = await decryptPaste(
                this.#pasteContainer.innerText,
                passcode
            )
        } catch (error) {
            alert(
                'Could not decrypt. Please, check your password and try again.'
            )
            console.error('Decryption error', error)
        }
    }

    showPaste(paste: string) {
        this.#pasteFormContainer.style.display = 'none'
        this.#pasteContainer.style.display = 'block'
        this.#pasteActions.style.display = 'flex'

        this.#pasteContainer.innerText = paste
    }

    clearPaste() {
        this.#pasteFormContainer.style.display = 'block'
        this.#pasteContainer.style.display = 'none'
        this.#pasteActions.style.display = 'none'

        this.#pasteContainer.innerText = ''

        clearSearchParams()
    }

    private getRequiredElement<T extends HTMLElement>(
        id: string,
        type: new () => T
    ): T {
        const element = document.getElementById(id)

        if (!element) {
            throw new Error(`Required element with id "${id}" not found in DOM`)
        }

        if (!(element instanceof type)) {
            throw new Error(
                `Element "${id}" is not of expected type ${type.name}`
            )
        }

        return element as T
    }
}
