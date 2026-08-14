# 3D Openpose Editor (sd-webui-3d-open-pose-editor) [[中文版](README-zh.md)] [[日本語版](README-ja.md)]

An extension of [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) to use [Online 3D Openpose Editor](https://github.com/ZhUyU1997/open-pose-editor).

## Forge Classic 2.28.1 fork

This fork targets
[sd-webui-forge-classic 2.28.1](https://github.com/Haoming02/sd-webui-forge-classic/tree/neo)
(Forge Neo) on Python 3.13 and Gradio 4.40.0.

### Why this fork?

I thought this 3D pose editor was a really cool and useful tool, but its
ControlNet transfer no longer worked correctly on my Forge Classic 2.28.1
installation. Rather than give up on it, I migrated the integration, fixed the
problems I found along the way, and tested the result with a little help from
AI. I hope this fork saves other Forge users some time and proves useful to the
community.

The original extension was written for older WebUI, Gradio, and ControlNet UI
contracts. This branch includes concrete fixes required to:

- build the tab with Gradio 4's `js=` callback API instead of the removed
  `_js=` argument;
- read Forge's current `control_net_unit_count` setting so every configured
  ControlNet unit is available as a destination;
- accept Gradio 4 image values and target the real input image of each unit,
  rather than accidentally selecting a generated preview or mask;
- build the bundled frontend on Windows without illegal `?` characters in
  generated filenames;
- download MediaPipe files to the directory actually served by the extension,
  using timeouts, atomic replacement, and SHA-256 verification;
- restrict iframe messages to the expected editor window and origin;
- restore the 3D scene even if rendering one of the output maps fails.

Generate, Skip, and Interrupt remain entirely owned by Forge. The extension
does not reset Forge's generation state or create a second sampling lifecycle;
it only renders maps and transfers them to the selected ControlNet inputs.

### Krea 2 compatibility

The editor itself can render pose, depth, normal, and canny maps while a Krea 2
checkpoint is loaded. Applying one of those maps during sampling still requires
a control model specifically compatible with the loaded checkpoint. A generic
SD 1.5 or SDXL OpenPose ControlNet does not become compatible with Krea 2 merely
because the map came from this editor.

Compatibility with other Forge or WebUI versions is not guaranteed.

# Preview

![Preview](https://user-images.githubusercontent.com/42905588/227674599-21610711-7276-413c-aa36-cc5108e74dc3.png)

# Installation

1. Open **Extensions** and then **Install from URL** in Forge.
2. Enter this repository URL:

   ```text
   https://github.com/fabiencomte/sd-webui-3d-open-pose-editor
   ```

3. Click **Install**, then use **Apply and restart UI** from the Installed tab.

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
