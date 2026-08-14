# 3D Openpose Editor (sd-webui-3d-open-pose-editor) [[中文版](README-zh.md)] [[日本語版](README-ja.md)]

An extension of [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) to use [Online 3D Openpose Editor](https://github.com/ZhUyU1997/open-pose-editor).

## Forge Classic 2.28.1 fork

I liked this editor, but its ControlNet transfer no longer worked correctly in
sd-webui-forge-classic 2.28.1. I migrated it with a little help from AI and am
sharing the result in the hope that it will be useful to other people in the
community.

This branch uses Forge's current ControlNet unit setting and Gradio 4 image
format, targets the actual input field of each ControlNet unit, bundles a
Windows-safe frontend build, and validates messages exchanged with the editor
iframe. MediaPipe assets are downloaded locally during installation so the
offline editor does not silently depend on a CDN.

Generate, Skip, and Interrupt remain entirely owned by Forge. This extension
does not create replacement generation buttons or modify Forge's generation
state; it only sends the rendered maps to the selected ControlNet inputs.

The editor can create pose, depth, normal, and canny maps with a Krea 2
checkpoint, but using a map during sampling still requires a control model that
is compatible with that checkpoint. In particular, a generic SD 1.5/SDXL
OpenPose ControlNet does not become Krea 2 compatible merely by using this
editor.

# Preview

![Preview](https://user-images.githubusercontent.com/42905588/227674599-21610711-7276-413c-aa36-cc5108e74dc3.png)

# Installation

1. Open the "Extension" tab of the WebUI
2. Open the "Available" tab
3. If your WebUI is out of date, change the "Extension index URL" to `https://raw.githubusercontent.com/AUTOMATIC1111/stable-diffusion-webui-extensions/master/index.json`
4. Click the "Load from:" button
5. Click the "Install" button of 3D Openpose Editor
6. Open the "Installed" tab and click the "Apply and restart UI" button

# Feature

- **Pose Editing**: Edit the pose of the 3D model by selecting a joint and rotating it with the mouse. 

- **Hand Editing**: Fine-tune the position of the hands by selecting the hand bones and adjusting them with the colored circles. 

- **Depth/Normal/Canny Maps**: Generate and visualize depth, normal, and canny maps to enhance your AI drawing. 

- **Save/Load/Restore Scene**: Save your progress and restore it later by using the built-in save and load functionality. 

- **Adjust Body Parameters**: Adjust various body parameters such as height, weight, and limb lengths to create a custom 3D model.
# Usage
### Scene Navigation:
- **Rotate Scene**: Click and hold the blank space, then move the mouse while holding down the left mouse button.
- **Move Scene**: Click and hold the blank space, then move the mouse while holding down the right mouse button.

### Body Manipulation:
- **Rotate Body**: Click on any joint to select it, then hold down one of the colored circles and move the mouse to rotate the selected joint.
- **Hand Editing**: Click on the red dot to select the hand bones, then rotate them by holding down one of the red circles and moving the mouse.
### Adjust Body Parameters:
- **Select Body**: Click on the body to select it.
- **Open Body Parameters**: Click on "Body Parameters" in the menu to adjust the body's parameters.
### Adjust Output Resolution:
- **Adjust Output Resolution in Menu**: Change the "Width" or "Height" in the menu to control the output resolution.
### Other Functions:
- **Switch to Move Mode**: Press the X key to switch to move mode, allowing you to move the entire body.
- **Delete Body**: Press the D key to delete the entire body.

# Credits

* [ZhUyU1997 - Online 3D Openpose Editor](https://github.com/ZhUyU1997/open-pose-editor): Original version
