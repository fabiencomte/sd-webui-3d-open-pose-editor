const waitForElement = async (
    parent: Element,
    selector: string,
    exist: boolean
) => {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (!!parent.querySelector(selector) != exist) {
                return
            }
            observer.disconnect()
            resolve(undefined)
        })

        observer.observe(parent, {
            childList: true,
            subtree: true,
        })

        if (!!parent.querySelector(selector) == exist) {
            resolve(undefined)
        }
    })
}

const timeout = (ms: number) => {
    return new Promise(function (resolve, reject) {
        setTimeout(() => reject('Timeout'), ms)
    })
}

export const waitForElementToBeInDocument = (
    parent: Element,
    selector: string
) => Promise.race([waitForElement(parent, selector, true), timeout(10000)])
export const waitForElementToBeRemoved = (parent: Element, selector: string) =>
    Promise.race([waitForElement(parent, selector, false), timeout(10000)])

export const updateGradioImage = async (
    element: Element,
    image: ImageValue,
    name: string
) => {
    const url = resolveImageUrl(image)
    if (!url) {
        throw new Error(`No usable URL was provided for ${name}`)
    }
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Unable to fetch ${name}: HTTP ${response.status}`)
    }
    const blob = await response.blob()
    const file = new File([blob], name)
    const dt = new DataTransfer()
    dt.items.add(file)

    element
        .querySelector<HTMLButtonElement>("button[aria-label='Clear']")
        ?.click()
    await waitForElementToBeRemoved(element, "button[aria-label='Clear']")
    const input = element.querySelector<HTMLInputElement>("input[type='file']")
    if (!input) {
        throw new Error(`Image upload input not found for ${name}`)
    }
    input.value = ''
    input.files = dt.files
    input.dispatchEvent(
        new Event('change', {
            bubbles: true,
            composed: true,
        })
    )
    await waitForElementToBeInDocument(element, "button[aria-label='Clear']")
}

export const switchGradioTab = (element: Element, index: number) => {
    const button = element.querySelectorAll<HTMLButtonElement>('button')[index]
    if (!button) {
        throw new Error(`ControlNet tab ${index} does not exist`)
    }
    button.click()
}

export const openGradioAccordion = (element: Element) => {
    const labelElem = element.querySelector<HTMLElement>(':scope > .label-wrap')
    if (!labelElem) {
        return
    }
    if (labelElem.classList.contains('open')) {
        return
    }
    labelElem.click()
}

export type ImageValue =
    | string
    | null
    | undefined
    | { url?: string | null; path?: string | null }

export const resolveImageUrl = (image: ImageValue): string | null => {
    if (typeof image === 'string') {
        return image || null
    }
    if (!image || typeof image !== 'object') {
        return null
    }
    return image.url || image.path || null
}

export const parseTargetIndex = (
    target: string,
    unitCount: number
): number | null => {
    if (target === '' || target === '-') {
        return null
    }
    const index = Number(target)
    return Number.isInteger(index) && index >= 0 && index < unitCount
        ? index
        : null
}

export const findControlNetInputImages = (controlNet: Element): Element[] =>
    Array.from(controlNet.querySelectorAll('.tabitem')).map((tab) => {
        const image = tab.querySelector(
            '.cnet-input-image-group .cnet-image[data-testid="image"]'
        )
        if (!image) {
            throw new Error('A ControlNet unit has no input image')
        }
        return image
    })
