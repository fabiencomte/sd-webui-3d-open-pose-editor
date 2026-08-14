import { describe, expect, it } from 'vitest'

import {
    getIframeOrigin,
    isTrustedEditorMessage,
} from '../src/environments/extension/internal/message'

describe('iframe message boundary', () => {
    const iframe = document.createElement('iframe')
    iframe.src = '/file=editor/pages/index.html'
    document.body.appendChild(iframe)

    const message = {
        cmd: 'openpose-3d',
        method: 'MakeImages',
        type: 'event' as const,
        payload: {},
    }

    it('derives an exact target origin instead of using a wildcard', () => {
        expect(getIframeOrigin(iframe)).toBe('http://127.0.0.1:7860')
    })

    it('accepts only messages from the configured iframe and origin', () => {
        const trusted = new MessageEvent('message', {
            data: message,
            origin: getIframeOrigin(iframe),
            source: iframe.contentWindow,
        })
        expect(isTrustedEditorMessage(trusted, iframe)).toBe(true)

        const wrongOrigin = new MessageEvent('message', {
            data: message,
            origin: 'https://attacker.invalid',
            source: iframe.contentWindow,
        })
        expect(isTrustedEditorMessage(wrongOrigin, iframe)).toBe(false)

        const wrongCommand = new MessageEvent('message', {
            data: { ...message, cmd: 'other-extension' },
            origin: getIframeOrigin(iframe),
            source: iframe.contentWindow,
        })
        expect(isTrustedEditorMessage(wrongCommand, iframe)).toBe(false)
    })
})
