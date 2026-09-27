/*
fern -- Frugal Ethereal encRypted pastebiN in a single HTML file
Copyright (C) 2026 pokeghost.

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

import { getRequiredElement } from "../util";

export function getElements() {
  return {
    form: getRequiredElement("pasteForm", HTMLFormElement),
    formContainer: getRequiredElement("pasteFormContainer", HTMLDivElement),
    pasteContainer: getRequiredElement("pasteContainer", HTMLDivElement),
    pasteActions: getRequiredElement("pasteActions", HTMLDivElement),
    decryptButton: getRequiredElement("decryptButton", HTMLButtonElement),
    clearButton: getRequiredElement("clearButton", HTMLButtonElement),
  };
}

export type Elements = ReturnType<typeof getElements>;
