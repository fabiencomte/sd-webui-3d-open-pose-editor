import { type UserConfig, type Plugin } from 'vite'
import { type OutputOptions } from 'rollup'
import { resolve } from 'path'

export default function (): Plugin {
    return {
        name: 'extension',
        config(config, env) {
            const common: UserConfig = {
                base: './',
                resolve: {
                    alias: [
                        {
                            find: /.*\/assets(\.ts)?$/,
                            replacement: resolve(
                                __dirname,
                                'src/environments/extension/assets.ts'
                            ),
                        },
                    ],
                },
                build: {
                    target: 'ESNext',
                    rollupOptions: {
                        output: {
                            entryFileNames: '[name]-[hash].js',
                            chunkFileNames: '[name]-[hash].js',
                            assetFileNames: '[name]-[hash][extname]',
                        },
                    },
                },
            }
            switch (env.mode) {
                case 'extension-editor':
                    {
                        common.build.outDir = 'pages'
                        common.build.emptyOutDir = true
                        common.build.rollupOptions.input = {
                            index: resolve(__dirname, 'index.html'),
                        }
                    }
                    break
                case 'extension-entry':
                    {
                        common.build.outDir = 'javascript'
                        common.build.emptyOutDir = true
                        common.build.rollupOptions.input = {
                            index: resolve(
                                __dirname,
                                'src/environments/extension/entry.ts'
                            ),
                        }
                        common.publicDir = false
                        const output = common.build.rollupOptions
                            .output as OutputOptions
                        output.format = 'iife'
                        output.entryFileNames = '[name].js'
                    }

                    break
                default:
                    throw Error(`Unknown mode: ${env.mode}`)
            }
            return common
        },
    }
}
