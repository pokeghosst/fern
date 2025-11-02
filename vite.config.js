import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import packageJson from './package.json'

export default defineConfig({
    plugins: [
        viteSingleFile(),
        {
            name: 'html-transform',
            transformIndexHtml(html) {
                return html.replace('%PACKAGE_VERSION%', packageJson.version)
            },
        },
    ],
})
