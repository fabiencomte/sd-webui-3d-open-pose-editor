const files: Record<string, string> = {
    'models/hand.fbx': '../models/hand.fbx',
    'models/foot.fbx': '../models/foot.fbx',
    'src/poses/data.bin': '../src/poses/data.bin',
}

try {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('config')
    if (url?.startsWith('/')) {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(
                `Unable to load local asset config: ${response.status}`
            )
        }
        const config = await response.json()
        const allowedNames = new Set([
            ...Object.keys(files),
            'pose_landmark_full.tflite',
            'pose_web.binarypb',
            'pose_solution_packed_assets.data',
            'pose_solution_simd_wasm_bin.wasm',
            'pose_solution_packed_assets_loader.js',
            'pose_solution_simd_wasm_bin.js',
        ])
        for (const [name, assetUrl] of Object.entries(config?.assets ?? {})) {
            if (
                allowedNames.has(name) &&
                typeof assetUrl === 'string' &&
                assetUrl.startsWith('/file=')
            ) {
                files[name] = assetUrl
            }
        }
    }
} catch (error) {
    console.error(error)
}

export default files
