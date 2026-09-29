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

import {
  compressString as lzmaCompressString,
  decompressString as lzmaDecompressString,
} from "lzma1";

type CompressionMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export async function compressString(
  data: string,
  mode?: CompressionMode,
): Promise<Uint8Array> {
  console.log(__USE_LZMA__);
  if (__USE_LZMA__) {
    return lzmaCompressString(data, mode);
  } else {
    return new Uint8Array(
      await pipe(new Blob([data]), new CompressionStream("gzip")),
    );
  }
}

export async function decompressString(data: Uint8Array): Promise<string> {
  if (__USE_LZMA__) {
    return lzmaDecompressString(data);
  } else {
    return new TextDecoder().decode(
      await pipe(
        new Blob([new Uint8Array(data)]),
        new DecompressionStream("gzip"),
      ),
    );
  }
}

async function pipe(
  input: Blob,
  stream: CompressionStream | DecompressionStream,
) {
  return new Response(input.stream().pipeThrough(stream)).arrayBuffer();
}
