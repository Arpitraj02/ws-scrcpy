# ws-scrcpy

> **Browser-based Android screen mirror, remote control & device management.**  
> Control your Android device (and [Redroid](https://github.com/remote-android/redroid-doc) virtual devices) from any modern web browser — no plugins, no installs on the client side.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Supported Devices](#supported-devices)
  - [Android / Physical Device](#android--physical-device)
  - [Redroid Virtual Device](#redroid-virtual-device)
  - [iOS (Experimental)](#ios-experimental)
- [Controls & Keyboard Shortcuts](#controls--keyboard-shortcuts)
- [New in This Fork](#new-in-this-fork)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [License](#license)

---

## Features

### Screen Streaming
- **H264 video streaming** from device to browser over WebSocket
- Multiple decoder backends:
  - **MSE Player** — HTML5 `<video>` + Media Source Extensions (hardware acceleration possible)
  - **Broadway Player** — WebAssembly software decoder
  - **TinyH264 Player** — Improved WASM decoder with WebGL rendering
  - **WebCodecs Player** — Browser-native hardware/software codec (Chromium-based browsers)

### Remote Control
- Touch events including **multi-touch**
- Multi-touch emulation: hold <kbd>Ctrl</kbd> for symmetric touch from center; hold <kbd>Shift</kbd>+<kbd>Ctrl</kbd> to set the center at the cursor
- Mouse wheel and touchpad **horizontal/vertical scrolling**
- Full **keyboard capture and injection**
- **Text injection** via textarea
- **Clipboard sync** — copy from/to device clipboard
- Device **rotation control**

### New Features (This Fork)
- 🔊 **Volume Mute** button in toolbar
- 🔔 **Expand notifications panel** button in toolbar
- ⚙️ **Expand quick settings** button in toolbar
- 🔄 **Rotate screen** button in toolbar
- 🌙 **Wake / lock screen** quick-action buttons in toolbar
- 🔒 **Lock screen** (screen power OFF) button in toolbar
- ⛶ **Fullscreen toggle** with browser Fullscreen API support
- 📦 **APK file picker** — click a button to browse and select APK files to install (no drag-and-drop required)
- 📋 **Keyboard shortcuts reference** panel inside the More menu
- 🎨 **Improved UI** — modern card layout, smooth hover/active animations, rounded corners, backdrop blur
- 🍞 **Toast notification system** — non-intrusive success/error/info messages
- 🏷️ **Device state badge** — green/red indicator with smooth transition
- 🌗 **Dark mode** — respects `prefers-color-scheme`, fully themed
- 🏁 **Improved page title & meta** for better browser tab readability
- **Section-organized More menu** — Text Input, APK Install, Device Commands, Screen Power, Display, Keyboard Shortcuts
- Better error messages and graceful error handling throughout

### File Management
- **Drag & drop** APK file installation
- **File picker** APK installation (new)
- File push to `/data/local/tmp`
- Push progress indicator on screen

### Remote Shell
- **`adb shell`** in your browser via xterm.js
- PTY support via node-pty

### WebView / DevTools Debugging
- Debug Chrome/WebView content running on the device
- Full DevTools integration

---

## Requirements

**Browser:**
- WebSockets
- Media Source Extensions + H264 decoding *or* WebAssembly
- WebWorkers
- (Optional) WebCodecs API (Chromium 94+)

**Server:**
- Node.js v14+
- `node-gyp` and build tools ([installation guide](https://github.com/nodejs/node-gyp#installation))
- `adb` executable in `PATH`

**Device:**
- Android 5.0+ (API 21+)
- [USB debugging enabled](https://developer.android.com/studio/command-line/adb.html#Enabling)
- On some devices, an [additional option](https://github.com/Genymobile/scrcpy/issues/70#issuecomment-373286323) to allow control via keyboard/mouse may be required

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Arpitraj02/ws-scrcpy.git
cd ws-scrcpy

# Install dependencies
npm install

# Build and start (production)
npm start
```

Then open your browser at **http://localhost:8000** (or the port shown in the terminal).

For development with auto-rebuild:
```bash
npm run dist:dev
cd dist && npm start
```

---

## Configuration

Copy the example config and edit it:

```bash
cp config.example.yaml config.yaml
```

Key options in `config.yaml`:

```yaml
server:
  - port: 8000          # HTTP port
    # secure: true       # Enable HTTPS
    # certPath: ./cert.pem
    # keyPath: ./key.pem

# Optional: connect to a remote ADB host
# remoteHostList:
#   - hostname: 192.168.1.100
#     port: 5037
```

### Custom Build Flags

Edit `build.config.override.json` (or set environment variables) to toggle features:

| Flag | Default | Description |
|------|---------|-------------|
| `INCLUDE_GOOG` | `true` | Android device support |
| `INCLUDE_APPL` | `false` | iOS device support (experimental) |
| `INCLUDE_ADB_SHELL` | `true` | Remote shell terminal |
| `INCLUDE_DEV_TOOLS` | `true` | WebView/DevTools debugging |
| `INCLUDE_FILE_LISTING` | `true` | File manager |
| `USE_BROADWAY` | `true` | Broadway WASM decoder |
| `USE_H264_CONVERTER` | `true` | MSE Player (H264→MP4) |
| `USE_TINY_H264` | `true` | TinyH264 WASM decoder |
| `USE_WEBCODECS` | `true` | WebCodecs decoder |

---

## Supported Devices

### Android / Physical Device

1. Enable **USB Debugging** on the device
2. Connect via USB (or via `adb connect <ip>:<port>` for WiFi)
3. Open the web UI and click the device name

### Redroid Virtual Device

[Redroid](https://github.com/remote-android/redroid-doc) is a multi-instance, GPU-accelerated Android-in-Docker container. ws-scrcpy works seamlessly with Redroid:

1. Start a Redroid container:
   ```bash
   docker run -itd --rm --privileged \
     --name redroid \
     -v ~/data:/data \
     -p 5555:5555 \
     redroid/redroid:12.0.0-latest
   ```
2. Connect ADB to the container:
   ```bash
   adb connect localhost:5555
   ```
3. Open ws-scrcpy — the virtual device will appear in the device list automatically.

> **Tip:** Redroid supports hardware video encoding on compatible GPUs, giving best streaming performance.

### iOS (Experimental)

iOS support requires additional setup. Set `INCLUDE_APPL=true` in your build config. See [docs/Devtools.md](docs/Devtools.md) for details.

---

## Controls & Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd>+<kbd>C</kbd> | Copy device clipboard to host |
| <kbd>Ctrl</kbd>+<kbd>V</kbd> | Paste host clipboard to device |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | Paste as key events |
| <kbd>Ctrl</kbd>+<kbd>I</kbd> | Toggle keyboard capture |
| <kbd>Esc</kbd> / Back | Inject Back key |
| <kbd>Ctrl</kbd>+<kbd>H</kbd> | Inject Home key |
| <kbd>Ctrl</kbd>+<kbd>App</kbd> | Inject App-Switch (Overview) key |
| <kbd>Ctrl</kbd>+<kbd>P</kbd> | Toggle power (screen on/off) |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | Turn screen off (keep streaming) |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | Turn screen on |
| <kbd>Ctrl</kbd>+<kbd>R</kbd> | Rotate device screen |
| <kbd>Ctrl</kbd>+<kbd>N</kbd> | Expand notification panel |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd> | Expand settings panel |

**Toolbar buttons** (right sidebar while streaming):
- **More (≡)** — toggle the settings panel
- **Power** — send power key
- **Volume Up / Down** — media volume
- **Back / Home / Overview** — navigation keys
- **Mute** — volume mute
- **Notifications** — expand notification panel
- **Quick Settings** — expand quick settings
- **Rotate** — rotate device orientation
- **Wake/Lock** — send back-or-screen-on key
- **Lock** — set screen power OFF
- **Screenshot** — capture and download PNG
- **Fullscreen** — enter browser fullscreen (press Esc to exit)
- **Capture Keyboard** — toggle keyboard event capture

---

## New in This Fork

This repository ([Arpitraj02/ws-scrcpy](https://github.com/Arpitraj02/ws-scrcpy)) is a fork of the excellent [NetrisTV/ws-scrcpy](https://github.com/NetrisTV/ws-scrcpy) by [Sergey Volkov](https://github.com/NetrisTV), with the following additions and improvements:

### Added Features
1. **APK file picker** — install APK via file browser dialog (no drag-and-drop needed)
2. **Fullscreen mode** — browser fullscreen via Fullscreen API with toolbar toggle and Esc support
3. **Mute button** — one-click volume mute in toolbar
4. **Expand notifications** — quick access in toolbar
5. **Expand quick settings** — quick access in toolbar
6. **Rotate screen** — quick rotate button in toolbar
7. **Wake/lock screen** — dedicated wake (back-or-screen-on) button
8. **Lock screen** — set screen power OFF from toolbar
9. **Organized More panel** — sections: Text Input, APK Install, Device Commands, Screen Power, Display, Keyboard Shortcuts
10. **Keyboard shortcuts reference** — displayed in the More panel
11. **Toast notifications** — animated non-blocking status messages
12. **Connection status badge** — visual connected/disconnected indicator
13. **Improved button hover/active states** — smooth transitions and scale animation
14. **Backdrop blur on panels** — glassmorphism control panel effect
15. **Device list improvements** — row borders, smooth hover, better status dot colors
16. **Section headers in MoreBox** — clearly labeled control sections
17. **APK drag-and-drop hint** — helper text in APK install section
18. **APK file type filter** — file picker pre-filtered to `.apk` files
19. **Dark mode improvements** — better shadow and blur in dark theme
20. **Updated page title & meta** — descriptive browser tab title and description meta
21. **Redroid compatibility notes** — documented in README
22. **Improved CSS architecture** — CSS custom properties for toast and shadow tokens

---

## Architecture

```
ws-scrcpy/
├── src/
│   ├── app/          # Frontend (TypeScript, no framework, plain DOM)
│   │   ├── googDevice/     # Android device UI & logic
│   │   ├── applDevice/     # iOS device UI & logic
│   │   ├── player/         # Video decoder backends
│   │   ├── interactionHandler/  # Touch/mouse/keyboard input
│   │   └── ui/             # Shared UI utilities
│   ├── server/       # Node.js backend (Express + WebSocket)
│   └── common/       # Shared types and constants
├── vendor/           # Bundled third-party libraries
├── webpack/          # Build configuration
└── dist/             # Build output (generated)
```

**Video pipeline:** Device → scrcpy server (modified) → ADB → Node.js proxy → WebSocket → Browser decoder → Canvas/Video element

---

## Troubleshooting

**Device not showing up:**
- Check `adb devices` — device must be listed as `device` (not `unauthorized`)
- Restart the ADB server: `adb kill-server && adb start-server`

**Black screen / no video:**
- Try a different player (MSE → Broadway → TinyH264 → WebCodecs)
- Reduce bitrate or resolution in the More panel → Video Settings
- Check browser console for errors

**APK install fails:**
- Make sure the APK is not corrupted
- Verify the device has enough free storage
- Check the `adb shell` terminal for detailed error messages

**Redroid connection issues:**
- Confirm the container is running: `docker ps`
- Verify ADB is connected: `adb devices`
- Check firewall rules if running remotely

**HTTPS required for fullscreen / clipboard:**
- Some browser APIs require a secure context (HTTPS or localhost)
- Configure `secure: true` with a certificate in `config.yaml`

---

## Credits

| Role | Contributor |
|------|-------------|
| **Original author** | [Sergey Volkov (NetrisTV)](https://github.com/NetrisTV) |
| **Fork maintainer** | [Arpitraj02](https://github.com/Arpitraj02) |
| **scrcpy** | [Genymobile/scrcpy](https://github.com/Genymobile/scrcpy) |
| **Modified scrcpy** | [NetrisTV fork](https://github.com/NetrisTV/scrcpy) |
| **H264 converter** | [xevokk/h264-converter](https://github.com/xevokk/h264-converter) |
| **Broadway decoder** | [mbebenita/Broadway](https://github.com/mbebenita/Broadway) |
| **H264 live player** | [131/h264-live-player](https://github.com/131/h264-live-player) |
| **TinyH264** | [udevbe/tinyh264](https://github.com/udevbe/tinyh264) |
| **xterm.js** | [xtermjs/xterm.js](https://github.com/xtermjs/xterm.js) |
| **adbkit** | [@dead50f7/adbkit](https://github.com/dead50f7/adbkit) |
| **Redroid** | [remote-android/redroid-doc](https://github.com/remote-android/redroid-doc) |

---

## License

[MIT](LICENSE) — see the LICENSE file for details.

> Original project © Sergey Volkov  
> Fork improvements © Arpitraj02


