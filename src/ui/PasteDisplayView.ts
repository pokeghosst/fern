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

import { getRequiredElement } from '../util'

export class PasteDisplayView {
    #container: HTMLDivElement
    #actionsContainer: HTMLDivElement
    #decryptButton: HTMLButtonElement
    #clearButton: HTMLButtonElement

    constructor() {
        this.#container = getRequiredElement('pasteContainer', HTMLDivElement)
        this.#actionsContainer = getRequiredElement(
            'pasteActions',
            HTMLDivElement
        )
        this.#decryptButton = getRequiredElement(
            'decryptButton',
            HTMLButtonElement
        )
        this.#clearButton = getRequiredElement('clearButton', HTMLButtonElement)
    }

    show(): void {
        this.#container.style.display = 'block'
        this.#actionsContainer.style.display = 'flex'
    }

    hide(): void {
        this.#container.style.display = 'none'
        this.#actionsContainer.style.display = 'none'
    }

    setContent(content: string): void {
        this.#container.textContent = content
    }

    getContent(): string {
        return this.#container.innerText
    }

    clearContent(): void {
        this.#container.innerText = ''
    }

    onDecrypt(handler: () => void): void {
        this.#decryptButton.addEventListener('click', handler)
    }

    onClear(handler: () => void): void {
        this.#clearButton.addEventListener('click', handler)
    }
}
