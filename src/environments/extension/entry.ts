import { getCurrentTime } from '../../utils/time'
import { download } from '../../utils/transfer'
import {
    findControlNetInputImages,
    ImageValue,
    openGradioAccordion,
    parseTargetIndex,
    resolveImageUrl,
    switchGradioTab,
    updateGradioImage,
    waitForElementToBeInDocument,
} from './internal/gradio'
import {
    AddMessageEventListener,
    InitMessageListener,
    InvokeCommand,
} from './internal/message'

const isTabActive = () => {
    const tab = gradioApp().querySelector<HTMLElement>('#tab_threedopenpose')
    return tab && tab.style.display != 'none'
}

let isInitialized = false
let isPaused = false

onUiLoaded(async () => {
    console.log('sd-webui-3d-open-pose-editor: onUiLoaded')

    const sendToControlNet = async (
        container: Element,
        poseImage: ImageValue,
        poseTarget: string,
        depthImage: ImageValue,
        depthTarget: string,
        normalImage: ImageValue,
        normalTarget: string,
        cannyImage: ImageValue,
        cannyTarget: string
    ) => {
        let element: Element | null | undefined =
            container.querySelector('#controlnet')
        if (!element) {
            for (const spans of container.querySelectorAll<HTMLSpanElement>(
                '.cursor-pointer > span'
            )) {
                if (!spans.textContent?.includes('ControlNet')) {
                    continue
                }
                if (spans.textContent?.includes('M2M')) {
                    continue
                }
                element = spans.parentElement?.parentElement
            }
            if (!element) {
                console.error('ControlNet element not found')
                return
            }
        } else {
            openGradioAccordion(element)
        }
        await waitForElementToBeInDocument(
            element,
            '.cnet-input-image-group .cnet-image[data-testid="image"]'
        )
        const imageElems = findControlNetInputImages(element)
        const tabsElem = element.querySelector('.tab-nav')
        const sendImage = async (
            image: Parameters<typeof updateGradioImage>[1],
            target: string,
            name: string
        ) => {
            if (!resolveImageUrl(image)) {
                return
            }
            const tabIndex = parseTargetIndex(target, imageElems.length)
            if (tabIndex === null) {
                if (target !== '' && target !== '-') {
                    throw new Error(`Invalid ControlNet target: ${target}`)
                }
                return
            }
            if (tabsElem) {
                switchGradioTab(tabsElem, tabIndex)
            }
            await updateGradioImage(imageElems[tabIndex], image, `${name}.png`)
        }
        await sendImage(poseImage, poseTarget, 'pose')
        await sendImage(depthImage, depthTarget, 'depth')
        await sendImage(normalImage, normalTarget, 'normal')
        await sendImage(cannyImage, cannyTarget, 'canny')
    }

    window.openpose3d = {
        sendTxt2img: async (
            poseImage: ImageValue,
            poseTarget: string,
            depthImage: ImageValue,
            depthTarget: string,
            normalImage: ImageValue,
            normalTarget: string,
            cannyImage: ImageValue,
            cannyTarget: string
        ) => {
            const container = gradioApp().querySelector(
                '#txt2img_script_container'
            )!
            switch_to_txt2img()
            await sendToControlNet(
                container,
                poseImage,
                poseTarget,
                depthImage,
                depthTarget,
                normalImage,
                normalTarget,
                cannyImage,
                cannyTarget
            )
        },
        sendImg2img: async (
            poseImage: ImageValue,
            poseTarget: string,
            depthImage: ImageValue,
            depthTarget: string,
            normalImage: ImageValue,
            normalTarget: string,
            cannyImage: ImageValue,
            cannyTarget: string
        ) => {
            const container = gradioApp().querySelector(
                '#img2img_script_container'
            )!
            switch_to_img2img()
            await sendToControlNet(
                container,
                poseImage,
                poseTarget,
                depthImage,
                depthTarget,
                normalImage,
                normalTarget,
                cannyImage,
                cannyTarget
            )
        },
        downloadImage: (image: ImageValue, name: string) => {
            const url = resolveImageUrl(image)
            if (!url) {
                return
            }
            const fileName = name + '_' + getCurrentTime() + '.png'
            download(url, fileName)
        },
    }

    InitMessageListener()
    AddMessageEventListener({
        MakeImages: async (args: Record<string, string>) => {
            const allowedImages = new Set(['pose', 'depth', 'normal', 'canny'])
            for (const [name, url] of Object.entries(args)) {
                if (!allowedImages.has(name) || typeof url !== 'string') {
                    continue
                }
                const element = gradioApp().querySelector(
                    `#openpose3d_${name}_image`
                )
                if (!element) {
                    throw new Error(`Output image field not found: ${name}`)
                }
                await updateGradioImage(element, url, name + '.png')
            }
            const tabs = gradioApp().querySelector('#openpose3d_main')!
            switchGradioTab(tabs, 1)
        },
    })

    for (let i = 0; i < 30; ++i) {
        try {
            await InvokeCommand('GetAppVersion')
            isInitialized = true
            break
        } catch (error: any) {
            if (error.status != 'Timeout') {
                throw error
            }
        }
    }
    if (!isInitialized) {
        console.error('sd-webui-3d-open-pose-editor: Timeout')
        return
    }

    // await InvokeCommand('OutputWidth', 512)
    // await InvokeCommand('OutputHeight', 512)
    if (!isTabActive()) {
        isPaused = true
        await InvokeCommand('Pause')
    }
})

onUiUpdate(async () => {
    if (!isInitialized) {
        return
    }
    if (isTabActive()) {
        if (isPaused) {
            isPaused = false
            await InvokeCommand('Resume')
        }
    } else {
        if (!isPaused) {
            isPaused = true
            await InvokeCommand('Pause')
        }
    }
})
