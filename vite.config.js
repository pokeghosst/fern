import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import packageJson from './package.json'

export default defineConfig({
    plugins: [
        {
            name: 'html-transform',
            transformIndexHtml(html) {
                return html.replace('%PACKAGE_VERSION%', packageJson.version)
            },
        },
        viteSingleFile(),
    ],
    test: {
        includeSource: ['src/**/*.{js,ts}'],
        environment: 'happy-dom',
    },
    define: {
        'import.meta.vitest': 'undefined',
    },
})
