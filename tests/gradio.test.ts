import { describe, expect, it } from 'vitest'

import {
    findControlNetInputImages,
    parseTargetIndex,
    resolveImageUrl,
} from '../src/environments/extension/internal/gradio'

describe('Gradio 4 image values', () => {
    it('accepts legacy strings and FileData-shaped values', () => {
        expect(resolveImageUrl('data:image/png;base64,abc')).toBe(
            'data:image/png;base64,abc'
        )
        expect(
            resolveImageUrl({ url: '/file=pose.png', path: 'ignored' })
        ).toBe('/file=pose.png')
        expect(resolveImageUrl({ path: '/tmp/depth.png' })).toBe(
            '/tmp/depth.png'
        )
        expect(resolveImageUrl(null)).toBeNull()
    })
})

describe('Forge ControlNet unit selection', () => {
    it('rejects disabled, fractional, negative, and out-of-range targets', () => {
        expect(parseTargetIndex('-', 3)).toBeNull()
        expect(parseTargetIndex('', 3)).toBeNull()
        expect(parseTargetIndex('-1', 3)).toBeNull()
        expect(parseTargetIndex('1.5', 3)).toBeNull()
        expect(parseTargetIndex('3', 3)).toBeNull()
        expect(parseTargetIndex('2', 3)).toBe(2)
    })

    it('selects only the input image of each unit', () => {
        const root = document.createElement('div')
        root.innerHTML = `
            <div class="tabitem">
                <div class="cnet-input-image-group"><div class="cnet-image" data-testid="image" id="input-0"></div></div>
                <div data-testid="image" id="preview-0"></div>
            </div>
            <div class="tabitem">
                <div class="cnet-input-image-group"><div class="cnet-image" data-testid="image" id="input-1"></div></div>
                <div data-testid="image" id="preview-1"></div>
            </div>`

        expect(
            findControlNetInputImages(root).map((element) => element.id)
        ).toEqual(['input-0', 'input-1'])
    })
})
