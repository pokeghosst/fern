/*
fern -- Frugal Ethereal encRypted pastebiN in a single HTML file
Copyright (C) 2025-2026 pokeghost.

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

import { decryptPaste, encryptPaste } from "./services/paste.service";
import { initializeState, State } from "./state";
import "./style.css";
import { getElements } from "./ui/elements";
import { render } from "./ui/render";

export function mountApp(): () => void {
  const paste = new URLSearchParams(window.location.search).get("paste");
  const elements = getElements();
  let state = initializeState(paste);

  function setState(next: State): void {
    state = next;
    render(elements, state);
  }

  function handleClear(): void {
    setState({ name: "new" });

    const url = new URL(window.location.href);
    url.searchParams.delete("paste");
    window.history.replaceState(window.history.state, "", url);
  }

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const passcode = prompt("Enter a passcode to derive the key from");

    if (!passcode) {
      alert("Passcode is required!");
      return;
    }

    const plaintext = new FormData(elements.form).get("paste")?.toString();

    if (!plaintext) {
      alert("Nothing to encrypt!");
      return;
    }

    const ciphertext = await encryptPaste(plaintext, passcode);
    const params = new URLSearchParams(window.location.search);
    params.set("paste", ciphertext);
    window.location.search = params.toString();
  }

  async function handleDecrypt(): Promise<void> {
    if (state.name !== "encrypted") return;

    const passcode = prompt("Enter a passcode to derive the key from");

    if (!passcode) {
      alert("Passcode is required!");
      return;
    }

    const ciphertext = elements.pasteContainer.innerText;

    setState({ name: "decrypting", ciphertext });

    try {
      const plaintext = await decryptPaste(ciphertext, passcode);
      setState({ name: "decrypted", plaintext });
    } catch (e) {
      alert("Could not decrypt. Please, check your password and try again.");
      console.error("Decryption error", e);
    }
  }

  elements.clearButton.addEventListener("click", handleClear);
  elements.form.addEventListener("submit", handleSubmit);
  elements.decryptButton.addEventListener("click", handleDecrypt);

  render(elements, state);

  return () => {
    elements.clearButton.removeEventListener("click", handleClear);
  };
}

document.addEventListener("DOMContentLoaded", () => mountApp());
