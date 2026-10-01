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

export async function compressString(data: string): Promise<Uint8Array> {
  return new Uint8Array(
    await pipe(new Blob([data]), new CompressionStream("gzip")),
  );
}

export async function decompressString(data: Uint8Array): Promise<string> {
  return new TextDecoder().decode(
    await pipe(
      new Blob([new Uint8Array(data)]),
      new DecompressionStream("gzip"),
    ),
  );
}

async function pipe(
  input: Blob,
  stream: CompressionStream | DecompressionStream,
): Promise<ArrayBuffer> {
  return new Response(input.stream().pipeThrough(stream)).arrayBuffer();
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const dummyString = "foo bar baz";
  const dummyStringCompressed = new Uint8Array([
    31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 75, 203, 207, 87, 72, 74, 44, 82, 72, 74,
    172, 2, 0, 97, 222, 98, 242, 11, 0, 0, 0,
  ]);
  const gzipSignature = new Uint8Array([Number(0x1f), Number(0x8b)]); // https://www.rfc-editor.org/info/rfc1952/

  describe("compress", () => {
    it.each([
      ["empty line", ""],
      ["ascii", "foo bar baz"],
      ["unicode", "Hello 世界 🌍 émoji e\u0301"],
      ["nulls and newlines", "a\0b\r\nc"],
      ["large text", "I'm baby ".repeat(200_000)],
    ])("should compress %s correctly", async (_, input) => {
      expect(await decompressString(await compressString(input))).toEqual(
        input,
      );
    });
  });

  it("should match gzip signature", async () => {
    expect(dummyStringCompressed.slice(0, 2)).toEqual(gzipSignature);
  });

  it("should make input smaller", async () => {
    const input = "I'm baby ".repeat(10_000);
    expect((await compressString(input)).length).toBeLessThan(
      new TextEncoder().encode(input).length,
    );
  });

  describe("decompress", () => {
    it("should decompress correctly", async () => {
      expect(await decompressString(dummyStringCompressed)).toEqual(
        dummyString,
      );
    });
  });

  it("should throw on non gzip-compressed data", async () => {
    await expect(decompressString(new Uint8Array([1, 2, 3]))).rejects.toThrow();
  });

  it.each([dummyStringCompressed.slice(0, -5), new Uint8Array([])])(
    "should throw on incorrect data",
    async (input) => {
      await expect(decompressString(input)).rejects.toThrow();
    },
  );
}
