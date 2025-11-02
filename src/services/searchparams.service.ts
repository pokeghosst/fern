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

export function getPasteFromSearchParams(): string | null {
    const params = new URLSearchParams(window.location.search)
    return params.get('paste')
}

export function setPasteToSearchParams(paste: string) {
    const params = new URLSearchParams(window.location.search)
    params.set('paste', paste)
    window.location.search = params.toString()
}

export function clearSearchParams() {
    const url = new URL(window.location.href)
    url.search = ''
}
