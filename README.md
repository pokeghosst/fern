# fern

> Frugal Ethereal encRypted pastebiN in a single HTML file

## Features

- Two versions: using gzip (Compression Streams API, no dependencies) and LZMA compression.
- Everything in a single HTML file. Portable and easily transportable.
- AES-GCM encryption using web Crypto API (no third-party dependencies) with PBKDF2 for key derivation.
- Pastes are decrypted in-place - plaintext exists only after explicitly decrypting. Refresh or close the page and it's back to ciphertext.

_fern_ supports two "modes of operation": online and offline. "Online" mode assumes being deployed on a server and retrieving pastes from URL params. In this case you simply share the link, which contains the encrypted compressed paste and the recipient decrypts it with a passcode. "Offline" mode means using `fern.html` to create pastes and save each one as a new file that contains the paste 'baked in' and the logic for decrypting and decompressing it (and also can be used for creating new pastes).

## Development

```bash
git clone git@github.com:pokeghosst/fern.git

npm i

npm dev:gzip
# Or
npm dev:lzma
```

## Building

```bash
npm build:gzip
# Or
npm build:lzma
# Or
npm build:all
```

## Deploying

`fern.html` can be served from any web server (Nginx, Apache, etc.) or from a platform like Vercel.

## License

GNU Affero General Public License v3.0 (see [LICENSE](/LICENSE)).
