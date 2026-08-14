interface Window {
    openpose3d?: {
        sendTxt2img: (
            pose_image: import('../internal/gradio').ImageValue,
            pose_target: string,
            depth_image: import('../internal/gradio').ImageValue,
            depth_target: string,
            normal_image: import('../internal/gradio').ImageValue,
            normal_target: string,
            canny_image: import('../internal/gradio').ImageValue,
            canny_target: string
        ) => void
        sendImg2img: (
            pose_image: import('../internal/gradio').ImageValue,
            pose_target: string,
            depth_image: import('../internal/gradio').ImageValue,
            depth_target: string,
            normal_image: import('../internal/gradio').ImageValue,
            normal_target: string,
            canny_image: import('../internal/gradio').ImageValue,
            canny_target: string
        ) => void
        downloadImage: (
            image: import('../internal/gradio').ImageValue,
            name: string
        ) => void
    }
}
