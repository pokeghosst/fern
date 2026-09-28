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

// type CompressionMode = 5 | 2 | 1 | 3 | 4 | 6 | 7 | 8 | 9;

export function compressString(
  //   _data: string,
  //   _mode: CompressionMode = 5,
): Uint8Array {
  const compressedData = new Int8Array();
  return new Uint8Array(compressedData);
}

export function decompressString(
  // _data: Uint8Array | ArrayBuffer
): string {
  //   return new LZMA().decompressString(data);
  return "dummy";
}
