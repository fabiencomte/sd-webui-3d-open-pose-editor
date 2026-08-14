import { IPostMessage as IPostMessageBase } from '../../../hooks/useMessageDispatch'

export type IPostMessage = IPostMessageBase & {
    cmd: string
}

const poseMessage = (message: IPostMessage) => {
    const iframe =
        gradioApp().querySelector<HTMLIFrameElement>('#openpose3d_iframe')!
    if (!iframe?.contentWindow) {
        throw new Error('3D Openpose iframe is not ready')
    }
    iframe.contentWindow.postMessage(message, getIframeOrigin(iframe))
}

const MessageReturnHandler: Record<string, (arg: any) => void> = {}
const MessageEventHandler: Record<string, (arg: any) => void> = {}

export const InitMessageListener = () => {
    window.addEventListener('message', (event: MessageEvent<IPostMessage>) => {
        const iframe =
            gradioApp().querySelector<HTMLIFrameElement>('#openpose3d_iframe')
        if (!iframe || !isTrustedEditorMessage(event, iframe)) {
            return
        }
        const { data } = event
        if (data && data.cmd && data.cmd == 'openpose-3d' && data.method) {
            const method = data.method
            console.log('Method', method, event)
            if (data.type == 'return') {
                MessageReturnHandler[method]?.(data.payload)
                delete MessageReturnHandler[method]
            } else if (data.type == 'event') {
                console.log(MessageEventHandler)
                MessageEventHandler[method]?.(data.payload)
            }
        }
    })
}

export const getIframeOrigin = (iframe: HTMLIFrameElement): string =>
    new URL(iframe.src, window.location.href).origin

export const isTrustedEditorMessage = (
    event: MessageEvent<IPostMessage>,
    iframe: HTMLIFrameElement
): boolean => {
    const data = event.data
    return (
        event.source === iframe.contentWindow &&
        event.origin === getIframeOrigin(iframe) &&
        !!data &&
        data.cmd === 'openpose-3d' &&
        typeof data.method === 'string' &&
        (data.type === 'return' || data.type === 'event')
    )
}

export const AddMessageEventListener = (
    listeners: Record<string, (arg: any) => void>
) => {
    Object.assign(MessageEventHandler, listeners)
}

export function InvokeCommand(method: string, ...args: any[]) {
    return new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            delete MessageReturnHandler[method]

            reject({
                method,
                status: 'Timeout',
            })
        }, 1000)

        const onReutrn = (arg: any) => {
            clearTimeout(id)
            delete MessageReturnHandler[method]
            resolve(arg)
        }
        MessageReturnHandler[method] = onReutrn

        poseMessage({
            cmd: 'openpose-3d',
            method,
            type: 'call',
            payload: args,
        })
    })
}
